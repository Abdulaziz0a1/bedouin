"use client";

import {
  getDashboardKPIs,
  MOCK_BOOKINGS,
  MOCK_LISTINGS,
  MOCK_EARNINGS_HISTORY,
  type DashboardBooking,
} from "@/lib/data/dashboard";
import StatusBadge from "../shared/StatusBadge";

function KPICard({
  label,
  value,
  sub,
  icon,
  delta,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  delta?: number;
}) {
  return (
    <div className="bg-white border border-[#e8dfd4] rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl bg-[#fdf5ee] flex items-center justify-center text-[#8b5e38]">
          {icon}
        </div>
        {delta !== undefined && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              delta >= 0
                ? "bg-[#f0faf5] text-[#049153]"
                : "bg-red-50 text-red-600"
            }`}
          >
            {delta >= 0 ? "+" : ""}{delta}%
          </span>
        )}
      </div>
      <div>
        <p className="font-display font-extrabold text-[#1a0e02] text-2xl leading-tight">{value}</p>
        {sub && <p className="text-xs text-[#64707d] mt-0.5">{sub}</p>}
        <p className="text-[10px] font-bold text-[#64707d] uppercase tracking-widest mt-1">{label}</p>
      </div>
    </div>
  );
}

function MiniBarChart({ data }: { data: { month: string; payout: number }[] }) {
  const max = Math.max(...data.map((d) => d.payout));
  return (
    <div className="flex items-end gap-1.5 h-16">
      {data.map((d, i) => {
        const pct = max > 0 ? (d.payout / max) * 100 : 0;
        const isLast = i === data.length - 1;
        return (
          <div key={d.month} className="flex flex-col items-center flex-1 gap-1">
            <div
              className={`w-full rounded-t-md transition-all ${
                isLast ? "bg-[#8b5e38]" : "bg-[#e8dfd4]"
              }`}
              style={{ height: `${Math.max(pct, 8)}%` }}
            />
            <span className={`text-[9px] font-medium ${isLast ? "text-[#8b5e38]" : "text-[#a09080]"}`}>
              {d.month}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function UpcomingRow({ booking }: { booking: DashboardBooking }) {
  const checkIn  = new Date(booking.checkIn);
  const checkOut = new Date(booking.checkOut);
  const fmtDate  = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const daysUntil = Math.ceil((checkIn.getTime() - Date.now()) / 86400000);

  return (
    <div className="flex items-center gap-3 py-3 border-b last:border-0 border-[#f0e8de]">
      <img
        src={booking.listingImage}
        alt={booking.listingTitle}
        className="w-12 h-10 rounded-lg object-cover shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#1a0e02] truncate">{booking.guestName}</p>
        <p className="text-xs text-[#64707d] truncate">{booking.listingTitle}</p>
        <p className="text-xs text-[#a09080]">{fmtDate(checkIn)} – {fmtDate(checkOut)} · {booking.nights}n</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-[#1a0e02]">SAR {booking.hostPayout.toLocaleString()}</p>
        <p className={`text-[10px] font-semibold mt-0.5 ${daysUntil <= 3 ? "text-[#c49a4f]" : "text-[#64707d]"}`}>
          {daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `in ${daysUntil}d`}
        </p>
      </div>
    </div>
  );
}

export default function OverviewSection() {
  const kpis = getDashboardKPIs();
  const upcoming = MOCK_BOOKINGS.filter((b) => b.status === "upcoming").slice(0, 3);
  const pendingListings = MOCK_LISTINGS.filter((l) => l.status === "pending_review");
  const rejectedListings = MOCK_LISTINGS.filter((l) => l.status === "rejected");

  const chartData = MOCK_EARNINGS_HISTORY.map((m) => ({ month: m.month, payout: m.payout }));

  return (
    <div className="flex flex-col gap-6">

      {/* Alert: pending review */}
      {pendingListings.length > 0 && (
        <div className="bg-[#fdf8ee] border border-[#ead9a6] rounded-2xl px-5 py-4 flex items-start gap-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[#c49a4f] shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-[#8b6a1f]">
              {pendingListings.length} listing{pendingListings.length > 1 ? "s" : ""} under review
            </p>
            <p className="text-xs text-[#a08040] mt-0.5">
              Our team usually responds within 48 hours. You'll receive an email once approved.
            </p>
          </div>
        </div>
      )}

      {/* Alert: rejected */}
      {rejectedListings.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-start gap-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-red-500 shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
            <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-red-700">
              {rejectedListings.length} listing{rejectedListings.length > 1 ? "s were" : " was"} not approved
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              Review the feedback in My Listings and resubmit when ready.
            </p>
          </div>
        </div>
      )}

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total Earnings"
          value={`SAR ${kpis.totalEarnings.toLocaleString()}`}
          sub="All time payout"
          delta={kpis.earningsDelta}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
        <KPICard
          label="Active Listings"
          value={String(kpis.activeListings)}
          sub={`${MOCK_LISTINGS.length} total`}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
        <KPICard
          label="Total Bookings"
          value={String(kpis.totalBookings)}
          sub={`${kpis.upcomingCount} upcoming`}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
              <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          }
        />
        <KPICard
          label="Avg. Rating"
          value={kpis.avgRating.toFixed(2)}
          sub="Across all listings"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
          }
        />
      </div>

      {/* Bottom row: upcoming bookings + mini chart */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Upcoming bookings */}
        <div className="lg:col-span-3 bg-white border border-[#e8dfd4] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#f0e8de] flex items-center justify-between">
            <h2 className="font-display font-semibold text-[#1a0e02]">Upcoming check-ins</h2>
            <span className="text-[11px] font-bold text-[#8b5e38] bg-[#fdf5ee] px-2 py-0.5 rounded-full">
              {kpis.upcomingCount} guests
            </span>
          </div>
          <div className="px-5 py-2">
            {upcoming.length === 0 ? (
              <p className="text-sm text-[#64707d] py-8 text-center">No upcoming check-ins.</p>
            ) : (
              upcoming.map((b) => <UpcomingRow key={b.id} booking={b} />)
            )}
          </div>
        </div>

        {/* Earnings mini chart */}
        <div className="lg:col-span-2 bg-white border border-[#e8dfd4] rounded-2xl p-5 flex flex-col gap-4">
          <div>
            <h2 className="font-display font-semibold text-[#1a0e02]">Earnings trend</h2>
            <p className="text-xs text-[#64707d] mt-0.5">Last 6 months payout (SAR)</p>
          </div>
          <MiniBarChart data={chartData} />
          <div className="flex items-center justify-between pt-2 border-t border-[#f0e8de]">
            <div>
              <p className="text-[10px] text-[#64707d] uppercase tracking-widest font-bold">This month</p>
              <p className="font-display font-extrabold text-[#8b5e38] text-lg">
                SAR {kpis.thisMonth.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-[#64707d] uppercase tracking-widest font-bold">vs last month</p>
              <p className={`font-semibold text-sm ${kpis.earningsDelta >= 0 ? "text-[#049153]" : "text-red-500"}`}>
                {kpis.earningsDelta >= 0 ? "+" : ""}{kpis.earningsDelta}%
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Listing status quick-view */}
      <div className="bg-white border border-[#e8dfd4] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#f0e8de]">
          <h2 className="font-display font-semibold text-[#1a0e02]">Listing status</h2>
        </div>
        <div className="divide-y divide-[#f0e8de]">
          {MOCK_LISTINGS.map((listing) => (
            <div key={listing.id} className="flex items-center gap-4 px-5 py-3">
              <img
                src={listing.imageUrl}
                alt={listing.title}
                className="w-12 h-10 rounded-lg object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1a0e02] truncate">{listing.title}</p>
                <p className="text-xs text-[#64707d]">{listing.region} · SAR {listing.price}/{listing.priceUnit.replace("per ", "")}</p>
              </div>
              <StatusBadge status={listing.status} />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
