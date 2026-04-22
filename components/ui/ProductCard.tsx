"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import RatingBadge from "./RatingBadge";
import { toggleWishlist } from "@/lib/actions/wishlist";

export interface ProductCardProps {
  id: string;
  image: string;
  title: string;
  location: string;
  price: number;
  originalPrice?: number;
  priceUnit?: string;
  score: number;
  reviewCount: number;
  badge?: string;
  badgeColor?: string;
  href?: string;
  tags?: string[];
  /** Override the default fixed-width scroll-row sizing for fluid grid layouts */
  className?: string;
  /** Server-provided initial saved state — avoids a client-side auth check on mount */
  savedByCurrentUser?: boolean;
}

export default function ProductCard({
  id, image, title, location, price, originalPrice,
  priceUnit = "per person", score, reviewCount,
  badge, badgeColor = "#049153", href, tags, className,
  savedByCurrentUser = false,
}: ProductCardProps) {
  const [saved, setSaved]     = useState(savedByCurrentUser);
  const [pending, startTransition] = useTransition();

  return (
    <Link
      href={href ?? `/listing/${id}`}
      className={`bg-white border border-[#e8dfd4] rounded-2xl overflow-hidden flex flex-col group hover:shadow-[0_8px_32px_rgba(70,30,0,0.13)] hover:-translate-y-0.5 transition-all duration-300 ${className ?? "shrink-0 w-[296px]"}`}
      style={{ minHeight: 400 }}
    >
      {/* Image */}
      <div className="relative w-full h-[210px] overflow-hidden">
        <Image
          src={image || "https://picsum.photos/seed/listing-placeholder/600/440"}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(min-width: 1280px) 296px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        />

        {/* Badge overlay */}
        {badge && (
          <span
            className="absolute top-3 left-3 text-[11px] font-bold text-white px-2.5 py-1 rounded-xl shadow-sm"
            style={{ backgroundColor: badgeColor }}
          >
            {badge}
          </span>
        )}

        {/* Wishlist */}
        <button
          aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
          type="button"
          disabled={pending}
          onClick={(e) => {
            e.preventDefault();
            startTransition(async () => {
              const result = await toggleWishlist(id);
              if ("error" in result) {
                if (result.error === "not_authenticated") {
                  window.location.href = `/login?returnTo=${encodeURIComponent(window.location.pathname)}`;
                }
                return;
              }
              setSaved(result.saved);
            });
          }}
          className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center hover:scale-110 transition-transform shadow-sm disabled:opacity-60"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 21S3 14 3 8.5C3 5.42 5.42 3 8.5 3 10.24 3 11.91 3.81 13 5.09 14.09 3.81 15.76 3 17.5 3 20.58 3 23 5.42 23 8.5 23 14 12 21 12 21z"
              stroke={saved ? "#c0392b" : "#8b5e38"}
              fill={saved ? "#c0392b" : "none"}
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2 px-4 pt-3.5 pb-4 flex-1">
        <RatingBadge score={score} reviewCount={reviewCount} />

        <h3 className="font-display font-semibold text-[#1a0e02] text-[1rem] leading-snug mt-0.5 line-clamp-2">
          {title}
        </h3>

        <div className="flex items-center gap-1 text-[#64707d] text-sm">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="shrink-0">
            <path
              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"
              fill="currentColor"
            />
          </svg>
          <span className="truncate">{location}</span>
        </div>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {tags.slice(0, 3).map((tag) => (
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
        <div className="mt-auto pt-3 flex items-center justify-between border-t border-[#f0e8de]">
          <span className="text-[#64707d] text-xs">{priceUnit}</span>
          <div className="flex items-baseline gap-1.5">
            {originalPrice && (
              <span className="text-[#a09080] text-sm line-through">SAR {originalPrice}</span>
            )}
            <span className="font-display font-bold text-[#1a0e02] text-lg">SAR {price}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
