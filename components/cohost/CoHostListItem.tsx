import type { CoHost } from "@/lib/types/cohost";
import { SERVICE_LABELS } from "@/lib/data/cohost";
import CoHostStatusBadge from "./shared/CoHostStatusBadge";
import UserAvatar from "@/components/ui/UserAvatar";

interface Props {
  cohost: CoHost;
  isActive: boolean;
  onClick: () => void;
}

function StarRating({ rating }: { rating: number }) {
  const full  = Math.floor(rating);
  const hasHalf = rating - full >= 0.4;
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="9" height="9" viewBox="0 0 24 24"
          fill={i < full ? "#c49a4f" : hasHalf && i === full ? "url(#half)" : "none"}
          stroke={i < full || (hasHalf && i === full) ? "#c49a4f" : "#d1c5b8"}
          strokeWidth="1.5"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  );
}

export default function CoHostListItem({ cohost, isActive, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={[
        "w-full flex items-start gap-3 px-4 py-3.5 text-left transition-all border-b border-[#f0e8de] last:border-0",
        isActive
          ? "bg-[#fdf5ee] border-l-[3px] border-l-[#8b5e38]"
          : "hover:bg-[#faf7f4] border-l-[3px] border-l-transparent",
      ].join(" ")}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <UserAvatar src={cohost.avatar} name={cohost.name} size={44} className="border-2 border-[#e8dfd4] rounded-full" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-0.5">
          <p className="text-sm font-semibold text-[#1a0e02] truncate">{cohost.name}</p>
          <CoHostStatusBadge status={cohost.status} />
        </div>

        <p className="text-[11px] text-[#8b5e38] font-medium mb-1">
          📍 {cohost.city}  ·  {cohost.yearsExperience}yr exp
        </p>

        <div className="flex items-center gap-2 mb-1.5">
          <StarRating rating={cohost.rating} />
          <span className="text-[10px] text-[#64707d]">{cohost.rating} ({cohost.reviewCount})</span>
        </div>

        <div className="flex flex-wrap gap-1">
          {cohost.services.slice(0, 2).map((s) => (
            <span
              key={s}
              className="text-[9px] font-semibold text-[#64707d] bg-[#f0e8de] px-1.5 py-0.5 rounded-md"
            >
              {SERVICE_LABELS[s]}
            </span>
          ))}
          {cohost.services.length > 2 && (
            <span className="text-[9px] font-semibold text-[#a09080] bg-[#f0e8de] px-1.5 py-0.5 rounded-md">
              +{cohost.services.length - 2}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
