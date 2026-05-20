"use client";

import { useRef } from "react";
import Image from "next/image";
import ProductCard from "@/components/ui/ProductCard";
import FadeInSection from "@/components/ui/FadeInSection";
import { useLanguage } from "@/context/LanguageProvider";
import type { HomepageListing } from "@/lib/server/homepage/getMarketplaceListings";

interface FarmsSectionProps {
  farms: HomepageListing[];
}

const ArrowBtn = ({
  dir, onClick,
}: { dir: "left" | "right"; onClick: () => void }) => (
  <button
    onClick={onClick}
    aria-label={dir === "left" ? "Previous" : "Next"}
    className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
    style={
      dir === "right"
        ? {
            background: "linear-gradient(135deg, #461e00 0%, #5a2a00 100%)",
            boxShadow: "0 4px 12px rgba(70,30,0,0.30)",
          }
        : {
            background: "white",
            border: "1px solid #e8dfd4",
            boxShadow: "0 2px 8px rgba(70,30,0,0.06)",
          }
    }
    onMouseEnter={(e) => {
      if (dir === "left") (e.currentTarget as HTMLButtonElement).style.borderColor = "#461e00";
    }}
    onMouseLeave={(e) => {
      if (dir === "left") (e.currentTarget as HTMLButtonElement).style.borderColor = "#e8dfd4";
    }}
  >
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      {dir === "left"
        ? <path d="M15 18l-6-6 6-6" stroke="#1a0e02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        : <path d="M9 18l6-6-6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      }
    </svg>
  </button>
);

export default function FarmsSection({ farms }: FarmsSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  if (farms.length === 0) return null;
  const scroll = (dir: "left" | "right") =>
    ref.current?.scrollBy({ left: dir === "right" ? 316 : -316, behavior: "smooth" });

  return (
    <section className="bg-[#f4efe6]">

      {/* ── Cinematic header banner ─────────────────────────────────────────── */}
      <div className="relative h-[320px] overflow-hidden">
        <Image
          src="/images/saudi-farm-story.jpg"
          alt=""
          fill
          className="object-cover object-center"
          aria-hidden="true"
        />
        {/* Dark overlay */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(8,4,0,0.50) 0%, rgba(6,3,0,0.76) 100%)" }}
          aria-hidden="true"
        />
        {/* Warm left wash */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to right, rgba(20,8,0,0.32) 0%, transparent 55%)" }}
          aria-hidden="true"
        />
        {/* Gold top accent */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent 0%, rgba(196,154,79,0.55) 30%, rgba(240,200,74,0.80) 50%, rgba(196,154,79,0.55) 70%, transparent 100%)" }}
          aria-hidden="true"
        />
        {/* Gold bottom accent */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent 0%, rgba(196,154,79,0.28) 30%, rgba(196,154,79,0.28) 70%, transparent 100%)" }}
          aria-hidden="true"
        />

        {/* Header text + nav arrows */}
        <div className="relative h-full max-w-[1232px] mx-auto px-6 lg:px-0 flex items-end pb-10">
          <FadeInSection direction="up" delay={0}>
            <div className="flex items-end justify-between w-full">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-3 mb-0.5">
                  <div className="h-px w-8" style={{ background: "rgba(196,154,79,0.60)" }} />
                  <p className="text-[#c49a4f] text-[0.65rem] font-bold uppercase tracking-[0.28em]">
                    {t("farms.eyebrow")}
                  </p>
                  <div className="h-px w-8" style={{ background: "rgba(196,154,79,0.60)" }} />
                </div>
                <h2
                  className="font-display font-extrabold text-white leading-tight"
                  style={{
                    fontSize: "clamp(1.75rem, 3.2vw, 2.4rem)",
                    textShadow: "0 2px 24px rgba(0,0,0,0.45)",
                    letterSpacing: "-0.022em",
                  }}
                >
                  {t("farms.heading")}
                </h2>
                <p className="text-white/70 text-sm mt-1 leading-relaxed">
                  {t("farms.subtitle")}
                </p>
              </div>
              {farms.length > 0 && (
                <div className="flex gap-2 shrink-0 pb-1">
                  <ArrowBtn dir="left"  onClick={() => scroll("left")}  />
                  <ArrowBtn dir="right" onClick={() => scroll("right")} />
                </div>
              )}
            </div>
          </FadeInSection>
        </div>
      </div>

      {/* ── Product cards ────────────────────────────────────────────────────── */}
      <div className="py-10">
        <div className="max-w-[1232px] mx-auto px-6 lg:px-0">
          <FadeInSection direction="up" delay={80}>
            <div ref={ref} className="scroll-row -mx-6 px-6 lg:mx-0 lg:px-0">
              {farms.map((f) => (
                <ProductCard key={f.id} {...f} />
              ))}
            </div>
          </FadeInSection>
        </div>
      </div>
    </section>
  );
}
