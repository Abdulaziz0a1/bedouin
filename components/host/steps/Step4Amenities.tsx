"use client";

import {
  ALL_AMENITIES,
  AMENITY_CATEGORIES,
  AMENITY_CATEGORY_LABELS,
  AmenityCategory,
} from "@/lib/data/amenities";

interface Step4AmenitiesProps {
  selected:    string[];
  onChange:    (v: string[]) => void;
  onNext:      () => void;
  onBack:      () => void;
  isRejected?: boolean;
}

export default function Step4Amenities({
  selected, onChange, onNext, onBack, isRejected,
}: Step4AmenitiesProps) {
  const toggle = (id: string) => {
    onChange(
      selected.includes(id)
        ? selected.filter((s) => s !== id)
        : [...selected, id]
    );
  };

  const byCategory = (cat: AmenityCategory) =>
    ALL_AMENITIES.filter((a) => a.category === cat);

  return (
    <div className="flex flex-col gap-7">
      {/* Heading */}
      <div>
        <p className="text-[#c49a4f] text-xs font-bold uppercase tracking-[0.16em] mb-2">Step 4 of 6</p>
        <h1 className="font-display font-extrabold text-[#1a0e02] text-3xl mb-1">
          What does your place offer?
        </h1>
        <p className="text-[#64707d] text-sm">
          Select all amenities and features available to guests. You can always add more later.
        </p>
      </div>

      {/* Selected count */}
      {selected.length > 0 && (
        <div className="flex items-center gap-2 -mb-3">
          <div className="w-5 h-5 rounded-full bg-[#8b5e38] flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <path d="M5 12l5 5 9-9" stroke="white" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-[#8b5e38]">
            {selected.length} amenit{selected.length === 1 ? "y" : "ies"} selected
          </span>
        </div>
      )}

      {isRejected && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-300 rounded-xl px-3 py-2">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="shrink-0">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Please update this section based on admin feedback.
        </div>
      )}

      {/* Categories */}
      <div className="flex flex-col gap-6">
        {AMENITY_CATEGORIES.map((cat) => {
          const items = byCategory(cat);
          return (
            <div key={cat} className="bg-white border border-[#e8dfd4] rounded-2xl p-5">
              <h2 className="font-display font-semibold text-[#1a0e02] text-sm mb-4">
                {AMENITY_CATEGORY_LABELS[cat]}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {items.map((amenity) => {
                  const active = selected.includes(amenity.id);
                  return (
                    <button
                      key={amenity.id}
                      type="button"
                      onClick={() => toggle(amenity.id)}
                      className={[
                        "flex items-center gap-2.5 px-3 py-2.5 border-2 rounded-xl text-left text-sm transition-all",
                        active
                          ? "border-[#8b5e38] bg-[#fdf5ee] font-medium text-[#1a0e02]"
                          : "border-[#e8dfd4] bg-[#faf7f4] text-[#64707d] hover:border-[#c49a4f] hover:bg-white",
                      ].join(" ")}
                    >
                      <span className="text-base leading-none">{amenity.icon}</span>
                      <span className="text-xs leading-tight">{amenity.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {selected.length < 3 && (
        <p className="text-xs text-[#64707d] flex items-center gap-1.5">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          Listings with 3+ amenities get 40% more views. Select at least 3.
        </p>
      )}

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button type="button" onClick={onBack}
          className="flex-1 py-3.5 border border-[#1a0e02] text-[#1a0e02] font-semibold text-sm rounded-2xl hover:bg-[#1a0e02] hover:text-white transition-colors">
          ← Back
        </button>
        <button type="button" onClick={onNext}
          className="flex-[2] py-4 bg-[#8b5e38] font-bold text-base rounded-2xl hover:bg-[#7a5030] transition-colors shadow-sm"
          style={{ color: "#fff" }}>
          Continue →
        </button>
      </div>
    </div>
  );
}
