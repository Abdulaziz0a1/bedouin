"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { SavedListing } from "@/lib/types/user";
import RatingBadge from "@/components/ui/RatingBadge";
import UserEmptyState from "../shared/UserEmptyState";

type SortOrder = "recent" | "price_asc" | "price_desc" | "rating";

function SavedCard({ listing, onRemove }: { listing: SavedListing; onRemove: (id: string) => void }) {
  const discountPct =
    listing.originalPrice && listing.originalPrice > listing.price
      ? Math.round(((listing.originalPrice - listing.price) / listing.originalPrice) * 100)
      : 0;

  const savedDate = new Date(listing.savedAt).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <div className="bg-white border border-[#e8dfd4] rounded-2xl overflow-hidden flex flex-col group hover:shadow-[0_8px_32px_rgba(70,30,0,0.1)] hover:-translate-y-0.5 transition-all duration-300">
      {/* Image */}
      <Link href={`/listing/${listing.listingId}`} className="relative block w-full h-[190px] overflow-hidden">
        <Image
          src={listing.imageUrl || "https://picsum.photos/seed/bedouin-placeholder/600/400"}
          alt={listing.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(min-width: 1280px) 296px, (min-width: 768px) 50vw, 100vw"
        />
        {discountPct > 0 && (
          <span className="absolute top-3 left-3 text-[11px] font-bold text-white bg-red-500 px-2.5 py-1 rounded-xl shadow-sm">
            {discountPct}% off
          </span>
        )}
        {/* Remove button */}
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); onRemove(listing.id); }}
          aria-label="Remove from saved"
          className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 21S3 14 3 8.5C3 5.42 5.42 3 8.5 3 10.24 3 11.91 3.81 13 5.09 14.09 3.81 15.76 3 17.5 3 20.58 3 23 5.42 23 8.5 23 14 12 21 12 21z"
              stroke="#c0392b"
              fill="#c0392b"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </Link>

      {/* Body */}
      <div className="flex flex-col gap-2 px-4 pt-3.5 pb-4 flex-1">
        <RatingBadge score={listing.score} reviewCount={listing.reviewCount} />

        <Link href={`/listing/${listing.listingId}`}>
          <h3 className="font-display font-semibold text-[#1a0e02] text-[1rem] leading-snug mt-0.5 line-clamp-2 hover:text-[#8b5e38] transition-colors">
            {listing.title}
          </h3>
        </Link>

        <div className="flex items-center gap-1 text-[#64707d] text-sm">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
          </svg>
          <span className="truncate">{listing.location}</span>
        </div>

        {listing.tags && listing.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {listing.tags.slice(0, 3).map((tag: string) => (
              <span
                key={tag}
                className="text-[10px] font-medium text-[#8b5e38] bg-[#fdf5ee] border border-[#f0dcc8] px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Price */}
        <div className="mt-auto pt-3 border-t border-[#f0e8de] flex items-center justify-between">
          <span className="text-[#64707d] text-xs">{listing.priceUnit}</span>
          <div className="flex items-baseline gap-1.5">
            {listing.originalPrice && (
              <span className="text-[#a09080] text-sm line-through">SAR {listing.originalPrice}</span>
            )}
            <span className="font-display font-bold text-[#1a0e02] text-lg">SAR {listing.price}</span>
          </div>
        </div>

        {/* Saved date */}
        <p className="text-[10px] text-[#a09080]">Saved {savedDate}</p>
      </div>
    </div>
  );
}

export default function UserSavedSection({ initialItems = [] }: { initialItems?: SavedListing[] }) {
  const [items, setItems]       = useState<SavedListing[]>(initialItems);
  const [sort, setSort]         = useState<SortOrder>("recent");

  const sorted = [...items].sort((a, b) => {
    if (sort === "price_asc")  return a.price - b.price;
    if (sort === "price_desc") return b.price - a.price;
    if (sort === "rating")     return b.score - a.score;
    // recent: by savedAt descending
    return b.savedAt.localeCompare(a.savedAt);
  });

  const handleRemove = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-semibold text-[#1a0e02] text-lg">Saved Places</h2>
          <p className="text-xs text-[#64707d] mt-0.5">
            {items.length} listing{items.length !== 1 ? "s" : ""} in your wishlist
          </p>
        </div>
        <Link
          href="/explore"
          className="flex items-center gap-2 px-4 py-2.5 border border-[#e8dfd4] text-[#1a0e02] text-sm font-semibold rounded-xl hover:border-[#8b5e38] hover:text-[#8b5e38] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.8" />
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          Explore more
        </Link>
      </div>

      {/* Sort */}
      {items.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-[#64707d] font-medium shrink-0">Sort by:</span>
          {(
            [
              { id: "recent",     label: "Recently saved" },
              { id: "price_asc",  label: "Price: Low–High" },
              { id: "price_desc", label: "Price: High–Low" },
              { id: "rating",     label: "Highest rated"  },
            ] as { id: SortOrder; label: string }[]
          ).map((s) => (
            <button
              key={s.id}
              onClick={() => setSort(s.id)}
              className={[
                "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all",
                sort === s.id
                  ? "bg-[#1a0e02] text-white"
                  : "bg-white border border-[#e8dfd4] text-[#64707d] hover:border-[#8b5e38]",
              ].join(" ")}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Info banner when items have been removed */}
      {items.length === 0 ? (
        <UserEmptyState
          icon={
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 21S3 14 3 8.5C3 5.42 5.42 3 8.5 3 10.24 3 11.91 3.81 13 5.09 14.09 3.81 15.76 3 17.5 3 20.58 3 23 5.42 23 8.5 23 14 12 21 12 21z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
          title="Your wishlist is empty"
          description="Tap the heart on any listing to save it here for later."
          action={{ label: "Explore experiences", href: "/explore" }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {sorted.map((listing) => (
            <SavedCard key={listing.id} listing={listing} onRemove={handleRemove} />
          ))}
        </div>
      )}

      {/* Tip */}
      {items.length > 0 && (
        <p className="text-xs text-[#64707d] flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          Tap the heart icon on a card to remove it from your saved places.
        </p>
      )}
    </div>
  );
}
