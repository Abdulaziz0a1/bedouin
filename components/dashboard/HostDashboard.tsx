"use client";

import { useState } from "react";
import { MOCK_HOST, getDashboardKPIs } from "@/lib/data/dashboard";
import OverviewSection  from "./sections/OverviewSection";
import ListingsSection  from "./sections/ListingsSection";
import BookingsSection  from "./sections/BookingsSection";
import EarningsSection  from "./sections/EarningsSection";
import CoHostSection    from "./sections/CoHostSection";

type Tab = "overview" | "listings" | "bookings" | "earnings" | "cohosts";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: "overview",
    label: "Overview",
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
    label: "My Listings",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
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
    id: "earnings",
    label: "Earnings",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "cohosts",
    label: "Co-hosts",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.7" />
        <path d="M3 20c0-4 2.7-7 6-7s6 3 6 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M21 18c0-3.5-2.24-6-5-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function HostDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const kpis = getDashboardKPIs();

  const fmtDate = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="min-h-screen bg-[#f4efe6]">

      {/* Top bar */}
      <header className="bg-white border-b border-[#e8dfd4] sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="font-display font-extrabold text-[#1a0e02] text-xl tracking-tight">
            Bedouin
          </a>

          {/* Desktop tabs */}
          <nav className="hidden md:flex items-center gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={[
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                  activeTab === tab.id
                    ? "bg-[#1a0e02] text-white"
                    : "text-[#64707d] hover:bg-[#f0e8de] hover:text-[#1a0e02]",
                ].join(" ")}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Host avatar */}
          <div className="flex items-center gap-3">
            {MOCK_HOST.superhost && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-[#8b5e38] bg-[#fdf5ee] border border-[#e8c89a] px-2.5 py-1 rounded-full">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#c49a4f">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                Superhost
              </span>
            )}
            <img
              src={MOCK_HOST.avatar}
              alt={MOCK_HOST.name}
              className="w-9 h-9 rounded-full object-cover border-2 border-[#e8dfd4]"
            />
            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-[#f0e8de] transition-colors"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
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
                onClick={() => { setActiveTab(tab.id); setMobileNavOpen(false); }}
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Page header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-[#c49a4f] uppercase tracking-[0.14em] mb-1">{fmtDate}</p>
            <h1 className="font-display font-extrabold text-[#1a0e02] text-3xl">
              Welcome back, {MOCK_HOST.name.split(" ")[0]}
            </h1>
            <p className="text-[#64707d] text-sm mt-1">
              {kpis.upcomingCount > 0
                ? `You have ${kpis.upcomingCount} upcoming check-in${kpis.upcomingCount > 1 ? "s" : ""}.`
                : "No upcoming check-ins. Your listings are ready for new guests."}
            </p>
          </div>

          <a
            href="/host/new"
            className="sm:shrink-0 flex items-center gap-2 px-5 py-3 bg-[#8b5e38] text-white text-sm font-semibold rounded-xl hover:bg-[#7a5030] transition-colors shadow-sm"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            Add new listing
          </a>
        </div>

        {/* Content */}
        {activeTab === "overview"  && <OverviewSection  />}
        {activeTab === "listings"  && <ListingsSection  />}
        {activeTab === "bookings"  && <BookingsSection  />}
        {activeTab === "earnings"  && <EarningsSection  />}
        {activeTab === "cohosts"   && <CoHostSection    />}

      </main>
    </div>
  );
}
