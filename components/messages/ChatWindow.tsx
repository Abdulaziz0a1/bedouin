"use client";

import { useState, useRef, useEffect } from "react";
import type { Conversation, ChatMessage } from "@/lib/types/messages";
import { getOtherParticipant } from "@/lib/data/messages";
import BookingContextBanner from "./BookingContextBanner";

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function formatDateSeparator(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString())     return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
}

function isSameDay(a: string, b: string): boolean {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

// ──────────────────────────────────────────────────────────────────────────────
// Message bubble
// ──────────────────────────────────────────────────────────────────────────────

function ChatBubble({
  message,
  isMine,
  showAvatar,
  avatar,
  isLast,
}: {
  message: ChatMessage;
  isMine: boolean;
  showAvatar: boolean;
  avatar: string;
  isLast: boolean;
}) {
  return (
    <div className={`flex items-end gap-2.5 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar — only for received messages at the start of a group */}
      <div className="w-7 shrink-0">
        {!isMine && showAvatar && avatar && (
          <img src={avatar} alt="" className="w-7 h-7 rounded-full object-cover border border-[#e8dfd4]" />
        )}
      </div>

      {/* Bubble + time */}
      <div className={`flex flex-col gap-1 max-w-[72%] ${isMine ? "items-end" : "items-start"}`}>
        <div
          className={[
            "px-4 py-2.5 text-sm leading-relaxed",
            isMine
              ? "bg-[#1a0e02] text-white rounded-2xl rounded-br-md"
              : "bg-white border border-[#e8dfd4] text-[#1a0e02] rounded-2xl rounded-bl-md shadow-sm",
          ].join(" ")}
        >
          {message.text}
        </div>
        {isLast && (
          <p className="text-[10px] text-[#a09080] px-1">{formatTime(message.sentAt)}</p>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Date separator
// ──────────────────────────────────────────────────────────────────────────────

function DateSeparator({ iso }: { iso: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex-1 h-px bg-[#f0e8de]" />
      <span className="text-[10px] font-bold text-[#a09080] bg-[#f0e8de] px-3 py-1 rounded-full shrink-0">
        {formatDateSeparator(iso)}
      </span>
      <div className="flex-1 h-px bg-[#f0e8de]" />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Chat window
// ──────────────────────────────────────────────────────────────────────────────

interface ChatWindowProps {
  conversation: Conversation;
  myId: string;
  onBack?: () => void;
}

export default function ChatWindow({ conversation, myId, onBack }: ChatWindowProps) {
  const other       = getOtherParticipant(conversation, myId);
  const [messages,  setMessages]  = useState<ChatMessage[]>(conversation.messages);
  const [input,     setInput]     = useState("");
  const [sending,   setSending]   = useState(false);
  const bottomRef   = useRef<HTMLDivElement>(null);
  const inputRef    = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Reset when conversation changes
  useEffect(() => {
    setMessages(conversation.messages);
    setInput("");
  }, [conversation.id, conversation.messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    setSending(true);
    setInput("");

    // Optimistic update — Firestore: addDoc(collection(db,"conversations",id,"messages"), msg)
    const newMsg: ChatMessage = {
      id:             `local-${Date.now()}`,
      conversationId: conversation.id,
      senderId:       myId,
      text,
      sentAt:         new Date().toISOString(),
      read:           false,
    };

    setMessages((prev) => [...prev, newMsg]);
    await new Promise<void>((r) => setTimeout(r, 400)); // simulate send
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Group messages: detect when to show avatar (first in sequence from same sender)
  const isFirstInGroup = (i: number) => {
    if (i === 0) return true;
    return messages[i - 1].senderId !== messages[i].senderId;
  };
  const isLastInGroup = (i: number) => {
    if (i === messages.length - 1) return true;
    return messages[i + 1].senderId !== messages[i].senderId;
  };

  return (
    <div className="flex flex-col h-full bg-[#f4efe6] overflow-hidden">

      {/* ── Top header ───────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#e8dfd4] px-4 py-3.5 flex items-center gap-3 shrink-0">

        {/* Back button (mobile) */}
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden p-2 rounded-xl hover:bg-[#f4f6f8] transition-colors text-[#64707d] shrink-0"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}

        {/* Avatar */}
        <div className="relative shrink-0">
          <img
            src={other.avatar}
            alt={other.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-[#e8dfd4]"
          />
          <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
            other.role === "host" ? "bg-[#8b5e38]" : "bg-[#0046cc]"
          }`} />
        </div>

        {/* Name + role + listing */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-display font-semibold text-[#1a0e02] text-sm">{other.name}</p>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
              other.role === "host"
                ? "bg-[#fdf5ee] text-[#8b5e38] border border-[#e8c89a]"
                : "bg-[#eef3ff] text-[#0036a3] border border-[#b3c8f5]"
            }`}>
              {other.role}
            </span>
          </div>
          {conversation.context && (
            <p className="text-[11px] text-[#64707d] truncate">
              {conversation.context.listingTitle}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <a
            href={conversation.context ? `/listing/${conversation.context.listingId}` : "#"}
            className="p-2 rounded-xl hover:bg-[#f4f6f8] transition-colors text-[#64707d]"
            title="View listing"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <button className="p-2 rounded-xl hover:bg-[#f4f6f8] transition-colors text-[#64707d]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="5" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="19" r="1" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Booking context banner ────────────────────────────────────────────── */}
      {conversation.context && (
        <BookingContextBanner context={conversation.context} />
      )}

      {/* ── Message timeline ──────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-1.5">

        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#f0e8de] flex items-center justify-center text-[#8b5e38]">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="font-display font-semibold text-[#1a0e02] text-sm">Start the conversation</p>
            <p className="text-xs text-[#64707d] max-w-xs">
              Say hello to {other.firstName} and ask about your upcoming experience.
            </p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMine      = msg.senderId === myId;
            const showSep     = i === 0 || !isSameDay(messages[i - 1].sentAt, msg.sentAt);
            const showAvatar  = !isMine && isFirstInGroup(i);
            const isLast      = isLastInGroup(i);

            return (
              <div key={msg.id}>
                {showSep && <DateSeparator iso={msg.sentAt} />}
                <ChatBubble
                  message={msg}
                  isMine={isMine}
                  showAvatar={showAvatar}
                  avatar={other.avatar}
                  isLast={isLast}
                />
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Input area ────────────────────────────────────────────────────────── */}
      <div className="bg-white border-t border-[#e8dfd4] px-4 py-3 shrink-0">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${other.firstName}…`}
              rows={1}
              className="w-full px-4 py-3 border border-[#e8dfd4] rounded-2xl text-sm text-[#1a0e02] placeholder:text-[#a09080] focus:outline-none focus:border-[#8b5e38] transition-colors resize-none bg-[#faf7f4] max-h-32 leading-relaxed"
              style={{ scrollbarWidth: "none" }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="w-10 h-10 shrink-0 bg-[#8b5e38] text-white rounded-2xl flex items-center justify-center hover:bg-[#7a5030] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {sending ? (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="15" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M22 2L15 22 11 13 2 9l20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-[10px] text-[#a09080] mt-1.5 px-1">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
