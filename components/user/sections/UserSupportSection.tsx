"use client";

import { useState, useTransition } from "react";
import type { SupportTicket, SupportReply, TicketWithReplies, IssueType, TicketStatus } from "@/lib/types/support";
import { ISSUE_TYPE_LABELS } from "@/lib/types/support";
import {
  createSupportTicket,
  replyToTicket,
  closeTicket,
  loadTicketThread,
} from "@/lib/actions/support";
import UserEmptyState from "../shared/UserEmptyState";

// ── Types ─────────────────────────────────────────────────────────────────────

type FilterTab = "all" | TicketStatus;
type View = "list" | "detail";

// ── Constants ─────────────────────────────────────────────────────────────────

const ISSUE_TYPES: IssueType[] = [
  "booking_issue", "payment_issue", "host_issue",
  "tourist_issue", "safety_concern", "listing_problem", "other",
];

const STATUS_CONFIG: Record<TicketStatus, { label: string; dot: string; bg: string; text: string; border: string }> = {
  open:        { label: "Open",        dot: "bg-[#c49a4f]", bg: "bg-[#fdf8ee]", text: "text-[#8b6a1f]", border: "border-[#ead9a6]" },
  in_progress: { label: "In Progress", dot: "bg-[#0046cc]", bg: "bg-[#f0f4ff]", text: "text-[#0046cc]", border: "border-[#b3c5f5]" },
  resolved:    { label: "Resolved",    dot: "bg-[#049153]", bg: "bg-[#f0faf5]", text: "text-[#049153]", border: "border-[#c8ead8]" },
  closed:      { label: "Closed",      dot: "bg-[#8b94a4]", bg: "bg-[#f4f6f8]", text: "text-[#64707d]", border: "border-[#dddfe3]" },
};

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: "all",         label: "All"         },
  { id: "open",        label: "Open"        },
  { id: "in_progress", label: "In Progress" },
  { id: "resolved",    label: "Resolved"    },
  { id: "closed",      label: "Closed"      },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

// ── TicketStatusBadge ─────────────────────────────────────────────────────────

function TicketStatusBadge({ status }: { status: TicketStatus }) {
  const c = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold shrink-0 ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
      {c.label}
    </span>
  );
}

// ── IssueChip ─────────────────────────────────────────────────────────────────

function IssueChip({ type }: { type: IssueType }) {
  return (
    <span className="text-[10px] font-bold uppercase tracking-wide text-[#8b5e38] bg-[#f0e8de] px-2 py-0.5 rounded-full">
      {ISSUE_TYPE_LABELS[type]}
    </span>
  );
}

// ── NewTicketModal ────────────────────────────────────────────────────────────

