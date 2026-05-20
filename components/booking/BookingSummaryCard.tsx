"use client";

import Image from "next/image";
import { ListingDetail } from "@/lib/data/listing-details";
import { useLanguage } from "@/context/LanguageProvider";
import { getListingText } from "@/lib/utils/listing-locale";

function fmtDate(d: Date, lang: string): string {
  const locale = lang === "ar" ? "ar-SA" : "en-GB";
  return d.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
}

interface BookingSummaryCardProps {
  listing:    ListingDetail;
  checkIn:    Date | null;
  checkOut:   Date | null;
  adults:     number;
  children:   number;
  nights:     number;
  subtotal:   number;
  serviceFee: number;
  total:      number;
}

export default function BookingSummaryCard({
  listing, checkIn, checkOut, adults, children,
  nights, subtotal, serviceFee, total,
}: BookingSummaryCardProps) {
  const { t, lang } = useLanguage();

  const displayTitle    = getListingText(listing.title,    listing.title_ar,    lang);
  const displayLocation = getListingText(listing.location, listing.location_ar, lang);

  const nightLabel = nights === 1 ? t("bsum.night") : t("bsum.nights");
  const adultLabel = adults === 1
    ? t("bsum.adult_one").replace("{n}", String(adults))
    : t("bsum.adult_many").replace("{n}", String(adults));
  const childLabel = children === 1
    ? t("bsum.child_one").replace("{n}", String(children))
    : t("bsum.child_many").replace("{n}", String(children));
  const guestsDisplay = children > 0 ? `${adultLabel}, ${childLabel}` : adultLabel;

  return (
    <div className="bg-white border border-[#e8dfd4] rounded-3xl overflow-hidden shadow-[0_4px_24px_rgba(26,14,2,0.08)]">

      {/* Listing thumbnail + info */}
      <div className="flex gap-3 p-4 border-b border-[#f0e8de]">
        <div className="relative w-[88px] h-[72px] rounded-2xl overflow-hidden shrink-0">
          <Image
            src={listing.images[0]}
            alt={displayTitle}
            fill
            className="object-cover"
            sizes="88px"
          />
        </div>
        <div className="flex flex-col gap-0.5 min-w-0 justify-center">
          {listing.badge && (
            <span
              className="self-start text-[10px] font-bold text-white px-2 py-0.5 rounded-lg leading-none mb-0.5"
              style={{ backgroundColor: listing.badgeColor }}
            >
              {listing.badge}
            </span>
          )}
          <p className="font-display font-semibold text-[#1a0e02] text-sm leading-snug line-clamp-2">
            {displayTitle}
          </p>
          <p className="text-[#64707d] text-xs truncate">{displayLocation}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#c49a4f">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="text-xs font-semibold text-[#1a0e02]">{listing.score.toFixed(1)}</span>
            <span className="text-xs text-[#64707d]">({listing.reviewCount} {t("bsum.reviews")})</span>
          </div>
        </div>
      </div>

      {/* Booking details */}
      <div className="p-5 flex flex-col gap-4">

        {/* Dates + guests */}
        <div className="flex flex-col gap-2.5">
          <h3 className="text-xs font-bold text-[#64707d] uppercase tracking-widest">{t("bsum.details")}</h3>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#faf7f4] rounded-xl px-3 py-2.5">
              <p className="text-[10px] text-[#64707d] mb-0.5 font-medium">{t("bsum.check_in")}</p>
              <p className="text-sm font-semibold text-[#1a0e02]">
                {checkIn ? fmtDate(checkIn, lang) : "—"}
              </p>
            </div>
            <div className="bg-[#faf7f4] rounded-xl px-3 py-2.5">
              <p className="text-[10px] text-[#64707d] mb-0.5 font-medium">{t("bsum.check_out")}</p>
              <p className="text-sm font-semibold text-[#1a0e02]">
                {checkOut ? fmtDate(checkOut, lang) : "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between bg-[#faf7f4] rounded-xl px-3 py-2.5">
            <p className="text-[10px] text-[#64707d] font-medium">{t("bsum.guests")}</p>
            <p className="text-sm font-semibold text-[#1a0e02]">{guestsDisplay}</p>
          </div>
        </div>

        {/* Price breakdown */}
        {nights > 0 && (
          <>
            <div className="h-px bg-[#f0e8de]" />

            <div className="flex flex-col gap-2.5">
              <h3 className="text-xs font-bold text-[#64707d] uppercase tracking-widest">{t("bsum.price_breakdown")}</h3>

              <div className="flex justify-between text-sm">
                <span className="text-[#64707d]">
                  SAR {listing.price.toLocaleString("en-US")} × {nights} {nightLabel}
                </span>
                <span className="text-[#1a0e02] font-medium">SAR {subtotal.toLocaleString("en-US")}</span>
              </div>

              {listing.originalPrice && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#049153] text-xs font-medium">{t("bsum.discount")}</span>
                  <span className="text-[#049153] text-xs font-medium">
                    −SAR {((listing.originalPrice - listing.price) * nights).toLocaleString("en-US")}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-[#64707d]">{t("bsum.service_fee")}</span>
                <span className="text-[#1a0e02] font-medium">SAR {serviceFee.toLocaleString("en-US")}</span>
              </div>
            </div>

            <div className="h-px bg-[#f0e8de]" />

            <div className="flex justify-between items-center">
              <span className="font-display font-bold text-[#1a0e02] text-base">{t("bsum.total")}</span>
              <span className="font-display font-bold text-[#1a0e02] text-xl">
                SAR {total.toLocaleString("en-US")}
              </span>
            </div>
          </>
        )}

        {nights === 0 && (
          <p className="text-xs text-[#a09080] text-center py-2">
            {t("bsum.select_dates")}
          </p>
        )}

        {/* Trust badge */}
        <div className="flex items-center gap-2.5 mt-1 p-3 bg-[#f0fdf6] border border-[#c3e6d5] rounded-xl">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
              fill="rgba(4,145,83,0.12)" stroke="#049153" strokeWidth="1.5" />
            <path d="M9 12l2 2 4-4"
              stroke="#049153" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-xs text-[#049153] font-semibold">{t("bsum.no_charge")}</span>
        </div>
      </div>
    </div>
  );
}
