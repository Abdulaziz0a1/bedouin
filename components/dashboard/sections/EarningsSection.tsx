"use client";

import { type EarningsMonth } from "@/lib/data/dashboard";
import { useLanguage } from "@/context/LanguageProvider";

function BarChart({ data }: { data: EarningsMonth[] }) {
  const { t } = useLanguage();

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-[#fdf5ee] flex items-center justify-center text-[#8b5e38]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-[#1a0e02]">{t("dash.earnings.no_earnings")}</p>
        <p className="text-xs text-[#64707d]">{t("dash.earnings.no_earnings_desc")}</p>
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
          <span className="text-[#64707d]">{t("dash.earnings.guest_paid")}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-[#8b5e38]" />
          <span className="text-[#64707d]">{t("dash.earnings.your_payout")}</span>
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
  const { t } = useLanguage();

  const totalGross    = earningsHistory.reduce((s, m) => s + m.gross,    0);
  const totalPayout   = earningsHistory.reduce((s, m) => s + m.payout,   0);
  const totalBookings = earningsHistory.reduce((s, m) => s + m.bookings, 0);
  const beduoinFee    = totalGross - totalPayout;

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div>
        <h2 className="font-display font-semibold text-[#1a0e02] text-lg">{t("dash.earnings.title")}</h2>
        <p className="text-xs text-[#64707d] mt-0.5">{t("dash.earnings.subtitle")}</p>
      </div>

      {/* Summary KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { labelKey: "dash.earnings.total_payout",   value: `SAR ${totalPayout.toLocaleString("en-US")}`,  subKey: "dash.earnings.6months" },
          { labelKey: "dash.earnings.guest_payments", value: `SAR ${totalGross.toLocaleString("en-US")}`,   subKey: "dash.earnings.6months" },
          { labelKey: "dash.earnings.bedouin_fee",    value: `SAR ${beduoinFee.toLocaleString("en-US")}`,   subKey: "dash.earnings.fee_pct" },
          { labelKey: "dash.earnings.bookings",       value: String(totalBookings),                          subKey: "dash.earnings.6months" },
        ].map((kpi) => (
          <div key={kpi.labelKey} className="bg-white border border-[#e8dfd4] rounded-2xl p-4">
            <p className="font-display font-extrabold text-[#1a0e02] text-xl">{kpi.value}</p>
            <p className="text-[10px] text-[#a09080] mt-0.5">{t(kpi.subKey)}</p>
            <p className="text-[10px] font-bold text-[#64707d] uppercase tracking-widest mt-1">{t(kpi.labelKey)}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white border border-[#e8dfd4] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-semibold text-[#1a0e02]">{t("dash.earnings.monthly")}</h3>
          <p className="text-xs text-[#64707d]">
            {t("dash.earnings.this_month_label")} <span className="font-bold text-[#8b5e38]">SAR {kpis.thisMonth.toLocaleString("en-US")}</span>
          </p>
        </div>
        <BarChart data={earningsHistory} />
      </div>

      {/* Fee breakdown explainer */}
      <div className="bg-[#faf7f4] border border-[#f0e8de] rounded-2xl p-5">
        <h3 className="font-display font-semibold text-[#1a0e02] mb-3 text-sm">{t("dash.earnings.payout_calc")}</h3>
        <div className="flex flex-col gap-2">
          {[
            { labelKey: "dash.earnings.you_list_at",   noteKey: "dash.earnings.list_note",     color: "text-[#1a0e02]"           },
            { labelKey: "dash.earnings.platform_fee",  noteKey: "dash.earnings.platform_note", color: "text-[#64707d]"           },
            { labelKey: "dash.earnings.service_fee",   noteKey: "dash.earnings.service_note",  color: "text-[#64707d]"           },
            { labelKey: "dash.earnings.you_receive",   noteKey: "dash.earnings.receive_note",  color: "text-[#049153] font-bold" },
          ].map((row) => (
            <div key={row.labelKey} className="flex items-center justify-between text-sm">
              <span className="text-[#64707d]">{t(row.labelKey)}</span>
              <span className={row.color}>{t(row.noteKey)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Payout history */}
      <div className="bg-white border border-[#e8dfd4] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#f0e8de]">
          <h3 className="font-display font-semibold text-[#1a0e02]">{t("dash.earnings.payout_history")}</h3>
          <p className="text-xs text-[#64707d] mt-0.5">{t("dash.earnings.payout_bank")}</p>
        </div>

        <div className="flex flex-col items-center text-center py-10 px-6 gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#fdf5ee] flex items-center justify-center text-[#8b5e38]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
              <path d="M2 10h20" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1a0e02]">{t("dash.earnings.no_payouts")}</p>
            <p className="text-xs text-[#64707d] mt-0.5 max-w-xs leading-relaxed">
              {t("dash.earnings.no_payouts_desc")}
            </p>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-[#f0e8de] bg-[#faf7f4]">
          <p className="text-xs text-[#64707d]">
            {t("dash.earnings.update_bank")}{" "}
            <button className="text-[#8b5e38] font-semibold hover:underline">{t("dash.earnings.contact_support")}</button>
          </p>
        </div>
      </div>

    </div>
  );
}
