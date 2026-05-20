"use client";

import { useState } from "react";
import { ListingDraft, DraftRegion } from "@/lib/types/host";
import { SAUDI_REGIONS, REGION_KEY_MAP } from "@/lib/constants/regions";
import { useLanguage } from "@/context/LanguageProvider";

const CHECK_IN_TIMES  = ["12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM","6:00 PM"];
const CHECK_OUT_TIMES = ["9:00 AM","10:00 AM","11:00 AM","12:00 PM","1:00 PM"];

type UpdateFn = <K extends keyof ListingDraft>(key: K, value: ListingDraft[K]) => void;

interface Step3DetailsProps {
  draft:             ListingDraft;
  onChange:          UpdateFn;
  onNext:            () => void;
  onBack:            () => void;
  locationRejected?: boolean;
  capacityRejected?: boolean;
}

function Counter({
  label, sub, value, min, max,
  onDec, onInc,
}: {
  label: string; sub: string; value: number; min: number; max: number;
  onDec: () => void; onInc: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0 border-[#f0e8de]">
      <div>
        <p className="text-sm font-semibold text-[#1a0e02]">{label}</p>
        <p className="text-xs text-[#64707d]">{sub}</p>
      </div>
      <div className="flex items-center gap-4">
        <button type="button" onClick={onDec} disabled={value <= min}
          className="w-9 h-9 rounded-full border border-[#e8dfd4] flex items-center justify-center text-[#1a0e02] text-lg font-light disabled:opacity-30 hover:border-[#8b5e38] hover:text-[#8b5e38] transition-colors">
          −
        </button>
        <span className="w-6 text-center font-semibold text-[#1a0e02] text-sm">{value}</span>
        <button type="button" onClick={onInc} disabled={value >= max}
          className="w-9 h-9 rounded-full border border-[#e8dfd4] flex items-center justify-center text-[#1a0e02] text-lg font-light disabled:opacity-30 hover:border-[#8b5e38] hover:text-[#8b5e38] transition-colors">
          +
        </button>
      </div>
    </div>
  );
}

export default function Step3Details({ draft, onChange, onNext, onBack, locationRejected, capacityRejected }: Step3DetailsProps) {
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";
  const [errors, setErrors] = useState<{ region?: string; location?: string; location_ar?: string; mapsUrl?: string }>({});
  // arOpen: toggle for the Arabic optional field (used in English mode)
  const [arOpen, setArOpen] = useState(!!draft.location_ar);
  // enOpen: toggle for the English optional field (used in Arabic mode)
  const [enOpen, setEnOpen] = useState(!!draft.location);

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!draft.region) e.region = t("host.step3.err.region");
    if (isAr) {
      if (!draft.location_ar?.trim()) e.location_ar = t("host.step3.err.location");
    } else {
      if (!draft.location.trim()) e.location = t("host.step3.err.location");
    }
    const mapsUrl = draft.mapsUrl.trim();
    if (!mapsUrl) {
      e.mapsUrl = t("host.step3.err.maps");
    } else if (!/^https?:\/\/.+/i.test(mapsUrl)) {
      e.mapsUrl = t("host.step3.err.maps_url");
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const inputCls = (err?: string) =>
    `w-full px-4 py-3 border rounded-xl text-sm text-[#1a0e02] placeholder:text-[#a09080] focus:outline-none bg-white transition-colors ${
      err ? "border-red-400" : "border-[#e8dfd4] focus:border-[#8b5e38]"
    }`;
  const labelCls = "block text-[10px] font-bold text-[#64707d] uppercase tracking-widest mb-1.5";
  const selectCls = `w-full px-4 py-3 border border-[#e8dfd4] rounded-xl text-sm text-[#1a0e02] bg-white focus:outline-none focus:border-[#8b5e38] transition-colors appearance-none`;

  return (
    <div className="flex flex-col gap-7">
      {/* Heading */}
      <div>
        <p className="text-[#c49a4f] text-xs font-bold uppercase tracking-[0.16em] mb-2">{t("host.step3.eyebrow")}</p>
        <h1 className="font-display font-extrabold text-[#1a0e02] text-3xl mb-1">
          {t("host.step3.heading")}
        </h1>
        <p className="text-[#64707d] text-sm">
          {t("host.step3.subtitle")}
        </p>
      </div>

      {/* Location */}
      <div className={`bg-white border rounded-2xl p-6 flex flex-col gap-5 ${locationRejected ? "border-red-300 bg-red-50/20" : "border-[#e8dfd4]"}`}>
        {locationRejected && (
          <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="shrink-0">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
              <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            {t("host.admin_feedback")}
          </div>
        )}
        <div>
          <label className={labelCls}>{t("host.step3.region_label")} <span className="text-red-500">*</span></label>
          <select
            value={draft.region}
            onChange={(e) => { onChange("region", e.target.value as DraftRegion); setErrors((v) => ({ ...v, region: "" })); }}
            className={`${selectCls} ${errors.region ? "border-red-400" : ""}`}
          >
            <option value="">{t("host.step3.region_ph")}</option>
            {SAUDI_REGIONS.map((r) => (
              <option key={r} value={r}>{t(REGION_KEY_MAP[r])}</option>
            ))}
          </select>
          {errors.region && <p className="text-xs text-red-600 mt-1">{errors.region}</p>}
        </div>

        {isAr ? (
          /* ── Arabic mode: Arabic is primary, English is optional ── */
          <div>
            <label className={labelCls}>
              {t("host.step3.area_label")} — عربي <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              dir="rtl"
              value={draft.location_ar ?? ""}
              onChange={(e) => { onChange("location_ar", e.target.value); setErrors((v) => ({ ...v, location_ar: "" })); }}
              placeholder="مثال: السودة، وادي طيب الاسم، حدا الشام"
              className={`${inputCls(errors.location_ar)} font-arabic`}
            />
            {errors.location_ar && <p className="text-xs text-red-600 mt-1">{errors.location_ar}</p>}
            <p className="text-[10px] text-[#a09080] mt-1">{t("host.step3.area_hint")}</p>

            {/* English location — collapsible optional section */}
            <div className="mt-3 pt-3 border-t border-[#f0e8de]">
              <button
                type="button"
                onClick={() => setEnOpen((v) => !v)}
                className="flex items-center gap-2 text-xs font-semibold text-[#8b5e38] hover:text-[#7a5030] transition-colors w-full"
              >
                <span className="text-[9px] font-bold bg-[#fdf5ee] text-[#8b5e38] border border-[#f0dcc8] px-1.5 py-0.5 rounded-full">EN</span>
                Add English location
                <span className="text-[10px] font-normal text-[#a09080]">(optional)</span>
                <svg
                  width="13" height="13" viewBox="0 0 24 24" fill="none"
                  className={`ml-auto text-[#a09080] transition-transform duration-200 ${enOpen ? "rotate-180" : ""}`}
                >
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {enOpen && (
                <div className="mt-3">
                  <label className="block text-[10px] font-bold text-[#64707d] uppercase tracking-widest mb-1.5">
                    {t("host.step3.area_label")} — English
                  </label>
                  <input
                    type="text"
                    value={draft.location}
                    onChange={(e) => onChange("location", e.target.value)}
                    placeholder={t("host.step3.area_ph")}
                    className={inputCls()}
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ── English mode: English is primary, Arabic is optional ── */
          <div>
            <label className={labelCls}>{t("host.step3.area_label")} <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={draft.location}
              onChange={(e) => { onChange("location", e.target.value); setErrors((v) => ({ ...v, location: "" })); }}
              placeholder={t("host.step3.area_ph")}
              className={inputCls(errors.location)}
            />
            {errors.location && <p className="text-xs text-red-600 mt-1">{errors.location}</p>}
            <p className="text-[10px] text-[#a09080] mt-1">{t("host.step3.area_hint")}</p>

            {/* Arabic location — collapsible optional section */}
            <div className="mt-3 pt-3 border-t border-[#f0e8de]">
              <button
                type="button"
                onClick={() => setArOpen((v) => !v)}
                className="flex items-center gap-2 text-xs font-semibold text-[#8b5e38] hover:text-[#7a5030] transition-colors w-full"
              >
                <span className="text-[9px] font-bold bg-[#fdf5ee] text-[#8b5e38] border border-[#f0dcc8] px-1.5 py-0.5 rounded-full">عربي</span>
                Add Arabic location
                <span className="text-[10px] font-normal text-[#a09080]">(optional)</span>
                <svg
                  width="13" height="13" viewBox="0 0 24 24" fill="none"
                  className={`ml-auto text-[#a09080] transition-transform duration-200 ${arOpen ? "rotate-180" : ""}`}
                >
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {arOpen && (
                <div className="mt-3">
                  <label className="block text-[10px] font-bold text-[#64707d] uppercase tracking-widest mb-1.5">
                    {t("host.step3.area_label")} — عربي
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={draft.location_ar ?? ""}
                    onChange={(e) => onChange("location_ar", e.target.value)}
                    placeholder="مثال: السودة، وادي طيب الاسم، حدا الشام"
                    className={`${inputCls()} font-arabic`}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        <div>
          <label className={labelCls}>
            {t("host.step3.maps_label")} <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            value={draft.mapsUrl}
            onChange={(e) => {
              onChange("mapsUrl", e.target.value);
              setErrors((v) => ({ ...v, mapsUrl: "" }));
            }}
            placeholder={t("host.step3.maps_ph")}
            className={inputCls(errors.mapsUrl)}
          />
          {errors.mapsUrl && <p className="text-xs text-red-600 mt-1">{errors.mapsUrl}</p>}
          <p className="text-[10px] text-[#a09080] mt-1">
            {t("host.step3.maps_hint")}
          </p>
        </div>
      </div>

      {/* Guest & room capacity */}
      <div className={`bg-white border rounded-2xl overflow-hidden ${capacityRejected ? "border-red-300 bg-red-50/20" : "border-[#e8dfd4]"}`}>
        <div className={`px-5 py-4 border-b ${capacityRejected ? "border-red-200" : "border-[#f0e8de]"}`}>
          <h2 className="font-display font-semibold text-[#1a0e02]">{t("host.step3.capacity")}</h2>
          <p className="text-xs text-[#64707d] mt-0.5">{t("host.step3.capacity_sub")}</p>
          {capacityRejected && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mt-3">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="shrink-0">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
                <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              {t("host.admin_feedback")}
            </div>
          )}
        </div>
        <div className="px-5 py-2">
          <Counter label={t("host.step3.guests")}      sub={t("host.step3.guests_sub")}    value={draft.maxGuests} min={1} max={30}
            onDec={() => onChange("maxGuests", Math.max(1, draft.maxGuests - 1))}
            onInc={() => onChange("maxGuests", Math.min(30, draft.maxGuests + 1))} />
          <Counter label={t("host.step3.bedrooms")}    sub={t("host.step3.bedrooms_sub")}  value={draft.bedrooms}  min={0} max={20}
            onDec={() => onChange("bedrooms",  Math.max(0, draft.bedrooms  - 1))}
            onInc={() => onChange("bedrooms",  Math.min(20, draft.bedrooms + 1))} />
          <Counter label={t("host.step3.beds")}        sub={t("host.step3.beds_sub")}      value={draft.beds}  min={0} max={30}
            onDec={() => onChange("beds",  Math.max(0, draft.beds  - 1))}
            onInc={() => onChange("beds",  Math.min(30, draft.beds + 1))} />
          <Counter label={t("host.step3.baths")}       sub={t("host.step3.baths_sub")}     value={draft.baths} min={0} max={20}
            onDec={() => onChange("baths", Math.max(0, draft.baths - 1))}
            onInc={() => onChange("baths", Math.min(20, draft.baths + 1))} />
          <Counter label={t("host.step3.min_nights")}  sub={t("host.step3.min_nights_sub")} value={draft.minNights} min={1} max={30}
            onDec={() => onChange("minNights", Math.max(1, draft.minNights - 1))}
            onInc={() => onChange("minNights", Math.min(30, draft.minNights + 1))} />
        </div>
      </div>

      {/* Check-in/out times */}
      <div className="bg-white border border-[#e8dfd4] rounded-2xl p-6 flex flex-col gap-4">
        <h2 className="font-display font-semibold text-[#1a0e02]">{t("host.step3.checkin_section")}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>{t("host.step3.checkin_time")}</label>
            <select value={draft.checkInTime} onChange={(e) => onChange("checkInTime", e.target.value)} className={selectCls}>
              {CHECK_IN_TIMES.map((time) => <option key={time} value={time}>{time}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>{t("host.step3.checkout_time")}</label>
            <select value={draft.checkOutTime} onChange={(e) => onChange("checkOutTime", e.target.value)} className={selectCls}>
              {CHECK_OUT_TIMES.map((time) => <option key={time} value={time}>{time}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button type="button" onClick={onBack}
          className="flex-1 py-3.5 border border-[#1a0e02] text-[#1a0e02] font-semibold text-sm rounded-2xl hover:bg-[#1a0e02] hover:text-white transition-colors">
          {t("host.back")}
        </button>
        <button type="button" onClick={() => { if (validate()) onNext(); }}
          className="flex-[2] py-4 bg-[#8b5e38] font-bold text-base rounded-2xl hover:bg-[#7a5030] transition-colors shadow-sm"
          style={{ color: "#fff" }}>
          {t("host.continue")}
        </button>
      </div>
    </div>
  );
}
