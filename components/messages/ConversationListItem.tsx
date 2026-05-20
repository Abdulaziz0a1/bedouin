"use client";

import type { Conversation } from "@/lib/types/messages";
import { getOtherParticipant } from "@/lib/data/messages";
import { useLanguage } from "@/context/LanguageProvider";

interface ConversationListItemProps {
  conversation: Conversation;
  myId: string;
  isActive: boolean;
  onClick: () => void;
}

function timeLabel(iso: string, lang: string): string {
  const locale = lang === "ar" ? "ar-SA" : "en-GB";
  const now  = new Date();
  const date = new Date(iso);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60)        return lang === "ar" ? "الآن" : "now";
  if (diff < 3600)      return lang === "ar" ? `${Math.floor(diff / 60)}د` : `${Math.floor(diff / 60)}m`;
  if (diff < 86400)     return date.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  if (diff < 86400 * 7) return date.toLocaleDateString(locale, { weekday: "short" });
  return date.toLocaleDateString(locale, { day: "numeric", month: "short" });
}

const BOOKING_STATUS_KEYS: Record<string, string> = {
  upcoming:  "status.upcoming",
  confirmed: "status.confirmed",
  completed: "status.completed",
  inquiry:   "status.inquiry",
};

export default function ConversationListItem({
  conversation, myId, isActive, onClick,
}: ConversationListItemProps) {
  const { t, lang } = useLanguage();
  const other     = getOtherParticipant(conversation, myId);
  const isUnread  = conversation.unreadCount > 0;
  const lastIsMine = conversation.lastMessageSenderId === myId;

  return (
    <button
      onClick={onClick}
      className={[
        "w-full flex items-start gap-3 px-4 py-3.5 text-left transition-all border-b border-[#f0e8de] last:border-0 relative",
        isActive
          ? "bg-[#fdf5ee] border-l-[3px] border-l-[#8b5e38]"
          : "hover:bg-[#faf7f4] border-l-[3px] border-l-transparent",
      ].join(" ")}
    >
      {/* Avatar with role indicator */}
      <div className="relative shrink-0">
        <img
          src={other.avatar}
          alt={other.name}
          className="w-11 h-11 rounded-full object-cover border-2 border-[#e8dfd4]"
        />
        <span className={[
          "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white",
          other.role === "host" ? "bg-[#8b5e38]" : "bg-[#0046cc]",
        ].join(" ")} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <p className={`text-sm truncate ${isUnread ? "font-bold text-[#1a0e02]" : "font-semibold text-[#1a0e02]"}`}>
            {other.firstName}
          </p>
          <p className={`text-[10px] shrink-0 ${isUnread ? "font-bold text-[#8b5e38]" : "text-[#a09080]"}`}>
            {timeLabel(conversation.lastMessageAt, lang)}
          </p>
        </div>

        {/* Listing context */}
        {conversation.context && (
          <p className="text-[10px] text-[#8b5e38] font-semibold truncate mb-0.5 flex items-center gap-1">
            {conversation.context.bookingStatus && (
              <span className="bg-[#fdf5ee] border border-[#e8c89a] px-1.5 py-0.5 rounded-md text-[9px]">
                {t(BOOKING_STATUS_KEYS[conversation.context.bookingStatus] ?? "")}
              </span>
            )}
            {conversation.context.listingTitle}
          </p>
        )}

        {/* Last message */}
        <p className={`text-xs truncate ${isUnread ? "text-[#1a0e02] font-medium" : "text-[#64707d]"}`}>
          {lastIsMine && <span className="text-[#a09080]">{t("messages.you")}: </span>}
          {conversation.lastMessage}
        </p>
      </div>

      {/* Unread badge */}
      {conversation.unreadCount > 0 && (
        <span className="shrink-0 min-w-[18px] h-[18px] px-1 bg-[#8b5e38] text-white text-[10px] font-bold rounded-full flex items-center justify-center mt-1">
          {conversation.unreadCount}
        </span>
      )}
    </button>
  );
}