function NewTicketModal({
  onClose,
  onCreated,
}: {
  onClose:   () => void;
  onCreated: (ticket: SupportTicket) => void;
}) {
  const [isPending,   startTransition] = useTransition();
  const [issueType,   setIssueType]    = useState<IssueType>("booking_issue");
  const [title,       setTitle]        = useState("");
  const [description, setDescription]  = useState("");
  const [error,       setError]        = useState<string | null>(null);

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await createSupportTicket({ issueType, title, description });
      if (!result.success) { setError(result.error); return; }
      const newTicket: SupportTicket = {
        id:          result.ticketId,
        issueType,
        title:       title.trim(),
        description: description.trim(),
        status:      "open",
        createdAt:   new Date().toISOString(),
        updatedAt:   new Date().toISOString(),
        replyCount:  0,
      };
      onCreated(newTicket);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-0 sm:px-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-[#f0e8de]">
          <div>
            <h2 className="font-display font-bold text-[#1a0e02] text-base">Submit a Support Ticket</h2>
            <p className="text-xs text-[#64707d] mt-0.5">Your request will be reviewed by the Bedouin support team.</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-[#f0e8de] transition-colors text-[#64707d] shrink-0 mt-0.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#1a0e02] uppercase tracking-wide">Issue Type</label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value as IssueType)}
              className="w-full border border-[#e8dfd4] rounded-xl px-3 py-2.5 text-sm text-[#1a0e02] focus:outline-none focus:border-[#8b5e38] bg-white transition-colors"
            >
              {ISSUE_TYPES.map((t) => (
                <option key={t} value={t}>{ISSUE_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#1a0e02] uppercase tracking-wide">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Briefly describe your issue…"
              maxLength={120}
              className="w-full border border-[#e8dfd4] rounded-xl px-3 py-2.5 text-sm text-[#1a0e02] placeholder:text-[#a09080] focus:outline-none focus:border-[#8b5e38] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#1a0e02] uppercase tracking-wide">Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide as much detail as possible — booking ID, dates, what happened…"
              className="w-full border border-[#e8dfd4] rounded-xl px-3 py-2.5 text-sm text-[#1a0e02] placeholder:text-[#a09080] focus:outline-none focus:border-[#8b5e38] resize-none transition-colors"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>
          )}

          <p className="text-xs text-[#8b94a4] leading-relaxed">
            We are here to help keep your experience safe and reliable. Our team typically responds within 1–2 business days.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-2xl border border-[#e8dfd4] text-sm font-semibold text-[#64707d] hover:bg-[#f0e8de] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending || !title.trim() || !description.trim()}
            className="flex-1 py-2.5 rounded-2xl bg-[#461e00] text-white text-sm font-bold hover:bg-[#5c2800] disabled:opacity-50 transition-colors"
          >
            {isPending ? "Submitting…" : "Submit Ticket"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── TicketCard ────────────────────────────────────────────────────────────────

function TicketCard({
  ticket,
  onClick,
}: {
  ticket:  SupportTicket;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border border-[#e8dfd4] rounded-2xl p-5 flex flex-col gap-3 hover:border-[#c49a4f] transition-all group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5 min-w-0">
          <IssueChip type={ticket.issueType} />
          <p className="font-display font-semibold text-[#1a0e02] text-sm leading-snug group-hover:text-[#8b5e38] transition-colors line-clamp-1">
            {ticket.title}
          </p>
          <p className="text-xs text-[#64707d] line-clamp-2 leading-relaxed">
            {ticket.description}
          </p>
        </div>
        <TicketStatusBadge status={ticket.status} />
      </div>
      <div className="flex items-center gap-3 text-[11px] text-[#a09080]">
        <span>{fmtDate(ticket.createdAt)}</span>
        {(ticket.replyCount ?? 0) > 0 && (
          <>
            <span>·</span>
            <span>{ticket.replyCount} {ticket.replyCount === 1 ? "reply" : "replies"}</span>
          </>
        )}
        <span className="ml-auto text-[#8b5e38] font-semibold flex items-center gap-1">
          View thread
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </button>
  );
}

// ── MessageBubble ─────────────────────────────────────────────────────────────

function MessageBubble({ reply }: { reply: SupportReply }) {
  const isAdmin = reply.isAdmin;
  return (
    <div className={`flex flex-col gap-1 ${isAdmin ? "items-start" : "items-end"}`}>
      <p className="text-[10px] font-bold text-[#8b94a4] uppercase tracking-wide px-1">
        {isAdmin ? reply.authorName : "You"} · {fmtDateTime(reply.createdAt)}
      </p>
      <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
        isAdmin
          ? "bg-white border border-[#e8dfd4] text-[#1a0e02] rounded-tl-sm"
          : "bg-[#461e00] text-white rounded-tr-sm"
      }`}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{reply.message}</p>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function UserSupportSection({
  initialTickets,
}: {
  initialTickets: SupportTicket[];
}) {
  const [tickets,          setTickets]          = useState<SupportTicket[]>(initialTickets);
  const [activeFilter,     setActiveFilter]     = useState<FilterTab>("all");
  const [view,             setView]             = useState<View>("list");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [thread,           setThread]           = useState<TicketWithReplies | null>(null);
  const [threadLoading,    setThreadLoading]    = useState(false);
  const [showNewModal,     setShowNewModal]     = useState(false);
  const [replyMessage,     setReplyMessage]     = useState("");
  const [replyError,       setReplyError]       = useState<string | null>(null);
  const [replySuccess,     setReplySuccess]     = useState(false);
  const [isReplying,       startReply]          = useTransition();
  const [isClosing,        startClose]          = useTransition();

  const filtered = activeFilter === "all"
    ? tickets
    : tickets.filter((t) => t.status === activeFilter);

  const counts: Record<FilterTab, number> = {
    all:         tickets.length,
    open:        tickets.filter((t) => t.status === "open").length,
    in_progress: tickets.filter((t) => t.status === "in_progress").length,
    resolved:    tickets.filter((t) => t.status === "resolved").length,
    closed:      tickets.filter((t) => t.status === "closed").length,
  };

  async function openTicket(ticketId: string) {
    setSelectedTicketId(ticketId);
    setView("detail");
    setThread(null);
    setThreadLoading(true);
    setReplyMessage("");
    setReplyError(null);
    setReplySuccess(false);
    const data = await loadTicketThread(ticketId);
    setThread(data);
    setThreadLoading(false);
  }

  function handleReply() {
    if (!selectedTicketId || !replyMessage.trim()) return;
    setReplyError(null);
    setReplySuccess(false);
    startReply(async () => {
      const result = await replyToTicket(selectedTicketId, replyMessage);
      if (!result.success) { setReplyError(result.error); return; }
      const newReply: SupportReply = {
        id:         Date.now().toString(),
        ticketId:   selectedTicketId,
        authorId:   "",
        authorName: "You",
        message:    replyMessage.trim(),
        isAdmin:    false,
        createdAt:  new Date().toISOString(),
      };
      setThread((prev) => prev ? { ...prev, replies: [...prev.replies, newReply] } : prev);
      setReplyMessage("");
      setReplySuccess(true);
      setTickets((prev) => prev.map((t) =>
        t.id === selectedTicketId ? { ...t, replyCount: (t.replyCount ?? 0) + 1 } : t
      ));
    });
  }

  function handleClose() {
    if (!selectedTicketId) return;
    startClose(async () => {
      const result = await closeTicket(selectedTicketId);
      if (!result.success) return;
      setTickets((prev) => prev.map((t) =>
        t.id === selectedTicketId ? { ...t, status: "closed" } : t
      ));
      setThread((prev) => prev
        ? { ...prev, ticket: { ...prev.ticket, status: "closed" } }
        : prev
      );
    });
  }

  function handleTicketCreated(ticket: SupportTicket) {
    setTickets((prev) => [ticket, ...prev]);
    setShowNewModal(false);
    openTicket(ticket.id);
  }

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) ?? null;
  const isClosed       = selectedTicket?.status === "closed";

  // ── Detail view ────────────────────────────────────────────────────────────

  if (view === "detail" && selectedTicket) {
    return (
      <div className="flex flex-col gap-4 max-w-2xl">

        <button
          onClick={() => setView("list")}
          className="flex items-center gap-2 text-sm font-semibold text-[#64707d] hover:text-[#8b5e38] transition-colors self-start"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to tickets
        </button>

        {/* Ticket info */}
        <div className="bg-white border border-[#e8dfd4] rounded-2xl p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex flex-col gap-2 min-w-0">
              <IssueChip type={selectedTicket.issueType} />
              <h2 className="font-display font-bold text-[#1a0e02] text-lg leading-snug">{selectedTicket.title}</h2>
            </div>
            <TicketStatusBadge status={selectedTicket.status} />
          </div>
          <p className="text-xs text-[#8b94a4] mb-3">Submitted {fmtDate(selectedTicket.createdAt)}</p>
          <div className="bg-[#fdf9f6] border border-[#e8dfd4] rounded-xl p-4">
            <p className="text-xs font-bold text-[#8b94a4] uppercase tracking-wide mb-1.5">Your message</p>
            <p className="text-sm text-[#1a0e02] leading-relaxed whitespace-pre-wrap">{selectedTicket.description}</p>
          </div>
        </div>

        {/* Conversation */}
        <div className="bg-white border border-[#e8dfd4] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#f0e8de]">
            <p className="text-xs font-bold text-[#1a0e02] uppercase tracking-wide">Conversation</p>
          </div>

          {threadLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-[#c49a4f] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (thread?.replies ?? []).length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-[#64707d]">No replies yet.</p>
              <p className="text-xs text-[#a09080] mt-1">Our team will respond within 1–2 business days.</p>
            </div>
          ) : (
            <div className="px-5 py-5 flex flex-col gap-4">
              {(thread?.replies ?? []).map((reply) => (
                <MessageBubble key={reply.id} reply={reply} />
              ))}
            </div>
          )}

          {/* Reply input */}
          {!isClosed && (
            <div className="px-5 pb-5 flex flex-col gap-3 border-t border-[#f0e8de] pt-4">
              <textarea
                rows={3}
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Write a reply…"
                className="w-full border border-[#e8dfd4] rounded-xl px-3 py-2.5 text-sm text-[#1a0e02] placeholder:text-[#a09080] focus:outline-none focus:border-[#8b5e38] resize-none transition-colors"
              />
              {replyError   && <p className="text-xs text-red-600">{replyError}</p>}
              {replySuccess && <p className="text-xs text-[#049153] font-semibold">Reply sent.</p>}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleReply}
                  disabled={isReplying || !replyMessage.trim()}
                  className="px-5 py-2 rounded-xl bg-[#461e00] text-white text-sm font-bold hover:bg-[#5c2800] disabled:opacity-50 transition-colors"
                >
                  {isReplying ? "Sending…" : "Send Reply"}
                </button>
                <button
                  onClick={handleClose}
                  disabled={isClosing}
                  className="ml-auto text-xs font-semibold text-[#a09080] hover:text-red-600 transition-colors"
                >
                  {isClosing ? "Closing…" : "Close ticket"}
                </button>
              </div>
            </div>
          )}

          {isClosed && (
            <div className="px-5 pb-5">
              <div className="bg-[#f4f6f8] border border-[#dddfe3] rounded-xl px-4 py-3 text-center">
                <p className="text-xs text-[#64707d] font-semibold">This ticket is closed.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── List view ──────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">
      {showNewModal && (
        <NewTicketModal
          onClose={() => setShowNewModal(false)}
          onCreated={handleTicketCreated}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-[#1a0e02] text-xl">Support Tickets</h2>
          <p className="text-sm text-[#64707d] mt-0.5">We are here to help keep your experience safe and reliable.</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#461e00] text-white text-sm font-bold rounded-xl hover:bg-[#5c2800] transition-colors shrink-0"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          New Ticket
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-[#f0e8de] rounded-2xl p-1 flex-wrap">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === tab.id
                ? "bg-white text-[#1a0e02] shadow-sm"
                : "text-[#64707d] hover:text-[#1a0e02]"
            }`}
          >
            {tab.label}
            {counts[tab.id] > 0 && (
              <span className={`text-[10px] font-bold rounded-full px-1.5 min-w-[18px] text-center ${
                activeFilter === tab.id ? "bg-[#c49a4f] text-white" : "bg-[#dddfe3] text-[#64707d]"
              }`}>
                {counts[tab.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <UserEmptyState
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M8 10h8M8 14h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              <path d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
          title={activeFilter === "all" ? "No support tickets yet" : `No ${activeFilter.replace("_", " ")} tickets`}
          description={
            activeFilter === "all"
              ? "Have a question or issue? Submit a ticket and our team will get back to you."
              : "No tickets with this status."
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} onClick={() => openTicket(ticket.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
