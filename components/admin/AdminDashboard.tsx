"use client";

import { useState, useMemo } from "react";
import type { AdminListing, AdminListingStatus } from "@/lib/types/admin";
import type { HostApplicationRow, CohostApplicationRow } from "@/lib/services/admin";
import type { ListingCancellationRequestRow } from "@/lib/services/cancellation";
import type { SupportTicket, SupportReply, TicketWithReplies, TicketStatus } from "@/lib/types/support";
import { ISSUE_TYPE_LABELS, TICKET_STATUS_LABELS } from "@/lib/types/support";
import {
  approveSubmission, rejectSubmission,
  approveHostApplication, rejectHostApplication,
  approveCohostApplication, rejectCohostApplication,
} from "@/lib/actions/admin";
import {
  approveListingCancellationRequest,
  rejectListingCancellationRequest,
} from "@/lib/actions/cancellation";
import {
  adminReplyToTicket,
  adminUpdateTicketStatus,
  adminLoadTicketThread,
} from "@/lib/actions/support";
import ListingQueueCard from "./ListingQueueCard";
import ListingReviewPanel from "./ListingReviewPanel";

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────

type Section   = "listings" | "hosts" | "cohosts" | "cancellations" | "support";
type TabFilter = "pending_review" | "approved" | "rejected" | "all";
type AppStatus = "pending" | "approved" | "rejected";

const LISTING_TABS: { id: TabFilter; label: string }[] = [
  { id: "pending_review", label: "Pending" },
  { id: "approved",       label: "Approved" },
  { id: "rejected",       label: "Rejected" },
  { id: "all",            label: "All" },
];

const APP_TABS: { id: AppStatus | "all"; label: string }[] = [
  { id: "pending",  label: "Pending"  },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
  { id: "all",      label: "All"      },
];

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center text-center py-16 px-6">
      <div className="w-14 h-14 rounded-2xl bg-[#f0e8de] flex items-center justify-center text-[#8b5e38] mb-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      </div>
      <p className="font-display font-semibold text-[#1a0e02] text-sm mb-1">{message}</p>
    </div>
  );
}

function RejectModal({
  onConfirm,
  onCancel,
  title,
}: {
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  title: string;
}) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
        <h3 className="font-display font-bold text-[#1a0e02] text-base mb-1">Reject Application</h3>
        <p className="text-xs text-[#64707d] mb-4">{title}</p>
        <textarea
          rows={3}
          placeholder="Reason for rejection (required)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full border border-[#e8dfd4] rounded-xl px-3 py-2.5 text-sm text-[#1a0e02] placeholder:text-[#a09080] focus:outline-none focus:border-[#8b5e38] resize-none"
        />
        <div className="flex gap-3 mt-4">
          <button onClick={onCancel} className="flex-1 py-2 rounded-xl border border-[#e8dfd4] text-sm font-semibold text-[#64707d] hover:bg-[#f0e8de]">Cancel</button>
          <button
            onClick={() => { if (reason.trim()) onConfirm(reason.trim()); }}
            disabled={!reason.trim()}
            className="flex-1 py-2 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Application card (host or cohost)
// ──────────────────────────────────────────────────────────────────────────────

