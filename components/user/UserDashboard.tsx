"use client";

import { useState } from "react";
import type { UserBooking, SavedListing } from "@/lib/types/user";
import type { CohostAssignmentItem, CohostInboxItem } from "@/lib/services/cohost";
import type { AppNotification } from "@/lib/services/notifications";
import type { SupportTicket } from "@/lib/types/support";
import UserOverviewSection   from "./sections/UserOverviewSection";
import UserBookingsSection   from "./sections/UserBookingsSection";
import UserSavedSection      from "./sections/UserSavedSection";
import UserActivitySection   from "./sections/UserActivitySection";
import UserAccountSection    from "./sections/UserAccountSection";
import UserCohostSection     from "./sections/UserCohostSection";
import UserSupportSection    from "./sections/UserSupportSection";
import NotificationsSection  from "@/components/notifications/NotificationsSection";

type Tab = "overview" | "bookings" | "saved" | "activity" | "account" | "cohost" | "support" | "notifications";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: "overview",
    label: "Overview",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <rect x="3"  y="3"  width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
        <rect x="14" y="3"  width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
        <rect x="3"  y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    ),
  },
  {
    id: "bookings",
    label: "Bookings",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.7" />
        <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "saved",
    label: "Saved",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M12 21S3 14 3 8.5C3 5.42 5.42 3 8.5 3 10.24 3 11.91 3.81 13 5.09 14.09 3.81 15.76 3 17.5 3 20.58 3 23 5.42 23 8.5 23 14 12 21 12 21z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "activity",
    label: "Activity",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.7" />
        <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "account",
    label: "Account",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.7" />
        <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "cohost",
    label: "Co-host",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <circle cx="9" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.7" />
        <path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M21 18c0-3.5-2.24-6-5-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "support",
    label: "Support",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M8 10h8M8 14h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

type ApplicationStatus = "pending" | "approved" | "rejected" | null;

export default function UserDashboard({
  bookings,
  userName,
  userAvatar,
  userEmail             = "",
  userFirstName         = "",
  userLastName          = "",
  userPhone             = "",
  userNationality       = "",
  userJoinedAt          = "",
  hostStatus            = null,
  hostRejectionReason   = null,
  cohostStatus          = null,
  cohostRejectionReason = null,
  cohostAssignments               = [],
  cohostInvitations               = [],
  pendingCohostInvitationCount    = 0,
  notifications                   = [],
  savedListings                   = [],
  reviewedBookingIds              = [],
  initialTickets                  = [],
}: {
  bookings:                        UserBooking[];
  userName:                        string;
  userAvatar:                      string;
  userEmail?:                      string;
  userFirstName?:                  string;
  userLastName?:                   string;
  userPhone?:                      string;
  userNationality?:                string;
  userJoinedAt?:                   string;
  hostStatus?:                     ApplicationStatus;
  hostRejectionReason?:            string | null;
  cohostStatus?:                   ApplicationStatus;
  cohostRejectionReason?:          string | null;
  cohostAssignments?:              CohostAssignmentItem[];
  cohostInvitations?:              CohostInboxItem[];
  pendingCohostInvitationCount?:   number;
  notifications?:                  AppNotification[];
  savedListings?:                  SavedListing[];
  reviewedBookingIds?:             string[];
  initialTickets?:                 SupportTicket[];
}) {
  const [activeTab, setActiveTab]     = useState<Tab>("overview");
  const [mobileNavOpen, setMobileNav] = useState(false);

  // Co-host assignment overrides guest booking — exclude co-host listings from KPIs.
  const cohostListingIds = new Set(cohostAssignments.map((a) => a.listingId));
  const guestBookings    = bookings.filter((b) => !cohostListingIds.has(b.listingId));

  const upcomingBookings = guestBookings.filter(
    (b) => b.status === "upcoming" || b.status === "confirmed"
  );
  const kpis = {
    upcomingCount:  upcomingBookings.length,
    completedCount: guestBookings.filter((b) => b.status === "completed").length,
    savedCount:     savedListings.length,
    totalSpent:     guestBookings
      .filter((b) => b.status !== "cancelled")
      .reduce((s, b) => s + b.totalPrice, 0),
    nextTrip: [...upcomingBookings].sort((a, b) =>
      a.checkIn.localeCompare(b.checkIn)
    )[0] ?? null,
  };

  return (
    <div className="min-h-screen pt-[74px]" style={{ background: "var(--bg-sand)" }}>

      {/* ─── Tab bar (sticks below global Navbar) ─── */}
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14 gap-4">

          {/* Desktop tabs */}
          <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
            {TABS.map((tab) => {
              let badge: number | undefined;
              if (tab.id === "bookings")      badge = kpis.upcomingCount + cohostAssignments.length;
              if (tab.id === "saved")         badge = kpis.savedCount;
              if (tab.id === "cohost" && pendingCohostInvitationCount > 0) badge = pendingCohostInvitationCount;
              if (tab.id === "notifications") badge = notifications.filter((n) => n.isNew).length || undefined;

              const showCohostDot = tab.id === "cohost" && cohostStatus && activeTab !== "cohost" && !pendingCohostInvitationCount;
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
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full"
                      style={{ background: "linear-gradient(90deg, transparent, #c49a4f, transparent)" }}
                    />
                  )}
                  <span style={{ opacity: isActive ? 1 : 0.7 }}>{tab.icon}</span>
                  {tab.label}
                  {badge !== undefined && badge > 0 && (
                    <span
                      className="text-[9px] font-bold min-w-[16px] h-[16px] px-0.5 flex items-center justify-center rounded-full"
                      style={{ background: "#8b5e38", color: "white" }}
                    >
                      {badge}
                    </span>
                  )}
                  {showCohostDot && (
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        background: cohostStatus === "approved" ? "#049153" : cohostStatus === "pending" ? "#c49a4f" : "#ef4444",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Mobile burger */}
          <div className="md:hidden shrink-0">
            <button
              className="p-2 rounded-lg transition-colors"
              style={{ color: "#1a0e02" }}
              onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.background = "rgba(70,30,0,0.06)"}
              onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.background = "transparent"}
              onClick={() => setMobileNav(!mobileNavOpen)}
              aria-label="Toggle menu"
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
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setMobileNav(false); }}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all text-left"
                style={{
                  background: isActive ? "rgba(196,154,79,0.10)" : "transparent",
                  color: isActive ? "#1a0e02" : "#8b7b6a",
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
              );
            })}
          </div>
        )}
      </header>

      {/* ─── Main content ─── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Application status banners — host only (co-host status lives in the Co-host tab) ── */}
        {hostStatus && (
          <div className="flex flex-col gap-3 mb-6">

            {/* Host application banner */}
            {hostStatus === "pending" && (
              <div className="flex items-start gap-3 bg-[#fdf5ee] border border-[#e8dfd4] rounded-2xl px-5 py-4">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[#b17a50] shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <div>
                  <p className="text-sm font-bold text-[#1a0e02]">Host Application Under Review</p>
                  <p className="text-xs text-[#64707d] mt-0.5">
                    Our team is reviewing your host application. You&apos;ll hear back within 1–2 business days.
                  </p>
                </div>
              </div>
            )}

            {hostStatus === "approved" && (
              <div className="flex items-start gap-3 bg-[#f0faf5] border border-[#c8ead8] rounded-2xl px-5 py-4">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[#049153] shrink-0 mt-0.5">
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div>
                  <p className="text-sm font-bold text-[#1a0e02]">Host Application Approved</p>
                  <p className="text-xs text-[#64707d] mt-0.5">
                    You&apos;re now a verified Bedouin host. Use the &quot;Switch to Hosting&quot; button in the navbar to access your Host Dashboard.
                  </p>
                </div>
              </div>
            )}

            {hostStatus === "rejected" && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-red-500 shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#1a0e02]">Host Application Not Approved</p>
                  {hostRejectionReason && (
                    <p className="text-xs text-red-700 mt-0.5">Reason: {hostRejectionReason}</p>
                  )}
                  <a
                    href="/host/onboarding"
                    className="inline-block mt-2 text-xs font-bold text-[#461e00] underline hover:no-underline"
                  >
                    Re-apply as a host →
                  </a>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Co-host status nudge — shown outside the tab when status is active, so user notices it */}
        {cohostStatus && activeTab !== "cohost" && (
          <div
            onClick={() => setActiveTab("cohost")}
            className="flex items-center gap-3 mb-6 px-5 py-3.5 rounded-2xl border cursor-pointer transition-colors hover:border-[#8b5e38] bg-white border-[#e8dfd4]"
          >
            <span className={[
              "w-2.5 h-2.5 rounded-full shrink-0",
              pendingCohostInvitationCount > 0 ? "bg-[#8b5e38] animate-pulse" :
              cohostStatus === "approved"      ? "bg-[#049153]" :
              cohostStatus === "pending"       ? "bg-[#c49a4f] animate-pulse" :
                                                 "bg-red-500",
            ].join(" ")} />
            <p className="text-sm font-semibold text-[#1a0e02] flex-1">
              {pendingCohostInvitationCount > 0
                ? `${pendingCohostInvitationCount} pending co-host invitation${pendingCohostInvitationCount > 1 ? "s" : ""}`
                : cohostStatus === "approved" ? "Your co-host profile is live"
                : cohostStatus === "pending"  ? "Co-host application under review"
                :                              "Co-host application: action required"}
            </p>
            <span className="text-xs font-semibold text-[#8b5e38] shrink-0">View →</span>
          </div>
        )}

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#64707d] mb-6">
          <a href="/" className="hover:text-[#8b5e38] transition-colors">Home</a>
          <span>›</span>
          <span className="text-[#1a0e02] font-medium capitalize">{activeTab}</span>
        </div>

        {/* Section content */}
        {activeTab === "overview"  && <UserOverviewSection  bookings={guestBookings} kpis={kpis} userName={userName} userAvatar={userAvatar} cohostAssignments={cohostAssignments} onViewAssignments={() => setActiveTab("bookings")} />}
        {activeTab === "bookings"  && <UserBookingsSection  bookings={guestBookings} cohostAssignments={cohostAssignments} reviewedBookingIds={reviewedBookingIds} />}
        {activeTab === "saved"     && <UserSavedSection     initialItems={savedListings} />}
        {activeTab === "activity"  && <UserActivitySection  />}
        {activeTab === "account"   && (
          <UserAccountSection
            firstName={userFirstName}
            lastName={userLastName}
            email={userEmail}
            phone={userPhone}
            nationality={userNationality}
            avatarUrl={userAvatar}
            joinedAt={userJoinedAt}
          />
        )}
        {activeTab === "cohost" && (
          <UserCohostSection
            cohostStatus={cohostStatus}
            cohostRejectionReason={cohostRejectionReason ?? null}
            assignments={cohostAssignments}
            invitations={cohostInvitations}
            pendingInvitationCount={pendingCohostInvitationCount}
          />
        )}
        {activeTab === "support" && (
          <UserSupportSection initialTickets={initialTickets} />
        )}
        {activeTab === "notifications" && (
          <NotificationsSection notifications={notifications} />
        )}

      </main>

      {/* ─── Mobile bottom nav ─── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-[#e8dfd4] z-[39] flex">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={[
                "flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-colors",
                isActive ? "text-[#8b5e38]" : "text-[#a09080]",
              ].join(" ")}
            >
              {tab.icon}
              <span className="text-[9px] font-bold uppercase tracking-wide">{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-[#8b5e38] rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom nav spacer on mobile */}
      <div className="md:hidden h-16" />
    </div>
  );
}
