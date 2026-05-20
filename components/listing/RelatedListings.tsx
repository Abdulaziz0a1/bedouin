"use client";

import Link from "next/link";
import Image from "next/image";
import { Listing } from "@/lib/data/listings";
import RatingBadge from "@/components/ui/RatingBadge";
import { useLanguage } from "@/context/LanguageProvider";
import { getListingText } from "@/lib/utils/listing-locale";

interface RelatedListingsProps {
  listings: Listing[];
}

export default function RelatedListings({ listings }: RelatedListingsProps) {
  const { t, lang } = useLanguage();
  if (listings.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {listings.map((listing) => (
        <Link
          key={listing.id}
          href={`/listing/${listing.id}`}
          className="bg-white border border-[#e8dfd4] rounded-2xl overflow-hidden flex flex-col group hover:shadow-[0_8px_32px_rgba(70,30,0,0.13)] hover:-translate-y-0.5 transition-all duration-300"
        >
          {/* Image */}
          <div className="relative w-full h-[180px] overflow-hidden">
            <Image
              src={listing.image}
              alt={listing.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            />
            {listing.badge && (
              <span
                className="absolute top-3 left-3 text-[11px] font-bold text-white px-2.5 py-1 rounded-xl shadow-sm"
                style={{ backgroundColor: listing.badgeColor }}
              >
                {listing.badge}
              </span>
            )}
          </div>

          {/* Body */}
          <div className="flex flex-col gap-2 px-4 pt-3 pb-4 flex-1">
            <RatingBadge score={listing.score} reviewCount={listing.reviewCount} />
            <h3 className="font-display font-semibold text-[#1a0e02] text-sm leading-snug line-clamp-2 mt-0.5">
              {getListingText(listing.title, listing.title_ar, lang)}
            </h3>
            <div className="flex items-center gap-1 text-[#64707d] text-xs">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" className="shrink-0">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" fill="currentColor" />
              </svg>
              <span className="truncate">{getListingText(listing.location, listing.location_ar, lang)}</span>
            </div>
            <div className="mt-auto pt-3 border-t border-[#f0e8de] flex items-baseline justify-end gap-1.5">
              {listing.originalPrice && (
                <span className="text-[#a09080] text-xs line-through">SAR {listing.originalPrice}</span>
              )}
              <span className="font-display font-bold text-[#1a0e02] text-base">SAR {listing.price}</span>
              <span className="text-[#64707d] text-xs">{listing.priceUnit ?? t("listing.per_person")}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
