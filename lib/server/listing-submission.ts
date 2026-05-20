/**
 * Core business logic for listing submission and update.
 *
 * This is a plain server module — no "use server" directive.  It is called by:
 *   • Route Handlers  (app/api/host/listings/…)
 *   • Server Actions  (lib/actions/listing.ts, kept as thin wrappers)
 *
 * Keeping it out of a "use server" file means it has no embedded action ID,
 * so it is never affected by Fast Refresh stale-ID invalidation.
 */

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import type { DraftCategory, DraftRegion } from "@/lib/types/host";
import type { ListingPayload, SubmitListingResult, UpdateListingResult } from "@/lib/types/listing";

// ─── Similarity check (template-based listings) ───────────────────────────────
//
// When a host duplicates a listing, source_submission_id is stored on the new
// draft.  Before submission, we compare key fields against the source to prevent
// nearly-identical duplicates from flooding the review queue.
//
// Rule: BLOCK if fewer than 2 meaningful fields changed AND at least 1 primary
// field is unchanged.  Primary fields: title, images, price, capacity, category.
// Location alone is NOT a primary field — hosts legitimately run multiple units
// at the same address.

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
  source: SourceRow,
): string | null {
  const changedFields: string[] = [];

  // title — primary
  const srcTitle   = normalize(source.title ?? "");
  const draftTitle = normalize(draft.title);
  const isTitleOnlyCopy =
    draftTitle === srcTitle || draftTitle === `copy of ${srcTitle}`;
  if (!isTitleOnlyCopy && srcTitle !== draftTitle) changedFields.push("title");

  // images — primary: at least 1 URL differs from source set
  const srcImages  = new Set<string>((source.image_urls ?? []).filter(Boolean));
  const draftImgs  = draft.imagePreviewUrls.filter((u) => u.startsWith("http"));
  if (draftImgs.some((u) => !srcImages.has(u)) || draftImgs.length !== srcImages.size) {
    changedFields.push("images");
  }

  // price — primary
  if (draft.price !== Number(source.price)) changedFields.push("price");

  // capacity — primary
  if (draft.maxGuests !== Number(source.max_guests)) changedFields.push("capacity");

  // category — primary
  if (draft.category !== source.category) changedFields.push("category");

  // location — secondary
  const srcLoc = normalize(source.location ?? "");
  if (srcLoc !== normalize(draft.location) && draft.location.trim().length > 0) {
    changedFields.push("location");
  }

  // maps_url — secondary
  if ((source.maps_url ?? "").trim() !== draft.mapsUrl.trim() && draft.mapsUrl.trim().length > 0) {
    changedFields.push("mapsUrl");
  }

  // description — secondary (>30 char delta)
  const srcDesc = normalize(source.description ?? "");
  if (srcDesc !== normalize(draft.description) && Math.abs(normalize(draft.description).length - srcDesc.length) > 30) {
    changedFields.push("description");
  }

  // highlights — secondary
  const srcHighlights  = (source.highlights ?? []).map(normalize).sort().join("|");
  const draftHighlights = draft.highlights.map(normalize).sort().join("|");
  if (srcHighlights !== draftHighlights) changedFields.push("highlights");

  const PRIMARY_FIELDS = new Set(["title", "images", "price", "capacity", "category"]);
  const primaryChanged = changedFields.filter((f) => PRIMARY_FIELDS.has(f)).length;

  // Pass if at least 2 primary fields changed, OR at least 1 primary + 1 secondary changed.
  // This allows a host who only changes photos + location to submit (previously blocked).
  if (primaryChanged >= 2) return null;
  if (primaryChanged >= 1 && changedFields.length >= 2) return null;

  const changed = changedFields.length > 0
    ? `So far only changed: ${changedFields.join(", ")}.`
    : "No meaningful changes detected yet.";

  return (
    "This listing is too similar to the original template. " +
    "Please update at least the photos plus one more detail (e.g. title, location, " +
    "price, or capacity) before submitting for review. " + changed
  );
}

// ─── Bilingual field normalization ────────────────────────────────────────────
//
// Because the DB has no _ar columns, we store the best available value into the
// main English column.  If the host filled only Arabic, that Arabic text goes
// into title/description/location so the record is never blank.