function ApplicationCard({
  id,
  name,
  status,
  region,
  city,
  submittedAt,
  services,
  isSelected,
  onClick,
}: {
  id: string;
  name: string;
  status: string;
  region: string;
  city: string;
  submittedAt: string;
  services?: string[];
  isSelected: boolean;
  onClick: () => void;
}) {
  const statusColor =
    status === "approved" ? "text-[#049153] bg-[#f0faf5] border-[#c8ead8]"
    : status === "rejected" ? "text-red-600 bg-red-50 border-red-200"
    : "text-[#8b6a1f] bg-[#fdf8ee] border-[#ead9a6]";

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3.5 border-b border-[#f0e8de] flex flex-col gap-1.5 transition-colors ${isSelected ? "bg-[#fdf5ee]" : "hover:bg-[#fdf9f6]"}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-[#1a0e02] text-sm truncate">{name}</span>
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border shrink-0 ${statusColor}`}>
          {status}
        </span>
      </div>
      <p className="text-xs text-[#64707d]">{city}, {region}</p>
      {services && services.length > 0 && (
        <p className="text-xs text-[#8b94a4] truncate">
          {services.slice(0, 3).join(", ")}{services.length > 3 ? ` +${services.length - 3}` : ""}
        </p>
      )}
      <p className="text-[11px] text-[#a09080]">{new Date(submittedAt).toLocaleDateString()}</p>
    </button>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Application detail panel (host or cohost)
// ──────────────────────────────────────────────────────────────────────────────

function ApplicationDetailPanel({
  app,
  type,
  onApprove,
  onReject,
  onClose,
}: {
  app: HostApplicationRow | CohostApplicationRow;
  type: "host" | "cohost";
  onApprove: (id: string) => void;
  onReject:  (id: string, reason: string) => void;
  onClose:   () => void;
}) {
  const [showRejectModal, setShowRejectModal] = useState(false);

  const isPending = app.status === "pending";

  const fields: { label: string; value: string | number }[] = [
    { label: "Applicant",  value: app.userName },
    { label: "Region",     value: app.region   },
    { label: "City",       value: app.city     },
    { label: "Phone",      value: app.phone    },
    { label: "Experience", value: `${app.experienceYears} yr${app.experienceYears === 1 ? "" : "s"}` },
    { label: "Languages",  value: app.languages.join(", ") || "—" },
    ...(type === "host"
      ? [
          { label: "Property types", value: (app as HostApplicationRow).propertyTypes.join(", ") || "—" },
          { label: "Bank",      value: (app as HostApplicationRow).paymentInfo?.bank_name ?? "—" },
          { label: "IBAN",      value: (app as HostApplicationRow).paymentInfo?.iban ?? "—" },
          { label: "Account holder", value: (app as HostApplicationRow).paymentInfo?.account_holder ?? "—" },
        ]
      : [
          { label: "Services", value: (app as CohostApplicationRow).serviceTypes.join(", ") || "—" },
          { label: "Fee model", value: (app as CohostApplicationRow).feeModel },
          ...(((app as CohostApplicationRow).feeValue) != null
            ? [{ label: "Fee value", value: String((app as CohostApplicationRow).feeValue) }]
            : []),
        ]
    ),
  ];

  return (
    <>
      {showRejectModal && (
        <RejectModal
          title={`Rejecting ${app.userName}'s ${type === "host" ? "host" : "service provider"} application`}
          onConfirm={(reason) => { onReject(app.id, reason); setShowRejectModal(false); }}
          onCancel={() => setShowRejectModal(false)}
        />
      )}

      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onClose} className="md:hidden p-1.5 rounded-lg hover:bg-[#f0e8de] transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="#1a0e02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div>
            <h2 className="font-display font-bold text-[#1a0e02] text-lg">{app.userName}</h2>
            <p className="text-xs text-[#64707d]">
              {type === "host" ? "Host" : "Service Provider"} Application · Submitted {new Date(app.submittedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Bio */}
        <div className="bg-[#fdf9f6] border border-[#e8dfd4] rounded-2xl p-4 mb-4">
          <p className="text-xs font-bold text-[#1a0e02] uppercase tracking-wide mb-2">Bio</p>
          <p className="text-sm text-[#1a0e02] leading-relaxed">{app.bio}</p>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {fields.map(({ label, value }) => (
            <div key={label} className="bg-white border border-[#e8dfd4] rounded-xl p-3">
              <p className="text-[10px] font-bold text-[#8b94a4] uppercase tracking-wide mb-0.5">{label}</p>
              <p className="text-sm text-[#1a0e02] font-medium truncate">{value}</p>
            </div>
          ))}
        </div>

        {/* Rejection reason if already rejected */}
        {app.status === "rejected" && app.rejectionReason && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
            <p className="text-xs font-bold text-red-600 mb-1">Rejection reason</p>
            <p className="text-sm text-red-700">{app.rejectionReason}</p>
          </div>
        )}

        {/* Actions */}
        {isPending && (
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => onApprove(app.id)}
              className="flex-1 bg-[#049153] text-white font-bold py-3 rounded-2xl hover:bg-[#038044] transition-colors"
            >
              Approve
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              className="flex-1 bg-red-600 text-white font-bold py-3 rounded-2xl hover:bg-red-700 transition-colors"
            >
              Reject
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────────────────────────────────────

export default function AdminDashboard({
  initialListings,
  initialHostApplications,
  initialCohostApplications,
  initialCancellationRequests,
  initialSupportTickets = [],
  adminName = "Admin",
}: {
  initialListings:               AdminListing[];
  initialHostApplications:       HostApplicationRow[];
  initialCohostApplications:     CohostApplicationRow[];
  initialCancellationRequests:   ListingCancellationRequestRow[];
  initialSupportTickets?:        SupportTicket[];
  adminName?:                    string;
}) {
  // ── Listings state ─────────────────────────────────────────────────────────
  const [listings,  setListings]  = useState<AdminListing[]>(initialListings);
  const [listingTab, setListingTab] = useState<TabFilter>("pending_review");
  const [search,    setSearch]    = useState("");
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);

  // ── Host applications state ────────────────────────────────────────────────
  const [hostApps,    setHostApps]    = useState<HostApplicationRow[]>(initialHostApplications);
  const [hostAppTab,  setHostAppTab]  = useState<AppStatus | "all">("pending");
  const [selectedHostAppId, setSelectedHostAppId] = useState<string | null>(null);

  // ── Cohost applications state ──────────────────────────────────────────────
  const [cohostApps,    setCohostApps]    = useState<CohostApplicationRow[]>(initialCohostApplications);
  const [cohostAppTab,  setCohostAppTab]  = useState<AppStatus | "all">("pending");
  const [selectedCohostAppId, setSelectedCohostAppId] = useState<string | null>(null);

  // ── Cancellation requests state ────────────────────────────────────────────
  const [cancelReqs,    setCancelReqs]    = useState<ListingCancellationRequestRow[]>(initialCancellationRequests);
  const [cancelReqTab,  setCancelReqTab]  = useState<AppStatus | "all">("pending");
  const [selectedCancelReqId, setSelectedCancelReqId] = useState<string | null>(null);
  const [showCancelRejectModal, setShowCancelRejectModal] = useState(false);

  // ── Support tickets state ──────────────────────────────────────────────────
  const [supportTickets,        setSupportTickets]        = useState<SupportTicket[]>(initialSupportTickets);
  const [supportTicketTab,      setSupportTicketTab]      = useState<TicketStatus | "all">("open");
  const [supportSearch,         setSupportSearch]         = useState("");
  const [selectedSupportId,     setSelectedSupportId]     = useState<string | null>(null);
  const [supportThread,         setSupportThread]         = useState<TicketWithReplies | null>(null);
  const [supportThreadLoading,  setSupportThreadLoading]  = useState(false);
  const [adminReplyMsg,         setAdminReplyMsg]         = useState("");
  const [adminReplyStatus,      setAdminReplyStatus]      = useState<TicketStatus>("in_progress");
  const [adminReplyError,       setAdminReplyError]       = useState<string | null>(null);
  const [adminReplying,         setAdminReplying]         = useState(false);

  // ── Section ────────────────────────────────────────────────────────────────
  const [section, setSection] = useState<Section>("listings");
  const [showPanel, setShowPanel] = useState(false);

  // ── Derived ────────────────────────────────────────────────────────────────
  const today = new Date().toISOString().slice(0, 10);

  const pendingListingCount  = listings.filter((l) => l.status === "pending_review").length;
  const pendingHostCount     = hostApps.filter((a) => a.status === "pending").length;
  const pendingCohostCount   = cohostApps.filter((a) => a.status === "pending").length;
  const pendingCancelCount   = cancelReqs.filter((r) => r.status === "pending").length;
  const openTicketCount      = supportTickets.filter((t) => t.status === "open").length;
  const totalPending         = pendingListingCount + pendingHostCount + pendingCohostCount + pendingCancelCount + openTicketCount;

  const listingCounts = useMemo(() => ({
    pending_review: listings.filter((l) => l.status === "pending_review").length,
    approved:       listings.filter((l) => l.status === "approved").length,
    rejected:       listings.filter((l) => l.status === "rejected").length,
    all:            listings.length,
  }), [listings]);

  const filteredListings = useMemo(() => {
    let res = listings;
    if (listingTab !== "all") res = res.filter((l) => l.status === listingTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      res = res.filter((l) =>
        l.title.toLowerCase().includes(q) ||
        l.host.name.toLowerCase().includes(q) ||
        l.region.toLowerCase().includes(q) ||
        l.listingRef.toLowerCase().includes(q)
      );
    }
    return [...res].sort((a, b) => {
      if (a.status === "pending_review" && b.status !== "pending_review") return -1;
      if (b.status === "pending_review" && a.status !== "pending_review") return  1;
      return b.submittedAt.localeCompare(a.submittedAt);
    });
  }, [listings, listingTab, search]);

  const filteredHostApps = useMemo(() =>
    hostAppTab === "all" ? hostApps : hostApps.filter((a) => a.status === hostAppTab),
  [hostApps, hostAppTab]);

  const filteredCohostApps = useMemo(() =>
    cohostAppTab === "all" ? cohostApps : cohostApps.filter((a) => a.status === cohostAppTab),
  [cohostApps, cohostAppTab]);

  const filteredCancelReqs = useMemo(() =>
    cancelReqTab === "all" ? cancelReqs : cancelReqs.filter((r) => r.status === cancelReqTab),
  [cancelReqs, cancelReqTab]);

  const filteredSupportTickets = useMemo(() => {
    let res = supportTicketTab === "all" ? supportTickets : supportTickets.filter((t) => t.status === supportTicketTab);
    if (supportSearch.trim()) {
      const q = supportSearch.toLowerCase();
      res = res.filter((t) =>
        t.title.toLowerCase().includes(q) ||
        (t.userName ?? "").toLowerCase().includes(q) ||
        (t.userEmail ?? "").toLowerCase().includes(q)
      );
    }
    return [...res].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [supportTickets, supportTicketTab, supportSearch]);

  const selectedListing   = listings.find((l) => l.id === selectedListingId) ?? null;
  const selectedHostApp   = hostApps.find((a) => a.id === selectedHostAppId) ?? null;
  const selectedCohostApp = cohostApps.find((a) => a.id === selectedCohostAppId) ?? null;
  const selectedCancelReq = cancelReqs.find((r) => r.id === selectedCancelReqId) ?? null;

  // ── Listing actions ────────────────────────────────────────────────────────
  const handleApprove = async (id: string) => {
    const result = await approveSubmission(id);
    if (!result.success) { console.error("Approve failed:", result.error); return; }
    setListings((prev) => prev.map((l) => l.id === id ? { ...l, status: "approved" as AdminListingStatus, reviewedAt: new Date().toISOString() } : l));
  };

  const handleReject = async (id: string, reason: string) => {
    const result = await rejectSubmission(id, reason);
    if (!result.success) { console.error("Reject failed:", result.error); return; }
    setListings((prev) => prev.map((l) => l.id === id ? { ...l, status: "rejected" as AdminListingStatus, rejectionReason: reason, reviewedAt: new Date().toISOString() } : l));
  };

  // ── Host application actions ───────────────────────────────────────────────
  const handleApproveHost = async (id: string) => {
    const result = await approveHostApplication(id);
    if (!result.success) { console.error("Approve host failed:", result.error); return; }
    setHostApps((prev) => prev.map((a) => a.id === id ? { ...a, status: "approved", reviewedAt: new Date().toISOString() } : a));
  };

  const handleRejectHost = async (id: string, reason: string) => {
    const result = await rejectHostApplication(id, reason);
    if (!result.success) { console.error("Reject host failed:", result.error); return; }
    setHostApps((prev) => prev.map((a) => a.id === id ? { ...a, status: "rejected", rejectionReason: reason, reviewedAt: new Date().toISOString() } : a));
  };

  // ── Cohost application actions ─────────────────────────────────────────────
  const handleApproveCohost = async (id: string) => {
    const result = await approveCohostApplication(id);
    if (!result.success) { console.error("Approve cohost failed:", result.error); return; }
    setCohostApps((prev) => prev.map((a) => a.id === id ? { ...a, status: "approved", reviewedAt: new Date().toISOString() } : a));
  };

  const handleRejectCohost = async (id: string, reason: string) => {
    const result = await rejectCohostApplication(id, reason);
    if (!result.success) { console.error("Reject cohost failed:", result.error); return; }
    setCohostApps((prev) => prev.map((a) => a.id === id ? { ...a, status: "rejected", rejectionReason: reason, reviewedAt: new Date().toISOString() } : a));
  };

  // ── Support ticket actions ─────────────────────────────────────────────────
  const handleOpenSupportTicket = async (ticketId: string) => {
    setSelectedSupportId(ticketId);
    setShowPanel(true);
    setSupportThread(null);
    setSupportThreadLoading(true);
    setAdminReplyMsg("");
    setAdminReplyError(null);
    const data = await adminLoadTicketThread(ticketId);
    setSupportThread(data);
    setSupportThreadLoading(false);
    if (data) {
      setAdminReplyStatus(
        data.ticket.status === "open" ? "in_progress" :
        data.ticket.status === "in_progress" ? "in_progress" :
        "resolved"
      );
    }
  };

  const handleAdminReply = async () => {
    if (!selectedSupportId || !adminReplyMsg.trim()) return;
    setAdminReplyError(null);
    setAdminReplying(true);
    const result = await adminReplyToTicket(selectedSupportId, adminReplyMsg, adminReplyStatus);
    setAdminReplying(false);
    if (!result.success) { setAdminReplyError(result.error); return; }
    const newReply: SupportReply = {
      id:         Date.now().toString(),
      ticketId:   selectedSupportId,
      authorId:   "",
      authorName: "Bedouin Support",
      message:    adminReplyMsg.trim(),
      isAdmin:    true,
      createdAt:  new Date().toISOString(),
    };
    setSupportThread((prev) => prev ? { ...prev, replies: [...prev.replies, newReply] } : prev);
    setSupportTickets((prev) => prev.map((t) =>
      t.id === selectedSupportId
        ? { ...t, status: adminReplyStatus, replyCount: (t.replyCount ?? 0) + 1 }
        : t
    ));
    setAdminReplyMsg("");
  };

  const handleAdminUpdateStatus = async (ticketId: string, newStatus: TicketStatus) => {
    const result = await adminUpdateTicketStatus(ticketId, newStatus);
    if (!result.success) return;
    setSupportTickets((prev) => prev.map((t) =>
      t.id === ticketId ? { ...t, status: newStatus } : t
    ));
    setSupportThread((prev) => prev
      ? { ...prev, ticket: { ...prev.ticket, status: newStatus } }
      : prev
    );
  };

  // ── Cancellation request actions ───────────────────────────────────────────
  const handleApproveCancelReq = async (id: string) => {
    const result = await approveListingCancellationRequest(id);
    if (!result.success) { console.error("Approve cancel req failed:", result.error); return; }
    setCancelReqs((prev) => prev.map((r) => r.id === id ? { ...r, status: "approved", reviewedAt: new Date().toISOString() } : r));
  };

  const handleRejectCancelReq = async (id: string, adminNote: string) => {
    const result = await rejectListingCancellationRequest(id, adminNote);
    if (!result.success) { console.error("Reject cancel req failed:", result.error); return; }
    setCancelReqs((prev) => prev.map((r) => r.id === id ? { ...r, status: "rejected", adminNote, reviewedAt: new Date().toISOString() } : r));
  };

  // ──────────────────────────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#f4efe6] flex flex-col pt-[72px]">

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-[#e8dfd4] sticky top-[72px] z-[39]">
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-[#64707d]">Admin</span>
            <span className="text-[10px] font-bold text-[#8b5e38] bg-[#fdf5ee] border border-[#e8c89a] px-2 py-0.5 rounded-full">Internal</span>
          </div>
          <div className="flex items-center gap-3">
            {totalPending > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-[#8b6a1f] bg-[#fdf8ee] border border-[#ead9a6] px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-[#c49a4f] animate-pulse" />
                {totalPending} pending
              </span>
            )}
          </div>
        </div>
      </header>

      {/* ── Section selector ────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#e8dfd4]">
        <div className="max-w-[1440px] mx-auto px-6 flex items-center gap-1 pt-3 pb-0">
          {([
            { id: "listings"      as Section, label: "Listings",              count: pendingListingCount },
            { id: "hosts"         as Section, label: "Host Applications",     count: pendingHostCount   },
            { id: "cohosts"       as Section, label: "Co-host Applications",  count: pendingCohostCount },
            { id: "cancellations" as Section, label: "Cancellation Requests", count: pendingCancelCount },
            { id: "support"       as Section, label: "Support Tickets",       count: openTicketCount    },
          ] as const).map(({ id, label, count }) => (
            <button
              key={id}
              onClick={() => { setSection(id); setShowPanel(false); }}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                section === id
                  ? "border-[#461e00] text-[#1a0e02]"
                  : "border-transparent text-[#64707d] hover:text-[#1a0e02]"
              }`}
            >
              {label}
              {count > 0 && (
                <span className="text-[10px] font-bold bg-[#c49a4f] text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
        {/* Stats strip */}
        <div className="px-6 pb-3 pt-2 flex items-center gap-6 overflow-x-auto">
          {[
            { label: "Listing queue",        value: pendingListingCount,  color: "text-[#8b6a1f]", bg: "bg-[#fdf8ee]" },
            { label: "Host applicants",      value: pendingHostCount,     color: "text-[#0046cc]", bg: "bg-[#f0f9ff]" },
            { label: "Co-host applicants",   value: pendingCohostCount,   color: "text-[#049153]", bg: "bg-[#f0faf5]" },
            { label: "Cancel requests",      value: pendingCancelCount,   color: "text-red-600",   bg: "bg-red-50"    },
            { label: "Open tickets",         value: openTicketCount,      color: "text-[#8b5e38]", bg: "bg-[#fdf5ee]" },
            { label: "Approved today",       value: listings.filter((l) => l.status === "approved" && l.reviewedAt?.startsWith(today)).length, color: "text-[#049153]", bg: "bg-[#f0faf5]" },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl ${bg} shrink-0`}>
              <span className={`font-display font-extrabold text-base ${color}`}>{value}</span>
              <span className="text-[10px] text-[#64707d] font-bold uppercase tracking-wide leading-tight">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main ────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex max-w-[1440px] w-full mx-auto overflow-hidden" style={{ height: "calc(100vh - 220px)" }}>

        {/* ── Listings section ────────────────────────────────────────────── */}
        {section === "listings" && (
          <>
            {/* Left: queue */}
            <div className={`w-full md:w-[380px] md:shrink-0 flex flex-col bg-white border-r border-[#e8dfd4] overflow-hidden ${showPanel ? "hidden md:flex" : "flex"}`}>
              <div className="px-4 pt-4 pb-3 border-b border-[#f0e8de] flex flex-col gap-3 shrink-0">
                <div className="flex gap-1 bg-[#f0e8de] rounded-xl p-1">
                  {LISTING_TABS.map((t) => (
                    <button key={t.id} onClick={() => { setListingTab(t.id); setSelectedListingId(null); }}
                      className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${listingTab === t.id ? "bg-white text-[#1a0e02] shadow-sm" : "text-[#64707d] hover:text-[#1a0e02]"}`}>
                      {t.label}
                      {listingCounts[t.id] > 0 && (
                        <span className={`text-[10px] font-bold rounded-full px-1 min-w-[16px] text-center ${listingTab === t.id ? t.id === "pending_review" ? "bg-[#c49a4f] text-white" : t.id === "approved" ? "bg-[#049153] text-white" : t.id === "rejected" ? "bg-red-500 text-white" : "bg-[#64707d] text-white" : "bg-[#e8dfd4] text-[#64707d]"}`}>
                          {listingCounts[t.id]}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a09080]">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                  <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title, host, region…"
                    className="w-full pl-9 pr-3 py-2 border border-[#e8dfd4] rounded-xl text-sm text-[#1a0e02] placeholder:text-[#a09080] focus:outline-none focus:border-[#8b5e38] bg-white transition-colors" />
                </div>
                <p className="text-[10px] text-[#a09080] font-medium">{filteredListings.length} listing{filteredListings.length !== 1 ? "s" : ""}</p>
              </div>
              <div className="flex-1 overflow-y-auto">
                {filteredListings.length === 0
                  ? <EmptyState message="No listings in this view." />
                  : filteredListings.map((listing) => (
                    <ListingQueueCard key={listing.id} listing={listing} isSelected={selectedListingId === listing.id}
                      onClick={() => { setSelectedListingId(listing.id); setShowPanel(true); }} />
                  ))
                }
              </div>
            </div>
            {/* Right: review panel */}
            <div className={`flex-1 flex flex-col overflow-hidden ${showPanel || !selectedListingId ? "block" : "hidden md:block"}`}>
              {selectedListing ? (
                <ListingReviewPanel key={selectedListing.id} listing={selectedListing}
                  onApprove={handleApprove} onReject={handleReject} onClose={() => setShowPanel(false)} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center px-10">
                  <div className="w-16 h-16 rounded-2xl bg-[#f0e8de] flex items-center justify-center text-[#8b5e38] mb-4">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                      <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.7" />
                    </svg>
                  </div>
                  <h3 className="font-display font-semibold text-[#1a0e02] mb-2">Select a listing to review</h3>
                  <p className="text-sm text-[#64707d] max-w-xs">Choose a listing from the queue to see its full details.</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Host Applications section ───────────────────────────────────── */}
        {section === "hosts" && (
          <>
            <div className={`w-full md:w-[380px] md:shrink-0 flex flex-col bg-white border-r border-[#e8dfd4] overflow-hidden ${showPanel ? "hidden md:flex" : "flex"}`}>
              <div className="px-4 pt-4 pb-3 border-b border-[#f0e8de] flex flex-col gap-3 shrink-0">
                <div className="flex gap-1 bg-[#f0e8de] rounded-xl p-1">
                  {APP_TABS.map((t) => (
                    <button key={t.id} onClick={() => { setHostAppTab(t.id); setSelectedHostAppId(null); }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${hostAppTab === t.id ? "bg-white text-[#1a0e02] shadow-sm" : "text-[#64707d] hover:text-[#1a0e02]"}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-[#a09080] font-medium">{filteredHostApps.length} application{filteredHostApps.length !== 1 ? "s" : ""}</p>
              </div>
              <div className="flex-1 overflow-y-auto">
                {filteredHostApps.length === 0
                  ? <EmptyState message="No host applications in this view." />
                  : filteredHostApps.map((app) => (
                    <ApplicationCard key={app.id} id={app.id} name={app.userName} status={app.status}
                      region={app.region} city={app.city} submittedAt={app.submittedAt}
                      services={app.propertyTypes}
                      isSelected={selectedHostAppId === app.id}
                      onClick={() => { setSelectedHostAppId(app.id); setShowPanel(true); }} />
                  ))
                }
              </div>
            </div>
            <div className={`flex-1 flex flex-col overflow-hidden ${showPanel || !selectedHostAppId ? "block" : "hidden md:block"}`}>
              {selectedHostApp ? (
                <ApplicationDetailPanel app={selectedHostApp} type="host"
                  onApprove={handleApproveHost} onReject={handleRejectHost} onClose={() => setShowPanel(false)} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center px-10">
                  <div className="w-16 h-16 rounded-2xl bg-[#f0e8de] flex items-center justify-center text-[#8b5e38] mb-4">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.7" />
                      <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                    </svg>
                  </div>
                  <h3 className="font-display font-semibold text-[#1a0e02] mb-2">Select an application</h3>
                  <p className="text-sm text-[#64707d] max-w-xs">Choose a host application from the list to review and decide.</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Co-host Applications section ────────────────────────────────── */}
        {section === "cohosts" && (
          <>
            <div className={`w-full md:w-[380px] md:shrink-0 flex flex-col bg-white border-r border-[#e8dfd4] overflow-hidden ${showPanel ? "hidden md:flex" : "flex"}`}>
              <div className="px-4 pt-4 pb-3 border-b border-[#f0e8de] flex flex-col gap-3 shrink-0">
                <div className="flex gap-1 bg-[#f0e8de] rounded-xl p-1">
                  {APP_TABS.map((t) => (
                    <button key={t.id} onClick={() => { setCohostAppTab(t.id); setSelectedCohostAppId(null); }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${cohostAppTab === t.id ? "bg-white text-[#1a0e02] shadow-sm" : "text-[#64707d] hover:text-[#1a0e02]"}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-[#a09080] font-medium">{filteredCohostApps.length} application{filteredCohostApps.length !== 1 ? "s" : ""}</p>
              </div>
              <div className="flex-1 overflow-y-auto">
                {filteredCohostApps.length === 0
                  ? <EmptyState message="No co-host applications in this view." />
                  : filteredCohostApps.map((app) => (
                    <ApplicationCard key={app.id} id={app.id} name={app.userName} status={app.status}
                      region={app.region} city={app.city} submittedAt={app.submittedAt}
                      services={app.serviceTypes}
                      isSelected={selectedCohostAppId === app.id}
                      onClick={() => { setSelectedCohostAppId(app.id); setShowPanel(true); }} />
                  ))
                }
              </div>
            </div>
            <div className={`flex-1 flex flex-col overflow-hidden ${showPanel || !selectedCohostAppId ? "block" : "hidden md:block"}`}>
              {selectedCohostApp ? (
                <ApplicationDetailPanel app={selectedCohostApp} type="cohost"
                  onApprove={handleApproveCohost} onReject={handleRejectCohost} onClose={() => setShowPanel(false)} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center px-10">
                  <div className="w-16 h-16 rounded-2xl bg-[#f0e8de] flex items-center justify-center text-[#8b5e38] mb-4">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.7" />
                      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                    </svg>
                  </div>
                  <h3 className="font-display font-semibold text-[#1a0e02] mb-2">Select an application</h3>
                  <p className="text-sm text-[#64707d] max-w-xs">Choose a co-host application from the list to review and decide.</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Cancellation Requests section ───────────────────────────────── */}
        {section === "cancellations" && (
          <>
            {/* Left: queue */}
            <div className={`w-full md:w-[380px] md:shrink-0 flex flex-col bg-white border-r border-[#e8dfd4] overflow-hidden ${showPanel ? "hidden md:flex" : "flex"}`}>
              <div className="px-4 pt-4 pb-3 border-b border-[#f0e8de] flex flex-col gap-3 shrink-0">
                <div className="flex gap-1 bg-[#f0e8de] rounded-xl p-1">
                  {APP_TABS.map((t) => (
                    <button key={t.id} onClick={() => { setCancelReqTab(t.id); setSelectedCancelReqId(null); }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${cancelReqTab === t.id ? "bg-white text-[#1a0e02] shadow-sm" : "text-[#64707d] hover:text-[#1a0e02]"}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-[#a09080] font-medium">{filteredCancelReqs.length} request{filteredCancelReqs.length !== 1 ? "s" : ""}</p>
              </div>
              <div className="flex-1 overflow-y-auto">
                {filteredCancelReqs.length === 0
                  ? <EmptyState message="No cancellation requests in this view." />
                  : filteredCancelReqs.map((req) => {
                    const statusColor =
                      req.status === "approved" ? "text-[#049153] bg-[#f0faf5] border-[#c8ead8]"
                      : req.status === "rejected" ? "text-red-600 bg-red-50 border-red-200"
                      : "text-[#8b6a1f] bg-[#fdf8ee] border-[#ead9a6]";
                    return (
                      <button key={req.id} onClick={() => { setSelectedCancelReqId(req.id); setShowPanel(true); }}
                        className={`w-full text-left px-4 py-3.5 border-b border-[#f0e8de] flex flex-col gap-1.5 transition-colors ${selectedCancelReqId === req.id ? "bg-[#fdf5ee]" : "hover:bg-[#fdf9f6]"}`}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-[#1a0e02] text-sm truncate">{req.listingTitle}</span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border shrink-0 ${statusColor}`}>
                            {req.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#64707d] truncate">Host: {req.hostName}</p>
                        <p className="text-[11px] text-[#a09080]">{new Date(req.createdAt).toLocaleDateString()}</p>
                      </button>
                    );
                  })
                }
              </div>
            </div>

            {/* Right: detail panel */}
            <div className={`flex-1 flex flex-col overflow-hidden ${showPanel || !selectedCancelReqId ? "block" : "hidden md:block"}`}>
              {selectedCancelReq ? (
                <>
                  {showCancelRejectModal && (
                    <RejectModal
                      title={`Rejecting cancellation for "${selectedCancelReq.listingTitle}"`}
                      onConfirm={(note) => { handleRejectCancelReq(selectedCancelReq.id, note); setShowCancelRejectModal(false); }}
                      onCancel={() => setShowCancelRejectModal(false)}
                    />
                  )}
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <button onClick={() => setShowPanel(false)} className="md:hidden p-1.5 rounded-lg hover:bg-[#f0e8de] transition-colors">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <path d="M15 18l-6-6 6-6" stroke="#1a0e02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <div>
                        <h2 className="font-display font-bold text-[#1a0e02] text-lg">{selectedCancelReq.listingTitle}</h2>
                        <p className="text-xs text-[#64707d]">
                          Cancellation Request · Submitted {new Date(selectedCancelReq.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Details grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {[
                        { label: "Host",       value: selectedCancelReq.hostName },
                        { label: "Email",      value: selectedCancelReq.hostEmail ?? "—" },
                        { label: "Status",     value: selectedCancelReq.status   },
                        { label: "Requested",  value: new Date(selectedCancelReq.createdAt).toLocaleDateString() },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-white border border-[#e8dfd4] rounded-xl p-3">
                          <p className="text-[10px] font-bold text-[#8b94a4] uppercase tracking-wide mb-0.5">{label}</p>
                          <p className="text-sm text-[#1a0e02] font-medium truncate">{value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Host's reason */}
                    <div className="bg-[#fdf9f6] border border-[#e8dfd4] rounded-2xl p-4 mb-4">
                      <p className="text-xs font-bold text-[#1a0e02] uppercase tracking-wide mb-2">Host&apos;s reason</p>
                      <p className="text-sm text-[#1a0e02] leading-relaxed">{selectedCancelReq.reason}</p>
                    </div>

                    {/* Admin note if already decided */}
                    {selectedCancelReq.status === "rejected" && selectedCancelReq.adminNote && (
                      <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                        <p className="text-xs font-bold text-red-600 mb-1">Your rejection note</p>
                        <p className="text-sm text-red-700">{selectedCancelReq.adminNote}</p>
                      </div>
                    )}
                    {selectedCancelReq.status === "approved" && (
                      <div className="bg-[#f0faf5] border border-[#c8ead8] rounded-xl px-4 py-3 mb-4">
                        <p className="text-xs font-bold text-[#049153] mb-1">Approved — listing deactivated</p>
                        <p className="text-sm text-[#049153]">The listing has been removed and is no longer visible to guests.</p>
                      </div>
                    )}

                    {/* Actions — pending only */}
                    {selectedCancelReq.status === "pending" && (
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => handleApproveCancelReq(selectedCancelReq.id)}
                          className="flex-1 bg-[#049153] text-white font-bold py-3 rounded-2xl hover:bg-[#038044] transition-colors"
                        >
                          Approve & deactivate listing
                        </button>
                        <button
                          onClick={() => setShowCancelRejectModal(true)}
                          className="flex-1 bg-red-600 text-white font-bold py-3 rounded-2xl hover:bg-red-700 transition-colors"
                        >
                          Reject request
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center px-10">
                  <div className="w-16 h-16 rounded-2xl bg-[#f0e8de] flex items-center justify-center text-[#8b5e38] mb-4">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.7" />
                      <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                    </svg>
                  </div>
                  <h3 className="font-display font-semibold text-[#1a0e02] mb-2">Select a cancellation request</h3>
                  <p className="text-sm text-[#64707d] max-w-xs">Choose a request from the list to review, approve, or reject it.</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Support Tickets section ─────────────────────────────────────── */}
        {section === "support" && (() => {
          const SUPPORT_STATUS_TABS: { id: TicketStatus | "all"; label: string }[] = [
            { id: "all",         label: "All"         },
            { id: "open",        label: "Open"        },
            { id: "in_progress", label: "In Progress" },
            { id: "resolved",    label: "Resolved"    },
            { id: "closed",      label: "Closed"      },
          ];

          const SUPPORT_STATUS_CONFIG: Record<TicketStatus, { dot: string; bg: string; text: string; border: string }> = {
            open:        { dot: "bg-[#c49a4f]", bg: "bg-[#fdf8ee]", text: "text-[#8b6a1f]", border: "border-[#ead9a6]" },
            in_progress: { dot: "bg-[#0046cc]", bg: "bg-[#f0f4ff]", text: "text-[#0046cc]", border: "border-[#b3c5f5]" },
            resolved:    { dot: "bg-[#049153]", bg: "bg-[#f0faf5]", text: "text-[#049153]", border: "border-[#c8ead8]" },
            closed:      { dot: "bg-[#8b94a4]", bg: "bg-[#f4f6f8]", text: "text-[#64707d]", border: "border-[#dddfe3]" },
          };

          const selectedTicket = supportTickets.find((t) => t.id === selectedSupportId) ?? null;

          return (
            <>
              {/* Left: ticket queue */}
              <div className={`w-full md:w-[380px] md:shrink-0 flex flex-col bg-white border-r border-[#e8dfd4] overflow-hidden ${showPanel ? "hidden md:flex" : "flex"}`}>
                <div className="px-4 pt-4 pb-3 border-b border-[#f0e8de] flex flex-col gap-3 shrink-0">
                  <div className="flex gap-1 bg-[#f0e8de] rounded-xl p-1 overflow-x-auto">
                    {SUPPORT_STATUS_TABS.map((t) => (
                      <button key={t.id} onClick={() => { setSupportTicketTab(t.id); setSelectedSupportId(null); setSupportThread(null); }}
                        className={`shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${supportTicketTab === t.id ? "bg-white text-[#1a0e02] shadow-sm" : "text-[#64707d] hover:text-[#1a0e02]"}`}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a09080]">
                      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.8" />
                      <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                    <input type="text" value={supportSearch} onChange={(e) => setSupportSearch(e.target.value)} placeholder="Search tickets…"
                      className="w-full pl-9 pr-3 py-2 border border-[#e8dfd4] rounded-xl text-sm text-[#1a0e02] placeholder:text-[#a09080] focus:outline-none focus:border-[#8b5e38] bg-white transition-colors" />
                  </div>
                  <p className="text-[10px] text-[#a09080] font-medium">{filteredSupportTickets.length} ticket{filteredSupportTickets.length !== 1 ? "s" : ""}</p>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {filteredSupportTickets.length === 0
                    ? <EmptyState message="No tickets in this view." />
                    : filteredSupportTickets.map((ticket) => {
                      const sc = SUPPORT_STATUS_CONFIG[ticket.status];
                      return (
                        <button key={ticket.id} onClick={() => handleOpenSupportTicket(ticket.id)}
                          className={`w-full text-left px-4 py-3.5 border-b border-[#f0e8de] flex flex-col gap-1.5 transition-colors ${selectedSupportId === ticket.id ? "bg-[#fdf5ee]" : "hover:bg-[#fdf9f6]"}`}>
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-[#1a0e02] text-sm truncate">{ticket.title}</span>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border shrink-0 ${sc.bg} ${sc.text} ${sc.border}`}>
                              {TICKET_STATUS_LABELS[ticket.status]}
                            </span>
                          </div>
                          <p className="text-xs text-[#64707d] truncate">
                            {ISSUE_TYPE_LABELS[ticket.issueType]} · {ticket.userName ?? "User"}
                          </p>
                          {ticket.userEmail && (
                            <p className="text-[11px] text-[#a09080] truncate">{ticket.userEmail}</p>
                          )}
                          <p className="text-[11px] text-[#a09080]">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                        </button>
                      );
                    })
                  }
                </div>
              </div>

              {/* Right: ticket detail */}
              <div className={`flex-1 flex flex-col overflow-hidden ${showPanel || !selectedSupportId ? "block" : "hidden md:block"}`}>
                {selectedTicket ? (
                  <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <button onClick={() => setShowPanel(false)} className="md:hidden p-1.5 rounded-lg hover:bg-[#f0e8de] transition-colors">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <path d="M15 18l-6-6 6-6" stroke="#1a0e02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <div className="flex-1 min-w-0">
                        <h2 className="font-display font-bold text-[#1a0e02] text-lg leading-snug truncate">{selectedTicket.title}</h2>
                        <p className="text-xs text-[#64707d]">
                          {ISSUE_TYPE_LABELS[selectedTicket.issueType]} · {selectedTicket.userName ?? "User"}{selectedTicket.userEmail ? ` · ${selectedTicket.userEmail}` : ""}
                        </p>
                      </div>
                      <select
                        value={selectedTicket.status}
                        onChange={(e) => handleAdminUpdateStatus(selectedTicket.id, e.target.value as TicketStatus)}
                        className="text-xs font-semibold border border-[#e8dfd4] rounded-xl px-2.5 py-1.5 bg-white text-[#1a0e02] focus:outline-none focus:border-[#8b5e38] transition-colors shrink-0"
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>

                    {/* Original message */}
                    <div className="bg-[#fdf9f6] border border-[#e8dfd4] rounded-2xl p-4">
                      <p className="text-xs font-bold text-[#8b94a4] uppercase tracking-wide mb-1.5">User&apos;s message</p>
                      <p className="text-sm text-[#1a0e02] leading-relaxed whitespace-pre-wrap">{selectedTicket.description}</p>
                      <p className="text-[11px] text-[#a09080] mt-2">Submitted {new Date(selectedTicket.createdAt).toLocaleDateString()}</p>
                    </div>

                    {/* Reply thread */}
                    <div className="bg-white border border-[#e8dfd4] rounded-2xl overflow-hidden">
                      <div className="px-4 py-3 border-b border-[#f0e8de]">
                        <p className="text-xs font-bold text-[#1a0e02] uppercase tracking-wide">Conversation</p>
                      </div>
                      {supportThreadLoading ? (
                        <div className="flex items-center justify-center py-10">
                          <div className="w-6 h-6 border-2 border-[#c49a4f] border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : (supportThread?.replies ?? []).length === 0 ? (
                        <div className="px-4 py-6 text-center">
                          <p className="text-sm text-[#64707d]">No replies yet.</p>
                        </div>
                      ) : (
                        <div className="px-4 py-4 flex flex-col gap-3">
                          {(supportThread?.replies ?? []).map((reply) => {
                            const isAdminReply = reply.isAdmin;
                            return (
                              <div key={reply.id} className={`flex flex-col gap-1 ${isAdminReply ? "items-end" : "items-start"}`}>
                                <p className="text-[10px] font-bold text-[#8b94a4] uppercase tracking-wide px-1">
                                  {isAdminReply ? "You (Support)" : reply.authorName} · {new Date(reply.createdAt).toLocaleDateString()}
                                </p>
                                <div className={`max-w-[85%] rounded-2xl px-3 py-2.5 text-sm ${
                                  isAdminReply
                                    ? "bg-[#461e00] text-white rounded-tr-sm"
                                    : "bg-white border border-[#e8dfd4] text-[#1a0e02] rounded-tl-sm"
                                }`}>
                                  <p className="leading-relaxed whitespace-pre-wrap">{reply.message}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Admin reply form */}
                    {selectedTicket.status !== "closed" && (
                      <div className="bg-white border border-[#e8dfd4] rounded-2xl p-4 flex flex-col gap-3">
                        <p className="text-xs font-bold text-[#1a0e02] uppercase tracking-wide">Reply as Bedouin Support</p>
                        <textarea
                          rows={3}
                          value={adminReplyMsg}
                          onChange={(e) => setAdminReplyMsg(e.target.value)}
                          placeholder="Write your reply…"
                          className="w-full border border-[#e8dfd4] rounded-xl px-3 py-2.5 text-sm text-[#1a0e02] placeholder:text-[#a09080] focus:outline-none focus:border-[#8b5e38] resize-none transition-colors"
                        />
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <label className="text-[10px] font-bold text-[#8b94a4] uppercase tracking-wide shrink-0">Set status</label>
                            <select
                              value={adminReplyStatus}
                              onChange={(e) => setAdminReplyStatus(e.target.value as TicketStatus)}
                              className="text-xs font-semibold border border-[#e8dfd4] rounded-xl px-2.5 py-1.5 bg-white text-[#1a0e02] focus:outline-none focus:border-[#8b5e38] transition-colors"
                            >
                              <option value="in_progress">In Progress</option>
                              <option value="resolved">Resolved</option>
                              <option value="closed">Closed</option>
                            </select>
                          </div>
                          <button
                            onClick={handleAdminReply}
                            disabled={adminReplying || !adminReplyMsg.trim()}
                            className="px-4 py-2 rounded-xl bg-[#461e00] text-white text-sm font-bold hover:bg-[#5c2800] disabled:opacity-50 transition-colors shrink-0"
                          >
                            {adminReplying ? "Sending…" : "Send Reply"}
                          </button>
                        </div>
                        {adminReplyError && (
                          <p className="text-xs text-red-600">{adminReplyError}</p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center px-10">
                    <div className="w-16 h-16 rounded-2xl bg-[#f0e8de] flex items-center justify-center text-[#8b5e38] mb-4">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                        <path d="M8 10h8M8 14h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                        <path d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <h3 className="font-display font-semibold text-[#1a0e02] mb-2">Select a support ticket</h3>
                    <p className="text-sm text-[#64707d] max-w-xs">Choose a ticket from the queue to view the conversation and reply.</p>
                  </div>
                )}
              </div>
            </>
          );
        })()}

      </div>
    </div>
  );
}
