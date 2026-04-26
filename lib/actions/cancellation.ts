"use server";

import { createClient } from "@/lib/supabase-server";

export type CancellationActionResult =
  | { success: true }
  | { success: false; error: string };

/* ─── Helpers ────────────────────────────────────────────────────────────── */

async function requireAuth(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const user = await requireAuth(supabase);
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return profile?.role === "admin" ? user : null;
}

/* ─── Host: request listing cancellation ─────────────────────────────────── */

/**
 * A host submits a cancellation request for one of their approved listings.
 *
 * Rules:
 *   1. Caller must own the listing_submission (host_id = auth.uid()).
 *   2. The submission must be in 'approved' status — can only cancel live listings.
 *   3. No duplicate pending request may already exist for the same submission.
 */
export async function requestListingCancellation(
  submissionId: string,
  reason: string,
): Promise<CancellationActionResult> {
  try {
    const supabase = await createClient();
    const user = await requireAuth(supabase);
    if (!user) return { success: false, error: "You must be signed in." };

    // Verify ownership and current status
    const { data: sub, error: subErr } = await supabase
      .from("listing_submissions")
      .select("id, host_id, status")
      .eq("id", submissionId)
      .single();

    if (subErr || !sub) return { success: false, error: "Listing not found." };
    if (sub.host_id !== user.id) return { success: false, error: "You do not own this listing." };
    if (sub.status !== "approved") {
      return { success: false, error: "You can only request cancellation for a live (approved) listing." };
    }

    // Block duplicate pending request
    const { data: existing } = await supabase
      .from("listing_cancellation_requests")
      .select("id")
      .eq("listing_submission_id", submissionId)
      .eq("status", "pending")
      .maybeSingle();

    if (existing) {
      return { success: false, error: "A cancellation request is already pending for this listing." };
    }

    const { error: insertErr } = await supabase
      .from("listing_cancellation_requests")
      .insert({
        listing_submission_id: submissionId,
        host_id:               user.id,
        reason:                reason.trim(),
        status:                "pending",
      });

    if (insertErr) return { success: false, error: insertErr.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unexpected error." };
  }
}

/* ─── Admin: approve listing cancellation request ────────────────────────── */

/**
 * Admin approves a host's cancellation request.
 *
 * Effect:
 *   1. Marks the request as 'approved'.
 *   2. Marks listing_submissions.status = 'cancelled'.
 *   3. Deletes the live listing row from the listings table (ON DELETE SET NULL
 *      on listing_submissions.listing_id nullifies that FK automatically, making
 *      the listing invisible to guests without any dangling reference).
 */
export async function approveListingCancellationRequest(
  requestId: string,
): Promise<CancellationActionResult> {
  try {
    const supabase = await createClient();
    const admin = await requireAdmin(supabase);
    if (!admin) return { success: false, error: "Insufficient permissions." };

    // Fetch request + submission id
    const { data: req, error: reqErr } = await supabase
      .from("listing_cancellation_requests")
      .select("id, status, listing_submission_id")
      .eq("id", requestId)
      .single();

    if (reqErr || !req) return { success: false, error: "Request not found." };
    if (req.status !== "pending") return { success: false, error: "Request is no longer pending." };

    // Fetch submission to find the live listing_id
    const { data: sub } = await supabase
      .from("listing_submissions")
      .select("id, listing_id")
      .eq("id", req.listing_submission_id)
      .single();

    const now = new Date().toISOString();

    // Mark request approved
    await supabase
      .from("listing_cancellation_requests")
      .update({ status: "approved", reviewed_at: now, reviewed_by: admin.id })
      .eq("id", requestId);

    // Mark submission cancelled
    await supabase
      .from("listing_submissions")
      .update({ status: "cancelled" })
      .eq("id", req.listing_submission_id);

    // Remove live listing if it exists (nullifies listing_submissions.listing_id via ON DELETE SET NULL)
    if (sub?.listing_id) {
      await supabase.from("listings").delete().eq("id", sub.listing_id);
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unexpected error." };
  }
}

/* ─── Admin: reject listing cancellation request ─────────────────────────── */

/**
 * Admin rejects a host's cancellation request.
 * The listing remains active and the host can see the rejection reason.
 */
export async function rejectListingCancellationRequest(
  requestId: string,
  adminNote: string,
): Promise<CancellationActionResult> {
  try {
    const supabase = await createClient();
    const admin = await requireAdmin(supabase);
    if (!admin) return { success: false, error: "Insufficient permissions." };

    const { data: req, error: reqErr } = await supabase
      .from("listing_cancellation_requests")
      .select("id, status")
      .eq("id", requestId)
      .single();

    if (reqErr || !req) return { success: false, error: "Request not found." };
    if (req.status !== "pending") return { success: false, error: "Request is no longer pending." };

    const now = new Date().toISOString();
    const { error: updateErr } = await supabase
      .from("listing_cancellation_requests")
      .update({
        status:      "rejected",
        admin_note:  adminNote.trim() || null,
        reviewed_at: now,
        reviewed_by: admin.id,
      })
      .eq("id", requestId);

    if (updateErr) return { success: false, error: updateErr.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unexpected error." };
  }
}
