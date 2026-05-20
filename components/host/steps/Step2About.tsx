"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageProvider";

interface Step2AboutProps {
  title:           string;
  title_ar?:       string;
  description:     string;
  description_ar?: string;
  highlights:      string[];
  onChangeTitle:      (v: string)   => void;
  onChangeTitleAr:    (v: string)   => void;
  onChangeDesc:       (v: string)   => void;
  onChangeDescAr:     (v: string)   => void;
  onChangeHighlights: (v: string[]) => void;
  onNext:      () => void;
  onBack:      () => void;
  isRejected?: boolean;
}

export default function Step2About({
  title, title_ar, description, description_ar, highlights,
  onChangeTitle, onChangeTitleAr, onChangeDesc, onChangeDescAr, onChangeHighlights,
  onNext, onBack, isRejected,
}: Step2AboutProps) {
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";

  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});
  const [newHighlight, setNewHighlight] = useState("");
  // Open the secondary panel if the secondary language already has content (edit mode)
  const [secOpen, setSecOpen] = useState(
    isAr
      ? !!(title.trim() || description.trim())
      : !!(title_ar?.trim() || description_ar?.trim())
  );

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (isAr) {
      if (!title_ar?.trim())               e.title       = t("host.step2.err.title");
      else if (title_ar.length > 80)       e.title       = t("host.step2.err.title_long");
      if (!description_ar?.trim())         e.description = t("host.step2.err.desc");
      else if (description_ar.length < 30) e.description = t("host.step2.err.desc_short");
    } else {
      if (!title.trim())               e.title       = t("host.step2.err.title");
      else if (title.length > 80)      e.title       = t("host.step2.err.title_long");
      if (!description.trim())         e.description = t("host.step2.err.desc");
      else if (description.length < 30) e.description = t("host.step2.err.desc_short");
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const addHighlight = () => {
    const h = newHighlight.trim();
    if (!h || highlights.length >= 5) return;
    onChangeHighlights([...highlights, h]);
    setNewHighlight("");
  };

  const removeHighlight = (i: number) => {
    onChangeHighlights(highlights.filter((_, idx) => idx !== i));
  };

  const inputBase =
    "w-full px-4 py-3 border rounded-xl text-sm text-[#1a0e02] placeholder:text-[#a09080] focus:outline-none transition-colors bg-white";
  const inputCls = (err?: string) =>
    `${inputBase} ${err ? "border-red-400 focus:border-red-500" : "border-[#e8dfd4] focus:border-[#8b5e38]"}`;
  const labelCls =
    "block text-[10px] font-bold text-[#64707d] uppercase tracking-widest mb-1.5";

  return (
    <div className="flex flex-col gap-7">
      {/* Heading */}
      <div>
        <p className="text-[#c49a4f] text-xs font-bold uppercase tracking-[0.16em] mb-2">
          {t("host.step2.eyebrow")}
        </p>
        <h1 className="font-display font-extrabold text-[#1a0e02] text-3xl mb-1">
          {t("host.step2.heading")}
        </h1>
        <p className="text-[#64707d] text-sm">
          {t("host.step2.subtitle")}
        </p>
      </div>

      <div className={`bg-white border rounded-2xl p-6 flex flex-col gap-5 ${isRejected ? "border-red-300 bg-red-50/20" : "border-[#e8dfd4]"}`}>
        {isRejected && (
          <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="shrink-0">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
              <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            {t("host.admin_feedback")}
          </div>
        )}

        {/* ── Primary title (language-aware) ───────────────────────── */}
        {isAr ? (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={labelCls}>
                {t("host.step2.title_label")} <span className="text-red-500">*</span>
              </label>
              <span className={`text-xs font-medium ${(title_ar?.length ?? 0) > 72 ? "text-red-500" : "text-[#a09080]"}`}>
                {title_ar?.length ?? 0}/80
              </span>
            </div>
            <input
              type="text"
              dir="rtl"
              value={title_ar ?? ""}
              onChange={(e) => { onChangeTitleAr(e.target.value.slice(0, 80)); setErrors((v) => ({ ...v, title: "" })); }}
              placeholder={t("host.step2.title_ph")}
              className={`${inputCls(errors.title)} font-arabic`}
            />
            {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
            <p className="text-[10px] text-[#a09080] mt-1">{t("host.step2.title_hint")}</p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={labelCls}>
                {t("host.step2.title_label")} <span className="text-red-500">*</span>
              </label>
              <span className={`text-xs font-medium ${title.length > 72 ? "text-red-500" : "text-[#a09080]"}`}>
                {title.length}/80
              </span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => { onChangeTitle(e.target.value.slice(0, 80)); setErrors((v) => ({ ...v, title: "" })); }}
              placeholder={t("host.step2.title_ph")}
              className={inputCls(errors.title)}
            />
            {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
            <p className="text-[10px] text-[#a09080] mt-1">{t("host.step2.title_hint")}</p>
          </div>
        )}

        {/* ── Primary description (language-aware) ─────────────────── */}
        {isAr ? (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={labelCls}>
                {t("host.step2.desc_label")} <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-[#a09080]">{description_ar?.length ?? 0}/1000</span>
            </div>
            <textarea
              dir="rtl"
              value={description_ar ?? ""}
              onChange={(e) => { onChangeDescAr(e.target.value.slice(0, 1000)); setErrors((v) => ({ ...v, description: "" })); }}
              placeholder={t("host.step2.desc_ph")}
              rows={5}
              className={`${inputCls(errors.description)} resize-none font-arabic`}
            />
            {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={labelCls}>
                {t("host.step2.desc_label")} <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-[#a09080]">{description.length}/1000</span>
            </div>
            <textarea
              value={description}
              onChange={(e) => { onChangeDesc(e.target.value.slice(0, 1000)); setErrors((v) => ({ ...v, description: "" })); }}
              placeholder={t("host.step2.desc_ph")}
              rows={5}
              className={`${inputCls(errors.description)} resize-none`}
            />
            {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
          </div>
        )}

        {/* ── Translation section — collapsible ────────────────────── */}
        <div className="border-t border-[#f0e8de] pt-4">
          <button
            type="button"
            onClick={() => setSecOpen((v) => !v)}
            className="flex items-center gap-2 w-full text-xs font-semibold text-[#8b5e38] hover:text-[#7a5030] transition-colors"
          >
            {isAr ? (
              <span className="text-[9px] font-bold bg-[#f0f4ff] text-[#0046cc] border border-[#c9d7f8] px-1.5 py-0.5 rounded-full">EN</span>
            ) : (
              <span className="text-[9px] font-bold bg-[#fdf5ee] text-[#8b5e38] border border-[#f0dcc8] px-1.5 py-0.5 rounded-full">عربي</span>
            )}
            {isAr ? "Add English translation" : "Add Arabic translation"}
            <span className="text-[10px] font-normal text-[#a09080]">(optional)</span>
            <svg
              width="13" height="13" viewBox="0 0 24 24" fill="none"
              className={`ml-auto text-[#a09080] transition-transform duration-200 ${secOpen ? "rotate-180" : ""}`}
            >
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {secOpen && (
            <div className="mt-4 flex flex-col gap-4">
              {isAr ? (
                /* Arabic mode → secondary = English fields */
                <>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className={labelCls}>Listing title — EN</label>
                      <span className={`text-xs font-medium ${title.length > 72 ? "text-red-500" : "text-[#a09080]"}`}>
                        {title.length}/80
                      </span>
                    </div>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => onChangeTitle(e.target.value.slice(0, 80))}
                      placeholder="e.g. Asir Highland Cabin with Mountain Views"
                      className={`${inputBase} border-[#e8dfd4] focus:border-[#8b5e38]`}
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className={labelCls}>Description — EN</label>
                      <span className="text-xs text-[#a09080]">{description.length}/1000</span>
                    </div>
                    <textarea
                      value={description}
                      onChange={(e) => onChangeDesc(e.target.value.slice(0, 1000))}
                      placeholder="Describe your place: the setting, what makes it special, nearby attractions…"
                      rows={4}
                      className={`${inputBase} border-[#e8dfd4] focus:border-[#8b5e38] resize-none`}
                    />
                  </div>
                </>
              ) : (
                /* English mode → secondary = Arabic fields */
                <>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className={labelCls}>{t("host.step2.title_label")} — عربي</label>
                      <span className={`text-xs font-medium ${(title_ar?.length ?? 0) > 72 ? "text-red-500" : "text-[#a09080]"}`}>
                        {title_ar?.length ?? 0}/80
                      </span>
                    </div>
                    <input
                      type="text"
                      dir="rtl"
                      value={title_ar ?? ""}
                      onChange={(e) => onChangeTitleAr(e.target.value.slice(0, 80))}
                      placeholder="مثال: كابينة جبال عسير بإطلالات خلابة"
                      className={`${inputBase} border-[#e8dfd4] focus:border-[#8b5e38] font-arabic`}
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className={labelCls}>{t("host.step2.desc_label")} — عربي</label>
                      <span className="text-xs text-[#a09080]">{description_ar?.length ?? 0}/1000</span>
                    </div>
                    <textarea
                      dir="rtl"
                      value={description_ar ?? ""}
                      onChange={(e) => onChangeDescAr(e.target.value.slice(0, 1000))}
                      placeholder="صف مكانك: الموقع، ما يجعله مميزًا، المناطق المجاورة، والتجربة التي ينتظرها الضيوف…"
                      rows={4}
                      className={`${inputBase} border-[#e8dfd4] focus:border-[#8b5e38] resize-none font-arabic`}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Highlights ───────────────────────────────────────────── */}
        <div>
          <label className={labelCls}>
            {t("host.step2.highlights")}{" "}
            <span className="text-[#a09080] normal-case tracking-normal font-normal">{t("host.step2.highlights_sub")}</span>
          </label>
          <p className="text-[10px] text-[#a09080] mb-2">
            {t("host.step2.highlights_hint")}
          </p>
          {highlights.length > 0 && (
            <ul className="flex flex-col gap-2 mb-3">
              {highlights.map((h, i) => (
                <li key={i} className="flex items-center gap-2 bg-[#faf7f4] border border-[#f0e8de] rounded-xl px-3 py-2">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[#c49a4f]">
                    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  <span className="text-sm text-[#1a0e02] flex-1">{h}</span>
                  <button
                    type="button"
                    onClick={() => removeHighlight(i)}
                    className="text-[#a09080] hover:text-red-500 transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {highlights.length < 5 && (
            <div className="flex gap-2">
              <input
                type="text"
                value={newHighlight}
                onChange={(e) => setNewHighlight(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addHighlight(); } }}
                placeholder={t("host.step2.highlight_ph")}
                className={`flex-1 ${inputBase} border-[#e8dfd4] focus:border-[#8b5e38]`}
              />
              <button
                type="button"
                onClick={addHighlight}
                disabled={!newHighlight.trim()}
                className="px-4 py-3 border border-[#e8dfd4] rounded-xl text-sm font-semibold text-[#8b5e38] hover:border-[#8b5e38] hover:bg-[#fdf5ee] disabled:opacity-40 transition-colors"
              >
                {t("host.step2.add")}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3.5 border border-[#1a0e02] text-[#1a0e02] font-semibold text-sm rounded-2xl hover:bg-[#1a0e02] hover:text-white transition-colors"
        >
          {t("host.back")}
        </button>
        <button
          type="button"
          onClick={() => { if (validate()) onNext(); }}
          className="flex-[2] py-4 bg-[#8b5e38] font-bold text-base rounded-2xl hover:bg-[#7a5030] transition-colors shadow-sm"
          style={{ color: "#fff" }}
        >
          {t("host.continue")}
        </button>
      </div>
    </div>
  );
}
