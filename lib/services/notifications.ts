import { createClient } from "@/lib/supabase-server";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type NotificationType =
  | "listing_approved"
  | "listing_rejected"
  | "booking_new"
  | "booking_checkin_today"
  | "booking_checkin_tomorrow"
  | "cohost_invitation_pending"
  | "cohost_invitation_accepted"
  | "cohost_invitation_declined";

export interface AppNotification {
  /** Deterministic key — used for popup dismissal in localStorage */
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  /** ISO timestamp — used for sorting and "X ago" display */
  date: string;
  /** True when the event occurred within the last 72 hours */
  isNew: boolean;
  /** True for time-sensitive items (check-in today, pending invitations) */
  isUrgent: boolean;
  actionLabel?: string;
  actionHref?: string;
  relatedTitle?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function isNew(isoDate: string | null): boolean {
  if (!isoDate) return false;
  return Date.now() - new Date(isoDate).getTime() < 72 * 60 * 60 * 1000;
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function tomorrowStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

/** ISO timestamp for "N days ago" ceiling */
function daysAgoIso(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

// ─────────────────────────────────────────────────────────────────────────────
// fetchHostNotifications
// Derives notifications for a host from existing tables (no events table).
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchHostNotifications(hostId: string): Promise<AppNotification[]> {
  try {
    const supabase = await createClient();
    const today    = todayStr();
    const tomorrow = tomorrowStr();
    const cutoff60 = daysAgoIso(60);
    const cutoff7  = daysAgoIso(7);
    const cutoff30 = daysAgoIso(30);

    const [submissionsRes, checkinsRes, newBookingsRes, inviteResponsesRes] = await Promise.all([
      // 1. Listing approvals / rejections (last 60 days)
      supabase
        .from("listing_submissions")
        .select("id, title, status, reviewed_at, rejection_reason, listing_id")
        .eq("host_id", hostId)
        .in("status", ["approved", "rejected"])
        .not("reviewed_at", "is", null)
        .gte("reviewed_at", cutoff60)
        .order("reviewed_at", { ascending: false })
        .limit(30),

      // 2. Guest check-ins today or tomorrow
      supabase
        .from("bookings")
        .select("id, reference, listing_title, listing_slug, check_in, guest_name, created_at")
        .eq("host_id", hostId)
        .in("check_in", [today, tomorrow])
        .neq("status", "cancelled"),

      // 3. New bookings in the last 7 days
      supabase
        .from("bookings")
        .select("id, reference, listing_title, check_in, guest_name, total_price, created_at")
        .eq("host_id", hostId)
        .gte("created_at", cutoff7)
        .neq("status", "cancelled")
        .order("created_at", { ascending: false })
        .limit(20),

      // 4. Co-host invitation responses (accepted / declined) in last 30 days
      supabase
        .from("cohost_invitations")
        .select("id, listing_title, listing_id, cohost_user_id, status, responded_at, sent_at")
        .eq("host_id", hostId)
        .in("status", ["accepted", "declined"])
        .gte("responded_at", cutoff30)
        .order("responded_at", { ascending: false })
        .limit(20),
    ]);

    // Batch-fetch co-host names for invitation responses
    const cohostIds = [...new Set((inviteResponsesRes.data ?? []).map((r) => r.cohost_user_id))];
    const cohostNameMap: Record<string, string> = {};
    if (cohostIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", cohostIds);
      (profiles ?? []).forEach((p) => {
        cohostNameMap[p.id] = `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || "Co-host";
      });
    }

    // Batch-fetch slugs for approved listings (needed for action URLs)
    const approvedListingIds = (submissionsRes.data ?? [])
      .filter((r) => r.status === "approved" && r.listing_id)
      .map((r) => r.listing_id as string);
    const slugMap: Record<string, string> = {};
    if (approvedListingIds.length > 0) {
      const { data: listings } = await supabase
        .from("listings")
        .select("id, slug")
        .in("id", approvedListingIds);
      (listings ?? []).forEach((l) => { slugMap[l.id] = l.slug; });
    }

    const notifications: AppNotification[] = [];

    // ── Listing status changes ──────────────────────────────────────────────
    for (const row of submissionsRes.data ?? []) {
      if (row.status === "approved") {
        const slug = row.listing_id ? slugMap[row.listing_id as string] : undefined;
        notifications.push({
          id:           `listing_approved_${row.id}`,
          type:         "listing_approved",
          title:        "Listing approved",
          description:  `Your listing "${row.title}" has been reviewed and approved. It is now live on Bedouin.`,
          date:         row.reviewed_at,
          isNew:        isNew(row.reviewed_at),
          isUrgent:     false,
          actionLabel:  "View listing",
          actionHref:   slug ? `/listing/${slug}` : "/dashboard",
          relatedTitle: row.title,
        });
      } else if (row.status === "rejected") {
        notifications.push({
          id:           `listing_rejected_${row.id}`,
          type:         "listing_rejected",
          title:        "Listing needs changes",
          description:  row.rejection_reason
            ? `"${row.title}" was not approved: ${row.rejection_reason}`
            : `Your listing "${row.title}" was not approved. Please review the feedback and resubmit.`,
          date:         row.reviewed_at,
          isNew:        isNew(row.reviewed_at),
          isUrgent:     false,
          actionLabel:  "Review feedback",
          actionHref:   "/dashboard?tab=listings",
          relatedTitle: row.title,
        });
      }
    }

    // ── Check-ins ───────────────────────────────────────────────────────────
    for (const row of checkinsRes.data ?? []) {
      const isToday = row.check_in === today;
      notifications.push({
        id:           `booking_checkin_${row.id}`,
        type:         isToday ? "booking_checkin_today" : "booking_checkin_tomorrow",
        title:        isToday ? "Guest checking in today" : "Guest checking in tomorrow",
        description:  `${row.guest_name} is arriving at "${row.listing_title}" — reference ${row.reference}.`,
        date:         row.check_in + "T00:00:00.000Z",
        isNew:        true,
        isUrgent:     isToday,
        actionLabel:  "View booking",
        actionHref:   "/dashboard?tab=bookings",
        relatedTitle: row.listing_title,
      });
    }

    // ── New bookings ────────────────────────────────────────────────────────
    const checkinBookingIds = new Set((checkinsRes.data ?? []).map((r) => r.id));
    for (const row of newBookingsRes.data ?? []) {
      if (checkinBookingIds.has(row.id)) continue; // already represented as check-in
      notifications.push({
        id:           `booking_new_${row.id}`,
        type:         "booking_new",
        title:        "New booking received",
        description:  `${row.guest_name} booked "${row.listing_title}" checking in ${row.check_in}.`,
        date:         row.created_at,
        isNew:        isNew(row.created_at),
        isUrgent:     false,
        actionLabel:  "View booking",
        actionHref:   "/dashboard?tab=bookings",
        relatedTitle: row.listing_title,
      });
    }

    // ── Co-host invitation responses ────────────────────────────────────────
    for (const row of inviteResponsesRes.data ?? []) {
      const name = cohostNameMap[row.cohost_user_id] ?? "Co-host";
      const responded = row.responded_at ?? row.sent_at;
      if (row.status === "accepted") {
        notifications.push({
          id:           `cohost_accepted_${row.id}`,
          type:         "cohost_invitation_accepted",
          title:        "Co-host invitation accepted",
          description:  `${name} accepted your invitation to co-host "${row.listing_title}".`,
          date:         responded,
          isNew:        isNew(responded),
          isUrgent:     false,
          actionLabel:  "View co-hosts",
          actionHref:   "/dashboard?tab=cohosts",
          relatedTitle: row.listing_title,
        });
      } else if (row.status === "declined") {
        notifications.push({
          id:           `cohost_declined_${row.id}`,
          type:         "cohost_invitation_declined",
          title:        "Co-host invitation declined",
          description:  `${name} declined your invitation for "${row.listing_title}". You can invite another co-host.`,
          date:         responded,
          isNew:        isNew(responded),
          isUrgent:     false,
          actionLabel:  "Browse co-hosts",
          actionHref:   "/cohost",
          relatedTitle: row.listing_title,
        });
      }
    }

    return notifications.sort((a, b) => b.date.localeCompare(a.date));
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// fetchUserNotifications
// Derives notifications for a guest/co-host user.
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchUserNotifications(userId: string): Promise<AppNotification[]> {
  try {
    const supabase = await createClient();
    const today    = todayStr();
    const tomorrow = tomorrowStr();

    const [checkinsRes, pendingInvitesRes] = await Promise.all([
      // 1. Upcoming guest check-ins today / tomorrow
      supabase
        .from("bookings")
        .select("id, reference, listing_title, listing_slug, check_in, created_at")
        .eq("user_id", userId)
        .in("check_in", [today, tomorrow])
        .neq("status", "cancelled"),

      // 2. Pending co-host invitations
      supabase
        .from("cohost_invitations")
        .select("id, listing_title, host_id, sent_at")
        .eq("cohost_user_id", userId)
        .eq("status", "pending")
        .order("sent_at", { ascending: false })
        .limit(20),
    ]);

    // Batch-fetch host names for pending invitations
    const hostIds = [...new Set((pendingInvitesRes.data ?? []).map((r) => r.host_id))];
    const hostNameMap: Record<string, string> = {};
    if (hostIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", hostIds);
      (profiles ?? []).forEach((p) => {
        hostNameMap[p.id] = `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || "A host";
      });
    }

    const notifications: AppNotification[] = [];

    // ── Check-ins (as guest) ────────────────────────────────────────────────
    for (const row of checkinsRes.data ?? []) {
      const isToday = row.check_in === today;
      notifications.push({
        id:           `guest_checkin_${row.id}`,
        type:         isToday ? "booking_checkin_today" : "booking_checkin_tomorrow",
        title:        isToday ? "Your check-in is today" : "Your check-in is tomorrow",
        description:  `You're checking in to "${row.listing_title}" — booking reference ${row.reference}.`,
        date:         row.check_in + "T00:00:00.000Z",
        isNew:        true,
        isUrgent:     isToday,
        actionLabel:  "View booking",
        actionHref:   "/account?tab=bookings",
        relatedTitle: row.listing_title,
      });
    }

    // ── Pending co-host invitations ─────────────────────────────────────────
    for (const row of pendingInvitesRes.data ?? []) {
      const hostName = hostNameMap[row.host_id] ?? "A host";
      notifications.push({
        id:           `cohost_invite_${row.id}`,
        type:         "cohost_invitation_pending",
        title:        "Co-host invitation pending",
        description:  `${hostName} invited you to co-host "${row.listing_title}". Accept or decline.`,
        date:         row.sent_at,
        isNew:        isNew(row.sent_at),
        isUrgent:     true,
        actionLabel:  "View invitation",
        actionHref:   "/cohost/invitations",
        relatedTitle: row.listing_title,
      });
    }

    return notifications.sort((a, b) => b.date.localeCompare(a.date));
  } catch {
    return [];
  }
}
