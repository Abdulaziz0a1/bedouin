"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type ActionResult =
  | { success: true }
  | { success: false; error: string };

// ─────────────────────────────────────────────────────────────────────────────
// sendCoHostInvite
// Called by the host from the InviteModal on /cohost
// ─────────────────────────────────────────────────────────────────────────────

export async function sendCoHostInvite(
  cohostApplicationId: string,
  listingId:           string,
  listingTitle:        string,
  listingImage:        string,
  message:             string
): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not signed in." };

    // Resolve co-host's user_id from their approved application
    const { data: app, error: appErr } = await supabase
      .from("cohost_applications")
      .select("user_id")
      .eq("id", cohostApplicationId)
      .eq("status", "approved")
      .single();

    if (appErr || !app) {
      return { success: false, error: "Co-host not found or application not approved." };
    }
    if (app.user_id === user.id) {
      return { success: false, error: "You cannot invite yourself as a co-host." };
    }

    const { error } = await supabase.from("cohost_invitations").insert({
      host_id:               user.id,
      cohost_user_id:        app.user_id,
      cohost_application_id: cohostApplicationId,
      listing_id:            listingId,
      listing_title:         listingTitle,
      listing_image:         listingImage,
      message:               message.trim(),
      status:                "pending",
    });

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: "You already have a pending invitation with this co-host for this listing." };
      }
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unexpected error." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// respondToInvitation
// Called by the co-host from /cohost/invitations
// On accept: creates a cohost_assignments row
// ─────────────────────────────────────────────────────────────────────────────

export async function respondToInvitation(
  invitationId: string,
  decision:     "accepted" | "declined"
): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not signed in." };

    // Fetch to confirm it belongs to this co-host and is still pending
    const { data: inv, error: fetchErr } = await supabase
      .from("cohost_invitations")
      .select("*")
      .eq("id", invitationId)
      .eq("cohost_user_id", user.id)
      .eq("status", "pending")
      .single();

    if (fetchErr || !inv) {
      return { success: false, error: "Invitation not found or already responded." };
    }

    // If accepted → create assignment FIRST (before changing invitation status).
    // This prevents a race where status = 'accepted' but no assignment row exists
    // if the insert below fails.
    if (decision === "accepted") {
      const { error: assignErr } = await supabase.from("cohost_assignments").insert({
        invitation_id:         invitationId,
        host_id:               inv.host_id,
        cohost_user_id:        user.id,
        cohost_application_id: inv.cohost_application_id,
        listing_id:            inv.listing_id,
        listing_title:         inv.listing_title,
        listing_image:         inv.listing_image,
      });
      if (assignErr) return { success: false, error: assignErr.message };
    }

    // Update invitation status only after assignment is safely created
    const { error: updateErr } = await supabase
      .from("cohost_invitations")
      .update({ status: decision, responded_at: new Date().toISOString() })
      .eq("id", invitationId);

    if (updateErr) return { success: false, error: updateErr.message };

    revalidatePath("/cohost/invitations");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unexpected error." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// cancelInvitation
// Called by the host from their dashboard Co-hosts tab
// ─────────────────────────────────────────────────────────────────────────────

export async function cancelInvitation(invitationId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not signed in." };

    const { error } = await supabase
      .from("cohost_invitations")
      .update({ status: "cancelled" })
      .eq("id", invitationId)
      .eq("host_id", user.id)
      .eq("status", "pending");

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unexpected error." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// requestWithdrawal
// Called by the co-host — sets status to 'withdrawal_requested'
// ─────────────────────────────────────────────────────────────────────────────

export async function requestWithdrawal(assignmentId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not signed in." };

    const { error } = await supabase
      .from("cohost_assignments")
      .update({ status: "withdrawal_requested" })
      .eq("id", assignmentId)
      .eq("cohost_user_id", user.id)
      .eq("status", "active");

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unexpected error." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// resolveWithdrawal
// Called by the host — approve sets status to 'ended', reject sets to 'active'
// ─────────────────────────────────────────────────────────────────────────────

export async function resolveWithdrawal(
  assignmentId: string,
  decision:     "approve" | "reject",
): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not signed in." };

    const newStatus = decision === "approve" ? "ended" : "active";

    const { error } = await supabase
      .from("cohost_assignments")
      .update({ status: newStatus })
      .eq("id", assignmentId)
      .eq("host_id", user.id)
      .eq("status", "withdrawal_requested");

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unexpected error." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// removeAssignment
// Called by the host from their dashboard Co-hosts tab
// ─────────────────────────────────────────────────────────────────────────────

export async function removeAssignment(assignmentId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not signed in." };

    const { error } = await supabase
      .from("cohost_assignments")
      .delete()
      .eq("id", assignmentId)
      .eq("host_id", user.id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unexpected error." };
  }
}
