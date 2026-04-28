"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import type { SubmittedListing, DraftCategory, DraftRegion } from "@/lib/types/host";

/**
 * Clean, serializable payload sent from the client to both submitListing and
 * updateListing. Only contains fields the action actually writes to the DB.
 * Keeping this free of optional / undefined fields prevents Next.js wire-format
 * serialization errors ("Invalid Server Actions request").
 */
export interface ListingPayload {
  category:         string;
  title:            string;
  description:      string;
  highlights:       string[];
  region:           string;
  location:         string;
  mapsUrl:          string;
  maxGuests:        number;
  bedrooms:         number;
  beds:             number;
  baths:            number;
  minNights:        number;
  checkInTime:      string;
  checkOutTime:     string;
  amenities:        string[];
  price:            number;
  originalPrice:    number;
  priceUnit:        string;
  imagePreviewUrls: string[];
  houseRules:       string[];
}

/* ─── Similarity check (for template-based listings) ────────────────────────
 *
 * When a host duplicates a listing, source_submission_id is stored.
 * Before allowing resubmission, we compare the draft against the source using
 * a multi-field check.
 *
 * Rule: BLOCK if fewer than 2 meaningful fields changed AND at least 1 primary
 * field has not changed. A "primary field" is one of:
 *   title, images, price, capacity (max_guests), category.
 *
 * Location alone is never a rejection reason — hosts legitimately own multiple
 * units/experiences at the same farm or property.
 *
 * Returns null if the draft is different enough, or an error string to show.
 * ─────────────────────────────────────────────────────────────────────────── */

function normalize(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, " ");
}

interface SourceRow {
  title:       string | null;
  category:    string;
  location:    string | null;
  maps_url:    string | null;
  price:       number | string;
  max_guests:  number;
  description: string | null;
  highlights:  string[] | null;
  image_urls:  string[] | null;
}

function checkMeaningfulDifference(
  draft:  ListingPayload,
  source: SourceRow
): string | null {
  const changed: string[] = [];

  // title — primary
  const srcTitle   = normalize(source.title ?? "");
  const draftTitle = normalize(draft.title);
  if (srcTitle !== draftTitle && draftTitle.length > 0 && !draftTitle.startsWith("copy of ")) {
    changed.push("title");
  } else if (!draftTitle.startsWith("copy of ") && srcTitle !== draftTitle) {
    changed.push("title");
  }
  // Detect title that is ONLY a "Copy of …" rename — that's not a meaningful change
  const isTitleOnlyCopy =
    draftTitle === srcTitle ||
    normalize(draft.title) === `copy of ${srcTitle}`;

  // Rebuild without the "only copy" noise
  const changedFields: string[] = [];

  // title — primary
  if (!isTitleOnlyCopy && srcTitle !== draftTitle) {
    changedFields.push("title");
  }

  // images — primary: at least 1 URL differs from source set
  const srcImages  = new Set<string>((source.image_urls ?? []).filter(Boolean));
  const draftImgs  = draft.imagePreviewUrls.filter((u) => u.startsWith("http"));
  const hasNewImgs = draftImgs.some((u) => !srcImages.has(u));
  const imgCountDiff = draftImgs.length !== srcImages.size;
  if (hasNewImgs || imgCountDiff) changedFields.push("images");

  // price — primary
  if (draft.price !== Number(source.price)) changedFields.push("price");

  // capacity — primary
  if (draft.maxGuests !== Number(source.max_guests)) changedFields.push("capacity");

  // category — primary
  if (draft.category !== source.category) changedFields.push("category");

  // location — secondary (intentionally NOT primary: same farm → same location is fine)
  const srcLoc  = normalize(source.location ?? "");
  const draftLoc = normalize(draft.location);
  if (srcLoc !== draftLoc && draftLoc.length > 0) changedFields.push("location");

  // maps_url — secondary
  const srcMaps  = (source.maps_url ?? "").trim();
  const draftMaps = draft.mapsUrl.trim();
  if (srcMaps !== draftMaps && draftMaps.length > 0) changedFields.push("mapsUrl");

  // description — secondary (substantial change: at least 50 chars different)
  const srcDesc  = normalize(source.description ?? "");
  const draftDesc = normalize(draft.description);
  if (srcDesc !== draftDesc && Math.abs(draftDesc.length - srcDesc.length) > 30) {
    changedFields.push("description");
  }

  // highlights — secondary
  const srcHighlights  = (source.highlights ?? []).map(normalize).sort().join("|");
  const draftHighlights = draft.highlights.map(normalize).sort().join("|");
  if (srcHighlights !== draftHighlights) changedFields.push("highlights");

  const PRIMARY_FIELDS = ["title", "images", "price", "capacity", "category"] as const;
  const primaryChangedCount = changedFields.filter((f) =>
    PRIMARY_FIELDS.includes(f as typeof PRIMARY_FIELDS[number])
  ).length;

  // Allow if: ≥2 fields changed AND at least 1 is a primary field
  if (changedFields.length >= 2 && primaryChangedCount >= 1) return null;

  // Build a helpful message about what specifically is missing
  return (
    "This draft is too similar to the original listing. " +
    "Please update at least two key details such as the title, photos, price, " +
    "capacity, or experience type before submitting it for review."
  );
}