function normalizeForDb(draft: ListingPayload) {
  const title       = draft.title?.trim()       || draft.title_ar?.trim()       || "";
  const description = draft.description?.trim() || draft.description_ar?.trim() || "";
  const location    = draft.location?.trim()    || draft.location_ar?.trim()    || "";
  const highlights  =
    draft.highlights.some((s) => s.trim())
      ? draft.highlights
      : ((draft as { highlights_ar?: string[] }).highlights_ar ?? []);
  return { title, description, location, highlights };
}

// ─── Payload validation ───────────────────────────────────────────────────────
//
// Called server-side before any DB write.  Rejects payloads that contain blob:
// or empty-string URLs — those would create unusable image records.

function validatePayload(draft: ListingPayload): string | null {
  const bad = draft.imagePreviewUrls.filter(
    (u) => !u.startsWith("http") || u.trim() === "",
  );
  if (bad.length > 0) {
    return "One or more image URLs are invalid — please re-upload photos and try again.";
  }
  return null;
}

// ─── Create (new submission) ──────────────────────────────────────────────────

export async function coreSubmitListing(
  userId: string,
  draft:  ListingPayload,
): Promise<SubmitListingResult> {
  const supabase = await createClient();

  // Payload guard — never persist blob: or empty URLs
  const payloadError = validatePayload(draft);
  if (payloadError) return { success: false, error: payloadError };

  // Mode guard: only users in Host mode (or admins) may create listings
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, active_mode")
    .eq("id", userId)
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
  const norm        = normalizeForDb(draft);

  const { error } = await supabase.from("listing_submissions").insert({
    id,
    reference,
    host_id:        userId,
    title:          norm.title,
    category:       draft.category,
    region:         draft.region,
    location:       norm.location,
    description:    norm.description,
    highlights:     norm.highlights,
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
    image_urls:     draft.imagePreviewUrls.filter((u) => u.startsWith("http")),
    status:         "pending_review",
    submitted_at:   submittedAt,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard");

  return {
    success: true,
    listing: {
      listingRef:  reference,
      title:       norm.title,
      title_ar:    draft.title_ar,
      category:    draft.category   as DraftCategory,
      region:      draft.region     as DraftRegion,
      price:       draft.price,
      imageUrl:    draft.imagePreviewUrls[0] ?? "",
      submittedAt,
    },
  };
}

// ─── Update (edit & resubmit) ─────────────────────────────────────────────────

export async function coreUpdateListing(
  userId:       string,
  submissionId: string,
  draft:        ListingPayload,
): Promise<UpdateListingResult> {
  const supabase = await createClient();

  const payloadError = validatePayload(draft);
  if (payloadError) return { success: false, error: payloadError };

  const norm = normalizeForDb(draft);

  // Required-field guard: location must be set before a submission enters the review queue.
  if (!norm.location) {
    return { success: false, error: "Please add a location (Step 3) before submitting for review." };
  }

  // Verify the submission belongs to this host and is in an editable state
  const { data: existing, error: fetchError } = await supabase
    .from("listing_submissions")
    .select("id, host_id, status, source_submission_id")
    .eq("id", submissionId)
    .single();

  if (fetchError || !existing) return { success: false, error: "Listing not found." };
  if (existing.host_id !== userId) return { success: false, error: "You do not own this listing." };
  if (existing.status === "approved") {
    return { success: false, error: "Approved listings cannot be edited through this flow." };
  }

  // Similarity check for template-based listings
  if (existing.source_submission_id) {
    const { data: sourceRow } = await supabase
      .from("listing_submissions")
      .select("title, category, location, maps_url, price, max_guests, description, highlights, image_urls")
      .eq("id", existing.source_submission_id)
      .single();

    if (sourceRow) {
      const similarityError = checkMeaningfulDifference(draft, sourceRow as SourceRow);
      if (similarityError) return { success: false, error: similarityError };
    }
  }

  const { error } = await supabase
    .from("listing_submissions")
    .update({
      title:          norm.title,
      category:       draft.category,
      region:         draft.region,
      location:       norm.location,
      description:    norm.description,
      highlights:     norm.highlights,
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
      status:           "pending_review",
      submitted_at:     new Date().toISOString(),
      reviewed_at:      null,
      reviewed_by:      null,
      rejection_reason: null,
      rejected_step:    null,
      rejected_steps:   null,
      admin_notes:      null,
    })
    .eq("id", submissionId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard");
  return { success: true };
}
