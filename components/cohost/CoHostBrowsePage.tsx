"use client";

import { useState, useMemo, useTransition } from "react";
import { SERVICE_LABELS } from "@/lib/data/cohost";
import type { CoHost, CoHostService, CoHostStatus, CoHostInvitation, CoHostAssignment, InviteModalListing } from "@/lib/types/cohost";
import { sendCoHostInvite, cancelInvitation, removeAssignment } from "@/lib/actions/cohost";
import CoHostListItem from "./CoHostListItem";
import CoHostProfilePanel from "./CoHostProfilePanel";
import InviteModal from "./InviteModal";

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────

/** Relationship between this host and a specific co-host */
export interface CoHostRelation {
  status:       CoHostStatus;
  invitationId?: string;   // set when status === "invited"
  assignmentId?: string;   // set when status === "assigned"
}

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

const ALL_SERVICES: CoHostService[] = [
  "guest_checkin", "guest_communication", "cleaning",
  "maintenance", "local_guide", "calendar",
  "listing_support", "photography", "emergency",
];

/**
 * Computes a map of coHostUserId → CoHostRelation from the host's existing
 * invitations and assignments. Priority: assigned > invited > declined > available.
 */
function buildRelations(
  invitations: CoHostInvitation[],
  assignments: CoHostAssignment[]
): Map<string, CoHostRelation> {
  const map = new Map<string, CoHostRelation>();

  // Assignments take highest priority
  for (const a of assignments) {
    map.set(a.coHostId, { status: "assigned", assignmentId: a.id });
  }

  // Invitations — only set if not already assigned
  for (const inv of invitations) {
    if (map.has(inv.coHostId)) continue; // assigned already wins
    if (inv.status === "pending") {
      map.set(inv.coHostId, { status: "invited", invitationId: inv.id });
    } else if (inv.status === "accepted" && !map.has(inv.coHostId)) {
      map.set(inv.coHostId, { status: "accepted" });
    } else if (inv.status === "declined" && !map.has(inv.coHostId)) {
      map.set(inv.coHostId, { status: "declined" });
    }
  }

  return map;
}

function SelectionPrompt() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-10 bg-[#f4efe6]">
      <div className="w-16 h-16 rounded-2xl bg-[#f0e8de] flex items-center justify-center text-[#8b5e38] mb-4">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.7" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M21 18c0-3.5-2.24-6-5-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      </div>
      <h3 className="font-display font-semibold text-[#1a0e02] mb-2">Find the right co-host</h3>
      <p className="text-sm text-[#64707d] leading-relaxed max-w-xs">
        Select a co-host from the list to view their full profile, services, and reviews — then send an invite.
      </p>
    </div>
  );
}

