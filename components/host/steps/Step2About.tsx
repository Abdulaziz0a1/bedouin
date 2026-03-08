"use client";

import { useState } from "react";

interface Step2AboutProps {
  title:      string;
  description: string;
  highlights: string[];
  onChangeTitle:      (v: string)   => void;
  onChangeDesc:       (v: string)   => void;
  onChangeHighlights: (v: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step2About({
  title, description, highlights,
  onChangeTitle, onChangeDesc, onChangeHighlights,
  onNext, onBack,
}: Step2AboutProps) {
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});
  const [newHighlight, setNewHighlight] = useState("");

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!title.trim())              e.title       = "Please give your listing a title.";
    else if (title.length > 80)     e.title       = "Title must be 80 characters or fewer.";
    if (!description.trim())        e.description = "Please write a short description.";
    else if (description.length < 30) e.description = "Description should be at least 30 characters.";
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
          Step 2 of 6
        </p>
        <h1 className="font-display font-extrabold text-[#1a0e02] text-3xl mb-1">
          Tell guests about your place
        </h1>
        <p className="text-[#64707d] text-sm">
          A great title and description help guests understand what makes your listing special.
        </p>
      </div>

      <div className="bg-white border border-[#e8dfd4] rounded-2xl p-6 flex flex-col gap-5">

        {/* Title */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className={labelCls}>
              Listing title <span className="text-red-500">*</span>
            </label>
            <span className={`text-xs font-medium ${title.length > 72 ? "text-red-500" : "text-[#a09080]"}`}>
              {title.length}/80
            </span>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => { onChangeTitle(e.target.value.slice(0, 80)); setErrors((v) => ({ ...v, title: "" })); }}
            placeholder="e.g. Asir Highland Cabin with Mountain Views"
            className={inputCls(errors.title)}
          />
          {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
          <p className="text-[10px] text-[#a09080] mt-1">
            Be specific — mention what makes it unique: location, views, or experience type.
          </p>
        </div>

        {/* Description */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className={labelCls}>
              Description <span className="text-red-500">*</span>
            </label>
            <span className="text-xs text-[#a09080]">{description.length}/1000</span>
          </div>
          <textarea
            value={description}
            onChange={(e) => { onChangeDesc(e.target.value.slice(0, 1000)); setErrors((v) => ({ ...v, description: "" })); }}
            placeholder="Describe your place: the setting, what makes it special, nearby attractions, and the experience guests can expect…"
            rows={5}
            className={`${inputCls(errors.description)} resize-none`}
          />
          {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
        </div>

        {/* Highlights */}
        <div>
          <label className={labelCls}>
            Key highlights{" "}
            <span className="text-[#a09080] normal-case tracking-normal font-normal">(up to 5)</span>
          </label>
          <p className="text-[10px] text-[#a09080] mb-2">
            Short bullet points that appear on your listing card.
          </p>

          {highlights.length > 0 && (
            <ul className="flex flex-col gap-2 mb-3">
              {highlights.map((h, i) => (
                <li key={i} className="flex items-center gap-2 bg-[#faf7f4] border border-[#f0e8de] rounded-xl px-3 py-2">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[#c49a4f]">
                    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.2"
                      strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  <span className="text-sm text-[#1a0e02] flex-1">{h}</span>
                  <button
                    type="button"
                    onClick={() => removeHighlight(i)}
                    className="text-[#a09080] hover:text-red-500 transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6l12 12"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
                placeholder="e.g. Private pool with canyon views"
                className={`flex-1 ${inputBase} border-[#e8dfd4] focus:border-[#8b5e38]`}
              />
              <button
                type="button"
                onClick={addHighlight}
                disabled={!newHighlight.trim()}
                className="px-4 py-3 border border-[#e8dfd4] rounded-xl text-sm font-semibold text-[#8b5e38] hover:border-[#8b5e38] hover:bg-[#fdf5ee] disabled:opacity-40 transition-colors"
              >
                Add
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
          ← Back
        </button>
        <button
          type="button"
          onClick={() => { if (validate()) onNext(); }}
          className="flex-[2] py-4 bg-[#8b5e38] font-bold text-base rounded-2xl hover:bg-[#7a5030] transition-colors shadow-sm"
          style={{ color: "#fff" }}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
