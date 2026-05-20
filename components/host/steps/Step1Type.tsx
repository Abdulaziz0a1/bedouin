"use client";

import { DraftCategory } from "@/lib/types/host";
import { useLanguage } from "@/context/LanguageProvider";

const TYPES: {
  id: DraftCategory;
  labelKey: string;
  icon: string;
  descKey: string;
}[] = [
  { id: "farms",      labelKey: "host.type.farms",      icon: "🌾", descKey: "host.type.farms.desc" },
  { id: "house",      labelKey: "host.type.house",      icon: "🏛️", descKey: "host.type.house.desc" },
  { id: "guesthouse", labelKey: "host.type.guesthouse", icon: "🏡", descKey: "host.type.guesthouse.desc" },
  { id: "cabins",     labelKey: "host.type.cabins",     icon: "🌲", descKey: "host.type.cabins.desc" },
  { id: "glamping",   labelKey: "host.type.glamping",   icon: "⛺", descKey: "host.type.glamping.desc" },
  { id: "doms",       labelKey: "host.type.doms",       icon: "🔭", descKey: "host.type.doms.desc" },
];

interface Step1TypeProps {
  category:   DraftCategory;
  onChange:   (v: DraftCategory) => void;
  onNext:     () => void;
  isRejected?: boolean;
}

export default function Step1Type({ category, onChange, onNext, isRejected }: Step1TypeProps) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col gap-7">
      {/* Heading */}
      <div>
        <p className="text-[#c49a4f] text-xs font-bold uppercase tracking-[0.16em] mb-2">
          {t("host.step1.eyebrow")}
        </p>
        <h1 className="font-display font-extrabold text-[#1a0e02] text-3xl mb-1">
          {t("host.step1.heading")}
        </h1>
        <p className="text-[#64707d] text-sm">
          {t("host.step1.subtitle")}
        </p>
      </div>

      {/* Type grid */}
      <div className={`rounded-2xl ${isRejected ? "border border-red-300 bg-red-50/20 p-4" : ""}`}>
        {isRejected && (
          <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-4">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="shrink-0">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
              <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            {t("host.admin_feedback")}
          </div>
        )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {TYPES.map((type) => {
          const selected = category === type.id;
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => onChange(type.id)}
              className={[
                "flex items-start gap-4 p-5 border-2 rounded-2xl text-left transition-all duration-200",
                selected
                  ? "border-[#8b5e38] bg-[#fdf5ee] shadow-[0_2px_12px_rgba(139,94,56,0.15)]"
                  : "border-[#e8dfd4] bg-white hover:border-[#c49a4f] hover:bg-[#fdfbf7]",
              ].join(" ")}
            >
              {/* Icon */}
              <span className="text-3xl shrink-0 mt-0.5">{type.icon}</span>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-display font-semibold text-[#1a0e02] text-base">
                    {t(type.labelKey)}
                  </p>
                  {/* Selected indicator */}
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    selected ? "border-[#8b5e38] bg-[#8b5e38]" : "border-[#c4b49a]"
                  }`}>
                    {selected && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12l5 5 9-9"
                          stroke="white" strokeWidth="2.5"
                          strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </div>
                <p className="text-xs text-[#64707d] mt-1 leading-relaxed">{t(type.descKey)}</p>
              </div>
            </button>
          );
        })}
      </div>
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={onNext}
        disabled={!category}
        className="w-full py-4 bg-[#8b5e38] font-bold text-base rounded-2xl hover:bg-[#7a5030] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
        style={{ color: "#fff" }}
      >
        {category
          ? `${t("host.continue")}`
          : t("host.step1.select")}
      </button>
    </div>
  );
}
