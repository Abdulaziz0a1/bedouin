"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/context/AuthProvider";
import { useLanguage } from "@/context/LanguageProvider";
import type { AppNotification, NotificationType } from "@/lib/services/notifications";

type TFn = (key: string) => string;

// ─────────────────────────────────────────────────────────────────────────────
// Routes where the popup must never appear
// ─────────────────────────────────────────────────────────────────────────────

const EXCLUDED_PREFIXES = ["/login", "/signup", "/booking/"];

function isExcluded(pathname: string): boolean {
  return EXCLUDED_PREFIXES.some((p) => pathname.startsWith(p));
}

// ─────────────────────────────────────────────────────────────────────────────
// Priority scoring: higher = shown first
// Recency (isNew = within 72h) boosts actionable types to the front.
// ─────────────────────────────────────────────────────────────────────────────

function priorityScore(n: AppNotification): number {
  const recent = n.isNew;
  switch (n.type) {
    case "booking_checkin_today":       return 100;
    case "booking_new":                 return recent ? 90 : 15;
    case "listing_rejected":            return recent ? 80 : 30;
    case "booking_checkin_tomorrow":    return 70;
    case "cohost_invitation_pending":   return 60;
    case "listing_approved":            return recent ? 50 : 20;
    default:                            return 5;
  }
}

function buildQueue(
  notifications: AppNotification[],
  dismissed:      Set<string>
): AppNotification[] {
  return notifications
    .filter((n) => !dismissed.has(n.id))
    .sort((a, b) => priorityScore(b) - priorityScore(a));
}

// ─────────────────────────────────────────────────────────────────────────────
// localStorage helpers
// ─────────────────────────────────────────────────────────────────────────────

function dismissedKey(userId: string) {
  return `bedouin:dismissedAnnouncements:${userId}`;
}

