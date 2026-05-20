"use client";

import { useRef } from "react";
import ProductCard from "@/components/ui/ProductCard";
import FadeInSection from "@/components/ui/FadeInSection";
import { useLanguage } from "@/context/LanguageProvider";
import type { HomepageListing } from "@/lib/server/homepage/getMarketplaceListings";

interface Props {
  listings: HomepageListing[];
}

export default function RecentlyAdded({ listings }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const scroll = (dir: "left" | "right") =>
    ref.current?.scrollBy({ left: dir === "right" ? 316 : -316, behavior: "smooth" });

  if (listings.length === 0) return null;

  return (
    <section className="py-16 bg-[#f4efe6]">
      <div className="max-w-[1232px] mx-auto px-6 lg:px-0 flex flex-col gap-8">
        <FadeInSection direction="up" delay={0}>
          <div className="flex items-end justify-between">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2.5">
                <div className="h-px w-8" style={{ background: "linear-gradient(90deg, transparent, #c49a4f)" }} />
                <p className="text-[#c49a4f] text-[0.6875rem] font-bold uppercase tracking-[0.22em]">
                  {t("recent.eyebrow")}
                </p>
              </div>
              <h2
                className="font-display font-extrabold text-[#1a0e02] leading-tight tracking-tight"
                style={{ fontSize: "clamp(1.9rem, 3.2vw, 2.6rem)" }}
              >
                {t("recent.heading")}
              </h2>
              <p className="text-[#8b94a4] text-sm mt-0.5 leading-relaxed">
                {t("recent.subtitle")}
              </p>
            </div>

            <div className="flex gap-2 shrink-0 pb-1">
              <button
                onClick={() => scroll("left")}
                aria-label="Previous"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:-translate-x-0.5"
                style={{
                  background: "white",
                  border: "1px solid #e8dfd4",
                  boxShadow: "0 2px 8px rgba(70,30,0,0.06)",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#461e00"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#e8dfd4"; }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18l-6-6 6-6" stroke="#1a0e02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                onClick={() => scroll("right")}
                aria-label="Next"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:translate-x-0.5"
                style={{
                  background: "linear-gradient(135deg, #461e00 0%, #5a2a00 100%)",
                  boxShadow: "0 4px 12px rgba(70,30,0,0.30)",
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18l6-6-6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </FadeInSection>

        <FadeInSection direction="up" delay={80}>
          <div ref={ref} className="scroll-row -mx-6 px-6 lg:mx-0 lg:px-0">
            {listings.map((l) => (
              <ProductCard key={l.id} {...l} />
            ))}
          </div>
        </FadeInSection>
      </div>
    </section>
  );
}
