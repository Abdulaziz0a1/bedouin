"use client";

import Image from "next/image";
import Link from "next/link";
import type { SavedListing } from "@/lib/types/user";
import { useLanguage } from "@/context/LanguageProvider";
import { getListingText } from "@/lib/utils/listing-locale";

interface WishlistCardProps {
  listing: SavedListing;
  onRemove: (id: string) => void;
  /** "grid" = standard card  |  "list" = horizontal row */
  layout?: "grid" | "list";
}

function StarIcon({ filled }: { filled?: boolean }) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill={filled ? "#c49a4f" : "none"}>
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        stroke="#c49a4f"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Converts a 0–10 score to a filled-star display (5-star scale) */
function ScoreStars({ score }: { score: number }) {
  const stars = Math.round((score / 10) * 5);
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon key={i} filled={i < stars} />
      ))}
    </div>
  );
}

function HeartButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick(); }}
      aria-label="Remove from wishlist"
      className="group/heart absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 active:scale-95 transition-transform"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="transition-colors">
        <path
          d="M12 21S3 14 3 8.5C3 5.42 5.42 3 8.5 3 10.24 3 11.91 3.81 13 5.09 14.09 3.81 15.76 3 17.5 3 20.58 3 23 5.42 23 8.5 23 14 12 21 12 21z"
          stroke="#c0392b"
          fill="#c0392b"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="group-hover/heart:fill-white group-hover/heart:stroke-[#8b5e38] transition-colors"
        />
      </svg>
    </button>
  );
}

