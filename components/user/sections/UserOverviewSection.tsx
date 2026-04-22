"use client";

import Link from "next/link";
import type { UserBooking } from "@/lib/types/user";
import type { CohostAssignmentItem } from "@/lib/services/cohost";
import BookingStatusBadge from "../shared/BookingStatusBadge";
import UserAvatar from "@/components/ui/UserAvatar";

function KPITile({
  icon,
  value,
  label,
  accent,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className={`rounded-2xl p-5 flex flex-col gap-3 border ${accent ? "bg-[#1a0e02] border-transparent" : "bg-white border-[#e8dfd4]"}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent ? "bg-white/10 text-white" : "bg-[#fdf5ee] text-[#8b5e38]"}`}>
        {icon}
      </div>
      <div>
        <p className={`font-display font-extrabold text-2xl leading-tight ${accent ? "text-white" : "text-[#1a0e02]"}`}>
          {value}
        </p>
        <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${accent ? "text-white/60" : "text-[#64707d]"}`}>
          {label}
        </p>
      </div>
    </div>
  );
}

function QuickAction({
  icon,
  label,
  sub,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 bg-white border border-[#e8dfd4] rounded-2xl px-5 py-4 hover:border-[#c49a4f] hover:shadow-sm transition-all group"
    >
      <div className="w-10 h-10 rounded-xl bg-[#fdf5ee] flex items-center justify-center text-[#8b5e38] shrink-0 group-hover:bg-[#f0e0c8] transition-colors">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#1a0e02]">{label}</p>
        <p className="text-xs text-[#64707d] truncate">{sub}</p>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#a09080] shrink-0">
        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}

function NextTripCard({ trip }: { trip: UserBooking | null }) {

  if (!trip) {
    return (
      <div className="bg-white border border-[#e8dfd4] rounded-2xl p-6 flex flex-col items-center text-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#fdf5ee] flex items-center justify-center text-[#8b5e38]">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" fill="currentColor" />
          </svg>
        </div>
        <div>
          <p className="font-display font-semibold text-[#1a0e02]">No upcoming trips</p>
          <p className="text-xs text-[#64707d] mt-0.5">Explore Saudi Arabia and book your next experience</p>
        </div>
        <Link
          href="/explore"
          className="mt-1 px-4 py-2 bg-[#8b5e38] text-white text-sm font-semibold rounded-xl hover:bg-[#7a5030] transition-colors"
        >
          Explore now
        </Link>
      </div>
    );
  }

  const checkIn  = new Date(trip.checkIn);
  const checkOut = new Date(trip.checkOut);
  const daysUntil = Math.ceil((checkIn.getTime() - Date.now()) / 86400000);
  const fmtDate  = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  return (
    <div className="bg-white border border-[#e8dfd4] rounded-2xl overflow-hidden">
      <img
        src={trip.listingImage}
        alt={trip.listingTitle}
        className="w-full h-36 object-cover"
      />
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <BookingStatusBadge status={trip.status} />
          <span className={`text-xs font-bold px-2 py-1 rounded-lg ${daysUntil <= 7 ? "bg-[#fdf8ee] text-[#8b6a1f]" : "bg-[#f4f6f8] text-[#64707d]"}`}>
            {daysUntil === 0 ? "Today!" : daysUntil === 1 ? "Tomorrow" : `in ${daysUntil} days`}
          </span>
        </div>
        <h3 className="font-display font-semibold text-[#1a0e02] mt-2 leading-snug">{trip.listingTitle}</h3>
        <p className="text-xs text-[#64707d] mt-0.5 flex items-center gap-1">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
          </svg>
          {trip.location}
        </p>
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#f0e8de]">
          <div className="flex-1">
            <p className="text-[10px] text-[#a09080] uppercase tracking-wide font-bold">Check-in</p>
            <p className="text-sm font-semibold text-[#1a0e02]">{fmtDate(checkIn)}</p>
          </div>
          <div className="w-px h-8 bg-[#e8dfd4]" />
          <div className="flex-1">
            <p className="text-[10px] text-[#a09080] uppercase tracking-wide font-bold">Check-out</p>
            <p className="text-sm font-semibold text-[#1a0e02]">{fmtDate(checkOut)}</p>
          </div>
          <div className="w-px h-8 bg-[#e8dfd4]" />
          <div className="flex-1">
            <p className="text-[10px] text-[#a09080] uppercase tracking-wide font-bold">Nights</p>
            <p className="text-sm font-semibold text-[#1a0e02]">{trip.nights}</p>
          </div>
        </div>
        <p className="text-[10px] font-mono text-[#a09080] mt-3">{trip.reference}</p>
      </div>
    </div>
  );
}

type KPIs = {
  upcomingCount:  number;
  completedCount: number;
  savedCount:     number;
  totalSpent:     number;
  nextTrip:       UserBooking | null;
};

export default function UserOverviewSection({
  bookings,
  kpis,
  userName,
  userAvatar,
  cohostAssignments = [],
  onViewAssignments,
}: {
  bookings:             UserBooking[];
  kpis:                 KPIs;
  userName:             string;
  userAvatar:           string;
  cohostAssignments?:   CohostAssignmentItem[];
  onViewAssignments?:   () => void;
}) {
  const fmtDate = new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long",
  });

  const recentBookings = bookings.slice(0, 2);

  return (
    <div className="flex flex-col gap-6">

      {/* Welcome strip */}
      <div className="bg-[#1a0e02] rounded-2xl px-6 py-5 flex items-center justify-between gap-4 overflow-hidden relative">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 80% 50%, #c49a4f 0%, transparent 60%)" }} />

        <div className="relative">
          <p className="text-[#c49a4f] text-xs font-bold uppercase tracking-widest mb-1">{fmtDate}</p>
          <h2 className="font-display font-extrabold text-white text-2xl">
            Welcome back, {userName}
          </h2>
          <p className="text-white/60 text-sm mt-1">
            {kpis.upcomingCount > 0
              ? `You have ${kpis.upcomingCount} upcoming trip${kpis.upcomingCount > 1 ? "s" : ""} — let's make it unforgettable.`
              : "Ready to discover your next Saudi adventure?"}
          </p>
        </div>

        <UserAvatar
          src={userAvatar}
          name={userName}
          size={56}
          className="relative border-2 border-[#c49a4f]"
        />
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPITile
          accent
          value={String(kpis.upcomingCount)}
          label="Upcoming trips"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
              <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          }
        />
        <KPITile
          value={String(kpis.completedCount)}
          label="Experiences"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            </svg>
          }
        />
        <KPITile
          value={String(kpis.savedCount)}
          label="Saved places"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 21S3 14 3 8.5C3 5.42 5.42 3 8.5 3 10.24 3 11.91 3.81 13 5.09 14.09 3.81 15.76 3 17.5 3 20.58 3 23 5.42 23 8.5 23 14 12 21 12 21z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
        <KPITile
          value={`SAR ${(kpis.totalSpent / 1000).toFixed(1)}k`}
          label="Total spent"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
      </div>

      {/* Co-host work banner — shown when user has active assignments */}
      {cohostAssignments.length > 0 && (
        <div className="bg-[#f0faf5] border border-[#9edcbb] rounded-2xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#d0f0e0] flex items-center justify-center text-[#049153] shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8" />
                <path d="M3 20c0-4 2.7-7 6-7s6 3 6 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M21 18c0-3.5-2.24-6-5-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-[#1a0e02]">
                You are co-hosting {cohostAssignments.length} listing{cohostAssignments.length > 1 ? "s" : ""}
              </p>
              <p className="text-xs text-[#64707d]">
                {cohostAssignments.map((a) => a.listingTitle).join(" · ")}
              </p>
            </div>
          </div>
          {onViewAssignments && (
            <button
              onClick={onViewAssignments}
              className="text-xs font-semibold text-[#049153] border border-[#9edcbb] px-3 py-1.5 rounded-lg hover:bg-[#d0f0e0] transition-colors shrink-0"
            >
              View assignments →
            </button>
          )}
        </div>
      )}

      {/* Main 2-col: next trip + quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Next trip */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <h3 className="font-display font-semibold text-[#1a0e02]">Your next trip</h3>
          <NextTripCard trip={kpis.nextTrip} />
        </div>

        {/* Quick actions */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          <h3 className="font-display font-semibold text-[#1a0e02]">Quick actions</h3>
          <div className="flex flex-col gap-2">
            <QuickAction
              href="/explore"
              label="Explore experiences"
              sub="Browse farms, domes, cabins & more"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              }
            />
            <QuickAction
              href="/account/bookings"
              label="Manage bookings"
              sub={`${kpis.upcomingCount} upcoming · ${kpis.completedCount} completed`}
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              }
            />
            <QuickAction
              href="/account/saved"
              label="My saved places"
              sub={`${kpis.savedCount} listings in your wishlist`}
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 21S3 14 3 8.5C3 5.42 5.42 3 8.5 3 10.24 3 11.91 3.81 13 5.09 14.09 3.81 15.76 3 17.5 3 20.58 3 23 5.42 23 8.5 23 14 12 21 12 21z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
            />
            <QuickAction
              href="/host"
              label="Become a host"
              sub="List your property and earn with Bedouin"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
            />
          </div>
        </div>
      </div>

      {/* Recent bookings strip */}
      {recentBookings.length > 0 && (
        <div className="bg-white border border-[#e8dfd4] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#f0e8de] flex items-center justify-between">
            <h3 className="font-display font-semibold text-[#1a0e02]">Recent bookings</h3>
            <a href="/account/bookings" className="text-xs font-semibold text-[#8b5e38] hover:underline">
              View all →
            </a>
          </div>
          <div className="divide-y divide-[#f0e8de]">
            {recentBookings.map((b) => {
              const fmtD = (iso: string) =>
                new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
              return (
                <div key={b.id} className="flex items-center gap-4 px-5 py-3.5">
                  <img
                    src={b.listingImage}
                    alt={b.listingTitle}
                    className="w-14 h-11 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1a0e02] truncate">{b.listingTitle}</p>
                    <p className="text-xs text-[#64707d]">{fmtD(b.checkIn)} – {fmtD(b.checkOut)} · {b.nights}n</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <BookingStatusBadge status={b.status} size="sm" />
                    <p className="text-xs font-bold text-[#1a0e02]">SAR {b.totalPrice.toLocaleString("en-US")}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
