"use client";

import Image from "next/image";
import { ListingDraft } from "@/lib/types/host";
import { useLanguage } from "@/context/LanguageProvider";
import { getListingText } from "@/lib/utils/listing-locale";

const CATEGORY_KEYS: Record<string, string> = {
  farms:      "host.type.farms",
  house:      "host.type.house",
  guesthouse: "host.type.guesthouse",
  cabins:     "host.type.cabins",
  glamping:   "host.type.glamping",
  doms:       "host.type.doms",
};

const CATEGORY_COLORS: Record<string, string> = {
  farms:      "#049153",
  house:      "#8b5e38",
  guesthouse: "#8b5e38",
  cabins:     "#2d6a4f",
  glamping:   "#e03e2d",
  doms:       "#0046cc",
};

interface HostListingPreviewProps {
  draft: ListingDraft;
  currentStep: number;
}

export default function HostListingPreview({ draft, currentStep }: HostListingPreviewProps) {
  const { t, lang } = useLanguage();
  const hasImage  = draft.imagePreviewUrls.length > 0;
  const hasTitle  = draft.title.trim().length > 0;
  const hasPrice  = draft.price > 0;
  const hasRegion = draft.region !== "";

  const completedFields = [
    draft.category !== "",
    hasTitle,
    draft.description.trim().length > 0,
    hasRegion,
    draft.amenities.length > 0,
    hasPrice,
    hasImage,
  ].filter(Boolean).length;

  const completionPct = Math.round((completedFields / 7) * 100);

  return (
    <div className="flex flex-col gap-4">
      {/* Label */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-[#64707d] uppercase tracking-widest">
          {t("host.preview.live")}
        </p>
        <span className="text-xs text-[#8b5e38] font-semibold">
          {completionPct}{t("host.preview.complete")}
        </span>
      </div>

      {/* Card */}
      <div className="bg-white border border-[#e8dfd4] rounded-2xl overflow-hidden shadow-sm">

        {/* Image area */}
        <div className="relative w-full h-[180px] bg-[#f4efe6] overflow-hidden">
          {hasImage ? (
            <Image
              src={draft.imagePreviewUrls[0]}
              alt="Listing preview"
              fill
              className="object-cover"
              sizes="360px"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-[#c4b49a]">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
                <polyline points="21 15 16 10 5 21" stroke="currentColor" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-xs text-[#c4b49a] font-medium">{t("host.preview.photos")}</p>
            </div>
          )}

          {/* Category badge */}
          {draft.category && (
            <span
              className="absolute top-3 left-3 text-[11px] font-bold text-white px-2.5 py-1 rounded-xl shadow-sm"
              style={{ backgroundColor: CATEGORY_COLORS[draft.category] ?? "#8b5e38" }}
            >
              {t(CATEGORY_KEYS[draft.category] ?? draft.category)}
            </span>
          )}

          {/* New badge */}
          <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-[#64707d] text-[10px] font-semibold px-2 py-0.5 rounded-lg">
            {t("host.preview.preview")}
          </span>
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col gap-2.5">
          {/* Rating placeholder */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center justify-center px-[5px] h-6 w-[34px] bg-[#f1f2f3]"
              style={{ borderRadius: "10px 6px 6px 10px" }}>
              <span className="text-xs font-bold text-[#0046cc]">{t("host.preview.new")}</span>
            </div>
            <span className="text-xs text-[#64707d]">{t("host.preview.no_reviews")}</span>
          </div>

          {/* Title */}
          <h3 className={`font-display font-semibold text-[0.95rem] leading-snug line-clamp-2 ${
            hasTitle ? "text-[#1a0e02]" : "text-[#c4b49a]"
          }`}>
            {hasTitle
              ? getListingText(draft.title, draft.title_ar, lang)
              : t("host.preview.placeholder")}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1 text-sm">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" className="shrink-0">
              <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"
                fill={hasRegion ? "#64707d" : "#c4b49a"}
              />
            </svg>
            <span className={`truncate text-xs ${hasRegion ? "text-[#64707d]" : "text-[#c4b49a]"}`}>
              {getListingText(draft.location, draft.location_ar, lang) || draft.region || t("host.preview.location")}
              {draft.region && draft.location ? `, ${draft.region}` : ""}
            </span>
          </div>

          {/* Amenities chips */}
          {draft.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {draft.amenities.slice(0, 3).map((id) => (
                <span key={id}
                  className="text-[10px] font-medium text-[#8b5e38] bg-[#fdf5ee] border border-[#f0dcc8] px-2 py-0.5 rounded-full">
                  {id}
                </span>
              ))}
              {draft.amenities.length > 3 && (
                <span className="text-[10px] font-medium text-[#64707d] px-1">
                  +{draft.amenities.length - 3} {t("host.preview.more")}
                </span>
              )}
            </div>
          )}

          {/* Price */}
          <div className="mt-auto pt-2.5 flex items-center justify-between border-t border-[#f0e8de]">
            <span className="text-[#64707d] text-xs">
              {draft.priceUnit || "per person"}
            </span>
            <div className="flex items-baseline gap-1.5">
              {draft.originalPrice > 0 && (
                <span className="text-[#a09080] text-xs line-through">
                  SAR {draft.originalPrice}
                </span>
              )}
              <span className={`font-display font-bold text-base ${
                hasPrice ? "text-[#1a0e02]" : "text-[#c4b49a]"
              }`}>
                {hasPrice ? `SAR ${draft.price}` : "SAR —"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress checklist */}
      <div className="bg-white border border-[#e8dfd4] rounded-2xl p-4">
        <p className="text-xs font-bold text-[#64707d] uppercase tracking-widest mb-3">
          {t("host.preview.checklist")}
        </p>
        <div className="flex flex-col gap-2">
          {[
            { labelKey: "host.check.type",        done: draft.category !== ""                  },
            { labelKey: "host.check.title",       done: hasTitle                               },
            { labelKey: "host.check.description", done: draft.description.trim().length >= 30  },
            { labelKey: "host.check.location",    done: hasRegion                              },
            { labelKey: "host.check.amenities",   done: draft.amenities.length >= 3            },
            { labelKey: "host.check.pricing",     done: hasPrice                               },
            { labelKey: "host.check.photos",      done: draft.imagePreviewUrls.length >= 3     },
          ].map(({ labelKey, done }) => (
            <div key={labelKey} className="flex items-center gap-2.5">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all ${
                done ? "bg-[#049153]" : "bg-[#e8dfd4]"
              }`}>
                {done && (
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12l5 5 9-9"
                      stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className={`text-xs ${done ? "text-[#1a0e02] font-medium" : "text-[#a09080]"}`}>
                {t(labelKey)}
              </span>
            </div>
          ))}
        </div>

        {/* Completion bar */}
        <div className="mt-4 w-full h-1.5 bg-[#e8dfd4] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#049153] rounded-full transition-all duration-500"
            style={{ width: `${completionPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
