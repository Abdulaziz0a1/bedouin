"use client";

import { useState, useTransition, useEffect, useRef, useCallback } from "react";
import UserAvatar from "@/components/ui/UserAvatar";
import { sendMessage, fetchThread, type ThreadMessage } from "@/lib/actions/messages";
import type { Conversation } from "@/lib/services/messages";

interface MessagesPageProps {
  myId:               string;
  conversations:      Conversation[];
  initialWithUserId?: string;
  initialWithName?:   string;
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
        {conv.lastMessage && (
          <p className="text-xs text-[#64707d] truncate">{conv.lastMessage}</p>
        )}
        {!conv.lastMessage && (
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
}: {
  msg:        ThreadMessage;
  isMine:     boolean;
  senderName: string;
}) {
  return (
    <div className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : ""}`}>
      {!isMine && (
        <UserAvatar name={senderName} size={28} className="shrink-0 rounded-full mb-0.5" />
      )}
      <div className={`max-w-[72%] flex flex-col gap-0.5 ${isMine ? "items-end" : "items-start"}`}>
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isMine
              ? "bg-[#461e00] text-white rounded-br-sm"
              : "bg-white border border-[#e8dfd4] text-[#1a0e02] rounded-bl-sm"
          }`}
        >
          {msg.content}
        </div>
        <span className="text-[10px] text-[#a09080] px-1">{fmtTime(msg.createdAt)}</span>
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
}: MessagesPageProps) {
  // Merge the initialWith user into the conversation list if they aren't there yet
  const [convList, setConvList] = useState<Conversation[]>(() => {
    if (
      initialWithUserId &&
      !initialConvs.find((c) => c.userId === initialWithUserId)
    ) {
      return [
        {
          userId:      initialWithUserId,
          name:        initialWithName ?? "User",
          lastMessage: "",
          lastAt:      "",
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
  const bottomRef                       = useRef<HTMLDivElement>(null);
  // Mobile: show thread panel when a conversation is selected
  const [showThread, setShowThread]     = useState(!!initialWithUserId);

  const activeName = convList.find((c) => c.userId === activeId)?.name ?? "User";

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
  }

  function handleSend() {
    const text = inputText.trim();
    if (!text || !activeId || sending) return;
    setSendError(null);
    setInputText("");

    startSend(async () => {
      const result = await sendMessage(activeId, text);
      if (result.success) {
        const msgs = await fetchThread(activeId);
        setThread(msgs);
        setConvList((prev) =>
          prev.map((c) =>
            c.userId === activeId
              ? { ...c, lastMessage: text, lastAt: new Date().toISOString() }
              : c
          )
        );
      } else {
        setSendError(result.error);
        setInputText(text);
      }
    });
  }

  return (
    <div className="flex h-[calc(100vh-72px)] bg-[#f4efe6]">

      {/* ── Left: conversation list ──────────────────────────────────── */}
      <aside
        className={[
          "w-full sm:w-[300px] lg:w-[340px] shrink-0 bg-white border-r border-[#e8dfd4] flex flex-col",
          showThread ? "hidden sm:flex" : "flex",
        ].join(" ")}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#f0e8de]">
          <h1 className="font-display font-bold text-[#1a0e02] text-lg">Messages</h1>
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
          "flex-1 flex flex-col bg-[#faf7f4]",
          showThread ? "flex" : "hidden sm:flex",
        ].join(" ")}
      >
        {activeId ? (
          <>
            {/* Thread header */}
            <div className="flex items-center gap-3 px-5 py-3.5 bg-white border-b border-[#e8dfd4] shadow-[0_1px_4px_rgba(26,14,2,0.05)]">
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
              <p className="font-semibold text-[#1a0e02] text-sm">{activeName}</p>
            </div>

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
              ) : (
                thread.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    msg={msg}
                    isMine={msg.senderId === myId}
                    senderName={activeName}
                  />
                ))
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="bg-white border-t border-[#e8dfd4] px-4 py-3 flex gap-2 items-end">
              <textarea
                value={inputText}
                onChange={(e) => { setInputText(e.target.value); setSendError(null); }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
                }}
                placeholder="Type a message…"
                rows={1}
                className="flex-1 resize-none px-4 py-2.5 border border-[#e8dfd4] rounded-2xl text-sm text-[#1a0e02] placeholder:text-[#a09080] focus:outline-none focus:border-[#8b5e38] transition-colors bg-[#faf7f4] max-h-32 overflow-y-auto"
              />
              <button
                onClick={handleSend}
                disabled={!inputText.trim() || sending}
                className="w-10 h-10 bg-[#461e00] text-white rounded-2xl flex items-center justify-center hover:bg-[#5a2800] disabled:opacity-40 transition-colors shrink-0"
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
    </div>
  );
}
