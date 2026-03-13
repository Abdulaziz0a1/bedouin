"use server";

import { createClient } from "@/lib/supabase-server";

export type AdminActionResult =
  | { success: true }
  | { success: false; error: string };

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

/** Converts a listing title + UUID segment into a URL-safe slug. */
function slugify(title: string, id: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 50)
    .replace(/-$/, "");
  const suffix = id.replace(/-/g, "").slice(0, 6);
  return `${base}-${suffix}`;
}

/** Verifies the current user exists and has the admin role in profiles. */
async function requireAdmin(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "Not authenticated.";

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return "Insufficient permissions.";
  return null; // null = no error
}

/* ─── Approve ────────────────────────────────────────────────────────────── */

/**
 * Approves a listing submission:
 *   1. Verifies admin role.
 *   2. Fetches submission fields.
 *   3. INSERTs a live listing into `listings`.
 *   4. UPDATEs `listing_submissions` with approved status + cross-link.
 *   5. UPDATEs `listings.submission_id` with the cross-link back.
 */
export async function approveSubmission(
  submissionId: string,
  adminName: string
): Promise<AdminActionResult> {
  try {
    const supabase = await createClient();

    const authError = await requireAdmin(supabase);
    if (authError) return { success: false, error: authError };

    // Fetch submission to copy into listings
    const { data: sub, error: fetchErr } = await supabase
      .from("listing_submissions")
      .select("*")
      .eq("id", submissionId)
      .single();

    if (fetchErr || !sub) {
      return { success: false, error: fetchErr?.message ?? "Submission not found." };
    }

    const listingId  = crypto.randomUUID();
    const reviewedAt = new Date().toISOString();
    const slug       = slugify(sub.title, listingId);

    // Insert into live listings table
    const { error: insertErr } = await supabase.from("listings").insert({
      id:             listingId,
      slug,
      title:          sub.title,
      category:       sub.category,
      region:         sub.region,
      location:       sub.location,
      description:    sub.description,
      image:          (sub.image_urls as string[])?.[0] ?? "",
      score:          0,
      review_count:   0,
      price:          sub.price,
      original_price: sub.original_price,
      price_unit:     sub.price_unit,
      max_guests:     sub.max_guests,
      bedrooms:       sub.bedrooms,
      beds:           sub.beds,
      baths:          sub.baths,
      min_nights:     sub.min_nights,
      check_in_time:  sub.check_in_time,
      check_out_time: sub.check_out_time,
      host_id:        sub.host_id,
      submission_id:  submissionId,
    });

    if (insertErr) return { success: false, error: insertErr.message };

    // Update submission: mark approved + store cross-link
    const { error: updateSubErr } = await supabase
      .from("listing_submissions")
      .update({
        status:      "approved",
        reviewed_at: reviewedAt,
        reviewed_by: adminName,
        listing_id:  listingId,
      })
      .eq("id", submissionId);

    if (updateSubErr) return { success: false, error: updateSubErr.message };

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred.";
    return { success: false, error: message };
  }
}

/* ─── Reject ─────────────────────────────────────────────────────────────── */

/**
 * Rejects a listing submission:
 *   1. Verifies admin role.
 *   2. UPDATEs `listing_submissions` with rejected status + reason.
 */
export async function rejectSubmission(
  submissionId: string,
  reason: string,
  adminName: string
): Promise<AdminActionResult> {
  try {
    const supabase = await createClient();

    const authError = await requireAdmin(supabase);
    if (authError) return { success: false, error: authError };

    const { error } = await supabase
      .from("listing_submissions")
      .update({
        status:           "rejected",
        reviewed_at:      new Date().toISOString(),
        reviewed_by:      adminName,
        rejection_reason: reason,
      })
      .eq("id", submissionId);

    if (error) return { success: false, error: error.message };

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred.";
    return { success: false, error: message };
  }
}