/* ─── Update (edit & resubmit) ──────────────────────────────────────────────── */

export type UpdateListingResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Updates an existing `listing_submissions` row owned by the current host.
 * Only allowed when status is `pending_review` or `rejected`.
 * After update the status is reset to `pending_review` so admin re-reviews it.
 *
 * When the listing was created from a template (source_submission_id is set),
 * a multi-field similarity check runs first. Submission is blocked if the draft
 * is effectively identical to the source — same location alone is NOT a reason
 * to block; at least 2 meaningful fields (including at least 1 primary field)
 * must differ.
 */
export async function updateListing(
  submissionId: string,
  draft: ListingPayload
): Promise<UpdateListingResult> {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "You must be signed in to edit a listing." };
    }

    // Verify the submission belongs to this host and is in an editable state.
    // Also fetch source_submission_id so we can run the similarity check.
    const { data: existing, error: fetchError } = await supabase
      .from("listing_submissions")
      .select("id, host_id, status, source_submission_id")
      .eq("id", submissionId)
      .single();

    if (fetchError || !existing) {
      return { success: false, error: "Listing not found." };
    }
    if (existing.host_id !== user.id) {
      return { success: false, error: "You do not own this listing." };
    }
    if (existing.status === "approved") {
      return { success: false, error: "Approved listings cannot be edited through this flow." };
    }

    // ── Similarity check for template-based listings ──────────────────────────
    //
    // Only runs when this listing was created from a template (has a source).
    // Skipped for: normal edits, rejection fixes, fresh submissions.

    if (existing.source_submission_id) {
      const { data: sourceRow } = await supabase
        .from("listing_submissions")
        .select("title, category, location, maps_url, price, max_guests, description, highlights, image_urls")
        .eq("id", existing.source_submission_id)
        .single();

      if (sourceRow) {
        const similarityError = checkMeaningfulDifference(draft, sourceRow as SourceRow);
        if (similarityError) {
          return { success: false, error: similarityError };
        }
      }
      // If sourceRow is null (source was deleted), skip the check — no baseline to compare
    }

    const { error } = await supabase
      .from("listing_submissions")
      .update({
        title:          draft.title       || "Untitled Listing",
        category:       draft.category,
        region:         draft.region,
        location:       draft.location,
        description:    draft.description,
        highlights:     draft.highlights,
        amenities:      draft.amenities,
        house_rules:    draft.houseRules,
        max_guests:     draft.maxGuests,
        bedrooms:       draft.bedrooms,
        beds:           draft.beds,
        baths:          draft.baths,
        min_nights:     draft.minNights,
        check_in_time:  draft.checkInTime,
        check_out_time: draft.checkOutTime,
        price:          draft.price,
        original_price: draft.originalPrice || null,
        price_unit:     draft.priceUnit,
        maps_url:       draft.mapsUrl.trim() || null,
        image_urls:     draft.imagePreviewUrls.filter((u) => u.startsWith("http")),
        // Reset to pending_review so admin re-reviews the updated content.
        status:           "pending_review",
        submitted_at:     new Date().toISOString(),
        reviewed_at:      null,
        reviewed_by:      null,
        rejection_reason: null,
        rejected_step:    null,
        admin_notes:      null,
      })
      .eq("id", submissionId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred.";
    return { success: false, error: message };
  }
}

