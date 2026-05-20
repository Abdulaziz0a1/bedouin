"use client";

import Link from "next/link";
import type { ActivityEvent } from "@/lib/types/user";
import UserEmptyState from "../shared/UserEmptyState";
import { useLanguage } from "@/context/LanguageProvider";

const ACTIVITY_CONFIG: Record<
  ActivityEvent["type"],
  { icon: React.ReactNode; color: string; bg: string; labelKey: string }
> = {
  booking_created: {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    color: "text-[#0046cc]",
    bg:    "bg-[#eef3ff]",
    labelKey: "activity.booking",
  },
  booking_confirmed: {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
    color: "text-[#049153]",
    bg:    "bg-[#f0faf5]",
    labelKey: "activity.booking",
  },
  booking_completed: {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      </svg>
    ),
    color: "text-[#c49a4f]",
    bg:    "bg-[#fdf8ee]",
    labelKey: "activity.completed",
  },
  booking_cancelled: {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
        <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    color: "text-red-500",
    bg:    "bg-red-50",
    labelKey: "activity.cancelled",
  },
  listing_saved: {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M12 21S3 14 3 8.5C3 5.42 5.42 3 8.5 3 10.24 3 11.91 3.81 13 5.09 14.09 3.81 15.76 3 17.5 3 20.58 3 23 5.42 23 8.5 23 14 12 21 12 21z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    color: "text-[#8b5e38]",
    bg:    "bg-[#fdf5ee]",
    labelKey: "activity.saved",
  },
  listing_unsaved: {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M12 21S3 14 3 8.5C3 5.42 5.42 3 8.5 3 10.24 3 11.91 3.81 13 5.09 14.09 3.81 15.76 3 17.5 3 20.58 3 23 5.42 23 8.5 23 14 12 21 12 21z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    color: "text-[#64707d]",
    bg:    "bg-[#f4f6f8]",
    labelKey: "activity.saved",
  },
  review_submitted: {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
    color: "text-[#8b5e38]",
    bg:    "bg-[#fdf5ee]",
    labelKey: "activity.review",
  },
  profile_updated: {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
        <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    color: "text-[#64707d]",
    bg:    "bg-[#f4f6f8]",
    labelKey: "activity.review",
  },
};

type TFn = (key: string) => string;

function timeAgo(isoString: string, t: TFn, lang: string): string {
  const now  = Date.now();
  const then = new Date(isoString).getTime();
  const diff = Math.floor((now - then) / 1000);
  const locale = lang === "ar" ? "ar-SA" : "en-GB";

  if (diff < 60)          return t("notif.time.just_now");
  if (diff < 3600)        return t("notif.time.m_ago").replace("{n}", String(Math.floor(diff / 60)));
  if (diff < 86400)       return t("notif.time.h_ago").replace("{n}", String(Math.floor(diff / 3600)));
  if (diff < 86400 * 7)   return t("notif.time.d_ago").replace("{n}", String(Math.floor(diff / 86400)));
  if (diff < 86400 * 30)  return t("notif.time.w_ago").replace("{n}", String(Math.floor(diff / 86400 / 7)));
  return new Date(isoString).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
}

function ActivityRow({ event }: { event: ActivityEvent }) {
  const { t, lang } = useLanguage();
  const cfg = ACTIVITY_CONFIG[event.type];

  return (
    <div className="flex items-start gap-4 py-4 border-b last:border-0 border-[#f0e8de]">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${cfg.bg} ${cfg.color}`}>
        {cfg.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#1a0e02]">{event.title}</p>
        <p className="text-xs text-[#64707d] mt-0.5 leading-relaxed">{event.description}</p>
        <p className="text-[10px] text-[#a09080] mt-1.5">{timeAgo(event.timestamp, t, lang)}</p>
      </div>
      {event.relatedImage && event.relatedId && (
        <Link href={`/listing/${event.relatedId}`} className="shrink-0">
          <img
            src={event.relatedImage}
            alt=""
            className="w-14 h-10 rounded-xl object-cover border border-[#e8dfd4] hover:opacity-90 transition-opacity"
          />
        </Link>
      )}
    </div>
  );
}

function groupByMonth(events: ActivityEvent[], lang: string): { label: string; events: ActivityEvent[] }[] {
  const locale = lang === "ar" ? "ar-SA" : "en-GB";
  const groups: Map<string, ActivityEvent[]> = new Map();
  for (const event of events) {
    const key = new Date(event.timestamp).toLocaleDateString(locale, { month: "long", year: "numeric" });
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(event);
  }
  return Array.from(groups.entries()).map(([label, evts]) => ({ label, events: evts }));
}

const LEGEND_TYPES: ActivityEvent["type"][] = [
  "booking_created",
  "booking_completed",
  "listing_saved",
  "review_submitted",
  "booking_cancelled",
];

export default function UserActivitySection() {
  const { t, lang } = useLanguage();
  const sorted: ActivityEvent[] = [];
  const groups = groupByMonth(sorted, lang);

  return (
    <div className="flex flex-col gap-6">

      <div>
        <h2 className="font-display font-semibold text-[#1a0e02] text-lg">{t("activity.heading")}</h2>
        <p className="text-xs text-[#64707d] mt-0.5">{t("activity.subtitle")}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {LEGEND_TYPES.map((type) => {
          const cfg = ACTIVITY_CONFIG[type];
          return (
            <span
              key={type}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cfg.bg} ${cfg.color}`}
            >
              {cfg.icon}
              {t(cfg.labelKey)}
            </span>
          );
        })}
      </div>

      {sorted.length === 0 ? (
        <UserEmptyState
          icon={
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" />
              <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
          title={t("activity.empty.title")}
          description={t("activity.empty.desc")}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map(({ label, events }) => (
            <div key={label} className="bg-white border border-[#e8dfd4] rounded-2xl overflow-hidden">
              <div className="px-5 py-3 bg-[#faf7f4] border-b border-[#f0e8de]">
                <p className="text-[10px] font-bold text-[#64707d] uppercase tracking-widest">{label}</p>
              </div>
              <div className="px-5 py-1">
                {events.map((event) => (
                  <ActivityRow key={event.id} event={event} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
