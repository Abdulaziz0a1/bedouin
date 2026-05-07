"use client";

import { useState, useTransition, useEffect, useRef, useCallback } from "react";
import UserAvatar from "@/components/ui/UserAvatar";
import { sendMessage, fetchThread, deleteMessage, hideConversation, markThreadRead, type ThreadMessage } from "@/lib/actions/messages";
import type { Conversation } from "@/lib/services/messages";

interface MessagesPageProps {
  myId:                 string;
  conversations:        Conversation[];
  initialWithUserId?:   string;
  initialWithName?:     string;
  initialListingId?:    string;
  initialListingTitle?: string;
  initialBookingId?:    string;
}

function fmtTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0)
    return d.toLocaleTimeString("en-SA", { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7)
    return d.toLocaleDateString("en-SA", { weekday: "short" });
  return d.toLocaleDateString("en-SA", { day: "numeric", month: "short" });
}

// ── Role badge ────────────────────────────────────────────────────────────

const ROLE_STYLES: Record<string, { bg: string; color: string }> = {
  "Host":             { bg: "#fdf5ee", color: "#8b5e38" },
  "Guest (Booked)":   { bg: "#f0f4ff", color: "#0046cc" },
  "Guest (Inquiry)":  { bg: "#fff8ee", color: "#b17a50" },
  "Co-host":          { bg: "#f0faf5", color: "#049153" },
};

function RoleBadge({ role }: { role: string }) {
  const s = ROLE_STYLES[role] ?? { bg: "#f1f2f3", color: "#64707d" };
  return (
    <span
      className="shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border"
      style={{ background: s.bg, color: s.color, borderColor: s.bg }}
    >
      {role}
    </span>
  );
}

function fmtShortDate(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-SA", {
    day: "numeric", month: "short",
  });
}

// ── Delete-eligibility check ───────────────────────────────────────────────
// A message is deletable only when no reply from the other side has been sent
// after it. Walk backwards: once we encounter a message from the other person,
// all earlier mine-messages are locked.
function getDeletableIds(thread: ThreadMessage[], myId: string): Set<string> {
  const result = new Set<string>();
  let seenOtherReply = false;
  for (let i = thread.length - 1; i >= 0; i--) {
    const msg = thread[i];
    if (msg.senderId !== myId) {
      seenOtherReply = true;
    } else if (!msg.isDeleted && !seenOtherReply) {
      result.add(msg.id);
    }
  }
  return result;
}

// ── Conversation list item ─────────────────────────────────────────────────

function ConvItem({
  conv,
  isActive,
  onClick,
}: {
  conv:     Conversation;
  isActive: boolean;
  onClick:  () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all border-b border-[#f0e8de] last:border-0",
        isActive
          ? "bg-[#fdf5ee] border-l-[3px] border-l-[#8b5e38]"
          : "hover:bg-[#faf7f4] border-l-[3px] border-l-transparent",
      ].join(" ")}
    >
      <UserAvatar name={conv.name} size={40} className="shrink-0 rounded-full" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <p className="text-sm font-semibold text-[#1a0e02] truncate">{conv.name}</p>
          {conv.lastAt && (
            <span className="text-[10px] text-[#a09080] shrink-0">{fmtTime(conv.lastAt)}</span>
          )}
        </div>
        {(conv.otherParticipantRole || conv.listingTitle) && (
          <div className="flex items-center gap-1.5 mb-0.5">
            {conv.otherParticipantRole && <RoleBadge role={conv.otherParticipantRole} />}
            {conv.listingTitle && (
              <span className="text-[11px] text-[#a09080] truncate">{conv.listingTitle}</span>
            )}
          </div>
        )}
        {conv.lastMessage ? (
          <p className="text-xs text-[#64707d] truncate">{conv.lastMessage}</p>
        ) : (
          <p className="text-xs text-[#a09080] italic">No messages yet</p>
        )}
      </div>
    </button>
  );
}

// ── Message bubble ─────────────────────────────────────────────────────────

