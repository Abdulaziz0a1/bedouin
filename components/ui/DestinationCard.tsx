"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageProvider";

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
  const [imgLoaded, setImgLoaded] = useState(false);
  const { t } = useLanguage();

  return (
    <Link
      href={href}
      className="relative w-[272px] h-[460px] rounded-[22px] overflow-hidden shrink-0 block group"
      style={{
        boxShadow: "0 8px 36px rgba(26,14,2,0.16), 0 2px 8px rgba(26,14,2,0.09)",
        transition: "box-shadow 0.36s cubic-bezier(0.16,1,0.3,1), transform 0.36s cubic-bezier(0.16,1,0.3,1)",
        willChange: "transform, box-shadow",
        background: "#1a0e02",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.boxShadow = "0 28px 70px rgba(26,14,2,0.36), 0 8px 24px rgba(26,14,2,0.16)";
        el.style.transform = "translateY(-8px) scale(1.010)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.boxShadow = "0 8px 36px rgba(26,14,2,0.16), 0 2px 8px rgba(26,14,2,0.09)";
        el.style.transform = "translateY(0) scale(1)";
      }}
    >
      {/* Skeleton shimmer while image loads */}
      {!imgLoaded && (
        <div className="absolute inset-0 skeleton-img" aria-hidden="true" />
      )}
      <Image
        src={imgSrc}
        alt={city}
        fill
        onLoad={() => setImgLoaded(true)}
        onError={() => { setImgSrc(FALLBACK_IMG); setImgLoaded(true); }}
        className={`object-cover group-hover:scale-[1.08] transition-all duration-700 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
        style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
        sizes="280px"
      />

      {/* Multi-layer gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: [
            "linear-gradient(to bottom, rgba(16,8,0,0.04) 25%, rgba(16,8,0,0.60) 72%, rgba(8,4,0,0.96) 100%)",
            "linear-gradient(to top right, rgba(70,30,0,0.22) 0%, transparent 55%)",
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
        <h3
          className="text-white font-display font-extrabold leading-tight"
          style={{
            fontSize: "clamp(1.25rem, 2.2vw, 1.5rem)",
            letterSpacing: "-0.025em",
            textShadow: "0 2px 16px rgba(0,0,0,0.40)",
          }}
        >
          {city}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-1 mt-0.5">
          <span className="text-white/60 text-xs font-medium">{t("dest.from")}</span>
          <span
            className="text-[0.9375rem] font-bold"
            style={{
              background: "linear-gradient(90deg, #d4aa5f, #f0c84a)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            SAR {fromPrice}
          </span>
          <span className="text-white/50 text-xs font-medium">{t("dest.per_night")}</span>
        </div>

        <p className="text-white/68 text-[0.8rem] leading-snug mt-1">{description}</p>

        {/* Explore arrow — appears on hover */}
        <div className="flex items-center gap-1.5 mt-3.5 opacity-0 group-hover:opacity-100 transition-all duration-280 translate-y-1.5 group-hover:translate-y-0">
          <span className="text-[#c49a4f] text-[0.7rem] font-bold uppercase tracking-[0.16em]">{t("nav.explore")}</span>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="#c49a4f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
