"use client";

import { useState } from "react";

interface StarPickerProps {
  value:    number;   // 0 = none selected
  onChange: (rating: number) => void;
}

const LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

export default function StarPicker({ value, onChange }: StarPickerProps) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="flex gap-1"
        onMouseLeave={() => setHovered(0)}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHovered(n)}
            className="p-0.5 transition-transform hover:scale-110 active:scale-95"
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
          >
            <svg width="32" height="32" viewBox="0 0 24 24">
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                fill={n <= active ? "#c49a4f" : "#e8dfd4"}
                stroke={n <= active ? "#b8893e" : "#d4c8ba"}
                strokeWidth="0.5"
              />
            </svg>
          </button>
        ))}
      </div>
      <p className="text-sm font-semibold text-[#8b5e38] h-5">
        {active > 0 ? LABELS[active] : ""}
      </p>
    </div>
  );
}
