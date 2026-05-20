"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  type DashboardBooking,
  type DashboardListing,
  type EarningsMonth,
} from "@/lib/data/dashboard";
import StatusBadge from "../shared/StatusBadge";
import AlertBanner from "@/components/ui/AlertBanner";
import { useLanguage } from "@/context/LanguageProvider";
import { getListingText } from "@/lib/utils/listing-locale";

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
    <div
      className="relative bg-white rounded-[18px] p-5 flex flex-col gap-3 overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
      style={{
        border: "1px solid var(--border)",
        borderTop: "2px solid rgba(196,154,79,0.50)",
        boxShadow: "0 2px 12px rgba(70,30,0,0.07), 0 1px 3px rgba(70,30,0,0.05)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 8px 28px rgba(70,30,0,0.11), 0 2px 8px rgba(70,30,0,0.06)";
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(196,154,79,0.35)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 2px 12px rgba(70,30,0,0.07), 0 1px 3px rgba(70,30,0,0.05)";
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgba(196,154,79,0.18), transparent)" }}
        aria-hidden="true"
      />

      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-[#8b5e38]"
          style={{
            background: "linear-gradient(135deg, #fdf5ee 0%, #f0e0c8 100%)",
            boxShadow: "0 2px 10px rgba(139,94,60,0.14)",
          }}
        >
          {icon}
        </div>
        {delta !== undefined && (
          <span
            className="text-[11px] font-bold px-2 py-0.5 rounded-full"
            style={{
              background: delta >= 0 ? "var(--status-success-bg)" : "var(--status-error-bg)",
              color: delta >= 0 ? "var(--status-success-text)" : "var(--status-error-text)",
            }}
          >
            {delta >= 0 ? "↑" : "↓"} {Math.abs(delta)}%
          </span>
        )}
      </div>
      <div>
        <p className="font-display font-extrabold text-[#1a0e02] text-[1.5rem] leading-tight">{value}</p>
        {sub && <p className="text-xs text-[#8b9199] mt-0.5">{sub}</p>}
        <p className="text-eyebrow mt-1.5">{label}</p>
      </div>
    </div>
  );
}

function buildSixMonthChart(data: { month: string; payout: number }[]) {
  const now = new Date();
  const byMonth = new Map(data.map((d) => [d.month, d.payout]));
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const month = d.toLocaleDateString("en-GB", { month: "short" });
    return { month, payout: byMonth.get(month) ?? 0 };
  });
}

function EarningsTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#e8dfd4] rounded-xl px-3.5 py-2.5 shadow-lg text-xs">
      <p className="text-[#a09080] font-medium mb-1">{label}</p>
      <p className="text-[#8b5e38] font-bold text-sm">SAR {payload[0].value.toLocaleString("en-US")}</p>
    </div>
  );
}

