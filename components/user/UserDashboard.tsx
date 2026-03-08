"use client";

import { useState } from "react";
import { MOCK_USER, getUserKPIs } from "@/lib/data/user-dashboard";
import UserOverviewSection  from "./sections/UserOverviewSection";
import UserBookingsSection  from "./sections/UserBookingsSection";
import UserSavedSection     from "./sections/UserSavedSection";
import UserActivitySection  from "./sections/UserActivitySection";
import UserAccountSection   from "./sections/UserAccountSection";

type Tab = "overview" | "bookings" | "saved" | "activity" | "account";

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
];

export default function UserDashboard() {
  const [activeTab, setActiveTab]     = useState<Tab>("overview");
  const [mobileNavOpen, setMobileNav] = useState(false);
  const kpis = getUserKPIs();

  return (
    <div className="min-h-screen bg-[#f4efe6]">

      {/* ─── Top navbar ─── */}
      <header className="bg-white border-b border-[#e8dfd4] sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <a href="/" className="font-display font-extrabold text-[#1a0e02] text-xl tracking-tight shrink-0">
            Bedouin
          </a>

          {/* Desktop tabs */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {TABS.map((tab) => {
              let badge: number | undefined;
              if (tab.id === "bookings") badge = kpis.upcomingCount;
              if (tab.id === "saved")    badge = kpis.savedCount;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={[
                    "relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                    activeTab === tab.id
                      ? "bg-[#1a0e02] text-white"
                      : "text-[#64707d] hover:bg-[#f0e8de] hover:text-[#1a0e02]",
                  ].join(" ")}
                >
                  {tab.icon}
                  {tab.label}
                  {badge !== undefined && badge > 0 && (
                    <span className={[
                      "text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full",
                      activeTab === tab.id
                        ? "bg-[#c49a4f] text-white"
                        : "bg-[#8b5e38] text-white",
                    ].join(" ")}>
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right: avatar + explore + mobile toggle */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="/explore"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 border border-[#e8dfd4] rounded-xl text-sm font-semibold text-[#64707d] hover:border-[#8b5e38] hover:text-[#8b5e38] transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.8" />
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              Explore
            </a>
            <img
              src={MOCK_USER.avatar}
              alt={MOCK_USER.firstName}
              className="w-9 h-9 rounded-full object-cover border-2 border-[#e8dfd4]"
            />
            {/* Mobile burger */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-[#f0e8de] transition-colors"
              onClick={() => setMobileNav(!mobileNavOpen)}
              aria-label="Toggle menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 12h18M3 6h18M3 18h18" stroke="#1a0e02" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile nav drawer */}
        {mobileNavOpen && (
          <div className="md:hidden border-t border-[#e8dfd4] bg-white px-4 py-3 flex flex-col gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setMobileNav(false); }}
                className={[
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all text-left",
                  activeTab === tab.id
                    ? "bg-[#1a0e02] text-white"
                    : "text-[#64707d] hover:bg-[#f0e8de] hover:text-[#1a0e02]",
                ].join(" ")}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* ─── Main content ─── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#64707d] mb-6">
          <a href="/" className="hover:text-[#8b5e38] transition-colors">Home</a>
          <span>›</span>
          <span className="text-[#1a0e02] font-medium capitalize">{activeTab}</span>
        </div>

        {/* Section content */}
        {activeTab === "overview"  && <UserOverviewSection  />}
        {activeTab === "bookings"  && <UserBookingsSection  />}
        {activeTab === "saved"     && <UserSavedSection     />}
        {activeTab === "activity"  && <UserActivitySection  />}
        {activeTab === "account"   && <UserAccountSection   />}

      </main>

      {/* ─── Mobile bottom nav ─── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-[#e8dfd4] z-40 flex">
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
