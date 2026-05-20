"use client";

import { useState, useMemo } from "react";
import type { DashboardBooking } from "@/lib/data/dashboard";
import UserAvatar from "@/components/ui/UserAvatar";
import DashboardEmptyState from "../shared/DashboardEmptyState";
import { sendMessage } from "@/lib/actions/messages";
import { useLanguage } from "@/context/LanguageProvider";
import { getListingText } from "@/lib/utils/listing-locale";

type Tab        = "upcoming" | "past";
type DateFilter = "all" | "30" | "60" | "90";

// Maps payment method → translation key
const PAYMENT_KEY: Record<string, string> = {
  card:      "dash.payment.card",
  mada:      "dash.payment.mada",
  apple_pay: "dash.payment.apple_pay",
};

// Template label → translation key (text stays in English — it's message content for guests)
const PAST_TEMPLATES: { tKey: string; text: string }[] = [
  {
    tKey: "dash.tpl.thank_you",
    text: "Thank you for staying with us! It was a pleasure hosting you and we hope you had a wonderful experience. We'd love to welcome you back anytime.",
  },
  {
    tKey: "dash.tpl.special_offer",
    text: "As one of our valued past guests, we'd like to offer you a special returning-guest discount on your next stay. Reply to this message and we'll share the details!",
  },
  {
    tKey: "dash.tpl.new_experience",
    text: "We're excited to share that we've added a new experience to our listing. As a past guest, we wanted you to hear about it first!",
  },
];

const UPCOMING_TEMPLATES: { tKey: string; text: string }[] = [
  {
    tKey: "dash.tpl.checkin_info",
    text: "We're looking forward to welcoming you! Here are your check-in details: [add your address and entry instructions here]. Please reach out if you have any questions before your arrival.",
  },
  {
    tKey: "dash.tpl.welcome",
    text: "We're so excited to have you staying with us soon! If there's anything we can do to make your stay more comfortable, don't hesitate to get in touch.",
  },
  {
    tKey: "dash.tpl.reminder",
    text: "Your stay is coming up soon — just a friendly reminder to review the house rules before your arrival. We look forward to hosting you!",
  },
];

// ── StatusChip ───────────────────────────────────────────────────────────────

