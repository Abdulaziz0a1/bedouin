"use client";

import { useState } from "react";
import type { DashboardBooking } from "@/lib/data/dashboard";
import DashboardEmptyState from "../shared/DashboardEmptyState";

type Tab = "upcoming" | "past";

const PAYMENT_LABELS: Record<string, string> = {
  card:      "Credit / Debit Card",
  mada:      "Mada",
  apple_pay: "Apple Pay",
};

function StatusChip({ status }: { status: DashboardBooking["status"] }) {
  const cfg = {
    upcoming:  { label: "Upcoming",  cls: "bg-[#fdf8ee] text-[#8b6a1f] border-[#ead9a6]"  },
    active:    { label: "Active",    cls: "bg-[#f0faf5] text-[#049153] border-[#c3e8d6]"  },
    completed: { label: "Completed", cls: "bg-[#f4f6f8] text-[#64707d] border-[#dddfe3]"  },
    cancelled: { label: "Cancelled", cls: "bg-red-50    text-red-600   border-red-200"    },
  }[status];
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

function BookingRow({ booking }: { booking: DashboardBooking }) {
  const [expanded, setExpanded] = useState(false);
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="bg-white border border-[#e8dfd4] rounded-2xl overflow-hidden">
      {/* Main row */}
      <button
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-[#faf7f4] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <img
          src={booking.guestAvatar}
          alt={booking.guestName}
          className="w-10 h-10 rounded-full object-cover shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-[#1a0e02]">{booking.guestName}</p>
            <p className="text-xs text-[#a09080]">{booking.guestNationality}</p>
          </div>
          <p className="text-xs text-[#64707d] truncate mt-0.5">{booking.listingTitle}</p>
          <p className="text-xs text-[#a09080] mt-0.5">
            {fmtDate(booking.checkIn)} → {fmtDate(booking.checkOut)} · {booking.nights} nights
          </p>
        </div>
        <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
          <StatusChip status={booking.status} />
          <p className="font-display font-bold text-[#1a0e02] text-sm">SAR {booking.hostPayout.toLocaleString()}</p>
          <p className="text-[10px] text-[#a09080]">payout</p>
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
        <div className="border-t border-[#f0e8de] px-5 pb-5 pt-4">
          <div className="flex items-start gap-4">
            <img
              src={booking.listingImage}
              alt={booking.listingTitle}
              className="w-24 h-16 rounded-xl object-cover shrink-0"
            />
            <div className="flex-1">
              <p className="text-xs font-bold text-[#64707d] uppercase tracking-widest mb-2">Booking details</p>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1.5">
                <div>
                  <p className="text-[10px] text-[#a09080] uppercase tracking-wide font-bold">Reference</p>
                  <p className="text-xs font-mono font-semibold text-[#1a0e02]">{booking.reference}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#a09080] uppercase tracking-wide font-bold">Guests</p>
                  <p className="text-xs font-semibold text-[#1a0e02]">
                    {booking.adults} adults{booking.children > 0 ? `, ${booking.children} children` : ""}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-[#a09080] uppercase tracking-wide font-bold">Total charged</p>
                  <p className="text-xs font-semibold text-[#1a0e02]">SAR {booking.totalPrice.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#a09080] uppercase tracking-wide font-bold">Your payout</p>
                  <p className="text-xs font-semibold text-[#049153]">SAR {booking.hostPayout.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#a09080] uppercase tracking-wide font-bold">Payment</p>
                  <p className="text-xs font-semibold text-[#1a0e02]">{PAYMENT_LABELS[booking.paymentMethod]}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#a09080] uppercase tracking-wide font-bold">Booked on</p>
                  <p className="text-xs font-semibold text-[#1a0e02]">{fmtDate(booking.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookingsSection({ bookings }: { bookings: DashboardBooking[] }) {
  const [tab, setTab] = useState<Tab>("upcoming");

  const upcoming = bookings.filter((b) => b.status === "upcoming" || b.status === "active");
  const past      = bookings.filter((b) => b.status === "completed" || b.status === "cancelled");

  const shown = tab === "upcoming" ? upcoming : past;

  const totalRevenue = past.filter(b => b.status === "completed")
    .reduce((s, b) => s + b.hostPayout, 0);

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-semibold text-[#1a0e02] text-lg">Bookings</h2>
          <p className="text-xs text-[#64707d] mt-0.5">
            {upcoming.length} upcoming · SAR {totalRevenue.toLocaleString()} earned to date
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#f0e8de] rounded-xl p-1 w-fit">
        {(["upcoming", "past"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              "px-5 py-2 rounded-lg text-sm font-semibold transition-all",
              tab === t ? "bg-white text-[#1a0e02] shadow-sm" : "text-[#64707d] hover:text-[#1a0e02]",
            ].join(" ")}
          >
            {t === "upcoming" ? "Upcoming" : "Past"}
            <span className={`ml-1.5 text-xs ${tab === t ? "text-[#8b5e38]" : "text-[#a09080]"}`}>
              {t === "upcoming" ? upcoming.length : past.length}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      {shown.length === 0 ? (
        <DashboardEmptyState
          icon={
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" />
              <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          }
          title={tab === "upcoming" ? "No upcoming bookings" : "No past bookings"}
          description={
            tab === "upcoming"
              ? "When guests book your listings, they'll appear here."
              : "Completed and cancelled reservations will appear here."
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {shown.map((b) => (
            <BookingRow key={b.id} booking={b} />
          ))}
        </div>
      )}

      {/* Summary strip — past only */}
      {tab === "past" && past.length > 0 && (
        <div className="bg-white border border-[#e8dfd4] rounded-2xl p-5">
          <p className="text-[10px] font-bold text-[#64707d] uppercase tracking-widest mb-3">Summary</p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="font-display font-extrabold text-[#1a0e02] text-xl">
                {past.filter((b) => b.status === "completed").length}
              </p>
              <p className="text-xs text-[#64707d]">Completed</p>
            </div>
            <div>
              <p className="font-display font-extrabold text-[#1a0e02] text-xl">
                {past.filter((b) => b.status === "cancelled").length}
              </p>
              <p className="text-xs text-[#64707d]">Cancelled</p>
            </div>
            <div>
              <p className="font-display font-extrabold text-[#8b5e38] text-xl">
                SAR {totalRevenue.toLocaleString()}
              </p>
              <p className="text-xs text-[#64707d]">Total payout</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
