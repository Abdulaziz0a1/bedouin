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

/* ─── Update (edit & resubmit) ──────────────────────────────────────────────── */

export type UpdateListingResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Updates an existing `listing_submissions` row owned by the current host.
 * Only allowed when status is `pending_review` or `rejected`.
 * After update the status is reset to `pending_review` so admin re-reviews it.
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
    const { data: existing, error: fetchError } = await supabase
      .from("listing_submissions")
      .select("id, host_id, status")
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