function StatusChip({
  status,
  cancellationType,
}: {
  status:             DashboardBooking["status"];
  cancellationType?:  string;
}) {
  const { t } = useLanguage();

  const label =
    status === "cancelled" && cancellationType === "by_tourist"
      ? t("dash.chip.cancelled_guest")
      : status === "cancelled"   ? t("dash.chip.cancelled")
      : status === "upcoming"    ? t("dash.chip.upcoming")
      : status === "active"      ? t("dash.chip.active")
      : t("dash.chip.completed");

  const cls =
    status === "cancelled"  ? "bg-red-50 text-red-600 border-red-200"
    : status === "upcoming" ? "bg-[#fdf8ee] text-[#8b6a1f] border-[#ead9a6]"
    : status === "active"   ? "bg-[#f0faf5] text-[#049153] border-[#c3e8d6]"
    :                         "bg-[#f4f6f8] text-[#64707d] border-[#dddfe3]";

  return (
    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${cls}`}>
      {label}
    </span>
  );
}

// ── BroadcastModal ────────────────────────────────────────────────────────────

function BroadcastModal({
  bookings,
  title,
  templates,
  showDateFilter,
  onClose,
}: {
  bookings:        DashboardBooking[];
  title:           string;
  templates:       { tKey: string; text: string }[];
  showDateFilter?: boolean;
  onClose:         () => void;
}) {
  const { t } = useLanguage();
  const [filter,           setFilter]          = useState<DateFilter>("all");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [customTitle,      setCustomTitle]      = useState("");
  const [message,          setMessage]          = useState("");
  const [sending,          setSending]          = useState(false);
  const [done,             setDone]             = useState<{ sent: number; failed: number; failedNames: string[] } | null>(null);

  const wordCount      = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
  const titleOverLimit = wordCount(customTitle) > 6;
  const fullContent    = selectedTemplate === "Custom" && customTitle.trim()
    ? `${customTitle.trim()}\n\n${message.trim()}`
    : message.trim();

  const now = Date.now();
  const cutoffs: Record<Exclude<DateFilter, "all">, Date> = {
    "30": new Date(now - 30 * 86400000),
    "60": new Date(now - 60 * 86400000),
    "90": new Date(now - 90 * 86400000),
  };

  const eligible = bookings.filter((b) => {
    if (!b.guestId) return false;
    if (!showDateFilter || filter === "all") return true;
    return new Date(b.checkOut) >= cutoffs[filter as Exclude<DateFilter, "all">];
  });

  const uniqueGuests = Object.values(
    eligible.reduce<Record<string, DashboardBooking>>((acc, b) => {
      if (!acc[b.guestId!] || b.checkOut > acc[b.guestId!].checkOut) {
        acc[b.guestId!] = b;
      }
      return acc;
    }, {})
  );

  const handleSend = async () => {
    if (!fullContent || uniqueGuests.length === 0 || titleOverLimit) return;
    setSending(true);
    let sent = 0, failed = 0;
    const failedNames: string[] = [];
    for (const b of uniqueGuests) {
      const res = await sendMessage(b.guestId!, fullContent, undefined, b.id);
      if (res.success) {
        sent++;
      } else {
        failed++;
        failedNames.push(b.guestName.split(" ")[0]);
        console.error(`Broadcast failed for ${b.guestName}:`, res.error);
      }
    }
    setSending(false);
    setDone({ sent, failed, failedNames });
  };

  const dateFilterOptions: { id: DateFilter; tKey: string }[] = [
    { id: "all", tKey: "dash.broadcast.all_past" },
    { id: "30",  tKey: "dash.broadcast.last_30"  },
    { id: "60",  tKey: "dash.broadcast.last_60"  },
    { id: "90",  tKey: "dash.broadcast.last_90"  },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4 pb-4 sm:pb-0">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0e8de] shrink-0">
          <h3 className="font-display font-bold text-[#1a0e02] text-base">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#f0e8de] transition-colors text-[#64707d]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
          {done ? (
            <div className="flex flex-col items-center text-center gap-3 py-6">
              {done.sent > 0 ? (
                <div className="w-12 h-12 rounded-2xl bg-[#f0faf5] flex items-center justify-center text-[#049153]">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                </div>
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-500">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                  </svg>
                </div>
              )}
              <p className="font-semibold text-[#1a0e02] text-sm">
                {done.sent > 0
                  ? (done.sent === 1
                      ? t("dash.broadcast.sent_singular").replace("{count}", String(done.sent))
                      : t("dash.broadcast.sent_plural").replace("{count}", String(done.sent)))
                  : t("dash.broadcast.none_sent")}
              </p>
              {done.failed > 0 && done.sent > 0 && (
                <p className="text-xs text-red-600">
                  {t("dash.broadcast.failed_n").replace("{count}", String(done.failed))}
                </p>
              )}
              {done.sent === 0 && done.failed > 0 && (
                <p className="text-xs text-red-600">
                  {done.failed === 1
                    ? t("dash.broadcast.error_one")
                    : t("dash.broadcast.error_many")}
                </p>
              )}
              {done.failedNames.length > 0 && (
                <p className="text-[11px] text-red-400">
                  {t("dash.broadcast.failed_list").replace("{names}", done.failedNames.join(", "))}
                </p>
              )}
              <button
                onClick={onClose}
                className="mt-2 px-5 py-2 bg-[#461e00] text-white text-sm font-semibold rounded-xl hover:bg-[#5a2900] transition-colors"
              >
                {t("dash.broadcast.done")}
              </button>
            </div>
          ) : (
            <>
              {/* Recipient filter */}
              {showDateFilter && (
                <div className="flex flex-col gap-2">
                  <p className="text-[10px] font-bold text-[#64707d] uppercase tracking-widest">{t("dash.broadcast.recipients")}</p>
                  <div className="flex gap-2 flex-wrap">
                    {dateFilterOptions.map(({ id, tKey }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setFilter(id)}
                        className={[
                          "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors",
                          filter === id
                            ? "bg-[#461e00] text-white border-[#461e00]"
                            : "bg-white text-[#64707d] border-[#e8dfd4] hover:border-[#8b5e38]",
                        ].join(" ")}
                      >
                        {t(tKey)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-[#64707d]">
                {uniqueGuests.length === 1
                  ? t("dash.broadcast.recipients_singular").replace("{count}", String(uniqueGuests.length))
                  : t("dash.broadcast.recipients_plural").replace("{count}", String(uniqueGuests.length))}
              </p>

              {/* Templates */}
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-bold text-[#64707d] uppercase tracking-widest">{t("dash.broadcast.templates")}</p>
                <div className="flex gap-2 flex-wrap">
                  {templates.map((tpl) => (
                    <button
                      key={tpl.tKey}
                      type="button"
                      onClick={() => { setSelectedTemplate(tpl.tKey); setMessage(tpl.text); setCustomTitle(""); }}
                      className={[
                        "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors",
                        selectedTemplate === tpl.tKey
                          ? "bg-[#8b5e38] text-white border-[#8b5e38]"
                          : "bg-white text-[#64707d] border-[#e8dfd4] hover:border-[#8b5e38] hover:text-[#1a0e02]",
                      ].join(" ")}
                    >
                      {t(tpl.tKey)}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => { setSelectedTemplate("Custom"); setMessage(""); setCustomTitle(""); }}
                    className={[
                      "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors",
                      selectedTemplate === "Custom"
                        ? "bg-[#8b5e38] text-white border-[#8b5e38]"
                        : "bg-white text-[#64707d] border-[#e8dfd4] hover:border-[#8b5e38] hover:text-[#1a0e02]",
                    ].join(" ")}
                  >
                    {t("dash.broadcast.custom")}
                  </button>
                </div>

                {selectedTemplate === "Custom" && (
                  <div className="flex flex-col gap-1 mt-1">
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => { if (e.target.value.length <= 40) setCustomTitle(e.target.value); }}
                      placeholder={t("dash.broadcast.msg_title_ph")}
                      className={[
                        "w-full border rounded-xl px-3 py-2 text-sm text-[#1a0e02] placeholder:text-[#a09080] focus:outline-none transition-colors",
                        titleOverLimit
                          ? "border-red-400 focus:border-red-500"
                          : "border-[#e8dfd4] focus:border-[#8b5e38]",
                      ].join(" ")}
                    />
                    <div className="flex items-center justify-between px-0.5">
                      <p className="text-[10px] text-[#a09080]">{t("dash.broadcast.title_hint")}</p>
                      <p className={`text-[10px] font-semibold ${titleOverLimit ? "text-red-500" : "text-[#a09080]"}`}>
                        {customTitle.length}/40 · {wordCount(customTitle)}/6 words
                      </p>
                    </div>
                    {titleOverLimit && (
                      <p className="text-[10px] text-red-500 px-0.5">{t("dash.broadcast.title_over")}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Message textarea */}
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-bold text-[#64707d] uppercase tracking-widest">{t("dash.broadcast.message")}</p>
                <textarea
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t("dash.broadcast.msg_ph")}
                  className="w-full border border-[#e8dfd4] rounded-xl px-3 py-2.5 text-sm text-[#1a0e02] placeholder:text-[#a09080] focus:outline-none focus:border-[#8b5e38] resize-none transition-colors"
                />
              </div>

              <button
                type="button"
                onClick={handleSend}
                disabled={sending || !fullContent || uniqueGuests.length === 0 || titleOverLimit}
                className="w-full py-3 bg-[#461e00] text-white font-bold text-sm rounded-2xl hover:bg-[#5a2900] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="15" />
                    </svg>
                    {t("dash.broadcast.sending")}
                  </>
                ) : (
                  uniqueGuests.length === 1
                    ? t("dash.broadcast.send_singular").replace("{count}", String(uniqueGuests.length))
                    : t("dash.broadcast.send_plural").replace("{count}", String(uniqueGuests.length))
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── MsgIcon ───────────────────────────────────────────────────────────────────

function MsgIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

// ── BookingRow ────────────────────────────────────────────────────────────────

function BookingRow({ booking }: { booking: DashboardBooking }) {
  const { t, lang } = useLanguage();
  const displayTitle = getListingText(booking.listingTitle, booking.listingTitle_ar, lang);
  const [expanded, setExpanded] = useState(false);
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  const adultsLabel = booking.adults === 1
    ? t("dash.booking.adult")
    : t("dash.booking.adults").replace("{count}", String(booking.adults));
  const childrenLabel = booking.children > 0
    ? (booking.children === 1
        ? `, ${t("dash.booking.child")}`
        : `, ${t("dash.booking.children").replace("{count}", String(booking.children))}`)
    : "";

  return (
    <div
      className="bg-white rounded-[18px] overflow-hidden transition-all duration-200"
      style={{ border: "1px solid var(--border)", boxShadow: "0 2px 10px rgba(70,30,0,0.06)" }}
    >
      {/* Collapsed row */}
      <button
        className="w-full flex items-center gap-4 px-5 py-4 text-left transition-colors"
        style={{ background: "transparent" }}
        onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.background = "rgba(250,247,244,0.9)"}
        onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.background = "transparent"}
        onClick={() => setExpanded(!expanded)}
      >
        <UserAvatar src={booking.guestAvatar} name={booking.guestName} size={40} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-[#1a0e02]">{booking.guestName}</p>
            <p className="text-xs text-[#a09080]">{booking.guestNationality}</p>
          </div>
          <p className="text-xs text-[#64707d] truncate mt-0.5">{displayTitle}</p>
          <p className="text-xs text-[#a09080] mt-0.5">
            {fmtDate(booking.checkIn)} → {fmtDate(booking.checkOut)} · {booking.nights} {t("dash.bookings.nights")}
          </p>
        </div>
        <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
          <StatusChip status={booking.status} cancellationType={booking.cancellationType} />
          <p className="font-display font-bold text-[#1a0e02] text-sm">SAR {booking.hostPayout.toLocaleString("en-US")}</p>
          <p className="text-[10px] text-[#a09080]">{t("dash.bookings.payout_label")}</p>
        </div>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          className={`text-[#64707d] transition-transform shrink-0 ${expanded ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="px-5 pb-5 pt-4 flex flex-col gap-4" style={{ borderTop: "1px solid var(--border-light)" }}>
          <div className="flex items-start gap-4">
            <img
              src={booking.listingImage}
              alt={displayTitle}
              className="w-24 h-16 rounded-xl object-cover shrink-0"
            />
            <div className="flex-1">
              <p className="text-xs font-bold text-[#64707d] uppercase tracking-widest mb-2">{t("dash.booking.details")}</p>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1.5">
                <div>
                  <p className="text-[10px] text-[#a09080] uppercase tracking-wide font-bold">{t("dash.booking.reference")}</p>
                  <p className="text-xs font-mono font-semibold text-[#1a0e02]">{booking.reference}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#a09080] uppercase tracking-wide font-bold">{t("dash.booking.guests")}</p>
                  <p className="text-xs font-semibold text-[#1a0e02]">
                    {adultsLabel}{childrenLabel}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-[#a09080] uppercase tracking-wide font-bold">{t("dash.booking.total_charged")}</p>
                  <p className="text-xs font-semibold text-[#1a0e02]">SAR {booking.totalPrice.toLocaleString("en-US")}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#a09080] uppercase tracking-wide font-bold">{t("dash.booking.your_payout")}</p>
                  <p className="text-xs font-semibold text-[#049153]">SAR {booking.hostPayout.toLocaleString("en-US")}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#a09080] uppercase tracking-wide font-bold">{t("dash.booking.payment")}</p>
                  <p className="text-xs font-semibold text-[#1a0e02]">
                    {t(PAYMENT_KEY[booking.paymentMethod] ?? "dash.payment.card")}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-[#a09080] uppercase tracking-wide font-bold">{t("dash.booking.booked_on")}</p>
                  <p className="text-xs font-semibold text-[#1a0e02]">{fmtDate(booking.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {booking.guestId && (
            <a
              href={`/messages?with=${booking.guestId}&booking=${booking.id}&listing=${booking.listingId}`}
              className="inline-flex items-center gap-2 self-start px-4 py-2 rounded-xl border border-[#e8dfd4] bg-white text-sm font-semibold text-[#1a0e02] hover:bg-[#faf7f4] hover:border-[#8b5e38] transition-colors"
            >
              <MsgIcon size={14} />
              {t("dash.booking.message_guest").replace("{name}", booking.guestName.split(" ")[0])}
            </a>
          )}

          {booking.status === "cancelled" && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-red-500 shrink-0">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">
                  {booking.cancellationType === "by_tourist"
                    ? t("dash.cancelled.by_guest")
                    : t("dash.cancelled.booking")}
                </p>
              </div>
              {booking.cancelledAt && (
                <p className="text-xs text-red-700 mb-1">
                  {t("dash.cancelled.on").replace("{date}", fmtDate(booking.cancelledAt.slice(0, 10)))}
                </p>
              )}
              {booking.cancellationReason ? (
                <>
                  <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mb-0.5 mt-2">
                    {t("dash.cancelled.guest_reason")}
                  </p>
                  <p className="text-xs text-red-700 leading-relaxed">{booking.cancellationReason}</p>
                </>
              ) : (
                <p className="text-xs text-red-500 italic">{t("dash.cancelled.no_reason")}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── BookingsSection ───────────────────────────────────────────────────────────

export default function BookingsSection({ bookings }: { bookings: DashboardBooking[] }) {
  const { t, lang } = useLanguage();
  const [tab,              setTab]             = useState<Tab>("upcoming");
  const [showPastBulk,    setShowPastBulk]    = useState(false);
  const [listingMsg,      setListingMsg]      = useState<{ listingId: string; listingTitle: string } | null>(null);
  const [showAllBroadcast, setShowAllBroadcast] = useState(false);

  const upcoming = bookings.filter((b) => b.status === "upcoming" || b.status === "active");
  const past      = bookings.filter((b) => b.status === "completed" || b.status === "cancelled");

  const totalRevenue          = past.filter(b => b.status === "completed").reduce((s, b) => s + b.hostPayout, 0);
  const messagablePastGuests  = past.filter((b) => b.guestId).length;
  const messagableAllGuests   = bookings.filter((b) => b.guestId).length;

  const upcomingGroups = useMemo(() => {
    const map = new Map<string, { listingTitle: string; listingTitle_ar?: string; bookings: DashboardBooking[] }>();
    for (const b of upcoming) {
      if (!map.has(b.listingId)) map.set(b.listingId, { listingTitle: b.listingTitle, listingTitle_ar: b.listingTitle_ar, bookings: [] });
      map.get(b.listingId)!.bookings.push(b);
    }
    return Array.from(map.entries()).map(([listingId, { listingTitle, listingTitle_ar, bookings: bkgs }]) => ({
      listingId,
      listingTitle,
      listingTitle_ar,
      bookings:   bkgs,
      guestCount: new Set(bkgs.map(b => b.guestId).filter(Boolean)).size,
    }));
  }, [upcoming]);

  const listingMsgBookings = listingMsg
    ? upcoming.filter((b) => b.listingId === listingMsg.listingId)
    : [];

  return (
    <div className="flex flex-col gap-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display font-semibold text-[#1a0e02] text-lg">{t("dash.bookings.title")}</h2>
          <p className="text-xs text-[#64707d] mt-0.5">
            {upcoming.length} {t("dash.bookings.tab_upcoming").toLowerCase()} · SAR {totalRevenue.toLocaleString("en-US")} {t("dash.bookings.earned_to_date")}
          </p>
        </div>

        {messagableAllGuests > 0 && (
          <button
            type="button"
            onClick={() => setShowAllBroadcast(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#e8dfd4] bg-white text-xs font-semibold text-[#64707d] hover:border-[#8b5e38] hover:text-[#1a0e02] transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.4 10.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012.3 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {t("dash.bookings.broadcast_all")}
          </button>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 bg-[#f0e8de] rounded-xl p-1">
          {(["upcoming", "past"] as Tab[]).map((tabId) => (
            <button
              key={tabId}
              onClick={() => setTab(tabId)}
              className={[
                "px-5 py-2 rounded-lg text-sm font-semibold transition-all",
                tab === tabId ? "bg-white text-[#1a0e02] shadow-sm" : "text-[#64707d] hover:text-[#1a0e02]",
              ].join(" ")}
            >
              {tabId === "upcoming" ? t("dash.bookings.tab_upcoming") : t("dash.bookings.tab_past")}
              <span className={`ml-1.5 text-xs ${tab === tabId ? "text-[#8b5e38]" : "text-[#a09080]"}`}>
                {tabId === "upcoming" ? upcoming.length : past.length}
              </span>
            </button>
          ))}
        </div>

        {tab === "past" && messagablePastGuests > 0 && (
          <button
            type="button"
            onClick={() => setShowPastBulk(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#e8dfd4] bg-white text-xs font-semibold text-[#64707d] hover:border-[#8b5e38] hover:text-[#1a0e02] transition-colors"
          >
            <MsgIcon />
            {t("dash.bookings.msg_past")}
          </button>
        )}
      </div>

      {/* ── Upcoming tab: grouped by listing ── */}
      {tab === "upcoming" && (
        upcomingGroups.length === 0 ? (
          <DashboardEmptyState
            icon={
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" />
                <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            }
            title={t("dash.bookings.no_upcoming")}
            description={t("dash.bookings.no_upcoming_desc")}
          />
        ) : (
          <div className="flex flex-col gap-8">
            {upcomingGroups.map((group) => (
              <div key={group.listingId}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs font-bold text-[#1a0e02] uppercase tracking-widest">
                      {getListingText(group.listingTitle, group.listingTitle_ar, lang)}
                    </p>
                    <p className="text-[10px] text-[#a09080] mt-0.5">
                      {group.bookings.length === 1
                        ? t("dash.bookings.group_count").replace("{count}", String(group.bookings.length))
                        : t("dash.bookings.group_count_plural").replace("{count}", String(group.bookings.length))}
                    </p>
                  </div>
                  {group.guestCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setListingMsg({ listingId: group.listingId, listingTitle: getListingText(group.listingTitle, group.listingTitle_ar, lang) })}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#e8dfd4] bg-white text-xs font-semibold text-[#64707d] hover:border-[#8b5e38] hover:text-[#1a0e02] transition-colors"
                    >
                      <MsgIcon />
                      {t("dash.bookings.msg_all_guests")}
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  {group.bookings.map((b) => (
                    <BookingRow key={b.id} booking={b} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ── Past tab: flat list ── */}
      {tab === "past" && (
        past.length === 0 ? (
          <DashboardEmptyState
            icon={
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" />
                <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            }
            title={t("dash.bookings.no_past")}
            description={t("dash.bookings.no_past_desc")}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {past.map((b) => (
              <BookingRow key={b.id} booking={b} />
            ))}
          </div>
        )
      )}

      {/* ── Summary strip (past only) ── */}
      {tab === "past" && past.length > 0 && (
        <div
          className="rounded-[18px] p-5"
          style={{
            background: "rgba(255,255,255,0.98)",
            border: "1px solid var(--border)",
            borderTop: "2px solid rgba(196,154,79,0.40)",
            boxShadow: "0 2px 10px rgba(70,30,0,0.06)",
          }}
        >
          <p className="text-eyebrow mb-3">{t("dash.bookings.summary_label")}</p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="font-display font-extrabold text-[#1a0e02] text-2xl leading-none mb-0.5">
                {past.filter((b) => b.status === "completed").length}
              </p>
              <p className="text-xs text-[#64707d]">{t("dash.bookings.completed")}</p>
            </div>
            <div>
              <p className="font-display font-extrabold text-[#1a0e02] text-2xl leading-none mb-0.5">
                {past.filter((b) => b.status === "cancelled").length}
              </p>
              <p className="text-xs text-[#64707d]">{t("dash.bookings.cancelled")}</p>
            </div>
            <div>
              <p className="font-display font-extrabold text-[#8b5e38] text-2xl leading-none mb-0.5">
                SAR {totalRevenue.toLocaleString("en-US")}
              </p>
              <p className="text-xs text-[#64707d]">{t("dash.bookings.total_payout")}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Modals ── */}

      {showAllBroadcast && (
        <BroadcastModal
          bookings={bookings}
          title={t("dash.bookings.broadcast_all")}
          templates={UPCOMING_TEMPLATES}
          onClose={() => setShowAllBroadcast(false)}
        />
      )}

      {listingMsg && (
        <BroadcastModal
          bookings={listingMsgBookings}
          title={`${t("dash.bookings.msg_all_guests")} — ${listingMsg.listingTitle}`}
          templates={UPCOMING_TEMPLATES}
          onClose={() => setListingMsg(null)}
        />
      )}

      {showPastBulk && (
        <BroadcastModal
          bookings={past}
          title={t("dash.bookings.msg_past")}
          templates={PAST_TEMPLATES}
          showDateFilter
          onClose={() => setShowPastBulk(false)}
        />
      )}
    </div>
  );
}