export type SubmitListingResult =
  | { success: true;  listing: SubmittedListing }
  | { success: false; error: string };

/**
 * Inserts a listing draft into `listing_submissions` as `pending_review`.
 *
 * Image upload to Supabase Storage is a TODO — `imagePreviewUrls` contains
 * client-side blob: URLs which are only used here to populate the confirmation
 * screen's imageUrl. The DB stores an empty array until Storage integration.
 */
export async function submitListing(
  draft: ListingPayload
): Promise<SubmitListingResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "You must be signed in to submit a listing.",
      };
    }

    // Mode guard: only users in Host mode (or admins) may create listings.
    // This is a server-side enforcement — client-side checks are insufficient.
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, active_mode")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin" && profile?.active_mode !== "host") {
      return {
        success: false,
        error:
          "Switch to Host mode before submitting a listing. " +
          "Use the 'Switch to Hosting' button in the navigation bar.",
      };
    }

    const id          = crypto.randomUUID();
    const reference   = `BDN-LST-${id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
    const submittedAt = new Date().toISOString();

    const { error } = await supabase.from("listing_submissions").insert({
      id,
      reference,
      host_id:        user.id,
      title:          draft.title       || "Untitled Listing",
      category:       draft.category,
      region:         draft.region,
      location:       draft.location,
      description:    draft.description,
      highlights:     draft.highlights,
      amenities:      draft.amenities,
      house_rules:    draft.houseRules,
      max_guests:     draft.maxGuests,
      bedrooms:       draft.bedrooms,
      beds:           draft.beds,
      baths:          draft.baths,
      min_nights:     draft.minNights,
      check_in_time:  draft.checkInTime,
      check_out_time: draft.checkOutTime,
      price:          draft.price,
      original_price: draft.originalPrice,
      price_unit:     draft.priceUnit,
      maps_url:       draft.mapsUrl.trim() || null,
      // Store the image URLs directly (real Supabase Storage URLs or pasted URLs).
      image_urls:     draft.imagePreviewUrls.filter((u) => u.startsWith("http")),
      status:         "pending_review",
      submitted_at:   submittedAt,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard");
    return {
      success: true,
      listing: {
        listingRef:  reference,
        title:       draft.title || "Untitled Listing",
        category:    draft.category as DraftCategory,
        region:      draft.region   as DraftRegion,
        price:       draft.price,
        // imagePreviewUrls are blob: URLs — valid on the originating client only.
        // Returned here solely so HostConfirmation can display the preview image.
        imageUrl:    draft.imagePreviewUrls[0] ?? "",
        submittedAt,
      },
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    return { success: false, error: message };
  }
}

/* ─── Duplicate Listing ──────────────────────────────────────────────────── */

export type DuplicateListingResult =
  | { success: true;  newId: string; newReference: string }
  | { success: false; error: string };

/**
 * Creates a new listing_submissions draft by copying an existing submission
 * owned by the current host.
 *
 * Security guarantees (all server-side):
 *   1. Only authenticated users in host or admin mode may duplicate.
 *   2. The source submission must be owned by the caller (host_id = auth.uid()),
 *      preventing any host from copying another host's listing.
 *   3. The new submission is created as pending_review and owned by the caller.
 *
 * Fields copied  : category, description, highlights, amenities, house_rules,
 *                  max_guests, bedrooms, beds, baths, min_nights, check_in_time,
 *                  check_out_time, price, original_price, price_unit, region.
 * Fields reset   : title ("Copy of …"), location, maps_url, image_urls.
 * Fields not copied: status (→ draft), reviewed_at/by, rejection_*.
 */
export async function duplicateListing(
  sourceSubmissionId: string
): Promise<DuplicateListingResult> {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "You must be signed in to duplicate a listing." };
    }

    // Mode guard
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, active_mode")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin" && profile?.active_mode !== "host") {
      return { success: false, error: "Switch to Host mode before duplicating a listing." };
    }

    // Fetch source and verify ownership
    const { data: source, error: fetchErr } = await supabase
      .from("listing_submissions")
      .select("*")
      .eq("id", sourceSubmissionId)
      .single();

    if (fetchErr || !source) {
      return { success: false, error: "Source listing not found." };
    }

    // Ownership check — a host can only duplicate their own listings
    if (profile?.role !== "admin" && source.host_id !== user.id) {
      return { success: false, error: "You can only duplicate your own listings." };
    }

    const newId          = crypto.randomUUID();
    const newReference   = `BDN-LST-${newId.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
    const submittedAt    = new Date().toISOString();

    const { error: insertErr } = await supabase.from("listing_submissions").insert({
      id:             newId,
      reference:      newReference,
      host_id:        user.id,

      // Copied fields — safe to reuse across similar properties
      category:       source.category,
      region:         source.region,
      description:    source.description,
      highlights:     source.highlights      ?? [],
      amenities:      source.amenities       ?? [],
      house_rules:    source.house_rules     ?? [],
      max_guests:     source.max_guests,
      bedrooms:       source.bedrooms,
      beds:           source.beds,
      baths:          source.baths,
      min_nights:     source.min_nights,
      check_in_time:  source.check_in_time,
      check_out_time: source.check_out_time,
      price:          source.price,
      original_price: source.original_price  ?? null,
      price_unit:     source.price_unit,

      // Reset fields — must be reviewed/updated by the host before publishing
      title:          `Copy of ${source.title ?? "Untitled Listing"}`,
      location:       "",          // host must enter the new address
      maps_url:       null,        // host must enter the new Google Maps link
      image_urls:     [],          // host must upload photos for the new property

      // Template lineage — enables similarity check in updateListing()
      source_submission_id: sourceSubmissionId,

      // Workflow — stays as draft until host explicitly submits for review
      status:         "draft",
      submitted_at:   null,
    });

    if (insertErr) {
      return { success: false, error: insertErr.message };
    }

    revalidatePath("/dashboard");
    return { success: true, newId, newReference };
  } catch (err) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred.";
    return { success: false, error: message };
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
 * removeSubmission
 *
 * Soft-deletes a draft, rejected, or pending_review submission by setting
 * removed_at = now().  The row is kept in the database but excluded from all
 * host-dashboard and admin-panel queries.
 *
 * Security:
 *  • Caller must be authenticated and own the submission.
 *  • Approved / cancelled submissions cannot be removed here — those states
 *    are admin-controlled.  Use the "Request cancellation" flow for live listings.
 *  • Already-removed submissions are silently accepted (idempotent).
 * ───────────────────────────────────────────────────────────────────────────── */
export async function removeSubmission(
  submissionId: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "You must be signed in." };
    }

    const { data: row, error: fetchError } = await supabase
      .from("listing_submissions")
      .select("id, host_id, status, removed_at")
      .eq("id", submissionId)
      .single();

    if (fetchError || !row) {
      return { success: false, error: "Submission not found." };
    }
    if (row.host_id !== user.id) {
      return { success: false, error: "You do not own this submission." };
    }
    if (row.status === "approved") {
      return {
        success: false,
        error: "Live listings cannot be removed this way. Use 'Request cancellation' instead.",
      };
    }
    if (row.status === "cancelled") {
      return { success: false, error: "This submission is already cancelled." };
    }
    // Idempotent — already removed is fine
    if (row.removed_at) {
      revalidatePath("/dashboard");
      return { success: true };
    }

    const { error: updateError } = await supabase
      .from("listing_submissions")
      .update({ removed_at: new Date().toISOString() })
      .eq("id", submissionId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred.";
    return { success: false, error: message };
  }
}
