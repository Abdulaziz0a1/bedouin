"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import { coreSubmitListing, coreUpdateListing } from "@/lib/server/listing-submission";

// Re-export types from their canonical location so existing imports are unaffected
export type { ListingPayload }            from "@/lib/types/listing";
export type { SubmitListingResult }       from "@/lib/types/listing";
export type { UpdateListingResult }       from "@/lib/types/listing";

import type { ListingPayload }            from "@/lib/types/listing";
import type { SubmitListingResult }       from "@/lib/types/listing";
import type { UpdateListingResult }       from "@/lib/types/listing";

/* ─── Submit (thin wrapper) ─────────────────────────────────────────────────── */

/**
 * Server Action kept for backward compatibility.
 * The primary submit path now goes through POST /api/host/listings/submit
 * to avoid stale Server Action IDs after Fast Refresh.
 */
export async function submitListing(
  draft: ListingPayload,
): Promise<SubmitListingResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "You must be signed in to submit a listing." };
    return await coreSubmitListing(user.id, draft);
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "An unexpected error occurred." };
  }
}

/* ─── Update (thin wrapper) ─────────────────────────────────────────────────── */

/**
 * Server Action kept for backward compatibility.
 * The primary update path now goes through PATCH /api/host/listings/[id]
 * to avoid stale Server Action IDs after Fast Refresh.
 */
export async function updateListing(
  submissionId: string,
  draft:        ListingPayload,
): Promise<UpdateListingResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "You must be signed in to edit a listing." };
    return await coreUpdateListing(user.id, submissionId, draft);
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "An unexpected error occurred." };
  }
}

/* ─── Duplicate Listing ──────────────────────────────────────────────────── */

export type DuplicateListingResult =
  | { success: true;  newId: string; newReference: string }
  | { success: false; error: string };

export async function duplicateListing(
  sourceSubmissionId: string
): Promise<DuplicateListingResult> {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "You must be signed in to duplicate a listing." };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, active_mode")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin" && profile?.active_mode !== "host") {
      return { success: false, error: "Switch to Host mode before duplicating a listing." };
    }

    const { data: source, error: fetchErr } = await supabase
      .from("listing_submissions")
      .select("*")
      .eq("id", sourceSubmissionId)
      .single();

    if (fetchErr || !source) {
      return { success: false, error: "Source listing not found." };
    }

    if (profile?.role !== "admin" && source.host_id !== user.id) {
      return { success: false, error: "You can only duplicate your own listings." };
    }

    const newId        = crypto.randomUUID();
    const newReference = `BDN-LST-${newId.replace(/-/g, "").slice(0, 8).toUpperCase()}`;

    const { error: insertErr } = await supabase.from("listing_submissions").insert({
      id:             newId,
      reference:      newReference,
      host_id:        user.id,
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
      title:          `Copy of ${source.title ?? "Untitled Listing"}`,
      location:       "",
      maps_url:       null,
      image_urls:     [],
      source_submission_id: sourceSubmissionId,
      status:         "draft",
      submitted_at:   null,
    });

    if (insertErr) {
      return { success: false, error: insertErr.message };
    }

    revalidatePath("/dashboard");
    return { success: true, newId, newReference };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "An unexpected error occurred." };
  }
}

/* ─── Remove submission (soft-delete) ────────────────────────────────────── */

export async function removeSubmission(
  submissionId: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "You must be signed in." };

    const { data: row, error: fetchError } = await supabase
      .from("listing_submissions")
      .select("id, host_id, status, removed_at")
      .eq("id", submissionId)
      .single();

    if (fetchError || !row) return { success: false, error: "Submission not found." };
    if (row.host_id !== user.id) return { success: false, error: "You do not own this submission." };
    if (row.status === "approved") {
      return {
        success: false,
        error: "Live listings cannot be removed this way. Use 'Request cancellation' instead.",
      };
    }
    if (row.status === "cancelled") return { success: false, error: "This submission is already cancelled." };
    if (row.removed_at) {
      revalidatePath("/dashboard");
      return { success: true };
    }

    const { error: updateError } = await supabase
      .from("listing_submissions")
      .update({ removed_at: new Date().toISOString() })
      .eq("id", submissionId);

    if (updateError) return { success: false, error: updateError.message };

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "An unexpected error occurred." };
  }
}
