"use client";

import Link from "next/link";
import Image from "next/image";
import type { RecommendedListing } from "@/lib/data/wishlist";

interface WishlistEmptyProps {
  recommended: RecommendedListing[];
}

function RecommendedCard({ listing }: { listing: RecommendedListing }) {
  const discountPct =
    listing.originalPrice && listing.originalPrice > listing.price
      ? Math.round(((listing.originalPrice - listing.price) / listing.originalPrice) * 100)
      : 0;

  const BADGE_COLORS: Record<string, string> = {
    Trending: "bg-[#0046cc]",
    Deal:     "bg-red-500",
    New:      "bg-[#049153]",
  };

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="bg-white border border-[#e8dfd4] rounded-2xl overflow-hidden flex flex-col group hover:shadow-[0_8px_28px_rgba(70,30,0,0.11)] hover:-translate-y-0.5 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative w-full h-[180px] overflow-hidden">
        <Image
          src={listing.imageUrl}
          alt={listing.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
        />
        <span className="absolute bottom-2 left-2 text-[10px] font-bold text-white bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full z-10">
          {listing.category}
        </span>
        {listing.badge && (
          <span className={`absolute top-2 left-2 text-[10px] font-bold text-white px-2.5 py-1 rounded-xl z-10 ${BADGE_COLORS[listing.badge] ?? "bg-[#8b5e38]"}`}>
            {listing.badge}
          </span>
        )}
        {discountPct > 0 && !listing.badge && (
          <span className="absolute top-2 left-2 text-[10px] font-bold text-white bg-red-500 px-2.5 py-1 rounded-xl z-10">
            {discountPct}% off
          </span>
        )}
      </div>

      {/* Body */}
      <div className="px-4 pt-3 pb-4 flex flex-col gap-1.5 flex-1">
        <h3 className="font-display font-semibold text-[#1a0e02] text-sm leading-snug line-clamp-2 group-hover:text-[#8b5e38] transition-colors">
          {listing.title}
        </h3>
        <p className="text-xs text-[#64707d] flex items-center gap-1 truncate">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
          </svg>
          {listing.location}
        </p>
        <div className="mt-auto pt-2.5 border-t border-[#f0e8de] flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            {listing.originalPrice && (
              <span className="text-[#a09080] text-xs line-through">SAR {listing.originalPrice}</span>
            )}
            <span className="font-display font-bold text-[#1a0e02]">SAR {listing.price}</span>
          </div>
          <div className="flex items-center gap-0.5 text-[#c49a4f]">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="text-xs font-semibold">{listing.score.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function WishlistEmpty({ recommended }: WishlistEmptyProps) {
  return (
    <div className="flex flex-col items-center gap-10">

      {/* Empty state illustration area */}
      <div className="flex flex-col items-center text-center py-10 px-4">
        {/* Decorative compass / heart icon */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full bg-[#f0e8de] flex items-center justify-center">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" className="text-[#c49a4f]">
              <path
                d="M12 21S3 14 3 8.5C3 5.42 5.42 3 8.5 3 10.24 3 11.91 3.81 13 5.09 14.09 3.81 15.76 3 17.5 3 20.58 3 23 5.42 23 8.5 23 14 12 21 12 21z"
                stroke="currentColor"
                fill="none"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          {/* Accent dots */}
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#c49a4f] opacity-60" />
          <div className="absolute -bottom-2 -left-2 w-3 h-3 rounded-full bg-[#8b5e38] opacity-40" />
        </div>

        <h2 className="font-display font-extrabold text-[#1a0e02] text-2xl mb-2">
          Your wishlist is empty
        </h2>
        <p className="text-[#64707d] text-sm max-w-sm leading-relaxed mb-6">
          Tap the heart on any listing while exploring to save it here.
          Build your personal collection of Saudi experiences.
        </p>

        <Link
          href="/explore"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a0e02] text-white font-semibold text-sm rounded-2xl hover:bg-[#2d1a0a] transition-colors shadow-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.8" />
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          Start exploring
        </Link>
      </div>

      {/* Recommended section */}
      {recommended.length > 0 && (
        <div className="w-full">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[#c49a4f] text-[10px] font-bold uppercase tracking-[0.16em] mb-1">Discover</p>
              <h3 className="font-display font-semibold text-[#1a0e02] text-lg">Places you might love</h3>
            </div>
            <Link
              href="/explore"
              className="text-sm font-semibold text-[#8b5e38] hover:underline flex items-center gap-1"
            >
              See all
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {recommended.map((listing) => (
              <RecommendedCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
