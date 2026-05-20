"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  type DashboardListing,
  type DashboardBooking,
  type EarningsMonth,
} from "@/lib/data/dashboard";
import type { CoHostAssignment, CoHostInvitation } from "@/lib/types/cohost";
import type { AppNotification } from "@/lib/services/notifications";
import OverviewSection       from "./sections/OverviewSection";
import ListingsSection       from "./sections/ListingsSection";
import BookingsSection       from "./sections/BookingsSection";
import EarningsSection       from "./sections/EarningsSection";
import CoHostSection         from "./sections/CoHostSection";
import NotificationsSection  from "@/components/notifications/NotificationsSection";
import { useLanguage }       from "@/context/LanguageProvider";

type Tab = "overview" | "listings" | "bookings" | "earnings" | "cohosts" | "notifications";

const VALID_TABS = new Set<Tab>(["overview", "listings", "bookings", "earnings", "cohosts", "notifications"]);

type TabDef = { id: Tab; tKey: string; icon: React.ReactNode };

const TAB_DEFS: TabDef[] = [
  {
    id: "overview",
    tKey: "dash.tab.overview",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    ),
  },
  {
    id: "listings",
    tKey: "dash.tab.listings",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "bookings",
    tKey: "dash.tab.bookings",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.7" />
        <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "earnings",
    tKey: "dash.tab.earnings",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "cohosts",
    tKey: "dash.tab.cohosts",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.7" />
        <path d="M3 20c0-4 2.7-7 6-7s6 3 6 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M21 18c0-3.5-2.24-6-5-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "notifications",
    tKey: "dash.tab.notifications",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function HostDashboard({
  listings,
  bookings,
  hostName,
  hostAvatar,
  cohostAssignments = [],
  cohostInvitations = [],
  notifications     = [],
}: {
  listings:           DashboardListing[];
  cohostAssignments?: CoHostAssignment[];
  cohostInvitations?: CoHostInvitation[];
  notifications?:     AppNotification[];
  bookings:           DashboardBooking[];
  hostName:           string;
  hostAvatar:         string;
}) {
  const { t, lang }   = useLanguage();
  const searchParams  = useSearchParams();
  const tabParam      = searchParams.get("tab") as Tab | null;
  const resolvedTab   = tabParam && VALID_TABS.has(tabParam) ? tabParam : "overview";

  const [activeTab, setActiveTab] = useState<Tab>(resolvedTab);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Sync when the URL tab param changes (e.g. Navbar "My Listings" from same page)
  useEffect(() => {
    if (tabParam && VALID_TABS.has(tabParam)) setActiveTab(tabParam);
  }, [tabParam]);

  const dateLocale = lang === "ar" ? "ar-SA" : "en-GB";
  const fmtDate = new Date().toLocaleDateString(dateLocale, { weekday: "long", day: "numeric", month: "long" });

  // Compute KPIs from real data.
  const kpis = useMemo(() => {
    const activeListings = listings.filter((l) => l.status === "approved").length;
    const totalBookings  = bookings.length;
    const upcomingCount  = bookings.filter((b) => b.status === "upcoming").length;
    const totalEarnings  = bookings
      .filter((b) => b.status === "completed")
      .reduce((s, b) => s + b.hostPayout, 0);
    const avgRatingListings = listings.filter((l) => l.avgRating > 0);
    const avgRating = avgRatingListings.length > 0
      ? avgRatingListings.reduce((s, l) => s + l.avgRating, 0) / avgRatingListings.length
      : 0;

    // Derive earnings history from real completed bookings (last 6 months).
    // Empty array when no completed bookings exist — honest state, not mock data.
    const completedBookings = bookings.filter((b) => b.status === "completed");
    let earningsHistory: EarningsMonth[] = [];

    if (completedBookings.length > 0) {
      const byMonth: Record<string, { gross: number; count: number; year: number; month: string }> = {};
      for (const b of completedBookings) {
        const d = new Date(b.createdAt);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        if (!byMonth[key]) {
          byMonth[key] = {
            year:  d.getFullYear(),
            month: d.toLocaleDateString("en-GB", { month: "short" }),
            gross: 0,
            count: 0,
          };
        }
        byMonth[key].gross += b.totalPrice;
        byMonth[key].count += 1;
      }
      const sorted = Object.values(byMonth)
        .sort((a, b) => new Date(`${a.year} ${a.month}`).getTime() - new Date(`${b.year} ${b.month}`).getTime())
        .slice(-6);

      if (sorted.length > 0) {
        earningsHistory = sorted.map((m) => ({
          month:    m.month,
          year:     m.year,
          gross:    m.gross,
          payout:   Math.round(m.gross * 0.825),
          bookings: m.count,
        }));
      }
    }

    const thisMonth  = earningsHistory[earningsHistory.length - 1]?.payout ?? 0;
    const lastMonth  = earningsHistory[earningsHistory.length - 2]?.payout ?? 0;
    const earningsDelta = lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : 0;

    return {
      activeListings, totalBookings, upcomingCount,
      totalEarnings, avgRating,
      earningsHistory, thisMonth, earningsDelta,
    };
  }, [listings, bookings]);

  return (
    <div className="min-h-screen pt-[74px]" style={{ background: "var(--bg-sand)" }}>

      {/* Tab bar (sticks below global Navbar) */}
      <header
        className="sticky top-[74px] z-[39]"
        style={{
          background: "rgba(255,254,252,0.97)",
          backdropFilter: "blur(16px) saturate(1.6)",
          WebkitBackdropFilter: "blur(16px) saturate(1.6)",
          borderBottom: "1px solid var(--border)",
          boxShadow: "0 1px 12px rgba(70,30,0,0.06)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">

          {/* Desktop tabs */}
          <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
            {TAB_DEFS.map((tab) => {
              const notifBadge = tab.id === "notifications" && notifications.filter((n) => n.isNew).length;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[0.8125rem] font-semibold transition-all duration-150"
                  style={{
                    color: isActive ? "#1a0e02" : "#8b7b6a",
                    background: isActive ? "rgba(196,154,79,0.10)" : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "rgba(70,30,0,0.05)";
                    if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = "#1a0e02";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                    if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = "#8b7b6a";
                  }}
                >
                  {/* Gold underline for active */}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full"
                      style={{ background: "linear-gradient(90deg, transparent, #c49a4f, transparent)" }}
                    />
                  )}
                  <span style={{ opacity: isActive ? 1 : 0.7 }}>{tab.icon}</span>
                  {t(tab.tKey)}
                  {!!notifBadge && (
                    <span
                      className="text-[9px] font-bold min-w-[16px] h-[16px] px-0.5 flex items-center justify-center rounded-full"
                      style={{ background: "#8b5e38", color: "white" }}
                    >
                      {notifBadge > 99 ? "99+" : notifBadge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Mobile menu toggle */}
          <div className="md:hidden shrink-0">
            <button
              className="p-2 rounded-lg transition-colors"
              style={{ color: "#1a0e02" }}
              onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.background = "rgba(70,30,0,0.06)"}
              onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.background = "transparent"}
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile nav drawer */}
        {mobileNavOpen && (
          <div
            className="md:hidden px-4 py-3 flex flex-col gap-0.5"
            style={{ borderTop: "1px solid var(--border-light)" }}
          >
            {TAB_DEFS.map((tab) => {
              const notifBadge = tab.id === "notifications" && notifications.filter((n) => n.isNew).length;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setMobileNavOpen(false); }}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all text-left"
                  style={{
                    background: isActive ? "rgba(196,154,79,0.10)" : "transparent",
                    color: isActive ? "#1a0e02" : "#8b7b6a",
                  }}
                >
                  {tab.icon}
                  {t(tab.tKey)}
                  {!!notifBadge && (
                    <span className="ml-auto text-[9px] font-bold min-w-[16px] h-[16px] px-0.5 flex items-center justify-center rounded-full bg-[#8b5e38] text-white">
                      {notifBadge > 99 ? "99+" : notifBadge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Page header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-eyebrow mb-1.5">{fmtDate}</p>
            <h1 className="font-display font-extrabold text-[#1a0e02]" style={{ fontSize: "clamp(1.6rem, 3vw, 2rem)" }}>
              {t("dash.welcome_back")} {hostName.split(" ")[0]}
            </h1>
            <p className="text-[#64707d] text-sm mt-1.5 leading-snug">
              {kpis.upcomingCount === 0
                ? t("dash.no_checkins")
                : kpis.upcomingCount === 1
                  ? t("dash.upcoming_one")
                  : t("dash.upcoming_many").replace("{count}", String(kpis.upcomingCount))}
            </p>
          </div>

          {activeTab === "listings" && (
            <a
              href="/host/new"
              className="sm:shrink-0 flex items-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-xl transition-all duration-150 hover:-translate-y-px"
              style={{
                background: "linear-gradient(135deg, #8b5e38 0%, #6a4428 100%)",
                boxShadow: "0 4px 14px rgba(139,94,56,0.28), inset 0 1px 0 rgba(255,255,255,0.10)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              {t("dash.add_listing")}
            </a>
          )}
        </div>

        {/* Content */}
        {activeTab === "overview"       && <OverviewSection  listings={listings} bookings={bookings} kpis={kpis} />}
        {activeTab === "listings"       && <ListingsSection  listings={listings} />}
        {activeTab === "bookings"       && <BookingsSection  bookings={bookings} />}
        {activeTab === "earnings"       && <EarningsSection  earningsHistory={kpis.earningsHistory} kpis={kpis} />}
        {activeTab === "cohosts"        && (
          <CoHostSection
            listings={listings}
            assignments={cohostAssignments}
            invitations={cohostInvitations}
          />
        )}
        {activeTab === "notifications"  && <NotificationsSection notifications={notifications} />}

      </main>
    </div>
  );
}
