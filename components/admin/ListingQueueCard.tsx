"use client";

import type { AdminListing } from "@/lib/types/admin";
import AdminStatusBadge from "./shared/AdminStatusBadge";

interface ListingQueueCardProps {
  listing: AdminListing;
  isSelected: boolean;
  onClick: () => void;
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 3600)       return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)      return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7)  return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function ListingQueueCard({
  listing, isSelected, onClick,
}: ListingQueueCardProps) {
  return (
    <button
      onClick={onClick}
      className={[
        "w-full flex items-start gap-3 px-4 py-3.5 text-left transition-all border-b border-[#f0e8de] last:border-0",
        isSelected
          ? "bg-[#fdf5ee] border-l-[3px] border-l-[#8b5e38]"
          : "hover:bg-[#faf7f4] border-l-[3px] border-l-transparent",
      ].join(" ")}
    >
      {/* Thumbnail */}
      <div className="relative shrink-0 w-14 h-12 rounded-xl overflow-hidden">
        <img
          src={listing.imageUrls[0]}
          alt={listing.title}
          className="w-full h-full object-cover"
        />
        {listing.status === "pending_review" && (
          <div className="absolute inset-0 ring-2 ring-[#c49a4f] ring-inset rounded-xl" />
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1.5 mb-1">
          <p className="text-sm font-semibold text-[#1a0e02] leading-snug line-clamp-1 flex-1">
            {listing.title}
          </p>
          <AdminStatusBadge status={listing.status} size="sm" />
        </div>
        <p className="text-[11px] text-[#64707d] truncate">
          {listing.category} · {listing.region}
        </p>
        <div className="flex items-center justify-between mt-1.5">
          <p className="text-[10px] text-[#a09080] flex items-center gap-1">
            <img
              src={listing.host.avatar}
              alt={listing.host.name}
              className="w-3.5 h-3.5 rounded-full object-cover"
            />
            {listing.host.name.split(" ")[0]}
          </p>
          <p className="text-[10px] text-[#a09080]">{timeAgo(listing.submittedAt)}</p>
        </div>
      </div>
    </button>
  );
}
