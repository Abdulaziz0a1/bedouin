"use client";

import { useState, useMemo } from "react";
import type { AdminListing, AdminListingStatus } from "@/lib/types/admin";
import { approveSubmission, rejectSubmission } from "@/lib/actions/admin";
import AdminStatusBadge from "./shared/AdminStatusBadge";
import ListingQueueCard from "./ListingQueueCard";
import ListingReviewPanel from "./ListingReviewPanel";

type TabFilter = "pending_review" | "approved" | "rejected" | "all";

const TABS: { id: TabFilter; label: string }[] = [
  { id: "pending_review", label: "Pending" },
  { id: "approved",       label: "Approved" },
  { id: "rejected",       label: "Rejected" },
  { id: "all",            label: "All" },
];


function EmptyQueue({ tab }: { tab: TabFilter }) {
  const msgs: Record<TabFilter, { title: string; sub: string }> = {
    pending_review: {
      title: "Queue is clear",
      sub: "All submitted listings have been reviewed. Check back when hosts submit new properties.",
    },
    approved: { title: "No approved listings yet", sub: "Approved listings will appear here." },
    rejected: { title: "No rejected listings",     sub: "Rejected listings will appear here."  },
    all:      { title: "No listings found",         sub: "No listings match your search."       },
  };
  const { title, sub } = msgs[tab];
  return (
    <div className="flex flex-col items-center text-center py-16 px-6">
      <div className="w-14 h-14 rounded-2xl bg-[#f0e8de] flex items-center justify-center text-[#8b5e38] mb-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      </div>
      <p className="font-display font-semibold text-[#1a0e02] text-sm mb-1">{title}</p>
      <p className="text-xs text-[#64707d] leading-relaxed max-w-[220px]">{sub}</p>
    </div>
  );
}

function SelectionPrompt() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-10">
      <div className="w-16 h-16 rounded-2xl bg-[#f0e8de] flex items-center justify-center text-[#8b5e38] mb-4">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.7" />
          <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      </div>
      <h3 className="font-display font-semibold text-[#1a0e02] mb-2">Select a listing to review</h3>
      <p className="text-sm text-[#64707d] leading-relaxed max-w-xs">
        Choose a listing from the queue to see its full details and take a moderation decision.
      </p>
    </div>
  );
}

