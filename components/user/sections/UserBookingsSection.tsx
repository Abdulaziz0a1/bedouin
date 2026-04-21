"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { UserBooking } from "@/lib/types/user";
import type { CohostAssignmentItem } from "@/lib/services/cohost";

import { cancelBooking } from "@/lib/actions/booking";
import BookingStatusBadge from "../shared/BookingStatusBadge";
import UserEmptyState from "../shared/UserEmptyState";

type Tab = "upcoming" | "past";

const PAYMENT_LABELS: Record<string, string> = {
  card:      "Credit / Debit Card",
  mada:      "Mada",
  apple_pay: "Apple Pay",
};

function BookingCard({
  booking,
  onCancelled,
}: {
  booking:     UserBooking;
  onCancelled: (id: string) => void;
}) {
  const [expanded, setExpanded]     = useState(false);
  const [cancelError, setCancelErr] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCancel = () => {
    setCancelErr(null);
    startTransition(async () => {
      const result = await cancelBooking(booking.id);
      if (result.success) {
        onCancelled(booking.id);
      } else {
        setCancelErr(result.error);
      }
    });
  };

  const checkIn  = new Date(booking.checkIn);
  const checkOut = new Date(booking.checkOut);
  const fmtDate  = (d: Date) =>
    d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  const fmtShort = (d: Date) =>
    d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  const isUpcoming = booking.status === "upcoming" || booking.status === "confirmed";
  const daysUntil  = isUpcoming
    ? Math.ceil((checkIn.getTime() - Date.now()) / 86400000)
    : null;

  return (
    <div className="bg-white border border-[#e8dfd4] rounded-2xl overflow-hidden">

      {/* Status colour strip */}
      <div className={`h-1 w-full ${
        booking.status === "upcoming"  ? "bg-[#c49a4f]" :
        booking.status === "confirmed" ? "bg-[#0046cc]" :
        booking.status === "active"    ? "bg-[#049153]" :
        booking.status === "completed" ? "bg-[#dddfe3]" :
                                         "bg-red-300"
      }`} />

      {/* Main content */}
      <div className="flex flex-col sm:flex-row gap-0">

        {/* Image */}
        <div className="relative sm:w-48 shrink-0">
          <img
            src={booking.listingImage}
            alt={booking.listingTitle}
            className="w-full h-40 sm:h-full object-cover"
          />
          <span className="absolute top-3 left-3 text-[10px] font-bold text-white bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full">
            {booking.listingCategory}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 p-5 flex flex-col gap-3 min-w-0">

          {/* Top row: status + countdown */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <BookingStatusBadge status={booking.status} />
            {daysUntil !== null && (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${
                daysUntil <= 3 ? "bg-[#fdf8ee] text-[#8b6a1f]" : "bg-[#f4f6f8] text-[#64707d]"
              }`}>
                {daysUntil === 0 ? "Check-in today!" : daysUntil === 1 ? "Tomorrow" : `${daysUntil} days away`}
              </span>
            )}
          </div>

          {/* Title + location */}
          <div>
            <Link
              href={`/listing/${booking.listingId}`}
              className="font-display font-semibold text-[#1a0e02] leading-snug hover:text-[#8b5e38] transition-colors"
            >
              {booking.listingTitle}
            </Link>
            <p className="text-xs text-[#64707d] mt-0.5 flex items-center gap-1">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
              </svg>
              {booking.location}
            </p>
          </div>

          {/* Date / guest strip */}
          <div className="flex flex-wrap gap-x-5 gap-y-1.5">
            <div>
              <p className="text-[10px] text-[#a09080] uppercase tracking-wide font-bold">Check-in</p>
              <p className="text-xs font-semibold text-[#1a0e02]">{fmtShort(checkIn)}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#a09080] uppercase tracking-wide font-bold">Check-out</p>
              <p className="text-xs font-semibold text-[#1a0e02]">{fmtShort(checkOut)}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#a09080] uppercase tracking-wide font-bold">Nights</p>
              <p className="text-xs font-semibold text-[#1a0e02]">{booking.nights}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#a09080] uppercase tracking-wide font-bold">Guests</p>
              <p className="text-xs font-semibold text-[#1a0e02]">
                {booking.adults} adult{booking.adults > 1 ? "s" : ""}
                {booking.children > 0 ? `, ${booking.children} child${booking.children > 1 ? "ren" : ""}` : ""}
              </p>
            </div>
          </div>

          {/* Price + actions */}
          <div className="flex items-center justify-between gap-3 mt-auto pt-3 border-t border-[#f0e8de] flex-wrap">
            <div>
              <p className="font-display font-extrabold text-[#1a0e02] text-lg">
                SAR {booking.totalPrice.toLocaleString()}
              </p>
              <p className="text-[10px] font-mono text-[#a09080]">{booking.reference}</p>
            </div>
            <div className="flex items-center gap-2">
              {booking.hostId && (
                <Link
                  href={`/messages?with=${booking.hostId}`}
                  className="px-3 py-1.5 border border-[#e8dfd4] rounded-xl text-xs font-semibold text-[#64707d] hover:border-[#8b5e38] hover:text-[#8b5e38] hover:bg-[#fdf5ee] transition-colors flex items-center gap-1"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Message
                </Link>
              )}
              {booking.status === "completed" && (
                <button className="px-3 py-1.5 border border-[#e8dfd4] rounded-xl text-xs font-semibold text-[#8b5e38] hover:border-[#8b5e38] hover:bg-[#fdf5ee] transition-colors">
                  Leave a review
                </button>
              )}
              {booking.canCancel && (
                <button
                  onClick={handleCancel}
                  disabled={isPending}
                  className="px-3 py-1.5 border border-red-200 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? "Cancelling…" : "Cancel"}
                </button>
              )}
              {cancelError && (
                <p className="w-full text-[10px] text-red-500 mt-1">{cancelError}</p>
              )}
              <button
                onClick={() => setExpanded(!expanded)}
                className="px-3 py-1.5 border border-[#e8dfd4] rounded-xl text-xs font-semibold text-[#64707d] hover:border-[#8b5e38] hover:text-[#8b5e38] transition-colors flex items-center gap-1"
              >
                Details
                <svg
                  width="12" height="12" viewBox="0 0 24 24" fill="none"
                  className={`transition-transform ${expanded ? "rotate-180" : ""}`}
                >
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded detail panel */}
      {expanded && (
        <div className="border-t border-[#f0e8de] bg-[#faf7f4] px-5 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Price breakdown */}
            <div>
              <p className="text-[10px] font-bold text-[#64707d] uppercase tracking-widest mb-3">Price breakdown</p>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#64707d]">SAR {booking.subtotal / booking.nights} × {booking.nights} nights</span>
                  <span className="font-medium text-[#1a0e02]">SAR {booking.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#64707d]">Service fee (12%)</span>
                  <span className="font-medium text-[#1a0e02]">SAR {booking.serviceFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-[#e8dfd4] pt-2 mt-1">
                  <span className="text-[#1a0e02]">Total</span>
                  <span className="text-[#1a0e02]">SAR {booking.totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Booking info */}
            <div>
              <p className="text-[10px] font-bold text-[#64707d] uppercase tracking-widest mb-3">Booking info</p>
              <div className="flex flex-col gap-2">
                <div>
                  <p className="text-[10px] text-[#a09080] uppercase tracking-wide font-bold">Check-in</p>
                  <p className="text-sm font-semibold text-[#1a0e02]">{fmtDate(checkIn)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#a09080] uppercase tracking-wide font-bold">Check-out</p>
                  <p className="text-sm font-semibold text-[#1a0e02]">{fmtDate(checkOut)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#a09080] uppercase tracking-wide font-bold">Payment</p>
                  <p className="text-sm font-semibold text-[#1a0e02]">{PAYMENT_LABELS[booking.paymentMethod]}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Host info */}
          <div className="mt-4 pt-4 border-t border-[#e8dfd4] flex items-center gap-3">
            <img
              src={booking.hostAvatar}
              alt={booking.hostName}
              className="w-9 h-9 rounded-full object-cover border border-[#e8dfd4] shrink-0"
            />
            <div>
              <p className="text-xs text-[#a09080]">Your host</p>
              <p className="text-sm font-semibold text-[#1a0e02]">{booking.hostName}</p>
            </div>
            <button className="ml-auto px-3 py-1.5 border border-[#e8dfd4] rounded-xl text-xs font-semibold text-[#64707d] hover:border-[#8b5e38] hover:text-[#8b5e38] transition-colors">
              Message host
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// CohostAssignmentCard — visually distinct from booking cards (green, no price)
// ──────────────────────────────────────────────────────────────────────────────

function CohostAssignmentCard({ assignment }: { assignment: CohostAssignmentItem }) {
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="bg-white border border-[#9edcbb] rounded-2xl overflow-hidden">
      {/* Green identity strip — immediately distinguishes this from a booking */}
      <div className="bg-[#f0faf5] border-b border-[#9edcbb] px-5 py-2 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#049153] animate-pulse shrink-0" />
        <span className="text-[10px] font-bold text-[#049153] uppercase tracking-widest">
          Active Co-host Assignment
        </span>
      </div>

      <div className="flex flex-col sm:flex-row">

        {/* Listing image */}
        <div className="relative sm:w-44 shrink-0">
          {assignment.listingImage ? (
            <img
              src={assignment.listingImage}
              alt={assignment.listingTitle}
              className="w-full h-36 sm:h-full object-cover"
            />
          ) : (
            <div className="w-full h-36 sm:h-full bg-[#e8dfd4]" />
          )}
        </div>

        {/* Details */}
        <div className="flex-1 p-5 flex flex-col gap-3 min-w-0">

          {/* Title + host */}
          <div>
            <Link
              href={`/listing/${assignment.listingId}`}
              className="font-display font-semibold text-[#1a0e02] leading-snug hover:text-[#049153] transition-colors"
            >
              {assignment.listingTitle}
            </Link>
            <p className="text-xs text-[#64707d] mt-0.5">
              Host:{" "}
              <span className="font-semibold text-[#8b5e38]">{assignment.hostName}</span>
            </p>
          </div>

          {/* Date strip */}
          <div className="flex flex-wrap gap-x-5 gap-y-1.5">
            <div>
              <p className="text-[10px] text-[#a09080] uppercase tracking-wide font-bold">Assigned since</p>
              <p className="text-xs font-semibold text-[#1a0e02]">{fmtDate(assignment.assignedAt)}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#a09080] uppercase tracking-wide font-bold">Role</p>
              <p className="text-xs font-semibold text-[#1a0e02]">Co-host</p>
            </div>
          </div>

          {/* Operational reminder */}
          <div className="flex items-start gap-2 bg-[#f0faf5] border border-[#9edcbb] rounded-xl px-4 py-2.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-[#049153] shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
              <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <p className="text-xs text-[#049153] font-medium leading-relaxed">
              {assignment.checkInTime
                ? `Guests check in at ${assignment.checkInTime} — please arrive at least 1 hour early to prepare.`
                : "Coordinate with your host and plan to arrive before guests check in — typically 1 hour early."}
            </p>
          </div>

          {/* Actions — no price, no cancel button */}
          <div className="flex items-center gap-2 pt-3 border-t border-[#f0e8de] flex-wrap mt-auto">
            <Link
              href={`/messages?with=${assignment.hostId}`}
              className="px-3 py-1.5 border border-[#9edcbb] rounded-xl text-xs font-semibold text-[#049153] hover:bg-[#f0faf5] transition-colors flex items-center gap-1"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Message host
            </Link>
            <Link
              href={`/listing/${assignment.listingId}`}
              className="px-3 py-1.5 border border-[#e8dfd4] rounded-xl text-xs font-semibold text-[#64707d] hover:border-[#8b5e38] hover:text-[#8b5e38] hover:bg-[#fdf5ee] transition-colors"
            >
              View listing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main section
// ──────────────────────────────────────────────────────────────────────────────

export default function UserBookingsSection({
  bookings: initialBookings,
  cohostAssignments = [],
}: {
  bookings:           UserBooking[];
  cohostAssignments?: CohostAssignmentItem[];
}) {
  const [tab, setTab]       = useState<Tab>("upcoming");
  // Local state so cancellation reflects immediately without a page reload.
  const [bookings, setBookings] = useState<UserBooking[]>(initialBookings);

  const handleCancelled = (id: string) => {
    setBookings((prev) =>
      prev.map((b) => b.id === id ? { ...b, status: "cancelled" as const, canCancel: false } : b)
    );
  };

  // Co-host assignment overrides guest booking — never show both for the same listing.
  const cohostListingIds = new Set(cohostAssignments.map((a) => a.listingId));
  const guestBookings = bookings.filter((b) => !cohostListingIds.has(b.listingId));

  const upcoming = guestBookings.filter(
    (b) => b.status === "upcoming" || b.status === "confirmed" || b.status === "active"
  );
  const past = guestBookings.filter(
    (b) => b.status === "completed" || b.status === "cancelled"
  );

  const shown = tab === "upcoming" ? upcoming : past;

  return (
    <div className="flex flex-col gap-10">

    {/* ── Section 1: Guest Bookings ─────────────────────────────────────────── */}
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h2 className="font-display font-semibold text-[#1a0e02] text-lg">Guest Bookings</h2>
            <span className="text-[10px] font-bold text-[#8b5e38] bg-[#fdf5ee] border border-[#e8c89a] px-2 py-0.5 rounded-full uppercase tracking-wide">
              As a guest
            </span>
          </div>
          <p className="text-xs text-[#64707d]">
            {upcoming.length} upcoming · {past.filter((b) => b.status === "completed").length} completed
          </p>
        </div>
        <Link
          href="/explore"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#8b5e38] text-white text-sm font-semibold rounded-xl hover:bg-[#7a5030] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          Book new
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#f0e8de] rounded-xl p-1 w-fit">
        {(["upcoming", "past"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              "px-5 py-2 rounded-lg text-sm font-semibold transition-all",
              tab === t
                ? "bg-white text-[#1a0e02] shadow-sm"
                : "text-[#64707d] hover:text-[#1a0e02]",
            ].join(" ")}
          >
            {t === "upcoming" ? "Upcoming" : "Past"}
            <span className={`ml-1.5 text-xs ${tab === t ? "text-[#8b5e38]" : "text-[#a09080]"}`}>
              {t === "upcoming" ? upcoming.length : past.length}
            </span>
          </button>
        ))}
      </div>

      {/* Status legend */}
      <div className="flex flex-wrap gap-3">
        {(tab === "upcoming"
          ? (["upcoming", "confirmed", "active"] as const)
          : (["completed", "cancelled"] as const)
        ).map((s) => (
          <BookingStatusBadge key={s} status={s} size="sm" />
        ))}
      </div>

      {/* Cards */}
      {shown.length === 0 ? (
        <UserEmptyState
          icon={
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" />
              <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          }
          title={tab === "upcoming" ? "No upcoming trips" : "No past bookings"}
          description={
            tab === "upcoming"
              ? "Start exploring Saudi Arabia and book your first experience."
              : "Your completed and cancelled bookings will appear here."
          }
          action={tab === "upcoming" ? { label: "Explore experiences", href: "/explore" } : undefined}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {shown.map((b) => <BookingCard key={b.id} booking={b} onCancelled={handleCancelled} />)}
        </div>
      )}
    </div>

    {/* ── Section 2: Co-host Assignments ───────────────────────────────────── */}
    {cohostAssignments.length > 0 && (
      <div className="flex flex-col gap-6">

        {/* Divider + header */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-[#e8dfd4]" />
        </div>
        <div className="flex items-center gap-3">
          <h2 className="font-display font-semibold text-[#1a0e02] text-lg">My Co-host Assignments</h2>
          <span className="text-[10px] font-bold text-[#049153] bg-[#f0faf5] border border-[#9edcbb] px-2 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#049153]" />
            {cohostAssignments.length} active
          </span>
        </div>
        <p className="text-xs text-[#64707d] -mt-4">
          Listings you are actively co-hosting — this is not a guest booking.
        </p>

        <div className="flex flex-col gap-4">
          {cohostAssignments.map((a) => (
            <CohostAssignmentCard key={a.id} assignment={a} />
          ))}
        </div>
      </div>
    )}

    </div>
  );
}
