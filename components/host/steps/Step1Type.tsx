"use client";

import { DraftCategory } from "@/lib/types/host";

const TYPES: {
  id: DraftCategory;
  label: string;
  icon: string;
  desc: string;
}[] = [
  { id: "farms",      label: "Farm Stay",       icon: "🌾", desc: "Orchards, date palms, strawberry fields, and agricultural experiences." },
  { id: "house",      label: "Heritage House",  icon: "🏛️", desc: "Coral houses, riads, mud-brick homes, and historic Saudi architecture." },
  { id: "guesthouse", label: "Guest House",     icon: "🏡", desc: "Traditional Saudi hospitality in a family-hosted environment." },
  { id: "cabins",     label: "Highland Cabin",  icon: "🌲", desc: "Mountain retreats in the highlands of Asir, Al Baha, and Taif." },
  { id: "glamping",   label: "Desert Glamping", icon: "⛺", desc: "Luxury tents, camps, and curated desert experiences." },
  { id: "doms",       label: "Dome Suite",      icon: "🔭", desc: "Geodesic domes with panoramic sky-view interiors, perfect for stargazing." },
];

interface Step1TypeProps {
  category: DraftCategory;
  onChange: (v: DraftCategory) => void;
  onNext:   () => void;
}

export default function Step1Type({ category, onChange, onNext }: Step1TypeProps) {
  return (
    <div className="flex flex-col gap-7">
      {/* Heading */}
      <div>
        <p className="text-[#c49a4f] text-xs font-bold uppercase tracking-[0.16em] mb-2">
          Step 1 of 6
        </p>
        <h1 className="font-display font-extrabold text-[#1a0e02] text-3xl mb-1">
          What kind of place are you listing?
        </h1>
        <p className="text-[#64707d] text-sm">
          Choose the type that best describes your property or experience.
        </p>
      </div>

      {/* Type grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {TYPES.map((type) => {
          const selected = category === type.id;
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => onChange(type.id)}
              className={[
                "flex items-start gap-4 p-5 border-2 rounded-2xl text-left transition-all duration-200",
                selected
                  ? "border-[#8b5e38] bg-[#fdf5ee] shadow-[0_2px_12px_rgba(139,94,56,0.15)]"
                  : "border-[#e8dfd4] bg-white hover:border-[#c49a4f] hover:bg-[#fdfbf7]",
              ].join(" ")}
            >
              {/* Icon */}
              <span className="text-3xl shrink-0 mt-0.5">{type.icon}</span>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-display font-semibold text-[#1a0e02] text-base">
                    {type.label}
                  </p>
                  {/* Selected indicator */}
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    selected ? "border-[#8b5e38] bg-[#8b5e38]" : "border-[#c4b49a]"
                  }`}>
                    {selected && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12l5 5 9-9"
                          stroke="white" strokeWidth="2.5"
                          strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </div>
                <p className="text-xs text-[#64707d] mt-1 leading-relaxed">{type.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={onNext}
        disabled={!category}
        className="w-full py-4 bg-[#8b5e38] font-bold text-base rounded-2xl hover:bg-[#7a5030] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
        style={{ color: "#fff" }}
      >
        {category
          ? `Continue with ${TYPES.find((t) => t.id === category)?.label ?? "selection"} →`
          : "Select a property type to continue"}
      </button>
    </div>
  );
}