export default function AdminDashboard({
  initialListings,
}: {
  initialListings: AdminListing[];
}) {
  const [listings,  setListings]  = useState<AdminListing[]>(initialListings);
  const [tab,       setTab]       = useState<TabFilter>("pending_review");
  const [search,    setSearch]    = useState("");
  const [selected,  setSelected]  = useState<string | null>(null);
  const [showPanel, setShowPanel] = useState(false); // mobile panel toggle

  // Compute stats from live listings state for real-time badge accuracy.
  const today = new Date().toISOString().slice(0, 10);
  const stats = {
    pendingCount:  listings.filter((l) => l.status === "pending_review").length,
    approvedToday: listings.filter((l) => l.status === "approved" && l.reviewedAt?.startsWith(today)).length,
    rejectedToday: listings.filter((l) => l.status === "rejected"  && l.reviewedAt?.startsWith(today)).length,
    avgReviewHours: 52,
  };

  // ── Derived list ────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = listings;
    if (tab !== "all") result = result.filter((l) => l.status === tab);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.host.name.toLowerCase().includes(q) ||
          l.region.toLowerCase().includes(q) ||
          l.listingRef.toLowerCase().includes(q)
      );
    }
    // pending first, then by submittedAt desc
    return [...result].sort((a, b) => {
      if (a.status === "pending_review" && b.status !== "pending_review") return -1;
      if (b.status === "pending_review" && a.status !== "pending_review") return  1;
      return b.submittedAt.localeCompare(a.submittedAt);
    });
  }, [listings, tab, search]);

  const selectedListing = listings.find((l) => l.id === selected) ?? null;

  // Tab counts
  const counts: Record<TabFilter, number> = useMemo(() => ({
    pending_review: listings.filter((l) => l.status === "pending_review").length,
    approved:       listings.filter((l) => l.status === "approved").length,
    rejected:       listings.filter((l) => l.status === "rejected").length,
    all:            listings.length,
  }), [listings]);

  // ── Actions ─────────────────────────────────────────────────────────────────
  // The admin display name is a fixed placeholder — in production it would
  // come from the authenticated admin's profile.
  const ADMIN_DISPLAY_NAME = "Admin · Bedouin";

  const handleApprove = async (id: string) => {
    const result = await approveSubmission(id, ADMIN_DISPLAY_NAME);
    if (!result.success) {
      console.error("Approve failed:", result.error);
      return;
    }
    // Optimistic update — reflect the decision immediately without refetching.
    setListings((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              status:     "approved" as AdminListingStatus,
              reviewedAt: new Date().toISOString(),
              reviewedBy: ADMIN_DISPLAY_NAME,
            }
          : l
      )
    );
  };

  const handleReject = async (id: string, reason: string) => {
    const result = await rejectSubmission(id, reason, ADMIN_DISPLAY_NAME);
    if (!result.success) {
      console.error("Reject failed:", result.error);
      return;
    }
    setListings((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              status:          "rejected" as AdminListingStatus,
              rejectionReason: reason,
              reviewedAt:      new Date().toISOString(),
              reviewedBy:      ADMIN_DISPLAY_NAME,
            }
          : l
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#f4efe6] flex flex-col">

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-[#e8dfd4] sticky top-0 z-40">
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <a href="/" className="font-display font-extrabold text-[#1a0e02] text-xl tracking-tight">
              Bedouin
            </a>
            <span className="text-[#e8dfd4]">·</span>
            <span className="text-sm font-semibold text-[#64707d]">Admin</span>
            <span className="text-[10px] font-bold text-[#8b5e38] bg-[#fdf5ee] border border-[#e8c89a] px-2 py-0.5 rounded-full ml-1">
              Internal
            </span>
          </div>
          <div className="flex items-center gap-3">
            {stats.pendingCount > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-[#8b6a1f] bg-[#fdf8ee] border border-[#ead9a6] px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-[#c49a4f] animate-pulse" />
                {stats.pendingCount} pending
              </span>
            )}
            <div className="w-8 h-8 rounded-full bg-[#1a0e02] flex items-center justify-center text-white text-xs font-bold">
              FA
            </div>
          </div>
        </div>
      </header>

      {/* ── Stats strip ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#e8dfd4]">
        <div className="max-w-[1440px] mx-auto px-6 py-3 flex items-center gap-6 overflow-x-auto">
          {[
            { label: "Pending review", value: counts.pending_review, color: "text-[#8b6a1f]", bg: "bg-[#fdf8ee]" },
            { label: "Approved",       value: counts.approved,       color: "text-[#049153]", bg: "bg-[#f0faf5]" },
            { label: "Rejected",       value: counts.rejected,       color: "text-red-600",   bg: "bg-red-50"    },
            { label: "Avg. review time", value: `${stats.avgReviewHours}h`, color: "text-[#1a0e02]", bg: "bg-[#f4f6f8]" },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl ${bg} shrink-0`}>
              <span className={`font-display font-extrabold text-lg ${color}`}>{value}</span>
              <span className="text-[10px] text-[#64707d] font-bold uppercase tracking-wide leading-tight">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main content: split pane ─────────────────────────────────────────── */}
      <div className="flex-1 flex max-w-[1440px] w-full mx-auto overflow-hidden" style={{ height: "calc(100vh - 116px)" }}>

        {/* ── Left: Queue ────────────────────────────────────────────────────── */}
        <div className={`w-full md:w-[380px] md:shrink-0 flex flex-col bg-white border-r border-[#e8dfd4] overflow-hidden ${showPanel ? "hidden md:flex" : "flex"}`}>

          {/* Queue controls */}
          <div className="px-4 pt-4 pb-3 border-b border-[#f0e8de] flex flex-col gap-3 shrink-0">
            {/* Tabs */}
            <div className="flex gap-1 bg-[#f0e8de] rounded-xl p-1">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setTab(t.id); setSelected(null); }}
                  className={[
                    "flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold transition-all",
                    tab === t.id ? "bg-white text-[#1a0e02] shadow-sm" : "text-[#64707d] hover:text-[#1a0e02]",
                  ].join(" ")}
                >
                  {t.label}
                  {counts[t.id] > 0 && (
                    <span className={`text-[10px] font-bold rounded-full px-1 min-w-[16px] text-center ${
                      tab === t.id
                        ? t.id === "pending_review" ? "bg-[#c49a4f] text-white"
                        : t.id === "approved"       ? "bg-[#049153] text-white"
                        : t.id === "rejected"       ? "bg-red-500 text-white"
                        :                             "bg-[#64707d] text-white"
                        : "bg-[#e8dfd4] text-[#64707d]"
                    }`}>
                      {counts[t.id]}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a09080]">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.8" />
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title, host, region, ref…"
                className="w-full pl-9 pr-3 py-2 border border-[#e8dfd4] rounded-xl text-sm text-[#1a0e02] placeholder:text-[#a09080] focus:outline-none focus:border-[#8b5e38] bg-white transition-colors"
              />
            </div>

            <p className="text-[10px] text-[#a09080] font-medium">
              {filtered.length} listing{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Scrollable queue */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <EmptyQueue tab={tab} />
            ) : (
              filtered.map((listing) => (
                <ListingQueueCard
                  key={listing.id}
                  listing={listing}
                  isSelected={selected === listing.id}
                  onClick={() => {
                    setSelected(listing.id);
                    setShowPanel(true);
                  }}
                />
              ))
            )}
          </div>
        </div>

        {/* ── Right: Review panel ─────────────────────────────────────────────── */}
        <div className={`flex-1 flex flex-col overflow-hidden ${showPanel || !selected ? "block" : "hidden md:block"}`}>
          {selectedListing ? (
            <ListingReviewPanel
              key={selectedListing.id}
              listing={selectedListing}
              onApprove={handleApprove}
              onReject={handleReject}
              onClose={() => setShowPanel(false)}
            />
          ) : (
            <SelectionPrompt />
          )}
        </div>

      </div>
    </div>
  );
}
