"use client";

import { useState } from "react";
import Link from "next/link";
import type { ConversationContext } from "@/lib/types/messages";
import { useLanguage } from "@/context/LanguageProvider";
import { getListingText } from "@/lib/utils/listing-locale";

interface BookingContextBannerProps {
  context: ConversationContext;
}

export default function BookingContextBanner({ context }: BookingContextBannerProps) {
  const { t, lang } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);
  const displayTitle    = getListingText(context.listingTitle,    context.listingTitle_ar,    lang);
  const displayLocation = getListingText(context.location,        context.location_ar,        lang);

  const STATUS_CONFIG = {
    upcoming:  { label: t("status.upcoming"),  cls: "bg-[#fdf8ee] text-[#8b6a1f] border-[#ead9a6]" },
    confirmed: { label: t("status.confirmed"), cls: "bg-[#eef3ff] text-[#0036a3] border-[#b3c8f5]" },
    completed: { label: t("status.completed"), cls: "bg-[#f4f6f8] text-[#64707d] border-[#dddfe3]" },
    inquiry:   { label: t("status.inquiry"),   cls: "bg-[#fdf5ee] text-[#8b5e38] border-[#e8c89a]" },
  };

  const cfg = context.bookingStatus ? STATUS_CONFIG[context.bookingStatus] : null;
  const locale = lang === "ar" ? "ar-SA" : "en-GB";

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="w-full flex items-center gap-2 px-4 py-2 bg-[#faf7f4] border-b border-[#e8dfd4] hover:bg-[#f0e8de] transition-colors"
      >
        <img
          src={context.listingImage}
          alt={displayTitle}
          className="w-7 h-7 rounded-lg object-cover shrink-0"
        />
        <p className="text-xs font-semibold text-[#8b5e38] truncate flex-1 text-left">
          {displayTitle}
        </p>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-[#64707d] shrink-0">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    );
  }

  return (
    <div className="bg-white border-b border-[#e8dfd4]">
      <div className="flex items-start gap-3 px-4 py-3">
        {/* Thumbnail */}
        <Link href={`/listing/${context.listingId}`} className="shrink-0">
          <img
            src={context.listingImage}
            alt={displayTitle}
            className="w-16 h-12 rounded-xl object-cover hover:opacity-90 transition-opacity"
          />
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link href={`/listing/${context.listingId}`}>
                <p className="text-sm font-semibold text-[#1a0e02] truncate hover:text-[#8b5e38] transition-colors">
                  {displayTitle}
                </p>
              </Link>
              <p className="text-[11px] text-[#64707d] truncate mt-0.5">
                📍 {displayLocation}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {cfg && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.cls}`}>
                  {cfg.label}
                </span>
              )}
              <button
                onClick={() => setCollapsed(true)}
                className="p-1 rounded-lg hover:bg-[#f4f6f8] transition-colors text-[#a09080]"
                aria-label="Collapse"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* Dates + ref */}
          {(context.checkIn || context.bookingRef) && (
            <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5">
              {context.checkIn && context.checkOut && (
                <p className="text-[10px] text-[#a09080]">
                  <span className="font-bold text-[#64707d]">{t("booking.check_in")}</span>{" "}
                  {fmtDate(context.checkIn)} → {fmtDate(context.checkOut)}
                </p>
              )}
              {context.bookingRef && (
                <p className="text-[10px] font-mono text-[#a09080]">{context.bookingRef}</p>
              )}
              {context.pricePerNight && (
                <p className="text-[10px] text-[#a09080]">
                  <span className="font-bold text-[#64707d]">SAR {context.pricePerNight}</span> {t("card.per_night")}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
