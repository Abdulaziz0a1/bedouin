interface RatingBadgeProps {
  score: number;
  reviewCount: number;
  className?: string;
}

function tier(score: number): { label: string; color: string } {
  if (score >= 4.8) return { label: "Excellent",  color: "#0046cc" };
  if (score >= 4.3) return { label: "Very Good",  color: "#003499" };
  return               { label: "Good",        color: "#052461" };
}

export default function RatingBadge({ score, reviewCount, className = "" }: RatingBadgeProps) {
  const { label, color } = tier(score);
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {/* Score pill – Figma asymmetric radius */}
      <div
        className="flex items-center justify-center px-[5px] h-6 w-[34px] bg-[#f1f2f3] shrink-0"
        style={{ borderRadius: "10px 6px 6px 10px" }}
      >
        <span className="text-xs font-bold leading-none" style={{ color }}>
          {score.toFixed(1)}
        </span>
      </div>
      {/* Label + reviews */}
      <div className="flex flex-col leading-none gap-[2px]">
        <span className="text-xs font-semibold" style={{ color }}>{label}</span>
        <span className="text-[10px] text-[#64707d] font-normal">{reviewCount} reviews</span>
      </div>
    </div>
  );
}
