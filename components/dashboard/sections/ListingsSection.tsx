"use client";

import { useState } from "react";
import type { DashboardListing } from "@/lib/data/dashboard";
import StatusBadge from "../shared/StatusBadge";
import DashboardEmptyState from "../shared/DashboardEmptyState";

type Filter = "all" | "approved" | "pending_review" | "rejected" | "draft";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all",            label: "All"       },
  { id: "approved",       label: "Live"      },
  { id: "pending_review", label: "In Review" },
  { id: "rejected",       label: "Rejected"  },
  { id: "draft",          label: "Draft"     },
];

function RejectionNotice({ reason }: { reason: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="text-xs font-semibold text-red-700 flex items-center gap-1.5">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Why was this rejected?
        </span>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          className={`text-red-500 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <p className="text-xs text-red-600 mt-2 leading-relaxed">{reason}</p>
      )}
    </div>
  );
}

function ListingCard({ listing }: { listing: DashboardListing }) {
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  const isLive     = listing.status === "approved";
  const isRejected = listing.status === "rejected";
  const isPending  = listing.status === "pending_review";

  return (
    <div className="bg-white border border-[#e8dfd4] rounded-2xl overflow-hidden">
      {/* Image */}
      <div className="relative">
        <img
          src={listing.imageUrl}
          alt={listing.title}
          className="w-full h-44 object-cover"
        />
        <div className="absolute top-3 left-3">
          <StatusBadge status={listing.status} />
        </div>
        {listing.originalPrice && listing.originalPrice > listing.price && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            {Math.round(((listing.originalPrice - listing.price) / listing.originalPrice) * 100)}% off
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-display font-semibold text-[#1a0e02] text-sm leading-snug">{listing.title}</h3>
        </div>
        <p className="text-xs text-[#64707d] mb-3">
          {listing.category} · {listing.region} · {listing.location}
        </p>

        {/* Price */}
        <div className="flex items-center gap-2 mb-4">
          {listing.originalPrice && listing.originalPrice > listing.price && (
            <span className="text-[#a09080] text-xs line-through">SAR {listing.originalPrice}</span>
          )}
          <span className="font-display font-extrabold text-[#1a0e02] text-lg">SAR {listing.price}</span>
          <span className="text-xs text-[#64707d]">{listing.priceUnit}</span>
        </div>

        {/* Stats row — only if live */}
        {isLive && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-[#faf7f4] rounded-xl px-3 py-2 text-center">
              <p className="font-bold text-[#1a0e02] text-sm">{listing.totalBookings}</p>
              <p className="text-[9px] text-[#64707d] uppercase tracking-wide font-bold mt-0.5">Bookings</p>
            </div>
            <div className="bg-[#faf7f4] rounded-xl px-3 py-2 text-center">
              <p className="font-bold text-[#1a0e02] text-sm">SAR {(listing.totalEarned / 1000).toFixed(1)}k</p>
              <p className="text-[9px] text-[#64707d] uppercase tracking-wide font-bold mt-0.5">Earned</p>
            </div>
            <div className="bg-[#faf7f4] rounded-xl px-3 py-2 text-center">
              <div className="flex items-center justify-center gap-0.5">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#c49a4f">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <p className="font-bold text-[#1a0e02] text-sm">{listing.avgRating.toFixed(1)}</p>
              </div>
              <p className="text-[9px] text-[#64707d] uppercase tracking-wide font-bold mt-0.5">{listing.reviewCount} reviews</p>
            </div>
          </div>
        )}

        {/* Pending info */}
        {isPending && (
          <div className="bg-[#fdf8ee] border border-[#ead9a6] rounded-xl px-4 py-3 mb-4">
            <p className="text-xs text-[#8b6a1f] font-medium">
              Submitted {fmtDate(listing.submittedAt)} · Usually approved within 48h
            </p>
          </div>
        )}

        {/* Rejection notice */}
        {isRejected && listing.rejectionReason && (
          <RejectionNotice reason={listing.rejectionReason} />
        )}

        {/* Action buttons */}
        <div className={`flex gap-2 ${isRejected || isPending || isLive ? "mt-4" : "mt-0"}`}>
          {isLive && (
            <a
              href={`/listing/${listing.id}`}
              className="flex-1 py-2 border border-[#e8dfd4] rounded-xl text-xs font-semibold text-[#1a0e02] text-center hover:border-[#8b5e38] hover:text-[#8b5e38] transition-colors"
            >
              View listing
            </a>
          )}
          {isRejected && (
            <a
              href="/host/new"
              className="flex-1 py-2 bg-[#1a0e02] text-white rounded-xl text-xs font-semibold text-center hover:bg-[#2d1a0a] transition-colors"
            >
              Edit & resubmit
            </a>
          )}
          {isPending && (
            <span className="flex-1 py-2 border border-[#e8dfd4] rounded-xl text-xs font-semibold text-[#a09080] text-center cursor-default">
              Awaiting review…
            </span>
          )}
          <button className="px-3 py-2 border border-[#e8dfd4] rounded-xl text-xs font-semibold text-[#64707d] hover:border-[#8b5e38] hover:text-[#8b5e38] transition-colors">
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ListingsSection({ listings }: { listings: DashboardListing[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered =
    filter === "all"
      ? listings
      : listings.filter((l) => l.status === filter);

  const counts: Record<Filter, number> = {
    all:            listings.length,
    approved:       listings.filter((l) => l.status === "approved").length,
    pending_review: listings.filter((l) => l.status === "pending_review").length,
    rejected:       listings.filter((l) => l.status === "rejected").length,
    draft:          listings.filter((l) => l.status === "draft").length,
  };

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-semibold text-[#1a0e02] text-lg">My Listings</h2>
          <p className="text-xs text-[#64707d] mt-0.5">{listings.length} properties managed</p>
        </div>
        <a
          href="/host/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#8b5e38] text-white text-sm font-semibold rounded-xl hover:bg-[#7a5030] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          Add listing
        </a>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {FILTERS.filter((f) => f.id === "all" || counts[f.id] > 0).map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={[
              "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all",
              filter === f.id
                ? "bg-[#1a0e02] text-white"
                : "bg-white border border-[#e8dfd4] text-[#64707d] hover:border-[#8b5e38]",
            ].join(" ")}
          >
            {f.label}
            {counts[f.id] > 0 && (
              <span className={`ml-1.5 ${filter === f.id ? "opacity-70" : "text-[#a09080]"}`}>
                {counts[f.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <DashboardEmptyState
          icon={
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
          title="No listings here"
          description="You don't have any listings in this category yet."
          action={{ label: "Add your first listing", href: "/host/new" }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
