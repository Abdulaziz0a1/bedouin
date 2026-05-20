"use client";

import { useState } from "react";
import { ListingDraft } from "@/lib/types/host";
import { ALL_AMENITIES } from "@/lib/data/amenities";
import ImageUploadZone from "@/components/host/ImageUploadZone";
import { useLanguage } from "@/context/LanguageProvider";

const CATEGORY_LABEL_KEYS: Record<string, string> = {
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

interface Step6ReviewProps {
  draft: ListingDraft;
  onChangeImages: {
    add:    (url: string, file?: File) => void;
    remove: (index: number) => void;
  };
  onChangeRules:  (rules: string[]) => void;
  onSubmit:       () => void;
  onBack:         () => void;
  isSubmitting:   boolean;
  /** Override the submit button label. Defaults to "Submit for Approval →" */
  submitLabel?:   string;
  isRejected?:    boolean;
}

/* ── Helper: collapsible review section ─────────────────────────────────── */
function ReviewSection({
  icon, title, children,
}: {
  icon: React.ReactNode; title: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-[#e8dfd4] rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#f0e8de]">
        <span className="text-[#8b5e38]">{icon}</span>
        <h3 className="font-display font-semibold text-[#1a0e02] text-sm">{title}</h3>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

export default function Step6Review({
  draft, onChangeImages, onChangeRules, onSubmit, onBack, isSubmitting, submitLabel, isRejected,
}: Step6ReviewProps) {
  const { t } = useLanguage();
  const [newRule, setNewRule]   = useState("");
  const [photoError, setPhotoError] = useState("");

  const addRule = () => {
    const r = newRule.trim();
    if (!r) return;
    onChangeRules([...draft.houseRules, r]);
    setNewRule("");
  };

  const removeRule = (i: number) => {
    onChangeRules(draft.houseRules.filter((_, idx) => idx !== i));
  };

  const handleSubmit = () => {
    if (draft.imagePreviewUrls.length < 3) {
      setPhotoError(t("host.step6.photo_err"));
      return;
    }
    setPhotoError("");
    onSubmit();
  };

  const selectedAmenities = ALL_AMENITIES.filter((a) => draft.amenities.includes(a.id));

  const iconProps = { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none" };

  // ── Smart tips ──────────────────────────────────────────────────────────
  const requiredIssues: string[] = [];
  const suggestions:    string[] = [];

  if (draft.imagePreviewUrls.length < 3) {
    requiredIssues.push(t("host.step6.tip.photos"));
  } else if (draft.imagePreviewUrls.length < 4) {
    suggestions.push(t("host.step6.tip.photos_more"));
  }
  if (draft.description.length < 150) {
    suggestions.push(t("host.step6.tip.desc"));
  }
  if (draft.amenities.length < 3) {
    suggestions.push(t("host.step6.tip.amenities"));
  }
  if (!draft.mapsUrl?.trim()) {
    suggestions.push(t("host.step6.tip.maps"));
  }

  const allGood = requiredIssues.length === 0 && suggestions.length === 0;

  return (
    <div className="flex flex-col gap-7">
      {/* Heading */}
      <div>
        <p className="text-[#c49a4f] text-xs font-bold uppercase tracking-[0.16em] mb-2">{t("host.step6.eyebrow")}</p>
        <h1 className="font-display font-extrabold text-[#1a0e02] text-3xl mb-1">
          {t("host.step6.heading")}
        </h1>
        <p className="text-[#64707d] text-sm">
          {t("host.step6.subtitle")}
        </p>
      </div>

      {/* ── Photos ───────────────────────────────────────────────────── */}
      <div className={`bg-white border rounded-2xl p-6 ${isRejected ? "border-red-300 bg-red-50/20" : "border-[#e8dfd4]"}`}>
        {isRejected && (
          <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-4">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="shrink-0">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
              <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            {t("host.admin_feedback")}
          </div>
        )}
        <h2 className="font-display font-semibold text-[#1a0e02] mb-1">{t("host.step6.photos")}</h2>
        <p className="text-xs text-[#64707d] mb-4">
          {t("host.step6.photos_hint")}
        </p>
        <ImageUploadZone
          previewUrls={draft.imagePreviewUrls}
          onAdd={onChangeImages.add}
          onRemove={onChangeImages.remove}
          minImages={3}
          maxImages={10}
        />
        {photoError && (
          <p className="text-xs text-red-600 mt-2 flex items-center gap-1.5">
            <svg {...iconProps}><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
              <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            {photoError}
          </p>
        )}
      </div>

      {/* ── House rules ───────────────────────────────────────────────── */}
      <div className="bg-white border border-[#e8dfd4] rounded-2xl p-6 flex flex-col gap-4">
        <div>
          <h2 className="font-display font-semibold text-[#1a0e02] mb-0.5">{t("host.step6.rules")}</h2>
          <p className="text-xs text-[#64707d]">
            {t("host.step6.rules_hint")}
          </p>
        </div>

        {draft.houseRules.length > 0 && (
          <ul className="flex flex-col gap-2">
            {draft.houseRules.map((rule, i) => (
              <li key={i} className="flex items-center gap-2 bg-[#faf7f4] border border-[#f0e8de] rounded-xl px-3 py-2.5">
                <svg {...iconProps} className="shrink-0 text-[#64707d]">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span className="text-sm text-[#1a0e02] flex-1">{rule}</span>
                <button type="button" onClick={() => removeRule(i)}
                  className="text-[#a09080] hover:text-red-500 transition-colors">
                  <svg {...iconProps}>
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={newRule}
            onChange={(e) => setNewRule(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addRule(); } }}
            placeholder={t("host.step6.rule_ph")}
            className="flex-1 px-4 py-3 border border-[#e8dfd4] rounded-xl text-sm text-[#1a0e02] placeholder:text-[#a09080] focus:outline-none focus:border-[#8b5e38] bg-white transition-colors"
          />
          <button type="button" onClick={addRule} disabled={!newRule.trim()}
            className="px-4 py-3 border border-[#e8dfd4] rounded-xl text-sm font-semibold text-[#8b5e38] hover:border-[#8b5e38] hover:bg-[#fdf5ee] disabled:opacity-40 transition-colors">
            {t("host.step6.add")}
          </button>
        </div>
      </div>

      {/* ── Review summary ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="h-px w-6 bg-[#c49a4f]" />
          <p className="text-[#c49a4f] text-xs font-bold uppercase tracking-[0.16em]">
            {t("host.step6.review")}
          </p>
        </div>

        {/* Category */}
        <ReviewSection
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          title={t("host.step6.prop_type")}
        >
          {draft.category ? (
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-white px-3 py-1.5 rounded-xl"
              style={{ backgroundColor: CATEGORY_COLORS[draft.category] ?? "#8b5e38" }}>
              {CATEGORY_LABEL_KEYS[draft.category] ? t(CATEGORY_LABEL_KEYS[draft.category]) : draft.category}
            </span>
          ) : (
            <p className="text-sm text-[#a09080] italic">{t("host.step6.not_set")}</p>
          )}
        </ReviewSection>

        {/* About */}
        <ReviewSection
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          title={t("host.step6.about")}
        >
          <div className="flex flex-col gap-2">
            <p className="font-semibold text-[#1a0e02]">{draft.title || <span className="text-[#a09080] font-normal italic">{t("host.step6.no_title")}</span>}</p>
            {draft.description && (
              <p className="text-sm text-[#64707d] leading-relaxed line-clamp-3">{draft.description}</p>
            )}
            {draft.highlights.length > 0 && (
              <ul className="flex flex-col gap-1 mt-1">
                {draft.highlights.map((h, i) => (
                  <li key={i} className="text-xs text-[#64707d] flex items-start gap-1.5">
                    <span className="text-[#c49a4f] mt-0.5">•</span>{h}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </ReviewSection>

        {/* Location & details */}
        <ReviewSection
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5" /></svg>}
          title={t("host.step6.location")}
        >
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { labelKey: "host.detail.region",     value: draft.region    || "—" },
              { labelKey: "host.detail.location",   value: draft.location  || "—" },
              { labelKey: "host.detail.guests",     value: draft.maxGuests         },
              { labelKey: "host.detail.bedrooms",   value: draft.bedrooms          },
              { labelKey: "host.detail.beds",       value: draft.beds              },
              { labelKey: "host.detail.baths",      value: draft.baths             },
              { labelKey: "host.detail.min_nights", value: draft.minNights         },
              { labelKey: "host.detail.check_in",   value: draft.checkInTime       },
              { labelKey: "host.detail.check_out",  value: draft.checkOutTime      },
            ].map(({ labelKey, value }) => (
              <div key={labelKey}>
                <p className="text-[10px] text-[#64707d] font-bold uppercase tracking-widest mb-0.5">{t(labelKey)}</p>
                <p className="font-medium text-[#1a0e02]">{value}</p>
              </div>
            ))}
          </div>
        </ReviewSection>

        {/* Amenities */}
        <ReviewSection
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5 9-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" /></svg>}
          title={`${t("host.step6.amenities_section")} (${selectedAmenities.length})`}
        >
          {selectedAmenities.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {selectedAmenities.map((a) => (
                <span key={a.id}
                  className="flex items-center gap-1.5 text-xs font-medium text-[#8b5e38] bg-[#fdf5ee] border border-[#f0dcc8] px-2.5 py-1 rounded-full">
                  <span>{a.icon}</span>{t(a.labelKey)}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#a09080] italic">{t("host.step6.no_amenities")}</p>
          )}
        </ReviewSection>

        {/* Pricing */}
        <ReviewSection
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          title={t("host.step6.pricing")}
        >
          <div className="flex items-baseline gap-3">
            {draft.originalPrice > draft.price && draft.originalPrice > 0 && (
              <span className="text-[#a09080] line-through text-base">SAR {draft.originalPrice}</span>
            )}
            <span className="font-display font-extrabold text-[#1a0e02] text-2xl">
              {draft.price > 0 ? `SAR ${draft.price}` : "—"}
            </span>
            <span className="text-[#64707d] text-sm">{draft.priceUnit}</span>
          </div>
        </ReviewSection>
      </div>

      {/* ── Smart Host Tips ──────────────────────────────────────────── */}
      {allGood ? (
        <div className="flex items-center gap-3 bg-[#f0faf5] border border-[#c3e8d6] rounded-2xl px-5 py-4">
          <div className="w-8 h-8 rounded-xl bg-[#049153]/10 flex items-center justify-center shrink-0">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4" stroke="#049153" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="10" stroke="#049153" strokeWidth="1.8" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-[#049153]">
            {t("host.step6.ready")}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="h-px w-6 bg-[#c49a4f]" />
            <p className="text-[#c49a4f] text-xs font-bold uppercase tracking-[0.16em]">{t("host.step6.tips")}</p>
          </div>

          {requiredIssues.length > 0 && (
            <div className="bg-[#fdf8ee] border border-[#ead9a6] rounded-2xl px-5 py-4 flex flex-col gap-2.5">
              <p className="text-[10px] font-bold text-[#8b6a1f] uppercase tracking-widest">
                {t("host.step6.fix_before")}
              </p>
              {requiredIssues.map((tip, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-0.5 text-[#c49a4f]">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <p className="text-sm text-[#8b6a1f]">{tip}</p>
                </div>
              ))}
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="bg-[#faf7f4] border border-[#e8dfd4] rounded-2xl px-5 py-4 flex flex-col gap-2.5">
              <p className="text-[10px] font-bold text-[#64707d] uppercase tracking-widest">
                {t("host.step6.suggestions")}
              </p>
              {suggestions.map((tip, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-0.5 text-[#c49a4f]">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <p className="text-sm text-[#64707d]">{tip}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Approval notice ───────────────────────────────────────────── */}
      <div className="flex items-start gap-3.5 bg-[#fff4e5] border border-[#f0dcc8] rounded-2xl p-5">
        <div className="w-9 h-9 rounded-xl bg-[#8b5e38]/10 flex items-center justify-center shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
              stroke="#8b5e38" strokeWidth="1.8" />
            <path d="M9 12l2 2 4-4"
              stroke="#8b5e38" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-[#1a0e02] text-sm mb-1">
            {t("host.step6.approval")}
          </p>
          <p className="text-xs text-[#64707d] leading-relaxed">
            {t("host.step6.approval_body")}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button type="button" onClick={onBack} disabled={isSubmitting}
          className="flex-1 py-3.5 border border-[#1a0e02] text-[#1a0e02] font-semibold text-sm rounded-2xl hover:bg-[#1a0e02] hover:text-white disabled:opacity-50 transition-colors">
          {t("host.back")}
        </button>
        <button type="button" onClick={handleSubmit} disabled={isSubmitting}
          className="flex-[2] py-4 bg-[#8b5e38] font-bold text-base rounded-2xl hover:bg-[#7a5030] disabled:opacity-70 transition-colors shadow-sm flex items-center justify-center gap-2"
          style={{ color: "#fff" }}>
          {isSubmitting ? (
            <>
              <svg className="animate-spin" width="17" height="17" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              {t("host.step6.saving")}
            </>
          ) : (
            submitLabel ?? t("host.step6.submit")
          )}
        </button>
      </div>
    </div>
  );
}
