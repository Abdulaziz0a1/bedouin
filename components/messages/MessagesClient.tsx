"use client";

import { useState, useMemo } from "react";
import { CONVERSATIONS, CURRENT_USER, getTotalUnread } from "@/lib/data/messages";
import type { Conversation } from "@/lib/types/messages";
import ConversationListItem from "./ConversationListItem";
import ChatWindow from "./ChatWindow";

// ──────────────────────────────────────────────────────────────────────────────
// Empty / selection prompt
// ──────────────────────────────────────────────────────────────────────────────

function SelectionPrompt() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-10 bg-[#f4efe6]">
      <div className="w-16 h-16 rounded-2xl bg-[#f0e8de] flex items-center justify-center text-[#8b5e38] mb-4">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
            stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        </svg>
      </div>
      <h3 className="font-display font-semibold text-[#1a0e02] mb-2">Your messages</h3>
      <p className="text-sm text-[#64707d] leading-relaxed max-w-xs">
        Select a conversation to read and reply to messages from your hosts and guests.
      </p>
    </div>
  );
}

function NoResults({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center text-center py-14 px-6">
      <div className="w-12 h-12 rounded-2xl bg-[#f0e8de] flex items-center justify-center text-[#8b5e38] mb-3">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.8" />
          <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>
      <p className="font-display font-semibold text-[#1a0e02] text-sm mb-1">No results for &ldquo;{query}&rdquo;</p>
      <p className="text-xs text-[#64707d]">Try searching by listing name or host name.</p>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main client component
// ──────────────────────────────────────────────────────────────────────────────

export default function MessagesClient() {
  const [conversations, setConversations] = useState<Conversation[]>(CONVERSATIONS);
  const [selectedId,    setSelectedId]    = useState<string | null>(null);
  const [search,        setSearch]        = useState("");
  const [showChat,      setShowChat]      = useState(false); // mobile toggle

  const totalUnread = getTotalUnread(conversations);

  // ── Derived list ────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter((c) => {
      const other = c.participants.find((p) => p.id !== CURRENT_USER.id);
      return (
        other?.name.toLowerCase().includes(q) ||
        c.context?.listingTitle.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q)
      );
    });
  }, [conversations, search]);

  const selectedConversation = conversations.find((c) => c.id === selectedId) ?? null;

  // ── Open conversation: mark unread → 0 ──────────────────────────────────────
  const openConversation = (id: string) => {
    setSelectedId(id);
    setShowChat(true);
    // Firestore: updateDoc(doc(db,"conversations",id), { [`unreadCounts.${CURRENT_USER.id}`]: 0 })
    setConversations((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, unreadCount: 0 }
          : c
      )
    );
  };

  return (
    <div className="flex flex-col" style={{ height: "100dvh" }}>

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-[#e8dfd4] sticky top-0 z-40 shrink-0">
        <div className="max-w-[1440px] mx-auto px-5 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <a href="/" className="font-display font-extrabold text-[#1a0e02] text-xl tracking-tight">
              Bedouin
            </a>
            <span className="text-[#e8dfd4]">·</span>
            <span className="text-sm font-semibold text-[#64707d]">Messages</span>
            {totalUnread > 0 && (
              <span className="text-[10px] font-bold text-white bg-[#8b5e38] px-2 py-0.5 rounded-full">
                {totalUnread}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/account"
              className="p-2 rounded-xl hover:bg-[#f4f6f8] transition-colors text-[#64707d]"
              title="My account"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </a>
            <a
              href="/"
              className="p-2 rounded-xl hover:bg-[#f4f6f8] transition-colors text-[#64707d]"
              title="Home"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      {/* ── Split pane ──────────────────────────────────────────────────────── */}
      <div className="flex flex-1 max-w-[1440px] w-full mx-auto overflow-hidden">

        {/* ── Left: conversation list ──────────────────────────────────────── */}
        <div className={`w-full md:w-[360px] md:shrink-0 flex flex-col bg-white border-r border-[#e8dfd4] overflow-hidden ${showChat ? "hidden md:flex" : "flex"}`}>

          {/* Search */}
          <div className="px-4 pt-4 pb-3 border-b border-[#f0e8de] shrink-0">
            <div className="relative">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a09080]">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.8" />
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations…"
                className="w-full pl-9 pr-3 py-2.5 border border-[#e8dfd4] rounded-xl text-sm text-[#1a0e02] placeholder:text-[#a09080] focus:outline-none focus:border-[#8b5e38] bg-white transition-colors"
              />
            </div>
            <p className="text-[10px] text-[#a09080] font-medium mt-2">
              {filtered.length} conversation{filtered.length !== 1 ? "s" : ""}
              {totalUnread > 0 && (
                <span className="ml-1.5 text-[#8b5e38] font-bold">· {totalUnread} unread</span>
              )}
            </p>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#f0e8de]">
            {filtered.length === 0 ? (
              <NoResults query={search} />
            ) : (
              filtered.map((conv) => (
                <ConversationListItem
                  key={conv.id}
                  conversation={conv}
                  myId={CURRENT_USER.id}
                  isActive={selectedId === conv.id}
                  onClick={() => openConversation(conv.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* ── Right: chat window ──────────────────────────────────────────── */}
        <div className={`flex-1 flex flex-col overflow-hidden ${showChat ? "flex" : "hidden md:flex"}`}>
          {selectedConversation ? (
            <ChatWindow
              key={selectedConversation.id}
              conversation={selectedConversation}
              myId={CURRENT_USER.id}
              onBack={() => setShowChat(false)}
            />
          ) : (
            <SelectionPrompt />
          )}
        </div>

      </div>
    </div>
  );
}
