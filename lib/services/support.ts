import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import type { SupportTicket, SupportReply, TicketWithReplies, IssueType, TicketStatus } from "@/lib/types/support";

/* ─── User: fetch own tickets ────────────────────────────────────────────── */

export async function fetchUserTickets(userId: string): Promise<SupportTicket[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("support_tickets")
      .select("id, issue_type, title, description, status, created_at, updated_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    // Fetch reply counts per ticket in one query
    const ticketIds = data.map((r) => r.id as string);
    const replyCounts: Record<string, number> = {};
    if (ticketIds.length > 0) {
      const { data: counts } = await supabase
        .from("support_replies")
        .select("ticket_id")
        .in("ticket_id", ticketIds);
      (counts ?? []).forEach((r) => {
        const tid = r.ticket_id as string;
        replyCounts[tid] = (replyCounts[tid] ?? 0) + 1;
      });
    }

    return data.map((row): SupportTicket => ({
      id:          row.id as string,
      issueType:   row.issue_type as IssueType,
      title:       row.title as string,
      description: row.description as string,
      status:      row.status as TicketStatus,
      createdAt:   row.created_at as string,
      updatedAt:   row.updated_at as string,
      replyCount:  replyCounts[row.id as string] ?? 0,
    }));
  } catch {
    return [];
  }
}

/* ─── User: fetch single ticket with replies ─────────────────────────────── */

export async function fetchTicketWithReplies(
  ticketId: string,
  userId: string,
): Promise<TicketWithReplies | null> {
  try {
    const supabase = await createClient();

    const { data: ticketRow, error: ticketErr } = await supabase
      .from("support_tickets")
      .select("id, issue_type, title, description, status, created_at, updated_at")
      .eq("id", ticketId)
      .eq("user_id", userId)
      .single();

    if (ticketErr || !ticketRow) return null;

    const { data: replyRows } = await supabase
      .from("support_replies")
      .select("id, author_id, message, is_admin, created_at")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });

    // Fetch author names from profiles
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

    const ticket: SupportTicket = {
      id:          ticketRow.id as string,
      issueType:   ticketRow.issue_type as IssueType,
      title:       ticketRow.title as string,
      description: ticketRow.description as string,
      status:      ticketRow.status as TicketStatus,
      createdAt:   ticketRow.created_at as string,
      updatedAt:   ticketRow.updated_at as string,
      replyCount:  (replyRows ?? []).length,
    };

    const replies: SupportReply[] = (replyRows ?? []).map((row): SupportReply => ({
      id:         row.id as string,
      ticketId:   ticketId,
      authorId:   row.author_id as string,
      authorName: (row.is_admin as boolean) ? "Bedouin Support" : (nameMap[row.author_id as string] ?? "You"),
      message:    row.message as string,
      isAdmin:    row.is_admin as boolean,
      createdAt:  row.created_at as string,
    }));

    return { ticket, replies };
  } catch {
    return null;
  }
}

/* ─── Admin: fetch all tickets ───────────────────────────────────────────── */

export async function fetchAllSupportTickets(): Promise<SupportTicket[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("support_tickets")
      .select("id, user_id, issue_type, title, description, status, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    // Batch fetch reply counts
    const ticketIds = data.map((r) => r.id as string);
    const replyCounts: Record<string, number> = {};
    if (ticketIds.length > 0) {
      const { data: counts } = await supabase
        .from("support_replies")
        .select("ticket_id")
        .in("ticket_id", ticketIds);
      (counts ?? []).forEach((r) => {
        const tid = r.ticket_id as string;
        replyCounts[tid] = (replyCounts[tid] ?? 0) + 1;
      });
    }

    // Batch fetch user display names from profiles
    const userIds = [...new Set(data.map((r) => r.user_id as string))];
    const nameMap: Record<string, string> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", userIds);
      (profiles ?? []).forEach((p) => {
        nameMap[p.id] = `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || "Unknown User";
      });
    }

    // Batch fetch emails via admin client (optional; skip on error)
    const emailMap: Record<string, string> = {};
    try {
      const adminClient = createAdminClient();
      const results = await Promise.all(userIds.map((id) => adminClient.auth.admin.getUserById(id)));
      results.forEach(({ data: u }) => {
        if (u.user?.email) emailMap[u.user.id] = u.user.email;
      });
    } catch {
      // emails are informational; continue without them
    }

    return data.map((row): SupportTicket => ({
      id:          row.id as string,
      issueType:   row.issue_type as IssueType,
      title:       row.title as string,
      description: row.description as string,
      status:      row.status as TicketStatus,
      createdAt:   row.created_at as string,
      updatedAt:   row.updated_at as string,
      replyCount:  replyCounts[row.id as string] ?? 0,
      userName:    nameMap[row.user_id as string] ?? "Unknown",
      userEmail:   emailMap[row.user_id as string] ?? undefined,
    }));
  } catch {
    return [];
  }
}

/* ─── Admin: fetch single ticket with replies ────────────────────────────── */

export async function fetchAdminTicketWithReplies(
  ticketId: string,
): Promise<TicketWithReplies | null> {
  try {
    const supabase = await createClient();

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

    const ticket: SupportTicket = {
      id:          ticketRow.id as string,
      issueType:   ticketRow.issue_type as IssueType,
      title:       ticketRow.title as string,
      description: ticketRow.description as string,
      status:      ticketRow.status as TicketStatus,
      createdAt:   ticketRow.created_at as string,
      updatedAt:   ticketRow.updated_at as string,
      replyCount:  (replyRows ?? []).length,
    };

    const replies: SupportReply[] = (replyRows ?? []).map((row): SupportReply => ({
      id:         row.id as string,
      ticketId:   ticketId,
      authorId:   row.author_id as string,
      authorName: (row.is_admin as boolean) ? "Bedouin Support" : (nameMap[row.author_id as string] ?? "User"),
      message:    row.message as string,
      isAdmin:    row.is_admin as boolean,
      createdAt:  row.created_at as string,
    }));

    return { ticket, replies };
  } catch {
    return null;
  }
}
