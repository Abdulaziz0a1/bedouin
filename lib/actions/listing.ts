"use server";

import { createClient } from "@/lib/supabase-server";
import type { ListingDraft, SubmittedListing } from "@/lib/types/host";

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
  draft: ListingDraft
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
      // TODO: upload images to Supabase Storage and store returned URLs here.
      // blob: URLs are client-side only and cannot be persisted.
      image_urls:     [],
      status:         "pending_review",
      submitted_at:   submittedAt,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      listing: {
        listingRef:  reference,
        title:       draft.title || "Untitled Listing",
        category:    draft.category,
        region:      draft.region,
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