function MessageBubble({
  msg,
  isMine,
  senderName,
  onDelete,
}: {
  msg:        ThreadMessage;
  isMine:     boolean;
  senderName: string;
  onDelete?:  (msgId: string) => void;
}) {
  const [confirming, setConfirming] = useState(false);

  function handleDelete() {
    setConfirming(false);
    onDelete?.(msg.id);
  }

  return (
    <div className={`flex items-end gap-2 group ${isMine ? "flex-row-reverse" : ""}`}>
      {!isMine && (
        <UserAvatar name={senderName} size={28} className="shrink-0 rounded-full mb-0.5" />
      )}

      {/* Three-dot button — only for my non-deleted messages */}
      {isMine && !msg.isDeleted && (
        <button
          onClick={() => setConfirming((v) => !v)}
          title="Message options"
          className="self-end mb-5 w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-[#a09080] hover:text-[#64707d] hover:bg-[#e8dfd4] transition-all opacity-40 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
          </svg>
        </button>
      )}

      <div className={`max-w-[72%] flex flex-col gap-0.5 ${isMine ? "items-end" : "items-start"}`}>
        <div
          className="px-4 py-2.5 text-sm leading-relaxed"
          style={
            msg.isDeleted
              ? {
                  borderRadius: "14px",
                  background: "#f4f1ee",
                  color: "#a09080",
                  fontStyle: "italic",
                  border: "1px solid var(--border)",
                }
              : isMine
              ? {
                  borderRadius: "18px 18px 4px 18px",
                  background: "linear-gradient(145deg, #461e00 0%, #2d1208 100%)",
                  color: "white",
                  boxShadow: "0 2px 12px rgba(70,30,0,0.24)",
                }
              : {
                  borderRadius: "18px 18px 18px 4px",
                  background: "white",
                  color: "#1a0e02",
                  border: "1px solid var(--border)",
                  boxShadow: "0 1px 6px rgba(70,30,0,0.06)",
                }
          }
        >
          {msg.isDeleted ? "This message was deleted." : msg.content}
        </div>
        <span className="text-[10px] text-[#a09080] px-1">{fmtTime(msg.createdAt)}</span>

        {/* Inline delete confirmation */}
        {confirming && (
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#e8dfd4] rounded-xl shadow-sm">
            <span className="text-xs text-[#64707d]">Delete this message?</span>
            <button
              onClick={handleDelete}
              className="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
            >
              Delete
            </button>
            <span className="text-[#d0c8be] text-xs">·</span>
            <button
              onClick={() => setConfirming(false)}
              className="text-xs text-[#a09080] hover:text-[#64707d] transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Hide conversation modal ────────────────────────────────────────────────

function HideConvModal({
  name,
  onConfirm,
  onCancel,
  isLoading,
  error,
}: {
  name:      string;
  onConfirm: () => void;
  onCancel:  () => void;
  isLoading: boolean;
  error:     string | null;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#1a0e02]/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#fdf5ee] flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[#8b5e38]">
              <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h3 className="font-display font-semibold text-[#1a0e02] text-base">Delete conversation?</h3>
            <p className="text-xs text-[#64707d] mt-1 leading-relaxed">
              Your conversation with{" "}
              <span className="font-semibold text-[#1a0e02]">{name}</span>{" "}
              will be removed from your inbox. The other person will still be able to see it.
            </p>
          </div>
        </div>
        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
            {error}
          </p>
        )}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 border border-[#e8dfd4] rounded-xl text-sm font-semibold text-[#64707d] hover:border-[#8b5e38] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-2.5 bg-[#461e00] text-white rounded-xl text-sm font-semibold hover:bg-[#5a2800] disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
          >
            {isLoading && (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="white" strokeOpacity="0.3" strokeWidth="2.5" />
                <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            )}
            Delete conversation
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function MessagesPage({
  myId,
  conversations: initialConvs,
  initialWithUserId,
  initialWithName,
  initialListingId,
  initialListingTitle,
  initialBookingId,
}: MessagesPageProps) {
  // Merge the initialWith user into the conversation list if they aren't there yet
  const [convList, setConvList] = useState<Conversation[]>(() => {
    if (
      initialWithUserId &&
      !initialConvs.find((c) => c.userId === initialWithUserId)
    ) {
      return [
        {
          userId:               initialWithUserId,
          name:                 initialWithName ?? "User",
          lastMessage:          "",
          lastAt:               "",
          unreadCount:          0,
          listingId:            initialListingId    ?? null,
          listingTitle:         initialListingTitle ?? null,
          bookingId:            initialBookingId    ?? null,
          bookingCheckIn:       null,
          bookingCheckOut:      null,
          otherParticipantRole: null,
        },
        ...initialConvs,
      ];
    }
    return initialConvs;
  });

  const [activeId, setActiveId]         = useState<string | null>(
    initialWithUserId ?? initialConvs[0]?.userId ?? null
  );
  const [thread, setThread]             = useState<ThreadMessage[]>([]);
  const [threadLoading, setThreadLoad]  = useState(false);
  const [inputText, setInputText]       = useState("");
  const [sendError, setSendError]       = useState<string | null>(null);
  const [sending, startSend]            = useTransition();
  const [deletingIds, setDeletingIds]   = useState<Set<string>>(new Set());
  const [deleteError, setDeleteError]   = useState<string | null>(null);
  const [showHideModal, setShowHideModal] = useState(false);
  const [hiding, setHiding]             = useState(false);
  const [hideError, setHideError]       = useState<string | null>(null);
  const bottomRef                       = useRef<HTMLDivElement>(null);
  // Mobile: show thread panel when a conversation is selected
  const [showThread, setShowThread]     = useState(!!initialWithUserId);

  const activeConv  = convList.find((c) => c.userId === activeId) ?? null;
  const activeName  = activeConv?.name ?? "User";

  // Context line shown below the name in the thread header
  let contextLine: string | null = null;
  if (activeConv?.bookingCheckIn && activeConv?.bookingCheckOut) {
    const range = `${fmtShortDate(activeConv.bookingCheckIn)} → ${fmtShortDate(activeConv.bookingCheckOut)}`;
    contextLine = activeConv.listingTitle ? `${range} · ${activeConv.listingTitle}` : range;
  } else if (activeConv?.listingTitle) {
    contextLine = `Inquiry about ${activeConv.listingTitle}`;
  }

  const loadThread = useCallback(async (otherId: string) => {
    setThreadLoad(true);
    const msgs = await fetchThread(otherId);
    setThread(msgs);
    setThreadLoad(false);
  }, []);

  useEffect(() => {
    if (activeId) loadThread(activeId);
  }, [activeId, loadThread]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread]);

  function selectConv(userId: string) {
    setActiveId(userId);
    setShowThread(true);
    setInputText("");
    setSendError(null);
    // Mark all incoming messages in this thread as read (fire-and-forget).
    // Also clear the local unread count immediately so the badge doesn't lag.
    markThreadRead(userId).catch(() => {});
    setConvList((prev) =>
      prev.map((c) => (c.userId === userId ? { ...c, unreadCount: 0 } : c))
    );
  }

  function handleSend() {
    const text = inputText.trim();
    if (!text || !activeId || sending) return;
    setSendError(null);
    setInputText("");

    // When the active conversation is the one we arrived at via URL params,
    // use the URL-supplied IDs as fallback — existing conv entries may have
    // null listingId/bookingId if prior messages were sent without context.
    const isInitialConv = activeId === initialWithUserId;
    const effectiveListingId =
      activeConv?.listingId ?? (isInitialConv ? initialListingId : undefined);
    const effectiveBookingId =
      activeConv?.bookingId ?? (isInitialConv ? initialBookingId : undefined);

    startSend(async () => {
      const result = await sendMessage(
        activeId,
        text,
        effectiveListingId,
        effectiveBookingId,
      );
      if (result.success) {
        const msgs = await fetchThread(activeId);
        setThread(msgs);
        setConvList((prev) =>
          prev.map((c) =>
            c.userId === activeId
              ? {
                  ...c,
                  lastMessage: text,
                  lastAt:      new Date().toISOString(),
                  // Persist context so future sends in this session also carry it
                  listingId:   c.listingId ?? effectiveListingId ?? null,
                  bookingId:   c.bookingId ?? effectiveBookingId ?? null,
                }
              : c
          )
        );
      } else {
        setSendError(result.error);
        setInputText(text);
      }
    });
  }

  async function handleDelete(msgId: string) {
    setDeleteError(null);
    // Optimistic: mark deleted immediately
    setThread((prev) =>
      prev.map((m) => m.id === msgId ? { ...m, isDeleted: true } : m)
    );
    setDeletingIds((prev) => new Set(prev).add(msgId));
    const result = await deleteMessage(msgId);
    setDeletingIds((prev) => { const s = new Set(prev); s.delete(msgId); return s; });
    if (!result.success) {
      // Reload the thread (may show a new reply that caused the rejection)
      // then surface the error so the user understands what happened.
      if (activeId) {
        const fresh = await fetchThread(activeId);
        setThread(fresh);
      } else {
        setThread((prev) =>
          prev.map((m) => m.id === msgId ? { ...m, isDeleted: false } : m)
        );
      }
      setDeleteError(result.error ?? "Could not delete message.");
    }
  }

  async function handleHideConversation() {
    if (!activeId) return;
    setHiding(true);
    setHideError(null);
    const result = await hideConversation(activeId);
    setHiding(false);
    if (result.success) {
      setShowHideModal(false);
      const nextConv = convList.find((c) => c.userId !== activeId);
      setConvList((prev) => prev.filter((c) => c.userId !== activeId));
      if (nextConv) {
        setActiveId(nextConv.userId);
      } else {
        setActiveId(null);
        setShowThread(false);
      }
    } else {
      setHideError(result.error ?? "Failed to delete conversation.");
    }
  }

  return (
    <div className="flex h-[calc(100vh-74px)]" style={{ background: "var(--bg-sand)" }}>

      {/* ── Left: conversation list ──────────────────────────────────── */}
      <aside
        className={[
          "w-full sm:w-[300px] lg:w-[340px] shrink-0 flex flex-col",
          showThread ? "hidden sm:flex" : "flex",
        ].join(" ")}
        style={{ background: "white", borderRight: "1px solid var(--border)" }}
      >
        {/* Header */}
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-light)" }}>
          <h1 className="font-display font-bold text-[#1a0e02] text-[1.05rem]">Messages</h1>
          <p className="text-xs text-[#a09080] mt-0.5">Your conversations</p>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {convList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#fdf5ee] flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-[#8b5e38]">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-[#1a0e02]">No messages yet</p>
              <p className="text-xs text-[#64707d]">
                Messages appear here after you book a stay or connect with a co-host.
              </p>
            </div>
          ) : (
            convList.map((conv) => (
              <ConvItem
                key={conv.userId}
                conv={conv}
                isActive={conv.userId === activeId}
                onClick={() => selectConv(conv.userId)}
              />
            ))
          )}
        </div>
      </aside>

      {/* ── Right: thread ───────────────────────────────────────────── */}
      <main
        className={[
          "flex-1 flex flex-col",
          showThread ? "flex" : "hidden sm:flex",
        ].join(" ")}
        style={{ background: "#faf7f3" }}
      >
        {activeId ? (
          <>
            {/* Thread header */}
            <div
              className="flex items-center gap-3 px-5 py-3.5"
              style={{
                background: "white",
                borderBottom: "1px solid var(--border)",
                boxShadow: "0 1px 8px rgba(70,30,0,0.05)",
              }}
            >
              {/* Mobile back button */}
              <button
                onClick={() => setShowThread(false)}
                className="sm:hidden p-1.5 -ml-1 rounded-xl hover:bg-[#f4f6f8] transition-colors text-[#64707d]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <UserAvatar name={activeName} size={36} className="rounded-full shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-[#1a0e02] text-sm truncate">{activeName}</p>
                  {activeConv?.otherParticipantRole && <RoleBadge role={activeConv.otherParticipantRole} />}
                </div>
                {contextLine && (
                  <p className="text-[11px] text-[#64707d] truncate mt-0.5">{contextLine}</p>
                )}
              </div>
              {/* Delete conversation button */}
              <button
                onClick={() => { setShowHideModal(true); setHideError(null); }}
                title="Delete conversation"
                className="p-2 rounded-xl text-[#a09080] hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Conversation context banner */}
            {(activeConv?.listingTitle || (activeConv?.bookingCheckIn && activeConv?.bookingCheckOut)) && (
              <div className="px-5 py-2.5 bg-white border-b border-[#f0e8de] flex flex-col gap-0.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#a09080]">
                  You&apos;re talking about
                </span>
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  {activeConv.listingTitle && (
                    <span className="text-xs font-semibold text-[#1a0e02]">
                      {activeConv.listingTitle}
                    </span>
                  )}
                  {activeConv.bookingCheckIn && activeConv.bookingCheckOut && (
                    <span className="text-[11px] text-[#64707d]">
                      {fmtShortDate(activeConv.bookingCheckIn)} – {fmtShortDate(activeConv.bookingCheckOut)}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Delete-message error banner */}
            {deleteError && (
              <div className="flex items-center justify-between gap-3 px-5 py-2.5 bg-red-50 border-b border-red-100">
                <span className="text-xs text-red-600">{deleteError}</span>
                <button
                  onClick={() => setDeleteError(null)}
                  className="text-red-400 hover:text-red-600 transition-colors shrink-0"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            )}

            {/* Thread messages */}
            <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">
              {threadLoading ? (
                <div className="flex items-center justify-center flex-1">
                  <svg className="animate-spin w-6 h-6 text-[#8b5e38]" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2.5" />
                    <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
              ) : thread.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 gap-2 text-center">
                  <p className="text-sm text-[#64707d]">No messages yet.</p>
                  <p className="text-xs text-[#a09080]">Send the first message below.</p>
                </div>
              ) : (() => {
                const deletableIds = getDeletableIds(thread, myId);
                return thread.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    msg={msg}
                    isMine={msg.senderId === myId}
                    senderName={activeName}
                    onDelete={deletableIds.has(msg.id) ? handleDelete : undefined}
                  />
                ));
              })()}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div
              className="px-4 py-3 flex gap-2 items-end"
              style={{ background: "white", borderTop: "1px solid var(--border)" }}
            >
              <textarea
                value={inputText}
                onChange={(e) => { setInputText(e.target.value); setSendError(null); }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
                }}
                placeholder="Type a message…"
                rows={1}
                className="flex-1 resize-none px-4 py-2.5 text-sm text-[#1a0e02] placeholder:text-[#a09080] outline-none max-h-32 overflow-y-auto transition-all"
                style={{
                  background: "#faf7f3",
                  border: "1.5px solid var(--border)",
                  borderRadius: "18px",
                  boxShadow: "inset 0 1.5px 4px rgba(70,30,0,0.04)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(196,154,79,0.60)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(196,154,79,0.10), inset 0 1.5px 4px rgba(70,30,0,0.04)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.boxShadow = "inset 0 1.5px 4px rgba(70,30,0,0.04)";
                }}
              />
              <button
                onClick={handleSend}
                disabled={!inputText.trim() || sending}
                className="w-10 h-10 text-white rounded-2xl flex items-center justify-center disabled:opacity-40 transition-all shrink-0"
                style={{
                  background: "linear-gradient(145deg, #461e00 0%, #2d1208 100%)",
                  boxShadow: "0 3px 12px rgba(70,30,0,0.28)",
                }}
                onMouseEnter={(e) => {
                  if (!(e.currentTarget as HTMLButtonElement).disabled)
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 5px 18px rgba(70,30,0,0.38)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 3px 12px rgba(70,30,0,0.28)";
                }}
              >
                {sending ? (
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2.5" />
                    <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M22 2L15 22l-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            </div>

            {sendError && (
              <p className="text-xs text-red-600 px-5 pb-2">{sendError}</p>
            )}
          </>
        ) : (
          // No conversation selected (desktop empty state)
          <div className="flex flex-col items-center justify-center flex-1 gap-3 text-center px-8">
            <div className="w-16 h-16 rounded-3xl bg-[#fdf5ee] flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-[#8b5e38]">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="font-semibold text-[#1a0e02]">Select a conversation</p>
            <p className="text-sm text-[#64707d] max-w-xs">
              Choose a conversation from the list, or start one from your bookings or co-host assignments.
            </p>
          </div>
        )}
      </main>

      {/* Hide / delete conversation modal */}
      {showHideModal && activeId && (
        <HideConvModal
          name={activeName}
          onConfirm={handleHideConversation}
          onCancel={() => setShowHideModal(false)}
          isLoading={hiding}
          error={hideError}
        />
      )}
    </div>
  );
}
