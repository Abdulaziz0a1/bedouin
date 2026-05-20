"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import FadeInSection from "@/components/ui/FadeInSection";
import { useLanguage } from "@/context/LanguageProvider";
import { localizeText } from "@/lib/types/discovery";
import type { DiscoveryCollection, CollectionCategory } from "@/lib/types/discovery";

const FALLBACK_IMG = "https://picsum.photos/seed/bedouin-activity/400/300";

function ActivityImage({ src, alt }: { src: string; alt: string }) {
  const [imgSrc, setImgSrc] = useState(src || FALLBACK_IMG);
  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      onError={() => setImgSrc(FALLBACK_IMG)}
      className="object-cover group-hover:scale-110 transition-transform duration-500"
      sizes="200px"
    />
  );
}

interface TopThingsToDoProps {
  /** Pre-fetched activity collections from getHomepageCollections(). */
  collections: DiscoveryCollection[];
}

export default function TopThingsToDo({ collections }: TopThingsToDoProps) {
  const firstCategory = (collections[0]?.category ?? "explore") as CollectionCategory;
  const [active, setActive] = useState<CollectionCategory>(firstCategory);
  const { t, lang } = useLanguage();

  const currentCollection = collections.find((c) => c.category === active);
  const activities = currentCollection?.activities ?? [];

  if (collections.length === 0) return null;

  return (
    <section className="py-16 relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #fef9f3 0%, white 100%)" }}
    >
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, #e8dfd4 30%, #e8dfd4 70%, transparent)" }}
      />
      <div className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, #e8dfd4 30%, #e8dfd4 70%, transparent)" }}
      />

      <div className="max-w-[1232px] mx-auto px-6 lg:px-0 flex flex-col gap-8">

        {/* Header */}
        <FadeInSection direction="up" delay={0}>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <div className="h-px w-8" style={{ background: "linear-gradient(90deg, transparent, #c49a4f)" }} />
              <p className="text-[#c49a4f] text-[0.6875rem] font-bold uppercase tracking-[0.22em]">
                {t("things.eyebrow")}
              </p>
            </div>
            <h2 className="font-display font-extrabold text-[#1a0e02] leading-tight tracking-tight" style={{ fontSize: "clamp(1.9rem, 3.2vw, 2.6rem)" }}>
              {t("things.heading")}
            </h2>
          </div>
        </FadeInSection>

        {/* Category chips */}
        <FadeInSection direction="up" delay={60}>
          <div className="flex flex-wrap gap-2.5">
            {collections.map(({ category, labelKey }) => {
              const isActive = active === category;
              return (
                <button
                  key={category}
                  onClick={() => setActive(category)}
                  className="px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-250"
                  style={{
                    background: isActive
                      ? "linear-gradient(148deg, #5a2a00 0%, #3a1800 100%)"
                      : "rgba(255,255,255,0.90)",
                    color: isActive ? "rgba(255,248,235,0.96)" : "#3a2510",
                    border: isActive
                      ? "1.5px solid rgba(196,154,79,0.22)"
                      : "1.5px solid rgba(232,223,212,0.90)",
                    boxShadow: isActive
                      ? "0 4px 18px rgba(70,30,0,0.28), inset 0 1px 0 rgba(255,255,255,0.08)"
                      : "0 1px 4px rgba(70,30,0,0.06)",
                    transform: isActive ? "translateY(-1px)" : "none",
                    letterSpacing: "0.01em",
                  }}
                >
                  {t(labelKey)}
                </button>
              );
            })}
          </div>
        </FadeInSection>

        {/* Activity grid */}
        <FadeInSection direction="up" delay={100}>
          {activities.length === 0 ? (
            <p className="text-[#8b94a4] text-sm py-8 text-center">
              {t("things.empty") || "Experiences coming soon."}
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {activities.map(({ id, name, image, href }, i) => (
                <Link
                  key={id}
                  href={href}
                  className="flex flex-col gap-2.5 group"
                  style={{
                    animation: `fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 55}ms both`,
                  }}
                >
                  <div
                    className="relative h-[156px] rounded-2xl overflow-hidden"
                    style={{
                      boxShadow: "0 4px 16px rgba(70,30,0,0.10)",
                      transition: "box-shadow 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.boxShadow = "0 10px 32px rgba(70,30,0,0.22)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(70,30,0,0.10)";
                    }}
                  >
                    <ActivityImage src={image} alt={localizeText(name, lang)} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <p className="text-[#1a0e02] text-sm font-semibold truncate group-hover:text-[#8b5e38] transition-colors duration-200">
                    {localizeText(name, lang)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </FadeInSection>
      </div>
    </section>
  );
}
