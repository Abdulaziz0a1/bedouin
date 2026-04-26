"use server";

import { createClient } from "@/lib/supabase-server";
import type { IssueType, TicketStatus } from "@/lib/types/support";

export type SupportActionResult =
  | { success: true }
  | { success: false; error: string };

export type CreateTicketResult =
  | { success: true; ticketId: string }
  | { success: false; error: string };

/* ─── Helpers ────────────────────────────────────────────────────────────── */

async function getAuthUser(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

async function getAdminUser(supabase: Awaited<ReturnType<typeof createClient>>) {
  const user = await getAuthUser(supabase);
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return profile?.role === "admin" ? user : null;
}

/* ─── User: create ticket ────────────────────────────────────────────────── */

export async function createSupportTicket(input: {
  issueType:   IssueType;
  title:       string;
  description: string;
}): Promise<CreateTicketResult> {
  try {
    const supabase = await createClient();
    const user = await getAuthUser(supabase);
    if (!user) return { success: false, error: "You must be signed in to submit a ticket." };

    if (!input.title.trim())       return { success: false, error: "Title is required." };
    if (!input.description.trim()) return { success: false, error: "Description is required." };

    const { data, error } = await supabase
      .from("support_tickets")
      .insert({
        user_id:     user.id,
        issue_type:  input.issueType,
        title:       input.title.trim(),
        description: input.description.trim(),
        status:      "open",
      })
      .select("id")
      .single();

    if (error || !data) return { success: false, error: error?.message ?? "Failed to submit ticket." };
    return { success: true, ticketId: data.id };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unexpected error." };
  }
}

/* ─── User: reply to own ticket ──────────────────────────────────────────── */

export async function replyToTicket(
  ticketId: string,
  message:  string,
): Promise<SupportActionResult> {
  try {
    const supabase = await createClient();
    const user = await getAuthUser(supabase);
    if (!user) return { success: false, error: "You must be signed in." };
    if (!message.trim()) return { success: false, error: "Message cannot be empty." };

    // Verify the ticket belongs to this user
    const { data: ticket } = await supabase
      .from("support_tickets")
      .select("id, user_id, status")
      .eq("id", ticketId)
      .single();

    if (!ticket || ticket.user_id !== user.id) {
      return { success: false, error: "Ticket not found." };
    }
    if (ticket.status === "closed") {
      return { success: false, error: "This ticket is closed." };
    }

    const { error } = await supabase.from("support_replies").insert({
      ticket_id:  ticketId,
      author_id:  user.id,
      message:    message.trim(),
      is_admin:   false,
    });

    if (error) return { success: false, error: error.message };

    // Reopen ticket if it was resolved (user replied back)
    if (ticket.status === "resolved") {
      await supabase
        .from("support_tickets")
        .update({ status: "open" })
        .eq("id", ticketId);
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unexpected error." };
  }
}

/* ─── User: close own ticket ─────────────────────────────────────────────── */

export async function closeTicket(ticketId: string): Promise<SupportActionResult> {
  try {
    const supabase = await createClient();
    const user = await getAuthUser(supabase);
    if (!user) return { success: false, error: "You must be signed in." };

    const { data: ticket } = await supabase
      .from("support_tickets")
      .select("id, user_id")
      .eq("id", ticketId)
      .single();

    if (!ticket || ticket.user_id !== user.id) {
      return { success: false, error: "Ticket not found." };
    }

    const { error } = await supabase
      .from("support_tickets")
      .update({ status: "closed" })
      .eq("id", ticketId)
      .eq("user_id", user.id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unexpected error." };
  }
}

/* ─── Admin: reply to any ticket + optionally change status ─────────────── */

export async function adminReplyToTicket(
  ticketId: string,
  message:  string,
  newStatus?: TicketStatus,
): Promise<SupportActionResult> {
  try {
    const supabase = await createClient();
    const admin = await getAdminUser(supabase);
    if (!admin) return { success: false, error: "Insufficient permissions." };
    if (!message.trim()) return { success: false, error: "Message cannot be empty." };

    const { data: ticket } = await supabase
      .from("support_tickets")
      .select("id")
      .eq("id", ticketId)
      .single();

    if (!ticket) return { success: false, error: "Ticket not found." };

    const { error: replyErr } = await supabase.from("support_replies").insert({
      ticket_id: ticketId,
      author_id: admin.id,
      message:   message.trim(),
      is_admin:  true,
    });

    if (replyErr) return { success: false, error: replyErr.message };

    const status = newStatus ?? "in_progress";
    await supabase
      .from("support_tickets")
      .update({ status })
      .eq("id", ticketId);

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unexpected error." };
  }
}

/* ─── Admin: update ticket status only ──────────────────────────────────── */

export async function adminUpdateTicketStatus(
  ticketId: string,
  status:   TicketStatus,
): Promise<SupportActionResult> {
  try {
    const supabase = await createClient();
    const admin = await getAdminUser(supabase);
    if (!admin) return { success: false, error: "Insufficient permissions." };

    const { error } = await supabase
      .from("support_tickets")
      .update({ status })
      .eq("id", ticketId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unexpected error." };
  }
}

/* ─── User: lazy-load ticket thread (for client components) ──────────────── */

import type { TicketWithReplies, SupportReply } from "@/lib/types/support";

export async function loadTicketThread(ticketId: string): Promise<TicketWithReplies | null> {
  try {
    const supabase = await createClient();
    const user = await getAuthUser(supabase);
    if (!user) return null;

    const { data: ticketRow, error } = await supabase
      .from("support_tickets")
      .select("id, issue_type, title, description, status, created_at, updated_at")
      .eq("id", ticketId)
      .eq("user_id", user.id)
      .single();

    if (error || !ticketRow) return null;

    const { data: replyRows } = await supabase
      .from("support_replies")
      .select("id, author_id, message, is_admin, created_at")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });

    const authorIds = [...new Set((replyRows ?? []).map((r) => r.author_id as string))];
    const nameMap: Record<string, string> = {};
    if (authorIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", authorIds);
      (profiles ?? []).forEach((p) => {
        nameMap[p.id] = `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || "Support Team";
      });
    }

    return {
      ticket: {
        id:          ticketRow.id as string,
        issueType:   ticketRow.issue_type as IssueType,
        title:       ticketRow.title as string,
        description: ticketRow.description as string,
        status:      ticketRow.status as TicketStatus,
        createdAt:   ticketRow.created_at as string,
        updatedAt:   ticketRow.updated_at as string,
        replyCount:  (replyRows ?? []).length,
      },
      replies: (replyRows ?? []).map((row): SupportReply => ({
        id:         row.id as string,
        ticketId,
        authorId:   row.author_id as string,
        authorName: (row.is_admin as boolean) ? "Bedouin Support" : (nameMap[row.author_id as string] ?? "You"),
        message:    row.message as string,
        isAdmin:    row.is_admin as boolean,
        createdAt:  row.created_at as string,
      })),
    };
  } catch {
    return null;
  }
}

/* ─── Admin: lazy-load ticket thread ────────────────────────────────────── */

export async function adminLoadTicketThread(ticketId: string): Promise<TicketWithReplies | null> {
  try {
    const supabase = await createClient();
    const admin = await getAdminUser(supabase);
    if (!admin) return null;

    const { data: ticketRow, error } = await supabase
      .from("support_tickets")
      .select("id, user_id, issue_type, title, description, status, created_at, updated_at")
      .eq("id", ticketId)
      .single();

    if (error || !ticketRow) return null;

    const { data: replyRows } = await supabase
      .from("support_replies")
      .select("id, author_id, message, is_admin, created_at")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });

    const authorIds = [...new Set((replyRows ?? []).map((r) => r.author_id as string))];
    const nameMap: Record<string, string> = {};
    if (authorIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", authorIds);
      (profiles ?? []).forEach((p) => {
        nameMap[p.id] = `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || "User";
      });
    }

    // Fetch ticket owner name
    const { data: ownerProfile } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", ticketRow.user_id as string)
      .single();
    const ownerName = ownerProfile
      ? `${ownerProfile.first_name ?? ""} ${ownerProfile.last_name ?? ""}`.trim() || "User"
      : "User";

    return {
      ticket: {
        id:          ticketRow.id as string,
        issueType:   ticketRow.issue_type as IssueType,
        title:       ticketRow.title as string,
        description: ticketRow.description as string,
        status:      ticketRow.status as TicketStatus,
        createdAt:   ticketRow.created_at as string,
        updatedAt:   ticketRow.updated_at as string,
        replyCount:  (replyRows ?? []).length,
        userName:    ownerName,
      },
      replies: (replyRows ?? []).map((row): SupportReply => ({
        id:         row.id as string,
        ticketId,
        authorId:   row.author_id as string,
        authorName: (row.is_admin as boolean) ? "Bedouin Support" : (nameMap[row.author_id as string] ?? "User"),
        message:    row.message as string,
        isAdmin:    row.is_admin as boolean,
        createdAt:  row.created_at as string,
      })),
    };
  } catch {
    return null;
  }
}