function MiniBarChart({ data }: {
  data: { month: string; payout: number }[];
}) {
  const chartData = buildSixMonthChart(data);

  return (
    <div style={{ height: 180 }}>
      <ResponsiveContainer width="99%" height="100%">
        <AreaChart data={chartData} margin={{ top: 12, right: 8, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"  stopColor="#8b5e38" stopOpacity={0.22} />
              <stop offset="100%" stopColor="#8b5e38" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke="#f0e8de" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: "#8b8078", fontWeight: 600 }}
            tickLine={false}
            axisLine={false}
            dy={4}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#8b8078" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
            width={44}
            tickCount={4}
          />
          <Tooltip content={<EarningsTooltip />} cursor={{ stroke: "#e8dfd4", strokeWidth: 1.5 }} />
          <Area
            type="monotone"
            dataKey="payout"
            stroke="#8b5e38"
            strokeWidth={2.5}
            fill="url(#earningsGrad)"
            dot={{ r: 4, fill: "#fff", stroke: "#8b5e38", strokeWidth: 2 }}
            activeDot={{ r: 6, fill: "#8b5e38", stroke: "#fff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function UpcomingRow({ booking }: { booking: DashboardBooking }) {
  const { t, lang } = useLanguage();
  const displayTitle = getListingText(booking.listingTitle, booking.listingTitle_ar, lang);
  const checkIn  = new Date(booking.checkIn);
  const checkOut = new Date(booking.checkOut);
  const fmtDate  = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const daysUntil = Math.ceil((checkIn.getTime() - Date.now()) / 86400000);

  const daysLabel =
    daysUntil === 0 ? t("dash.today")
    : daysUntil === 1 ? t("dash.tomorrow")
    : t("dash.in_days").replace("{count}", String(daysUntil));

  return (
    <div className="flex items-center gap-3 py-3 border-b last:border-0 border-[#f0e8de]">
      {booking.listingImage ? (
        <img
          src={booking.listingImage}
          alt={displayTitle}
          className="w-12 h-10 rounded-lg object-cover shrink-0"
        />
      ) : (
        <div className="w-12 h-10 rounded-lg bg-[#f0e8de] shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#1a0e02] truncate">{booking.guestName}</p>
        <p className="text-xs text-[#64707d] truncate">{displayTitle}</p>
        <p className="text-xs text-[#a09080]">{fmtDate(checkIn)} – {fmtDate(checkOut)} · {booking.nights}n</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-[#1a0e02]">SAR {booking.hostPayout.toLocaleString("en-US")}</p>
        <p className={`text-[10px] font-semibold mt-0.5 ${daysUntil <= 3 ? "text-[#c49a4f]" : "text-[#64707d]"}`}>
          {daysLabel}
        </p>
      </div>
    </div>
  );
}

type OverviewKPIs = {
  totalEarnings:  number;
  earningsDelta:  number;
  activeListings: number;
  totalBookings:  number;
  upcomingCount:  number;
  avgRating:      number;
  thisMonth:      number;
  earningsHistory: EarningsMonth[];
};

function BookingAnnouncementCard({
  icon,
  title,
  subtitle,
  href,
  variant = "info",
}: {
  icon:     React.ReactNode;
  title:    string;
  subtitle: string;
  href:     string;
  variant?: "info" | "warning" | "success";
}) {
  const styles = {
    info:    { bg: "bg-[#f0f4ff]", border: "border-[#c0d0ff]", color: "text-[#0046cc]", iconBg: "bg-[#dce8ff]" },
    warning: { bg: "bg-[#fdf8ee]", border: "border-[#ead9a6]", color: "text-[#8b6a1f]", iconBg: "bg-[#faefc5]" },
    success: { bg: "bg-[#f0faf5]", border: "border-[#c3e8d6]", color: "text-[#049153]", iconBg: "bg-[#d4f2e4]" },
  }[variant];

  return (
    <a
      href={href}
      className={`flex items-center gap-4 px-5 py-4 rounded-2xl border ${styles.bg} ${styles.border} hover:opacity-90 transition-opacity`}
    >
      <div className={`w-10 h-10 rounded-xl ${styles.iconBg} flex items-center justify-center shrink-0 ${styles.color}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${styles.color}`}>{title}</p>
        <p className="text-xs text-[#64707d] mt-0.5">{subtitle}</p>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={`shrink-0 ${styles.color}`}>
        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
}

export default function OverviewSection({
  listings,
  bookings,
  kpis,
}: {
  listings: DashboardListing[];
  bookings: DashboardBooking[];
  kpis:     OverviewKPIs;
}) {
  const { t, lang } = useLanguage();
  const upcoming         = bookings.filter((b) => b.status === "upcoming").slice(0, 3);
  const pendingListings  = listings.filter((l) => l.status === "pending_review");
  const rejectedListings = listings.filter((l) => l.status === "rejected");

  const chartData = kpis.earningsHistory.map((m) => ({ month: m.month, payout: m.payout }));

  const todayStr    = new Date().toISOString().split("T")[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const checkIns = bookings.filter((b) =>
    b.status === "upcoming" && (b.checkIn === todayStr || b.checkIn === tomorrowStr)
  );
  const newRequests = bookings.filter((b) => b.status === "upcoming").length;

  const pendingAlertTitle = pendingListings.length === 1
    ? t("dash.alert.pending_one")
    : t("dash.alert.pending_many").replace("{count}", String(pendingListings.length));

  const rejectedAlertTitle = rejectedListings.length === 1
    ? t("dash.alert.rejected_one")
    : t("dash.alert.rejected_many").replace("{count}", String(rejectedListings.length));

  const guestsBadge = kpis.upcomingCount === 1
    ? t("dash.guest_singular").replace("{count}", "1")
    : t("dash.guest_plural").replace("{count}", String(kpis.upcomingCount));

  return (
    <div className="flex flex-col gap-6">

      {/* ── Booking announcement cards ── */}
      {(checkIns.length > 0 || newRequests > 0) && (
        <div className="flex flex-col gap-3">
          {checkIns.map((b) => {
            const isToday = b.checkIn === todayStr;
            return (
              <BookingAnnouncementCard
                key={b.id}
                variant={isToday ? "warning" : "info"}
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.7" />
                    <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  </svg>
                }
                title={`${isToday ? t("dash.checkin_today") : t("dash.checkin_tomorrow")}: ${b.guestName}`}
                subtitle={`${getListingText(b.listingTitle, b.listingTitle_ar, lang)} · ${b.nights} ${b.nights !== 1 ? t("dash.bookings.nights") : t("dash.bookings.nights_one")}`}
                href="/dashboard?tab=bookings"
              />
            );
          })}
          {newRequests > 0 && checkIns.length === 0 && (
            <BookingAnnouncementCard
              variant="success"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12l5 5 9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
              title={`${newRequests} ${newRequests !== 1 ? t("dash.bookings.tab_upcoming").toLowerCase() : t("dash.bookings.tab_upcoming").toLowerCase()}`}
              subtitle={t("dash.view_upcoming")}
              href="/dashboard?tab=bookings"
            />
          )}
        </div>
      )}

      {pendingListings.length > 0 && (
        <AlertBanner
          variant="warning"
          title={pendingAlertTitle}
          description={t("dash.alert.pending_desc")}
          dismissible
          storageKey={`bdw:alert:pending:${pendingListings.map((l) => l.id).sort().join(",")}`}
        />
      )}

      {rejectedListings.length > 0 && (
        <AlertBanner
          variant="error"
          title={rejectedAlertTitle}
          description={t("dash.alert.rejected_desc")}
          dismissible
          storageKey={`bdw:alert:rejected:${rejectedListings.map((l) => l.id).sort().join(",")}`}
        />
      )}

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label={t("dash.kpi.total_earnings")}
          value={`SAR ${kpis.totalEarnings.toLocaleString("en-US")}`}
          sub={t("dash.kpi.all_time_payout")}
          delta={kpis.earningsDelta}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
        <KPICard
          label={t("dash.kpi.active_listings")}
          value={String(kpis.activeListings)}
          sub={t("dash.kpi.total_listings").replace("{count}", String(listings.length))}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
        <KPICard
          label={t("dash.kpi.total_bookings")}
          value={String(kpis.totalBookings)}
          sub={t("dash.kpi.upcoming").replace("{count}", String(kpis.upcomingCount))}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
              <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          }
        />
        <KPICard
          label={t("dash.kpi.avg_rating")}
          value={kpis.avgRating.toFixed(2)}
          sub={t("dash.kpi.across_listings")}
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
        <div
          className="lg:col-span-3 bg-white rounded-[18px] overflow-hidden"
          style={{ border: "1px solid var(--border)", boxShadow: "0 2px 12px rgba(70,30,0,0.06)" }}
        >
          <div
            className="px-5 py-3.5 flex items-center justify-between"
            style={{ borderBottom: "1px solid var(--border-light)" }}
          >
            <h2 className="font-display font-semibold text-[#1a0e02] text-[0.9375rem]">{t("dash.upcoming_checkins_title")}</h2>
            <span
              className="text-[10px] font-bold text-[#8b5e38] px-2.5 py-1 rounded-full"
              style={{ background: "linear-gradient(135deg,#fdf5ee 0%,#f0e0c8 100%)", border: "1px solid rgba(196,154,79,0.22)" }}
            >
              {guestsBadge}
            </span>
          </div>
          <div className="px-5 py-2">
            {upcoming.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center mb-1"
                  style={{ background: "linear-gradient(135deg, #f9f1e7 0%, #ede4d4 100%)", color: "#c4b8a8" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.6"/>
                    <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                  </svg>
                </div>
                <p className="text-sm font-medium text-[#64707d]">{t("dash.no_upcoming")}</p>
                <p className="text-xs text-[#a09080]">{t("dash.new_bookings_appear")}</p>
              </div>
            ) : (
              upcoming.map((b) => <UpcomingRow key={b.id} booking={b} />)
            )}
          </div>
        </div>

        {/* Earnings mini chart */}
        <div
          className="lg:col-span-2 bg-white rounded-[18px] px-5 pt-5 pb-4 flex flex-col gap-3"
          style={{ border: "1px solid var(--border)", boxShadow: "0 2px 12px rgba(70,30,0,0.06)" }}
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display font-semibold text-[#1a0e02] text-[0.9375rem]">{t("dash.earnings_trend")}</h2>
              <p className="text-xs text-[#a09080] mt-0.5">{t("dash.last_6_months")}</p>
            </div>
            {kpis.earningsDelta !== 0 && (
              <span
                className="text-[11px] font-bold px-2 py-0.5 rounded-full mt-0.5"
                style={{
                  background: kpis.earningsDelta >= 0 ? "var(--status-success-bg)" : "var(--status-error-bg)",
                  color: kpis.earningsDelta >= 0 ? "var(--status-success-text)" : "var(--status-error-text)",
                }}
              >
                {kpis.earningsDelta >= 0 ? "↑" : "↓"} {Math.abs(kpis.earningsDelta)}%
              </span>
            )}
          </div>
          <MiniBarChart data={chartData} />
          <div
            className="flex items-center justify-between pt-3"
            style={{ borderTop: "1px solid var(--border-light)" }}
          >
            <div>
              <p className="text-eyebrow mb-0.5">{t("dash.this_month")}</p>
              <p className="font-display font-extrabold text-[#8b5e38] text-[1.2rem] leading-none">
                SAR {kpis.thisMonth.toLocaleString("en-US")}
              </p>
            </div>
            <div className="text-right">
              <p className="text-eyebrow mb-0.5">{t("dash.vs_last_month")}</p>
              <p
                className="font-bold text-base leading-none"
                style={{ color: kpis.earningsDelta >= 0 ? "var(--status-success-text)" : "var(--status-error-text)" }}
              >
                {kpis.earningsDelta >= 0 ? "+" : ""}{kpis.earningsDelta}%
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Listing status quick-view */}
      <div
        className="bg-white rounded-[18px] overflow-hidden"
        style={{ border: "1px solid var(--border)", boxShadow: "0 2px 12px rgba(70,30,0,0.06)" }}
      >
        <div
          className="px-5 py-3.5"
          style={{ borderBottom: "1px solid var(--border-light)" }}
        >
          <h2 className="font-display font-semibold text-[#1a0e02] text-[0.9375rem]">{t("dash.listing_status")}</h2>
        </div>
        <div className="divide-y divide-[#f0e8de]">
          {listings
            .filter((l) => l.status !== "draft")
            .map((listing) => (
              <div key={listing.id} className="flex items-center gap-4 px-5 py-3">
                {listing.imageUrl ? (
                  <img
                    src={listing.imageUrl}
                    alt={listing.title}
                    className="w-12 h-10 rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <div className="w-12 h-10 rounded-lg bg-[#f0e8de] shrink-0 flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-[#c4b8a8]">
                      <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.4" />
                      <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.4" />
                      <path d="M21 15l-5-5-4 4-2-2-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1a0e02] truncate">{getListingText(listing.title, listing.title_ar, lang)}</p>
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
