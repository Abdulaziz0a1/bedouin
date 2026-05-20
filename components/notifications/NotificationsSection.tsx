"use client";

import { useState } from "react";
import Link from "next/link";
import type { AppNotification, NotificationType } from "@/lib/services/notifications";
import { useLanguage } from "@/context/LanguageProvider";

// ─────────────────────────────────────────────────────────────────────────────
// Type metadata (visual only — labels resolved via translation keys)
// ─────────────────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<NotificationType, {
  tKey:      string;
  bg:        string;
  border:    string;
  textColor: string;
  dotColor:  string;
  icon:      React.ReactNode;
}> = {
  listing_approved: {
    tKey:      "notif.type.listing_approved",
    bg:        "bg-[#f0faf5]",
    border:    "border-[#9edcbb]",
    textColor: "text-[#049153]",
    dotColor:  "bg-[#049153]",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  listing_rejected: {
    tKey:      "notif.type.listing_rejected",
    bg:        "bg-red-50",
    border:    "border-red-200",
    textColor: "text-red-600",
    dotColor:  "bg-red-500",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  booking_new: {
    tKey:      "notif.type.booking_new",
    bg:        "bg-[#eef3ff]",
    border:    "border-[#b3c8f5]",
    textColor: "text-[#0036a3]",
    dotColor:  "bg-[#0036a3]",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.7" />
        <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    ),
  },
  booking_checkin_today: {
    tKey:      "notif.type.booking_checkin_today",
    bg:        "bg-[#fdf8ee]",
    border:    "border-[#ead9a6]",
    textColor: "text-[#8b6a1f]",
    dotColor:  "bg-[#c49a4f]",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.7" />
        <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    ),
  },
  booking_checkin_tomorrow: {
    tKey:      "notif.type.booking_checkin_tomorrow",
    bg:        "bg-[#faf7f4]",
    border:    "border-[#e8dfd4]",
    textColor: "text-[#64707d]",
    dotColor:  "bg-[#a09080]",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.7" />
        <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    ),
  },
  cohost_invitation_pending: {
    tKey:      "notif.type.cohost_invitation_pending",
    bg:        "bg-[#fdf8ee]",
    border:    "border-[#ead9a6]",
    textColor: "text-[#8b6a1f]",
    dotColor:  "bg-[#c49a4f]",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 2L15 22 11 13 2 9l20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  cohost_invitation_accepted: {
    tKey:      "notif.type.cohost_invitation_accepted",
    bg:        "bg-[#f0faf5]",
    border:    "border-[#9edcbb]",
    textColor: "text-[#049153]",
    dotColor:  "bg-[#049153]",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.7" />
        <path d="M3 20c0-4 2.7-7 6-7s6 3 6 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M16 11l2 2 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  cohost_invitation_declined: {
    tKey:      "notif.type.cohost_invitation_declined",
    bg:        "bg-red-50",
    border:    "border-red-200",
    textColor: "text-red-600",
    dotColor:  "bg-red-400",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.7" />
        <path d="M3 20c0-4 2.7-7 6-7s6 3 6 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M18 12l4 4M22 12l-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    ),
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

type TFn = (key: string) => string;

function relativeTime(iso: string, t: TFn, lang: string): string {
  const diffMs  = Date.now() - new Date(iso).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 2)   return t("notif.time.just_now");
  if (diffMin < 60)  return t("notif.time.m_ago").replace("{n}", String(diffMin));
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24)    return t("notif.time.h_ago").replace("{n}", String(diffH));
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1)   return t("notif.time.yesterday");
  if (diffD < 7)     return t("notif.time.d_ago").replace("{n}", String(diffD));
  if (diffD < 30)    return t("notif.time.w_ago").replace("{n}", String(Math.floor(diffD / 7)));
  const locale = lang === "ar" ? "ar-SA" : "en-GB";
  return new Date(iso).toLocaleDateString(locale, { day: "numeric", month: "short" });
}

type FilterValue = "all" | "urgent" | "listings" | "bookings" | "cohosts";

function matchesFilter(n: AppNotification, filter: FilterValue): boolean {
  if (filter === "all")      return true;
  if (filter === "urgent")   return n.isUrgent;
  if (filter === "listings") return n.type === "listing_approved" || n.type === "listing_rejected";
  if (filter === "bookings") return n.type.startsWith("booking_");
  if (filter === "cohosts")  return n.type.startsWith("cohost_");
  return true;
}

const FILTER_OPTIONS: { value: FilterValue; tKey: string }[] = [
  { value: "all",      tKey: "notif.filter.all"      },
  { value: "urgent",   tKey: "notif.filter.urgent"   },
  { value: "listings", tKey: "notif.filter.listings" },
  { value: "bookings", tKey: "notif.filter.bookings" },
  { value: "cohosts",  tKey: "notif.filter.cohosts"  },
];

const NO_FILTER_KEY: Record<FilterValue, string> = {
  all:      "notif.no_all",
  urgent:   "notif.no_urgent",
  listings: "notif.no_listings",
  bookings: "notif.no_bookings",
  cohosts:  "notif.no_cohosts",
};

// ─────────────────────────────────────────────────────────────────────────────
// NotificationCard
// ─────────────────────────────────────────────────────────────────────────────

