"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const FALLBACK_IMG = "https://picsum.photos/seed/bedouin-destination/600/900";

interface DestinationCardProps {
  city: string;
  fromPrice: number;
  description: string;
  image: string;
  href?: string;
}

export default function DestinationCard({
  city, fromPrice, description, image, href = "/explore",
}: DestinationCardProps) {
  const [imgSrc, setImgSrc] = useState(image || FALLBACK_IMG);
  return (
    <Link
      href={href}
      className="relative w-[280px] h-[480px] rounded-3xl overflow-hidden shrink-0 block group"
      style={{
        boxShadow: "0 8px 32px rgba(26,14,2,0.18), 0 2px 8px rgba(26,14,2,0.10)",
        transition: "box-shadow 0.35s cubic-bezier(0.16,1,0.3,1), transform 0.35s cubic-bezier(0.16,1,0.3,1)",
        willChange: "transform, box-shadow",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.boxShadow = "0 24px 64px rgba(26,14,2,0.38), 0 8px 20px rgba(26,14,2,0.18)";
        el.style.transform = "translateY(-8px) scale(1.012)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.boxShadow = "0 8px 32px rgba(26,14,2,0.18), 0 2px 8px rgba(26,14,2,0.10)";
        el.style.transform = "translateY(0) scale(1)";
      }}
    >
      <Image
        src={imgSrc}
        alt={city}
        fill
        onError={() => setImgSrc(FALLBACK_IMG)}
        className="object-cover group-hover:scale-[1.08] transition-transform duration-700"
        style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
        sizes="280px"
      />

      {/* Multi-layer gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: [
            "linear-gradient(to bottom, rgba(26,14,2,0.08) 35%, rgba(26,14,2,0.78) 80%, rgba(26,14,2,0.95) 100%)",
            "linear-gradient(to top right, rgba(70,30,0,0.25) 0%, transparent 60%)",
          ].join(", "),
        }}
      />

      {/* Top gold accent + subtle shine */}
      <div className="absolute top-5 left-5 flex items-center gap-2">
        <div className="w-8 h-[2px] rounded-full"
          style={{ background: "linear-gradient(90deg, #c49a4f, #f0c84a)" }}
        />
        <div className="w-2 h-[2px] rounded-full bg-[#c49a4f] opacity-50" />
      </div>

      {/* Hover: subtle gold border glow */}
      <div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          boxShadow: "inset 0 0 0 1.5px rgba(196,154,79,0.45)",
        }}
      />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 px-5 py-6 flex flex-col gap-1.5">
        {/* City name */}
        <h3 className="text-white font-display font-extrabold text-2xl leading-tight tracking-tight">
          {city}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-1">
          <span className="text-white/65 text-sm">From</span>
          <span
            className="text-base font-bold"
            style={{
              background: "linear-gradient(90deg, #c49a4f, #f0c84a)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            SAR {fromPrice}
          </span>
          <span className="text-white/55 text-sm">/night</span>
        </div>

        <p className="text-white/70 text-sm leading-snug mt-0.5">{description}</p>

        {/* Explore arrow — appears on hover */}
        <div className="flex items-center gap-1.5 mt-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
          <span className="text-[#c49a4f] text-xs font-bold uppercase tracking-[0.14em]">Explore</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="#c49a4f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
