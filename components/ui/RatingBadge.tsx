"use client";

import { useLanguage } from "@/context/LanguageProvider";

interface RatingBadgeProps {
  score: number;
  reviewCount: number;
  className?: string;
}

function tierKeys(score: number): { labelKey: string; color: string; bg: string } {
  if (score >= 4.8) return { labelKey: "rating.excellent", color: "#7a4e2c", bg: "rgba(177,122,80,0.12)" };
  if (score >= 4.3) return { labelKey: "rating.very_good", color: "#8b5e38", bg: "rgba(196,154,79,0.10)" };
  return               { labelKey: "rating.good",      color: "#9b6a42", bg: "rgba(196,154,79,0.08)" };
}

export default function RatingBadge({ score, reviewCount, className = "" }: RatingBadgeProps) {
  const { t } = useLanguage();
  const { labelKey, color, bg } = tierKeys(score);
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {/* Score pill */}
      <div
        className="flex items-center justify-center px-[5px] h-[22px] w-[34px] shrink-0"
        style={{
          borderRadius: "8px 5px 5px 8px",
          background: bg,
          border: "1px solid rgba(196,154,79,0.22)",
        }}
      >
        <span className="text-[11px] font-bold leading-none" style={{ color }}>
          {score.toFixed(1)}
        </span>
      </div>
      {/* Label + reviews */}
      <div className="flex flex-col leading-none gap-[2px]">
        <span className="text-[11px] font-semibold" style={{ color }}>{t(labelKey)}</span>
        <span className="text-[10px] text-[#8b94a4] font-normal">{reviewCount} {t("card.reviews")}</span>
      </div>
    </div>
  );
}
