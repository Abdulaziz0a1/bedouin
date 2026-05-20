"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import RatingBadge from "./RatingBadge";
import { toggleWishlist } from "@/lib/actions/wishlist";
import { useLanguage } from "@/context/LanguageProvider";
import { getListingText } from "@/lib/utils/listing-locale";

export interface ProductCardProps {
  id: string;
  image: string;
  title: string;
  title_ar?: string;
  location: string;
  location_ar?: string;
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

const FALLBACK_IMG = "https://picsum.photos/seed/bedouin-listing/600/440";

export default function ProductCard({
  id, image, title, title_ar, location, location_ar, price, originalPrice,
  priceUnit, score, reviewCount,
  badge, badgeColor = "#049153", href, tags, className,
  savedByCurrentUser = false,
}: ProductCardProps) {
  const [saved, setSaved]           = useState(savedByCurrentUser);
  const [pending, startTransition]  = useTransition();
  const [imgSrc, setImgSrc]         = useState(image || FALLBACK_IMG);
  const [imgLoaded, setImgLoaded]   = useState(false);
  const { t, lang } = useLanguage();
  const displayTitle    = getListingText(title, title_ar, lang);
  const displayLocation = getListingText(location, location_ar, lang);

  const displayUnit = priceUnit === "per night" ? t("card.per_night")
                    : priceUnit === "per person" ? t("card.per_person")
                    : priceUnit ?? t("card.per_person");

  return (
    <Link
      href={href ?? `/listing/${id}`}
      className={`relative flex flex-col group ${className ?? "shrink-0 w-[296px]"}`}
      style={{ minHeight: 416 }}
    >
      {/* Card body */}
      <div
        className="flex flex-col flex-1 bg-white rounded-[1.25rem] overflow-hidden"
        style={{
          border: "1px solid rgba(232,223,212,0.85)",
          boxShadow: "0 4px 24px rgba(70,30,0,0.08), 0 1px 4px rgba(70,30,0,0.05)",
          transform: "translateY(0) scale(1)",
          transition: "transform 0.32s cubic-bezier(0.16,1,0.3,1), box-shadow 0.32s cubic-bezier(0.16,1,0.3,1), border-color 0.22s ease",
          willChange: "transform, box-shadow",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.transform = "translateY(-6px) scale(1.004)";
          el.style.boxShadow = "0 22px 60px rgba(70,30,0,0.17), 0 6px 18px rgba(70,30,0,0.09)";
          el.style.borderColor = "rgba(196,154,79,0.42)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.transform = "translateY(0) scale(1)";
          el.style.boxShadow = "0 4px 24px rgba(70,30,0,0.08), 0 1px 4px rgba(70,30,0,0.05)";
          el.style.borderColor = "rgba(232,223,212,0.85)";
        }}
      >
        {/* Image */}
        <div className="relative w-full h-[238px] overflow-hidden bg-[#ede4d6]">
          {/* Skeleton shimmer while image loads */}
          {!imgLoaded && (
            <div className="absolute inset-0 skeleton-img" aria-hidden="true" />
          )}
          <Image
            src={imgSrc}
            alt={title}
            fill
            onLoad={() => setImgLoaded(true)}
            onError={() => { setImgSrc(FALLBACK_IMG); setImgLoaded(true); }}
            className={`object-cover transition-all duration-700 group-hover:scale-[1.08] ${imgLoaded ? "opacity-100" : "opacity-0"}`}
            style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
            sizes="(min-width: 1280px) 296px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />

          {/* Gradient for bottom legibility */}
          <div
            className="absolute inset-x-0 bottom-0 h-20 pointer-events-none"
            style={{ background: "linear-gradient(to top, rgba(6,3,0,0.38) 0%, transparent 100%)" }}
          />

          {/* Badge overlay */}
          {badge && (
            <span
              className="absolute top-3 left-3 text-[10.5px] font-bold text-white px-2.5 py-[5px] rounded-[10px]"
              style={{
                backgroundColor: badgeColor,
                boxShadow: "0 2px 10px rgba(0,0,0,0.28)",
                letterSpacing: "0.01em",
              }}
            >
              {badge}
            </span>
          )}

          {/* Wishlist button */}
          <button
            aria-label={saved ? t("wishlist.remove") : t("wishlist.save")}
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
            className="absolute top-3 right-3 rounded-full w-[34px] h-[34px] flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-90 disabled:opacity-60"
            style={{
              background: saved ? "rgba(192,57,43,0.92)" : "rgba(255,255,255,0.92)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.30)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 21S3 14 3 8.5C3 5.42 5.42 3 8.5 3 10.24 3 11.91 3.81 13 5.09 14.09 3.81 15.76 3 17.5 3 20.58 3 23 5.42 23 8.5 23 14 12 21 12 21z"
                stroke={saved ? "white" : "#8b5e38"}
                fill={saved ? "white" : "none"}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-2 px-4 pt-3.5 pb-4 flex-1">
          <RatingBadge score={score} reviewCount={reviewCount} />

          <h3 className="font-display font-semibold text-[#1a0e02] text-[0.9375rem] leading-snug mt-0.5 line-clamp-2" style={{ letterSpacing: "-0.01em" }}>
            {displayTitle}
          </h3>

          <div className="flex items-center gap-1.5 text-[#8b94a4] text-[0.78rem]">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[#b17a50]">
              <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"
                fill="currentColor"
              />
            </svg>
            <span className="truncate">{displayLocation}</span>
          </div>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-0.5">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-semibold text-[#8b5e38] px-2 py-[3px] rounded-full"
                  style={{
                    background: "rgba(177,122,80,0.09)",
                    border: "1px solid rgba(196,154,79,0.20)",
                    letterSpacing: "0.01em",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Price — pushed to bottom */}
          <div className="mt-auto pt-3 flex items-center justify-between border-t border-[#f0e8de]">
            <span className="text-[#a09080] text-[0.72rem] font-medium">{displayUnit}</span>
            <div className="flex items-baseline gap-1.5">
              {originalPrice && (
                <span className="text-[#bfad9a] text-[0.78rem] line-through">SAR {originalPrice}</span>
              )}
              <span className="font-display font-bold text-[#1a0e02] text-[1.05rem]" style={{ letterSpacing: "-0.01em" }}>SAR {price}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
