"use client";

import { type EarningsMonth } from "@/lib/data/dashboard";

function BarChart({ data }: { data: EarningsMonth[] }) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-[#fdf5ee] flex items-center justify-center text-[#8b5e38]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-[#1a0e02]">No earnings yet</p>
        <p className="text-xs text-[#64707d]">Monthly data will appear here once you receive your first completed booking.</p>
      </div>
    );
  }

  const maxGross = Math.max(...data.map((d) => d.gross));

  return (
    <div className="flex flex-col gap-3">
      {/* Legend */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-[#e8dfd4]" />
          <span className="text-[#64707d]">Guest paid</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-[#8b5e38]" />
          <span className="text-[#64707d]">Your payout</span>
        </div>
      </div>

      {/* Bars */}
      <div className="flex items-end gap-3 h-40">
        {data.map((d, i) => {
          const grossPct  = maxGross > 0 ? (d.gross  / maxGross) * 100 : 0;
          const payoutPct = maxGross > 0 ? (d.payout / maxGross) * 100 : 0;
          const isLatest = i === data.length - 1;
          return (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5">
              <p className={`text-[10px] font-bold ${isLatest ? "text-[#8b5e38]" : "text-[#64707d]"}`}>
                SAR {(d.payout / 1000).toFixed(1)}k
              </p>
              <div className="w-full flex items-end gap-0.5" style={{ height: "96px" }}>
                <div
                  className="flex-1 rounded-t-md bg-[#e8dfd4] transition-all"
                  style={{ height: `${Math.max(grossPct, 4)}%` }}
                />
                <div
                  className={`flex-1 rounded-t-md transition-all ${isLatest ? "bg-[#8b5e38]" : "bg-[#c49a4f]"}`}
                  style={{ height: `${Math.max(payoutPct, 4)}%` }}
                />
              </div>
              <p className={`text-[10px] ${isLatest ? "text-[#8b5e38] font-bold" : "text-[#a09080]"}`}>{d.month}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function EarningsSection({
  earningsHistory,
  kpis,
}: {
  earningsHistory: EarningsMonth[];
  kpis:            { thisMonth: number; earningsDelta: number };
}) {
  const totalGross    = earningsHistory.reduce((s, m) => s + m.gross,    0);
  const totalPayout   = earningsHistory.reduce((s, m) => s + m.payout,   0);
  const totalBookings = earningsHistory.reduce((s, m) => s + m.bookings, 0);
  const beduoinFee    = totalGross - totalPayout;

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div>
        <h2 className="font-display font-semibold text-[#1a0e02] text-lg">Earnings & Payouts</h2>
        <p className="text-xs text-[#64707d] mt-0.5">Last 6 months · Payouts processed on the 1st of each month</p>
      </div>

      {/* Summary KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total payout",   value: `SAR ${totalPayout.toLocaleString("en-US")}`,  sub: "6 months"           },
          { label: "Guest payments", value: `SAR ${totalGross.toLocaleString("en-US")}`,   sub: "6 months"           },
          { label: "Bedouin fee",    value: `SAR ${beduoinFee.toLocaleString("en-US")}`,   sub: "8% of listed price" },
          { label: "Bookings",       value: String(totalBookings),                  sub: "6 months"           },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white border border-[#e8dfd4] rounded-2xl p-4">
            <p className="font-display font-extrabold text-[#1a0e02] text-xl">{kpi.value}</p>
            <p className="text-[10px] text-[#a09080] mt-0.5">{kpi.sub}</p>
            <p className="text-[10px] font-bold text-[#64707d] uppercase tracking-widest mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white border border-[#e8dfd4] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-semibold text-[#1a0e02]">Monthly breakdown</h3>
          <p className="text-xs text-[#64707d]">
            This month: <span className="font-bold text-[#8b5e38]">SAR {kpis.thisMonth.toLocaleString("en-US")}</span>
          </p>
        </div>
        <BarChart data={earningsHistory} />
      </div>

      {/* Fee breakdown explainer */}
      <div className="bg-[#faf7f4] border border-[#f0e8de] rounded-2xl p-5">
        <h3 className="font-display font-semibold text-[#1a0e02] mb-3 text-sm">How your payout is calculated</h3>
        <div className="flex flex-col gap-2">
          {[
            { label: "You list at",         note: "Price per night × nights",       color: "text-[#1a0e02]"           },
            { label: "Bedouin platform fee",note: "8% of your listed subtotal",     color: "text-[#64707d]"           },
            { label: "Service fee (guest)", note: "12% added on top — guest pays",  color: "text-[#64707d]"           },
            { label: "You receive",         note: "92% of your listed subtotal",    color: "text-[#049153] font-bold" },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between text-sm">
              <span className="text-[#64707d]">{row.label}</span>
              <span className={row.color}>{row.note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Payout history — honest empty state, no mock records */}
      <div className="bg-white border border-[#e8dfd4] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#f0e8de]">
          <h3 className="font-display font-semibold text-[#1a0e02]">Payout history</h3>
          <p className="text-xs text-[#64707d] mt-0.5">Transferred to your registered bank account</p>
        </div>

        {/* Empty state — payout infrastructure not yet live */}
        <div className="flex flex-col items-center text-center py-10 px-6 gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#fdf5ee] flex items-center justify-center text-[#8b5e38]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
              <path d="M2 10h20" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1a0e02]">No payouts yet</p>
            <p className="text-xs text-[#64707d] mt-0.5 max-w-xs leading-relaxed">
              Your first payout will appear here after your first completed and settled booking.
            </p>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-[#f0e8de] bg-[#faf7f4]">
          <p className="text-xs text-[#64707d]">
            Need to update your bank details?{" "}
            <button className="text-[#8b5e38] font-semibold hover:underline">Contact support →</button>
          </p>
        </div>
      </div>

    </div>
  );
}