function loadDismissed(userId: string): Set<string> {
  try {
    const raw = localStorage.getItem(dismissedKey(userId));
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveDismissed(userId: string, ids: Set<string>) {
  try {
    localStorage.setItem(dismissedKey(userId), JSON.stringify([...ids]));
  } catch {
    // localStorage unavailable — dismiss is ephemeral this session only
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Client-side notification fetch (browser Supabase client, urgent types only)
// ─────────────────────────────────────────────────────────────────────────────

function todayStr()    { return new Date().toISOString().split("T")[0]; }
function tomorrowStr() { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split("T")[0]; }
function daysAgoIso(n: number) { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString(); }
function isNew(iso: string | null) { return !!iso && Date.now() - new Date(iso).getTime() < 72 * 60 * 60 * 1000; }

async function fetchUrgentNotifications(userId: string, activeMode: string, t: TFn): Promise<AppNotification[]> {
  const supabase = createClient();
  const today    = todayStr();
  const tomorrow = tomorrowStr();
  const results: AppNotification[] = [];

  if (activeMode === "host") {
    // Host: listing decisions + check-ins + new bookings + co-host responses
    const [submRes, checkRes, newBkRes, invRes] = await Promise.all([
      supabase
        .from("listing_submissions")
        .select("id, title, status, reviewed_at, rejection_reason, rejected_steps, rejected_step, listing_id")
        .eq("host_id", userId)
        .in("status", ["approved", "rejected"])
        .not("reviewed_at", "is", null)
        .gte("reviewed_at", daysAgoIso(60))
        .order("reviewed_at", { ascending: false })
        .limit(20),

      supabase
        .from("bookings")
        .select("id, reference, listing_title, check_in, guest_name, created_at")
        .eq("host_id", userId)
        .in("check_in", [today, tomorrow])
        .neq("status", "cancelled"),

      supabase
        .from("bookings")
        .select("id, reference, listing_title, check_in, guest_name, created_at")
        .eq("host_id", userId)
        .gte("created_at", daysAgoIso(7))
        .neq("status", "cancelled")
        .order("created_at", { ascending: false })
        .limit(10),

      supabase
        .from("cohost_invitations")
        .select("id, listing_title, cohost_user_id, status, responded_at, sent_at")
        .eq("host_id", userId)
        .in("status", ["accepted", "declined"])
        .gte("responded_at", daysAgoIso(14))
        .order("responded_at", { ascending: false })
        .limit(10),
    ]);

    // Batch fetch slugs for approved listing action URLs
    const approvedIds = (submRes.data ?? [])
      .filter((r) => r.status === "approved" && r.listing_id)
      .map((r) => r.listing_id as string);
    const slugMap: Record<string, string> = {};
    if (approvedIds.length > 0) {
      const { data: lRows } = await supabase
        .from("listings")
        .select("id, slug")
        .in("id", approvedIds);
      (lRows ?? []).forEach((l) => { slugMap[l.id] = l.slug; });
    }

    for (const row of submRes.data ?? []) {
      if (row.status === "rejected") {
        const issueCount = Array.isArray(row.rejected_steps) && row.rejected_steps.length > 0
          ? row.rejected_steps.length
          : row.rejected_step ? 1 : 1;
        const descKey = issueCount === 1 ? "notif.desc.listing_rejected_one" : "notif.desc.listing_rejected_many";
        results.push({
          id:           `listing_rejected_${row.id}`,
          type:         "listing_rejected",
          title:        t("notif.title.listing_needs_changes"),
          description:  t(descKey).replace("{title}", row.title).replace("{count}", String(issueCount)),
          date:         row.reviewed_at,
          isNew:        isNew(row.reviewed_at),
          isUrgent:     true,
          actionLabel:  t("notif.action.review_feedback"),
          actionHref:   "/dashboard?tab=listings",
          relatedTitle: row.title,
        });
      } else if (row.status === "approved") {
        const slug = row.listing_id ? slugMap[row.listing_id as string] : undefined;
        results.push({
          id:           `listing_approved_${row.id}`,
          type:         "listing_approved",
          title:        t("notif.title.listing_approved"),
          description:  t("notif.desc.listing_approved").replace("{title}", row.title),
          date:         row.reviewed_at,
          isNew:        isNew(row.reviewed_at),
          isUrgent:     false,
          actionLabel:  t("notif.action.view_listing"),
          actionHref:   slug ? `/listing/${slug}` : "/dashboard",
          relatedTitle: row.title,
        });
      }
    }

    const checkinIds = new Set((checkRes.data ?? []).map((r) => r.id));
    for (const row of checkRes.data ?? []) {
      const isToday = row.check_in === today;
      results.push({
        id:           `booking_checkin_${row.id}`,
        type:         isToday ? "booking_checkin_today" : "booking_checkin_tomorrow",
        title:        isToday ? t("notif.title.host_checkin_today") : t("notif.title.host_checkin_tomorrow"),
        description:  t("notif.desc.host_checkin")
          .replace("{guest}", row.guest_name)
          .replace("{listing}", row.listing_title)
          .replace("{ref}", row.reference),
        date:         row.check_in + "T00:00:00.000Z",
        isNew:        true,
        isUrgent:     isToday,
        actionLabel:  t("notif.action.view_booking"),
        actionHref:   "/dashboard?tab=bookings",
        relatedTitle: row.listing_title,
      });
    }

    for (const row of newBkRes.data ?? []) {
      if (checkinIds.has(row.id)) continue;
      results.push({
        id:           `booking_new_${row.id}`,
        type:         "booking_new",
        title:        t("notif.title.booking_new"),
        description:  t("notif.desc.booking_new")
          .replace("{guest}", row.guest_name)
          .replace("{listing}", row.listing_title)
          .replace("{date}", row.check_in),
        date:         row.created_at,
        isNew:        isNew(row.created_at),
        isUrgent:     false,
        actionLabel:  t("notif.action.view_booking"),
        actionHref:   "/dashboard?tab=bookings",
        relatedTitle: row.listing_title,
      });
    }

    // Co-host names for invitation responses
    const cohostIds = [...new Set((invRes.data ?? []).map((r) => r.cohost_user_id))];
    const nameMap: Record<string, string> = {};
    if (cohostIds.length > 0) {
      const { data: pRows } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", cohostIds);
      (pRows ?? []).forEach((p) => {
        nameMap[p.id] = `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || "Co-host";
      });
    }
    for (const row of invRes.data ?? []) {
      const name = nameMap[row.cohost_user_id] ?? "Co-host";
      const responded = row.responded_at ?? row.sent_at;
      if (row.status === "accepted") {
        results.push({
          id:           `cohost_accepted_${row.id}`,
          type:         "cohost_invitation_accepted",
          title:        t("notif.title.cohost_accepted"),
          description:  t("notif.desc.cohost_accepted")
            .replace("{name}", name)
            .replace("{listing}", row.listing_title),
          date:         responded,
          isNew:        isNew(responded),
          isUrgent:     false,
          actionLabel:  t("notif.action.view_cohosts"),
          actionHref:   "/dashboard?tab=cohosts",
          relatedTitle: row.listing_title,
        });
      } else if (row.status === "declined") {
        results.push({
          id:           `cohost_declined_${row.id}`,
          type:         "cohost_invitation_declined",
          title:        t("notif.title.cohost_declined"),
          description:  t("notif.desc.cohost_declined")
            .replace("{name}", name)
            .replace("{listing}", row.listing_title),
          date:         responded,
          isNew:        isNew(responded),
          isUrgent:     false,
          actionLabel:  t("notif.action.browse_cohosts"),
          actionHref:   "/cohost",
          relatedTitle: row.listing_title,
        });
      }
    }
  } else {
    // Guest / co-host: check-ins + pending invitations
    const [checkRes, invRes] = await Promise.all([
      supabase
        .from("bookings")
        .select("id, reference, listing_title, check_in, created_at")
        .eq("user_id", userId)
        .in("check_in", [today, tomorrow])
        .neq("status", "cancelled"),

      supabase
        .from("cohost_invitations")
        .select("id, listing_title, host_id, sent_at")
        .eq("cohost_user_id", userId)
        .eq("status", "pending")
        .order("sent_at", { ascending: false })
        .limit(10),
    ]);

    for (const row of checkRes.data ?? []) {
      const isToday = row.check_in === today;
      results.push({
        id:           `guest_checkin_${row.id}`,
        type:         isToday ? "booking_checkin_today" : "booking_checkin_tomorrow",
        title:        isToday ? t("notif.title.guest_checkin_today") : t("notif.title.guest_checkin_tomorrow"),
        description:  t("notif.desc.guest_checkin")
          .replace("{listing}", row.listing_title)
          .replace("{ref}", row.reference),
        date:         row.check_in + "T00:00:00.000Z",
        isNew:        true,
        isUrgent:     isToday,
        actionLabel:  t("notif.action.view_booking"),
        actionHref:   "/account?tab=bookings",
        relatedTitle: row.listing_title,
      });
    }

    const hostIds = [...new Set((invRes.data ?? []).map((r) => r.host_id))];
    const hostMap: Record<string, string> = {};
    if (hostIds.length > 0) {
      const { data: pRows } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", hostIds);
      (pRows ?? []).forEach((p) => {
        hostMap[p.id] = `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || "A host";
      });
    }
    for (const row of invRes.data ?? []) {
      const hostName = hostMap[row.host_id] ?? "A host";
      results.push({
        id:           `cohost_invite_${row.id}`,
        type:         "cohost_invitation_pending",
        title:        t("notif.title.cohost_pending"),
        description:  t("notif.desc.cohost_pending")
          .replace("{host}", hostName)
          .replace("{listing}", row.listing_title),
        date:         row.sent_at,
        isNew:        isNew(row.sent_at),
        isUrgent:     true,
        actionLabel:  t("notif.action.view_invitation"),
        actionHref:   "/cohost/invitations",
        relatedTitle: row.listing_title,
      });
    }
  }

  return results.sort((a, b) => b.date.localeCompare(a.date));
}

// ─────────────────────────────────────────────────────────────────────────────
// Icon per type
// ─────────────────────────────────────────────────────────────────────────────

const TYPE_META: Record<NotificationType, {
  icon:      React.ReactNode;
  iconBg:    string;
  iconColor: string;
  accent:    string;
}> = {
  listing_rejected: {
    iconBg: "bg-red-100", iconColor: "text-red-500", accent: "bg-red-500",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    ),
  },
  booking_checkin_today: {
    iconBg: "bg-[#fdf8ee]", iconColor: "text-[#8b6a1f]", accent: "bg-[#c49a4f]",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  booking_checkin_tomorrow: {
    iconBg: "bg-[#f0e8de]", iconColor: "text-[#8b5e38]", accent: "bg-[#8b5e38]",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  booking_new: {
    iconBg: "bg-[#eef3ff]", iconColor: "text-[#0036a3]", accent: "bg-[#0036a3]",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M8 14l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  cohost_invitation_pending: {
    iconBg: "bg-[#fdf8ee]", iconColor: "text-[#8b6a1f]", accent: "bg-[#c49a4f]",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 2L15 22 11 13 2 9l20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  listing_approved: {
    iconBg: "bg-[#f0faf5]", iconColor: "text-[#049153]", accent: "bg-[#049153]",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  cohost_invitation_accepted: {
    iconBg: "bg-[#f0faf5]", iconColor: "text-[#049153]", accent: "bg-[#049153]",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3 20c0-4 2.7-7 6-7s6 3 6 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M16 11l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  cohost_invitation_declined: {
    iconBg: "bg-red-100", iconColor: "text-red-500", accent: "bg-red-400",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3 20c0-4 2.7-7 6-7s6 3 6 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M18 12l4 4M22 12l-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export default function AnnouncementPopup() {
  const { user, loading, activeMode } = useAuth();
  const { t } = useLanguage();
  const pathname = usePathname();
  const router   = useRouter();

  const [queue,        setQueue]        = useState<AppNotification[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible,      setVisible]      = useState(false);

  // Clamp index and hide when queue empties after a dismiss
  useEffect(() => {
    if (queue.length === 0) {
      setVisible(false);
    } else {
      setCurrentIndex((i) => Math.min(i, queue.length - 1));
    }
  }, [queue.length]);

  const dismiss = useCallback((id: string) => {
    if (!user) return;
    const dismissed = loadDismissed(user.id);
    dismissed.add(id);
    saveDismissed(user.id, dismissed);
    setQueue((prev) => prev.filter((n) => n.id !== id));
  }, [user]);

  const handleAction = useCallback(() => {
    const n = queue[currentIndex];
    if (!n) return;
    const href = n.actionHref;
    dismiss(n.id);
    if (href) router.push(href);
  }, [queue, currentIndex, dismiss, router]);

  useEffect(() => {
    if (loading || !user || isExcluded(pathname)) {
      setVisible(false);
      return;
    }

    let cancelled = false;

    fetchUrgentNotifications(user.id, activeMode, t)
      .then((all) => {
        if (cancelled) return;
        const dismissed = loadDismissed(user.id);
        const q = buildQueue(all, dismissed);
        if (q.length > 0) {
          setQueue(q);
          setCurrentIndex(0);
          setTimeout(() => { if (!cancelled) setVisible(true); }, 800);
        }
      })
      .catch(() => { /* silent — popup is non-critical */ });

    return () => { cancelled = true; };
  }, [user?.id, activeMode, pathname, t]); // eslint-disable-line react-hooks/exhaustive-deps

  const current = queue[currentIndex];
  if (!current || !visible) return null;

  const meta  = TYPE_META[current.type];
  const total = queue.length;

  return (
    <>
      {/* ── Backdrop ──────────────────────────────────────────────────────── */}
      <div
        className="fixed inset-0 z-[200] bg-[#1a0e02]/50 backdrop-blur-[2px] transition-opacity duration-300"
        onClick={() => dismiss(current.id)}
        aria-hidden="true"
      />

      {/* ── Modal ─────────────────────────────────────────────────────────── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="announcement-title"
        className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none"
      >
        <div className="relative w-full max-w-sm pointer-events-auto bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">

          {/* Accent stripe */}
          <div className={`h-1 w-full ${meta.accent}`} />

          {/* Close button */}
          <button
            onClick={() => dismiss(current.id)}
            aria-label="Close announcement"
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-xl bg-[#f4f6f8] hover:bg-[#e8dfd4] transition-colors text-[#64707d] hover:text-[#1a0e02]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </button>

          <div className="px-6 pb-6 pt-5 flex flex-col items-center text-center">

            {/* Icon */}
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${meta.iconBg} ${meta.iconColor}`}>
              {meta.icon}
            </div>

            {/* Title */}
            <h2
              id="announcement-title"
              className="font-display font-extrabold text-[#1a0e02] text-xl mb-2 leading-tight"
            >
              {current.title}
            </h2>

            {/* Description */}
            <p className="text-sm text-[#64707d] leading-relaxed mb-4 max-w-[280px]">
              {current.description}
            </p>

            {/* Related listing pill */}
            {current.relatedTitle && (
              <div className="flex items-center gap-1.5 mb-5 px-3 py-1.5 bg-[#faf7f4] border border-[#e8dfd4] rounded-full">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" className="text-[#a09080] shrink-0">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                </svg>
                <span className="text-[11px] font-semibold text-[#8b5e38] max-w-[220px] truncate">
                  {current.relatedTitle}
                </span>
              </div>
            )}

            {/* Primary CTA */}
            {current.actionLabel && (
              <button
                onClick={handleAction}
                className="w-full py-3 bg-[#8b5e38] text-white text-sm font-bold rounded-2xl hover:bg-[#7a5030] transition-colors mb-3"
              >
                {current.actionLabel}
              </button>
            )}

            {/* Navigation row: dismiss link left, pagination center/right */}
            <div className="flex items-center w-full">
              <button
                onClick={() => dismiss(current.id)}
                className="text-xs text-[#a09080] hover:text-[#64707d] transition-colors font-medium"
              >
                Remind me later
              </button>

              {total > 1 && (
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                    disabled={currentIndex === 0}
                    aria-label="Previous notification"
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#f0e8de] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-[#64707d]"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <span className="text-xs font-medium text-[#a09080] tabular-nums">
                    {currentIndex + 1} / {total}
                  </span>
                  <button
                    onClick={() => setCurrentIndex((i) => Math.min(total - 1, i + 1))}
                    disabled={currentIndex === total - 1}
                    aria-label="Next notification"
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#f0e8de] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-[#64707d]"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