function NoResults() {
  return (
    <div className="flex flex-col items-center text-center py-14 px-6">
      <div className="w-12 h-12 rounded-2xl bg-[#f0e8de] flex items-center justify-center text-[#8b5e38] mb-3">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.8" />
          <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>
      <p className="font-display font-semibold text-[#1a0e02] text-sm mb-1">No co-hosts found</p>
      <p className="text-xs text-[#64707d]">Try adjusting your filters or search term.</p>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────────────────────────────────────

interface CoHostBrowsePageProps {
  initialCohosts:  CoHost[];
  hostListings:    InviteModalListing[];
  hostInvitations: CoHostInvitation[];
  hostAssignments: CoHostAssignment[];
  currentUserId:   string | null;
  defaultListingId?: string | null;
  error?:          string;
}

export default function CoHostBrowsePage({
  initialCohosts,
  hostListings,
  hostInvitations,
  hostAssignments,
  currentUserId,
  defaultListingId = null,
  error,
}: CoHostBrowsePageProps) {
  const [cohosts,         ]           = useState<CoHost[]>(initialCohosts);
  const [relations,       setRelations] = useState<Map<string, CoHostRelation>>(
    () => buildRelations(hostInvitations, hostAssignments)
  );
  const [search,          setSearch]         = useState("");
  const [regionFilter,    setRegionFilter]   = useState<string | null>(null);
  const [serviceFilters,  setServiceFilters] = useState<CoHostService[]>([]);
  const [selectedId,      setSelectedId]     = useState<string | null>(null);
  const [showPanel,       setShowPanel]      = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviting,        setInviting]       = useState(false);
  const [inviteError,     setInviteError]    = useState<string | null>(null);
  const [inviteSuccess,   setInviteSuccess]  = useState(false);
  const [actionError,     setActionError]    = useState<string | null>(null);
  const [, startAction]                      = useTransition();

  // Compute effective cohost with status overlay
  const effectiveCohosts = useMemo(
    () => cohosts.map((c) => ({
      ...c,
      status: (relations.get(c.userId)?.status ?? c.status) as CoHostStatus,
    })),
    [cohosts, relations]
  );

  const selectedCohost = effectiveCohosts.find((c) => c.id === selectedId) ?? null;
  const selectedRelation = selectedCohost ? relations.get(selectedCohost.userId) : undefined;
  const isOwnProfile = !!(currentUserId && selectedCohost?.userId === currentUserId);

  // Derived regions
  const ALL_REGIONS = useMemo(
    () => [...new Set(cohosts.map((c) => c.region).filter(Boolean))].sort(),
    [cohosts]
  );

  // Filtered + sorted list
  const filtered = useMemo(() => {
    let result = effectiveCohosts;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.region.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.services.some((s) => SERVICE_LABELS[s].toLowerCase().includes(q))
      );
    }
    if (regionFilter) result = result.filter((c) => c.region === regionFilter);
    if (serviceFilters.length > 0)
      result = result.filter((c) => serviceFilters.every((s) => c.services.includes(s)));
    return [...result].sort((a, b) => {
      if (a.status === "available" && b.status !== "available") return -1;
      if (b.status === "available" && a.status !== "available") return  1;
      return b.rating - a.rating;
    });
  }, [effectiveCohosts, search, regionFilter, serviceFilters]);

  const toggleService = (s: CoHostService) =>
    setServiceFilters((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  // ── Send invite ───────────────────────────────────────────────────────────

  const handleInviteConfirm = async (
    listingId:    string,
    listingTitle: string,
    listingImage: string,
    message:      string
  ) => {
    if (!selectedCohost) return;
    setInviting(true);
    setInviteError(null);

    const result = await sendCoHostInvite(
      selectedCohost.id,
      listingId, listingTitle, listingImage, message
    );

    setInviting(false);

    if (!result.success) {
      setInviteError(result.error ?? "Failed to send invitation.");
      return;
    }

    // Update relation: this co-host now has a pending invite
    // (invitationId is not returned by the action — mark as invited; dashboard has the full id)
    setRelations((prev) => {
      const next = new Map(prev);
      next.set(selectedCohost.userId, { status: "invited" });
      return next;
    });
    setInviteSuccess(true);
    setShowInviteModal(false);
    setTimeout(() => setInviteSuccess(false), 4000);
  };

  // ── Cancel invitation ─────────────────────────────────────────────────────

  const handleCancelInvite = (coHostUserId: string, invitationId: string) => {
    setActionError(null);
    startAction(async () => {
      const result = await cancelInvitation(invitationId);
      if (!result.success) {
        setActionError(result.error ?? "Failed to cancel invitation.");
        return;
      }
      setRelations((prev) => {
        const next = new Map(prev);
        next.delete(coHostUserId); // back to available
        return next;
      });
    });
  };

  // ── Remove assignment ─────────────────────────────────────────────────────

  const handleRemoveAssignment = (coHostUserId: string, assignmentId: string) => {
    setActionError(null);
    startAction(async () => {
      const result = await removeAssignment(assignmentId);
      if (!result.success) {
        setActionError(result.error ?? "Failed to remove co-host.");
        return;
      }
      setRelations((prev) => {
        const next = new Map(prev);
        next.delete(coHostUserId); // back to available
        return next;
      });
    });
  };

  const availableCount = effectiveCohosts.filter((c) => c.status === "available").length;

  return (
    <div className="flex flex-col" style={{ height: "100dvh" }}>

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-[#e8dfd4] sticky top-0 z-40 shrink-0">
        <div className="max-w-[1440px] mx-auto px-5 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <a href="/" className="font-display font-extrabold text-[#1a0e02] text-xl tracking-tight">Bedouin</a>
            <span className="text-[#e8dfd4]">·</span>
            <span className="text-sm font-semibold text-[#64707d]">Find a Co-host</span>
          </div>
          <a href="/dashboard" className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#64707d] hover:bg-[#f4f6f8] transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
            </svg>
            Dashboard
          </a>
        </div>
      </header>

      {/* ── Intro strip ─────────────────────────────────────────────────────── */}
      <div className="bg-[#1a0e02] shrink-0 px-5 py-4">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display font-bold text-white text-base mb-0.5">
              Trusted co-hosts across Saudi Arabia
            </h1>
            <p className="text-xs text-[#a09080]">
              {availableCount} co-host{availableCount !== 1 ? "s" : ""} available to help manage your listings
            </p>
          </div>
          <a href="/cohost/apply" className="flex items-center gap-2 px-4 py-2 bg-[#8b5e38] text-white text-xs font-semibold rounded-xl hover:bg-[#7a5030] transition-colors">
            Become a co-host
          </a>
        </div>
      </div>

      {/* ── Split pane ──────────────────────────────────────────────────────── */}
      <div className="flex flex-1 max-w-[1440px] w-full mx-auto overflow-hidden">

        {/* ── Left sidebar ─────────────────────────────────────────────────── */}
        <div className={`w-full md:w-[380px] md:shrink-0 flex flex-col bg-white border-r border-[#e8dfd4] overflow-hidden ${showPanel ? "hidden md:flex" : "flex"}`}>

          <div className="px-4 pt-4 pb-3 border-b border-[#f0e8de] flex flex-col gap-3 shrink-0">
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
                placeholder="Search by name, region, or service…"
                className="w-full pl-9 pr-3 py-2.5 border border-[#e8dfd4] rounded-xl text-sm text-[#1a0e02] placeholder:text-[#a09080] focus:outline-none focus:border-[#8b5e38] bg-white transition-colors"
              />
            </div>

            {/* Region filter */}
            <div className="flex gap-1.5 flex-wrap">
              <button
                onClick={() => setRegionFilter(null)}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${!regionFilter ? "bg-[#1a0e02] text-white border-[#1a0e02]" : "text-[#64707d] border-[#e8dfd4] hover:border-[#8b5e38]"}`}
              >
                All regions
              </button>
              {ALL_REGIONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setRegionFilter(regionFilter === r ? null : r)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${regionFilter === r ? "bg-[#8b5e38] text-white border-[#8b5e38]" : "text-[#64707d] border-[#e8dfd4] hover:border-[#8b5e38]"}`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Service chips */}
            <div className="flex gap-1.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
              {ALL_SERVICES.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleService(s)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 transition-all ${serviceFilters.includes(s) ? "bg-[#c49a4f] text-white border-[#c49a4f]" : "text-[#64707d] border-[#e8dfd4] hover:border-[#c49a4f]"}`}
                >
                  {SERVICE_LABELS[s]}
                </button>
              ))}
            </div>

            <p className="text-[10px] text-[#a09080] font-medium">
              {filtered.length} co-host{filtered.length !== 1 ? "s" : ""}
              {serviceFilters.length > 0 || regionFilter ? " (filtered)" : ""}
            </p>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#f0e8de]">
            {error ? (
              <div className="flex flex-col items-center text-center py-14 px-6">
                <p className="text-sm font-semibold text-red-600 mb-1">Failed to load co-hosts</p>
                <p className="text-xs text-[#64707d]">{error}</p>
              </div>
            ) : cohosts.length === 0 ? (
              <div className="flex flex-col items-center text-center py-14 px-6">
                <div className="w-12 h-12 rounded-2xl bg-[#f0e8de] flex items-center justify-center text-[#8b5e38] mb-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="font-display font-semibold text-[#1a0e02] text-sm mb-1">No co-hosts yet</p>
                <p className="text-xs text-[#64707d] max-w-xs">
                  No approved co-hosts available yet.{" "}
                  <a href="/cohost/apply" className="text-[#8b5e38] font-semibold underline">Be the first to apply →</a>
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <NoResults />
            ) : (
              filtered.map((cohost) => (
                <CoHostListItem
                  key={cohost.id}
                  cohost={cohost}
                  isActive={selectedId === cohost.id}
                  onClick={() => { setSelectedId(cohost.id); setShowPanel(true); }}
                />
              ))
            )}
          </div>
        </div>

        {/* ── Right: profile panel ─────────────────────────────────────────── */}
        <div className={`flex-1 flex flex-col overflow-hidden ${showPanel ? "flex" : "hidden md:flex"}`}>
          {selectedCohost ? (
            <CoHostProfilePanel
              key={selectedCohost.id}
              cohost={selectedCohost}
              relation={selectedRelation}
              isOwnProfile={isOwnProfile}
              onInvite={() => { if (!isOwnProfile) setShowInviteModal(true); }}
              onCancelInvite={
                selectedRelation?.invitationId
                  ? () => handleCancelInvite(selectedCohost.userId, selectedRelation.invitationId!)
                  : undefined
              }
              onRemoveAssignment={
                selectedRelation?.assignmentId
                  ? () => handleRemoveAssignment(selectedCohost.userId, selectedRelation.assignmentId!)
                  : undefined
              }
              onClose={() => setShowPanel(false)}
            />
          ) : (
            <SelectionPrompt />
          )}
        </div>
      </div>

      {/* ── Invite modal ─────────────────────────────────────────────────────── */}
      {showInviteModal && selectedCohost && (
        <InviteModal
          cohost={selectedCohost}
          listings={hostListings}
          defaultListingId={defaultListingId}
          onConfirm={handleInviteConfirm}
          onCancel={() => { setShowInviteModal(false); setInviteError(null); }}
          isSubmitting={inviting}
        />
      )}

      {/* ── Toasts ───────────────────────────────────────────────────────────── */}
      {inviteError && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-red-600 text-white px-5 py-3 rounded-2xl shadow-lg text-sm font-semibold">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /><path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          {inviteError}
          <button onClick={() => setInviteError(null)} className="ml-2 opacity-70 hover:opacity-100">✕</button>
        </div>
      )}
      {actionError && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-red-600 text-white px-5 py-3 rounded-2xl shadow-lg text-sm font-semibold">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /><path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          {actionError}
          <button onClick={() => setActionError(null)} className="ml-2 opacity-70 hover:opacity-100">✕</button>
        </div>
      )}
      {inviteSuccess && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-[#049153] text-white px-5 py-3 rounded-2xl shadow-lg text-sm font-semibold">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Invitation sent successfully!
        </div>
      )}
    </div>
  );
}