function NotificationCard({ n }: { n: AppNotification }) {
  const { t, lang } = useLanguage();
  const cfg = TYPE_CONFIG[n.type];

  return (
    <div className={`relative bg-white border rounded-2xl overflow-hidden transition-shadow hover:shadow-sm ${n.isNew ? "border-[#d4b896]" : "border-[#e8dfd4]"}`}>
      {/* Urgent left accent */}
      {n.isUrgent && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#c49a4f] rounded-l-2xl" />
      )}

      <div className={`flex items-start gap-4 p-4 ${n.isUrgent ? "pl-5" : ""}`}>
        {/* Icon badge */}
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${cfg.bg} ${cfg.textColor} ${cfg.border}`}>
          {cfg.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-start justify-between gap-3 mb-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-[#1a0e02] text-sm leading-tight">{n.title}</p>
              {n.isNew && (
                <span className="text-[9px] font-bold uppercase tracking-wide text-white bg-[#8b5e38] px-1.5 py-0.5 rounded-full leading-none shrink-0">
                  {t("notif.new_badge")}
                </span>
              )}
            </div>
            <span className="text-[10px] text-[#a09080] shrink-0 mt-0.5 whitespace-nowrap">
              {relativeTime(n.date, t, lang)}
            </span>
          </div>

          {/* Type chip */}
          <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md border mb-1.5 ${cfg.bg} ${cfg.textColor} ${cfg.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`} />
            {t(cfg.tKey)}
          </span>

          {/* Description */}
          <p className="text-xs text-[#64707d] leading-relaxed mb-2.5">{n.description}</p>

          {/* Related listing pill */}
          {n.relatedTitle && (
            <div className="flex items-center gap-1.5 mb-2.5">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="text-[#a09080] shrink-0">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              </svg>
              <span className="text-[10px] font-medium text-[#8b5e38] truncate">{n.relatedTitle}</span>
            </div>
          )}

          {/* Action link */}
          {n.actionLabel && n.actionHref && (
            <Link
              href={n.actionHref}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8b5e38] hover:text-[#461e00] transition-colors"
            >
              {n.actionLabel}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────

export default function NotificationsSection({
  notifications,
  error,
}: {
  notifications: AppNotification[];
  error?:        string;
}) {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");

  const newCount    = notifications.filter((n) => n.isNew).length;
  const urgentCount = notifications.filter((n) => n.isUrgent).length;
  const visible     = notifications.filter((n) => matchesFilter(n, activeFilter));

  const countLabel = notifications.length === 0
    ? t("notif.no_yet")
    : notifications.length === 1
      ? t("notif.count_one")
      : t("notif.count_many").replace("{count}", String(notifications.length));

  const newSuffix = newCount > 0
    ? t("notif.new_suffix").replace("{count}", String(newCount))
    : "";

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-display font-bold text-[#1a0e02] text-xl mb-1">{t("notif.title")}</h2>
          <p className="text-sm text-[#64707d]">{countLabel}{newSuffix}</p>
        </div>

        {urgentCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#fdf8ee] border border-[#ead9a6] rounded-xl">
            <span className="w-2 h-2 rounded-full bg-[#c49a4f] animate-pulse" />
            <span className="text-xs font-semibold text-[#8b6a1f]">
              {urgentCount === 1
                ? t("notif.urgent_one").replace("{count}", String(urgentCount))
                : t("notif.urgent_many").replace("{count}", String(urgentCount))}
            </span>
          </div>
        )}
      </div>

      {/* Filter chips */}
      {notifications.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setActiveFilter(opt.value)}
              className={[
                "text-xs font-semibold px-3 py-1.5 rounded-full border transition-all",
                activeFilter === opt.value
                  ? "bg-[#1a0e02] text-white border-[#1a0e02]"
                  : "text-[#64707d] border-[#e8dfd4] hover:border-[#8b5e38] bg-white",
              ].join(" ")}
            >
              {t(opt.tKey)}
            </button>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-red-500 shrink-0">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!error && notifications.length === 0 && (
        <div className="flex flex-col items-center text-center py-16 px-6 bg-white rounded-2xl border border-[#e8dfd4]">
          <div className="w-14 h-14 rounded-2xl bg-[#f0e8de] flex items-center justify-center text-[#8b5e38] mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3 className="font-display font-semibold text-[#1a0e02] text-lg mb-2">{t("notif.empty.title")}</h3>
          <p className="text-sm text-[#64707d] max-w-xs leading-relaxed">
            {t("notif.empty.desc")}
          </p>
        </div>
      )}

      {/* No results for current filter */}
      {!error && notifications.length > 0 && visible.length === 0 && (
        <div className="text-center py-10">
          <p className="text-sm text-[#a09080]">{t(NO_FILTER_KEY[activeFilter])}</p>
        </div>
      )}

      {/* Notification list */}
      {visible.length > 0 && (
        <div className="flex flex-col gap-3">
          {visible.map((n) => (
            <NotificationCard key={n.id} n={n} />
          ))}
        </div>
      )}

      {/* Footer note */}
      {notifications.length > 0 && (
        <p className="text-[10px] text-center text-[#a09080]">
          {t("notif.footer")}
        </p>
      )}
    </div>
  );
}
