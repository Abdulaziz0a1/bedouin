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

type RequireAdminResult =
  | { adminId: string }
  | { error: string };

/**
 * Verifies the current user exists and has the admin role in profiles.
 * Returns { adminId } on success — the caller stores this UUID as reviewed_by.
 * Returns { error } on failure.
 */
async function requireAdmin(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<RequireAdminResult> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return { error: "Insufficient permissions." };
  return { adminId: user.id };
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
  submissionId: string
): Promise<AdminActionResult> {
  try {
    const supabase = await createClient();

    const authResult = await requireAdmin(supabase);
    if ("error" in authResult) return { success: false, error: authResult.error };
    const { adminId } = authResult;

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

    // Resolve host profile for the listing_details host card.
    const { data: hostProfile } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", sub.host_id)
      .single();

    const hostDisplayName = hostProfile
      ? `${hostProfile.first_name ?? ""} ${hostProfile.last_name ?? ""}`.trim() || "Host"
      : "Host";

    // Convert amenities TEXT[] → JSONB [{icon, label}] for listing_details.
    // Amenity IDs stored in submissions are plain text labels — store as-is
    // so the detail page can render them without a client-side lookup.
    const amenitiesJson = ((sub.amenities as string[]) ?? []).map((label) => ({
      icon:  "check",
      label,
    }));

    // Build the host card JSONB from the resolved profile.
    const hostJson = {
      name:         hostDisplayName,
      avatar:       `https://i.pravatar.cc/80?u=${sub.host_id}`,
      tagline:      "Verified Bedouin host",
      since:        new Date().getFullYear().toString(),
      responseRate: 100,
      superhost:    false,
    };

    // Insert the corresponding listing_details row so the detail page
    // renders real content instead of falling back to mock data.
    const { error: detailErr } = await supabase.from("listing_details").insert({
      listing_id:    listingId,
      images:        (sub.image_urls as string[]) ?? [],
      description:   sub.description   ?? "",
      highlights:    (sub.highlights   as string[]) ?? [],
      house_rules:   (sub.house_rules  as string[]) ?? [],
      max_guests:    sub.max_guests    ?? 1,
      bedrooms:      sub.bedrooms      ?? 0,
      beds:          sub.beds          ?? 1,
      baths:         sub.baths         ?? 1,
      min_nights:    sub.min_nights    ?? 1,
      check_in_time: sub.check_in_time  ?? "3:00 PM",
      check_out_time: sub.check_out_time ?? "11:00 AM",
      host:          hostJson,
      amenities:     amenitiesJson,
      reviews:       [],
      rating_breakdown: null,
    });

    if (detailErr) return { success: false, error: detailErr.message };

    // Update submission: mark approved + store cross-link
    const { error: updateSubErr } = await supabase
      .from("listing_submissions")
      .update({
        status:      "approved",
        reviewed_at: reviewedAt,
        reviewed_by: adminId,
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
  reason: string
): Promise<AdminActionResult> {
  try {
    const supabase = await createClient();

    const authResult = await requireAdmin(supabase);
    if ("error" in authResult) return { success: false, error: authResult.error };
    const { adminId } = authResult;

    const { error } = await supabase
      .from("listing_submissions")
      .update({
        status:           "rejected",
        reviewed_at:      new Date().toISOString(),
        reviewed_by:      adminId,
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

/* ─── Host application actions ────────────────────────────────────────────── */

/**
 * Approves a host application:
 *   1. Verifies admin role.
 *   2. Marks the host_application row as approved.
 *   3. Sets profiles.host_status = 'approved' and profiles.active_mode = 'host'
 *      so the user immediately lands on the host dashboard on next login.
 */
export async function approveHostApplication(
  applicationId: string
): Promise<AdminActionResult> {
  try {
    const supabase = await createClient();

    const authResult = await requireAdmin(supabase);
    if ("error" in authResult) return { success: false, error: authResult.error };
    const { adminId } = authResult;

    // Fetch the application to get the user_id
    const { data: app, error: fetchErr } = await supabase
      .from("host_applications")
      .select("user_id")
      .eq("id", applicationId)
      .single();

    if (fetchErr || !app) {
      return { success: false, error: fetchErr?.message ?? "Application not found." };
    }

    // Mark application approved
    const { error: appErr } = await supabase
      .from("host_applications")
      .update({
        status:      "approved",
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminId,
      })
      .eq("id", applicationId);

    if (appErr) return { success: false, error: appErr.message };

    // Update the profile: set host_status = approved, activate host mode
    const { error: profileErr } = await supabase
      .from("profiles")
      .update({
        host_status:  "approved",
        active_mode:  "host",
      })
      .eq("id", app.user_id);

    if (profileErr) return { success: false, error: profileErr.message };

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unexpected error." };
  }
}

/**
 * Rejects a host application:
 *   1. Verifies admin role.
 *   2. Marks the application rejected with a reason.
 *   3. Sets profiles.host_status = 'rejected' and ensures tourist mode.
 */
export async function rejectHostApplication(
  applicationId: string,
  reason: string
): Promise<AdminActionResult> {
  try {
    const supabase = await createClient();

    const authResult = await requireAdmin(supabase);
    if ("error" in authResult) return { success: false, error: authResult.error };
    const { adminId } = authResult;

    const { data: app, error: fetchErr } = await supabase
      .from("host_applications")
      .select("user_id")
      .eq("id", applicationId)
      .single();

    if (fetchErr || !app) {
      return { success: false, error: fetchErr?.message ?? "Application not found." };
    }

    const { error: appErr } = await supabase
      .from("host_applications")
      .update({
        status:           "rejected",
        reviewed_at:      new Date().toISOString(),
        reviewed_by:      adminId,
        rejection_reason: reason,
      })
      .eq("id", applicationId);

    if (appErr) return { success: false, error: appErr.message };

    const { error: profileErr } = await supabase
      .from("profiles")
      .update({
        host_status:           "rejected",
        host_rejection_reason: reason,
        active_mode:           "tourist",
      })
      .eq("id", app.user_id);

    if (profileErr) return { success: false, error: profileErr.message };

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unexpected error." };
  }
}

/* ─── Co-host application actions ─────────────────────────────────────────── */

export async function approveCohostApplication(
  applicationId: string
): Promise<AdminActionResult> {
  try {
    const supabase = await createClient();

    const authResult = await requireAdmin(supabase);
    if ("error" in authResult) return { success: false, error: authResult.error };
    const { adminId } = authResult;

    const { data: app, error: fetchErr } = await supabase
      .from("cohost_applications")
      .select("user_id")
      .eq("id", applicationId)
      .single();

    if (fetchErr || !app) {
      return { success: false, error: fetchErr?.message ?? "Application not found." };
    }

    const { error: appErr } = await supabase
      .from("cohost_applications")
      .update({
        status:      "approved",
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminId,
      })
      .eq("id", applicationId);

    if (appErr) return { success: false, error: appErr.message };

    const { error: profileErr } = await supabase
      .from("profiles")
      .update({ cohost_status: "approved" })
      .eq("id", app.user_id);

    if (profileErr) return { success: false, error: profileErr.message };

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unexpected error." };
  }
}

export async function rejectCohostApplication(
  applicationId: string,
  reason: string
): Promise<AdminActionResult> {
  try {
    const supabase = await createClient();

    const authResult = await requireAdmin(supabase);
    if ("error" in authResult) return { success: false, error: authResult.error };
    const { adminId } = authResult;

    const { data: app, error: fetchErr } = await supabase
      .from("cohost_applications")
      .select("user_id")
      .eq("id", applicationId)
      .single();

    if (fetchErr || !app) {
      return { success: false, error: fetchErr?.message ?? "Application not found." };
    }

    const { error: appErr } = await supabase
      .from("cohost_applications")
      .update({
        status:           "rejected",
        reviewed_at:      new Date().toISOString(),
        reviewed_by:      adminId,
        rejection_reason: reason,
      })
      .eq("id", applicationId);

    if (appErr) return { success: false, error: appErr.message };

    const { error: profileErr } = await supabase
      .from("profiles")
      .update({
        cohost_status:           "rejected",
        cohost_rejection_reason: reason,
      })
      .eq("id", app.user_id);

    if (profileErr) return { success: false, error: profileErr.message };

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unexpected error." };
  }
}
