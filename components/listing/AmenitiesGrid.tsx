"use client";

import { useState } from "react";
import { Amenity } from "@/lib/data/listing-details";

interface AmenitiesGridProps {
  amenities: Amenity[];
}

// Map string keys (stored in DB seed) → display emoji.
// If the icon field is already an emoji / multi-char string, it passes through as-is.
const ICON_MAP: Record<string, string> = {
  wifi:      "📶",
  pool:      "🏊",
  breakfast: "🍳",
  parking:   "🚗",
  ac:        "❄️",
  telescope: "🔭",
  fire:      "🔥",
  bbq:       "🍖",
  hiking:    "🥾",
  kitchen:   "🍽️",
  view:      "🏔️",
  shower:    "🚿",
  camel:     "🐪",
  rooftop:   "🌇",
  heritage:  "🏛️",
  gym:       "🏋️",
  spa:       "🧖",
  laundry:   "👕",
  tv:        "📺",
  pet:       "🐾",
  coffee:    "☕",
};

function resolveIcon(icon: string): string {
  // Already an emoji or multi-char icon (not a plain ASCII key) → use as-is
  if (icon.length > 10 || [...icon].some((c) => c.codePointAt(0)! > 127)) {
    return icon;
  }
  return ICON_MAP[icon.toLowerCase()] ?? "✦";
}

export default function AmenitiesGrid({ amenities }: AmenitiesGridProps) {
  const [showAll, setShowAll] = useState(false);

  const visible = showAll ? amenities : amenities.slice(0, 8);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {visible.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 bg-[#faf7f4] border border-[#f0e8de] rounded-xl px-4 py-3"
          >
            <span className="text-xl leading-none w-7 text-center shrink-0">
              {resolveIcon(item.icon)}
            </span>
            <span className="text-sm text-[#1a0e02] font-medium">{item.label}</span>
          </div>
        ))}
      </div>

      {amenities.length > 8 && (
        <button
          onClick={() => setShowAll((v) => !v)}
          className="self-start px-5 py-2.5 border border-[#1a0e02] text-[#1a0e02] text-sm font-semibold rounded-xl hover:bg-[#1a0e02] hover:text-white transition-colors"
        >
          {showAll
            ? "Show less"
            : `Show all ${amenities.length} amenities`}
        </button>
      )}
    </div>
  );
}