export default function WishlistCard({ listing, onRemove, layout = "grid" }: WishlistCardProps) {
  const { lang } = useLanguage();
  const discountPct =
    listing.originalPrice && listing.originalPrice > listing.price
      ? Math.round(((listing.originalPrice - listing.price) / listing.originalPrice) * 100)
      : 0;

  const savedDate = new Date(listing.savedAt).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });

  if (layout === "list") {
    return (
      <div className="bg-white border border-[#e8dfd4] rounded-2xl overflow-hidden flex group hover:shadow-[0_6px_24px_rgba(70,30,0,0.10)] hover:-translate-y-0.5 transition-all duration-300">

        {/* Image */}
        <Link href={`/listing/${listing.listingId}`} className="relative shrink-0 w-40 sm:w-52">
          <Image
            src={listing.imageUrl}
            alt={listing.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(min-width: 640px) 208px, 160px"
          />
          {discountPct > 0 && (
            <span className="absolute top-2 left-2 text-[10px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-lg shadow-sm z-10">
              {discountPct}% off
            </span>
          )}
          <span className="absolute bottom-2 left-2 text-[10px] font-bold text-white bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full z-10">
            {listing.category}
          </span>
          <HeartButton onClick={() => onRemove(listing.id)} />
        </Link>

        {/* Body */}
        <div className="flex-1 min-w-0 flex flex-col gap-2 p-4">

          {/* Rating + saved date */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <ScoreStars score={listing.score} />
              <span className="text-xs font-semibold text-[#c49a4f]">{listing.score.toFixed(1)}</span>
              <span className="text-[10px] text-[#a09080]">({listing.reviewCount})</span>
            </div>
            <span className="text-[10px] text-[#a09080] shrink-0">Saved {savedDate}</span>
          </div>

          {/* Title */}
          <Link href={`/listing/${listing.listingId}`}>
            <h3 className="font-display font-semibold text-[#1a0e02] leading-snug line-clamp-1 hover:text-[#8b5e38] transition-colors">
              {getListingText(listing.title, listing.title_ar, lang)}
            </h3>
          </Link>

          {/* Location */}
          <p className="text-xs text-[#64707d] flex items-center gap-1 truncate">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
            </svg>
            {getListingText(listing.location, listing.location_ar, lang)}
          </p>

          {/* Tags */}
          {listing.tags && listing.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
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

          {/* Price + actions */}
          <div className="mt-auto flex items-center justify-between gap-3 pt-3 border-t border-[#f0e8de]">
            <div className="flex items-baseline gap-1.5">
              {listing.originalPrice && (
                <span className="text-[#a09080] text-xs line-through">SAR {listing.originalPrice}</span>
              )}
              <span className="font-display font-bold text-[#1a0e02] text-lg">SAR {listing.price}</span>
              <span className="text-[#64707d] text-xs">{listing.priceUnit}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/listing/${listing.listingId}`}
                className="px-3 py-1.5 border border-[#e8dfd4] rounded-xl text-xs font-semibold text-[#64707d] hover:border-[#8b5e38] hover:text-[#8b5e38] transition-colors"
              >
                View
              </Link>
              <Link
                href={`/booking/${listing.listingId}`}
                className="px-3 py-1.5 bg-[#8b5e38] text-white rounded-xl text-xs font-semibold hover:bg-[#7a5030] transition-colors"
              >
                Book
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid layout
  return (
    <div className="bg-white border border-[#e8dfd4] rounded-2xl overflow-hidden flex flex-col group hover:shadow-[0_8px_32px_rgba(70,30,0,0.12)] hover:-translate-y-0.5 transition-all duration-300">

      {/* Image */}
      <Link href={`/listing/${listing.listingId}`} className="relative w-full h-[200px] overflow-hidden block">
        <Image
          src={listing.imageUrl}
          alt={listing.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(min-width: 1280px) 380px, (min-width: 768px) 50vw, 100vw"
        />

        {/* Category chip */}
        <span className="absolute bottom-3 left-3 text-[10px] font-bold text-white bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full z-10">
          {listing.category}
        </span>

        {/* Discount badge */}
        {discountPct > 0 && (
          <span className="absolute top-3 left-3 text-[11px] font-bold text-white bg-red-500 px-2.5 py-1 rounded-xl shadow-sm z-10">
            {discountPct}% off
          </span>
        )}

        {/* Heart remove button */}
        <HeartButton onClick={() => onRemove(listing.id)} />
      </Link>

      {/* Body */}
      <div className="flex flex-col gap-2.5 px-4 pt-3.5 pb-4 flex-1">

        {/* Score + saved date */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <ScoreStars score={listing.score} />
            <span className="text-xs font-semibold text-[#c49a4f]">{listing.score.toFixed(1)}</span>
            <span className="text-[10px] text-[#a09080]">({listing.reviewCount})</span>
          </div>
          <span className="text-[10px] text-[#a09080] shrink-0">Saved {savedDate}</span>
        </div>

        {/* Title */}
        <Link href={`/listing/${listing.listingId}`}>
          <h3 className="font-display font-semibold text-[#1a0e02] text-[0.95rem] leading-snug line-clamp-2 hover:text-[#8b5e38] transition-colors">
            {getListingText(listing.title, listing.title_ar, lang)}
          </h3>
        </Link>

        {/* Location */}
        <p className="text-xs text-[#64707d] flex items-center gap-1 truncate">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
          </svg>
          {getListingText(listing.location, listing.location_ar, lang)}
        </p>

        {/* Tags */}
        {listing.tags && listing.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
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

        {/* Price — pushed to bottom */}
        <div className="mt-auto pt-3 border-t border-[#f0e8de]">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-1.5">
                {listing.originalPrice && (
                  <span className="text-[#a09080] text-xs line-through">SAR {listing.originalPrice}</span>
                )}
                <span className="font-display font-bold text-[#1a0e02] text-lg">SAR {listing.price}</span>
              </div>
              <p className="text-[10px] text-[#a09080]">{listing.priceUnit}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <Link
                href={`/listing/${listing.listingId}`}
                className="px-3 py-1.5 border border-[#e8dfd4] rounded-xl text-[11px] font-semibold text-[#64707d] hover:border-[#8b5e38] hover:text-[#8b5e38] transition-colors"
              >
                View
              </Link>
              <Link
                href={`/booking/${listing.listingId}`}
                className="px-3 py-1.5 bg-[#8b5e38] text-white rounded-xl text-[11px] font-semibold hover:bg-[#7a5030] transition-colors"
              >
                Book
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
