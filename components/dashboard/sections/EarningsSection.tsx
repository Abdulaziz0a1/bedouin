"use client";

import {
  MOCK_EARNINGS_HISTORY,
  MOCK_PAYOUTS,
  getDashboardKPIs,
  type EarningsMonth,
  type PayoutRecord,
} from "@/lib/data/dashboard";

function BarChart({ data }: { data: EarningsMonth[] }) {
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

function PayoutStatusChip({ status }: { status: PayoutRecord["status"] }) {
  const cfg = {
    paid:       { label: "Paid",       cls: "bg-[#f0faf5] text-[#049153] border-[#c3e8d6]" },
    processing: { label: "Processing", cls: "bg-[#fdf8ee] text-[#8b6a1f] border-[#ead9a6]" },
    scheduled:  { label: "Scheduled",  cls: "bg-[#f4f6f8] text-[#64707d] border-[#dddfe3]" },
  }[status];
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

function PayoutRow({ payout }: { payout: PayoutRecord }) {
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="flex items-center gap-4 py-3.5 border-b last:border-0 border-[#f0e8de]">
      <div className="w-9 h-9 rounded-xl bg-[#fdf5ee] flex items-center justify-center shrink-0">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#8b5e38]">
          <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M2 10h20" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#1a0e02]">{fmtDate(payout.date)}</p>
        <p className="text-xs text-[#64707d]">{payout.method} · {payout.reference}</p>
      </div>
      <div className="text-right shrink-0 flex flex-col items-end gap-1">
        <p className="font-display font-bold text-[#1a0e02]">SAR {payout.amount.toLocaleString()}</p>
        <PayoutStatusChip status={payout.status} />
      </div>
    </div>
  );
}

export default function EarningsSection() {
  const kpis = getDashboardKPIs();

  const totalGross  = MOCK_EARNINGS_HISTORY.reduce((s, m) => s + m.gross,  0);
  const totalPayout = MOCK_EARNINGS_HISTORY.reduce((s, m) => s + m.payout, 0);
  const totalBookings = MOCK_EARNINGS_HISTORY.reduce((s, m) => s + m.bookings, 0);
  const beduoinFee  = totalGross - totalPayout;

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
          { label: "Total payout",   value: `SAR ${totalPayout.toLocaleString()}`,  sub: "6 months"   },
          { label: "Guest payments", value: `SAR ${totalGross.toLocaleString()}`,   sub: "6 months"   },
          { label: "Bedouin fee",    value: `SAR ${beduoinFee.toLocaleString()}`,   sub: "8% of gross" },
          { label: "Bookings",       value: String(totalBookings),                  sub: "6 months"   },
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
            This month: <span className="font-bold text-[#8b5e38]">SAR {kpis.thisMonth.toLocaleString()}</span>
          </p>
        </div>
        <BarChart data={MOCK_EARNINGS_HISTORY} />
      </div>

      {/* Fee breakdown explainer */}
      <div className="bg-[#faf7f4] border border-[#f0e8de] rounded-2xl p-5">
        <h3 className="font-display font-semibold text-[#1a0e02] mb-3 text-sm">How your payout is calculated</h3>
        <div className="flex flex-col gap-2">
          {[
            { label: "Guest pays",         note: "Listing price × nights",    color: "text-[#1a0e02]" },
            { label: "Bedouin earns",      note: "8% platform fee",           color: "text-[#64707d]" },
            { label: "Service fee (guest)",note: "12% added to guest total",  color: "text-[#64707d]" },
            { label: "You receive",        note: "92% of your listed price",  color: "text-[#049153] font-bold" },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between text-sm">
              <span className="text-[#64707d]">{row.label}</span>
              <span className={row.color}>{row.note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Payout history */}
      <div className="bg-white border border-[#e8dfd4] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#f0e8de]">
          <h3 className="font-display font-semibold text-[#1a0e02]">Payout history</h3>
          <p className="text-xs text-[#64707d] mt-0.5">Transferred to your registered bank account</p>
        </div>
        <div className="px-5 py-2">
          {MOCK_PAYOUTS.map((p) => (
            <PayoutRow key={p.id} payout={p} />
          ))}
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
