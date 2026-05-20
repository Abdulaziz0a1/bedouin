"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import DestinationCard from "@/components/ui/DestinationCard";
import FadeInSection from "@/components/ui/FadeInSection";
import { useLanguage } from "@/context/LanguageProvider";
import { localizeText } from "@/lib/types/discovery";
import type { DiscoveryDestinationCard, Season } from "@/lib/types/discovery";

// ─── Season icons ─────────────────────────────────────────────────────────────

const SpringIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22V12"/><path d="M12 12C12 12 8 9 8 5a4 4 0 0 1 8 0c0 4-4 7-4 7z"/>
    <path d="M12 12C12 12 16 9 16 5"/><path d="M5 22h14"/>
  </svg>
);
const SummerIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
  </svg>
);
const AutumnIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
  </svg>
);
const WinterIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="2" x2="12" y2="22"/><path d="M17 7l-5 5-5-5"/><path d="M17 17l-5-5-5 5"/>
    <path d="M2 12h20"/><path d="M7 7l-5 5 5 5"/><path d="M17 7l5 5-5 5"/>
  </svg>
);

const SEASONS: { key: Season; tabKey: string; icon: React.ReactNode }[] = [
  { key: "spring", tabKey: "trending.tab.spring", icon: <SpringIcon /> },
  { key: "summer", tabKey: "trending.tab.summer", icon: <SummerIcon /> },
  { key: "autumn", tabKey: "trending.tab.autumn", icon: <AutumnIcon /> },
  { key: "winter", tabKey: "trending.tab.winter", icon: <WinterIcon /> },
];

// ─── Editorial destination cards (shown when zero real listings exist) ─────────
//
// These are static tourism editorial cards — NOT host listings.
// Images are reused from lib/data/discovery/trending-destinations.ts so they
// are consistent with the rest of the platform's visual language.

interface EditorialCard {
  city:     { en: string; ar: string };
  subtitle: { en: string; ar: string };
  image:    string;
  href:     string;
}

const EDITORIAL_DESTINATIONS: EditorialCard[] = [
  {
    city:     { en: "AlUla",    ar: "العُلا" },
    subtitle: { en: "Ancient wonders under open skies.",             ar: "عجائب أثرية تحت السماء المفتوحة." },
    image:    "https://images.unsplash.com/photo-1548092372-0d1bd40894a3?w=600&h=900&fit=crop",
    href:     "/destinations/alula",
  },
  {
    city:     { en: "Taif",     ar: "الطائف" },
    subtitle: { en: "Mountain breeze and rose-scented sunsets.",     ar: "نسيم الجبال وغروب برائحة الورد." },
    image:    "https://images.unsplash.com/photo-1444930694458-01babf71870c?w=600&h=900&fit=crop",
    href:     "/destinations/taif",
  },
  {
    city:     { en: "Abha",     ar: "أبها" },
    subtitle: { en: "Cool highlands escape from the summer heat.",   ar: "ملاذ المرتفعات الباردة من حرّ الصيف." },
    image:    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=900&fit=crop",
    href:     "/destinations/abha",
  },
  {
    city:     { en: "Al Ahsa",  ar: "الأحساء" },
    subtitle: { en: "Lush palm groves and ancient oasis culture.",   ar: "بساتين النخيل الخضراء وثقافة الواحات." },
    image:    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=900&fit=crop",
    href:     "/explore?region=Eastern+Province",
  },
];

// ─── Single editorial card ────────────────────────────────────────────────────

function EditorialDestinationCard({ card }: { card: EditorialCard }) {
  const [imgSrc,   setImgSrc]   = useState(card.image);
  const [imgLoaded, setImgLoaded] = useState(false);
  const { t, lang } = useLanguage();

  const cityName    = localizeText(card.city,     lang);
  const subtitleStr = localizeText(card.subtitle, lang);

  return (
    <Link
      href={card.href}
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
      {!imgLoaded && <div className="absolute inset-0 skeleton-img" aria-hidden="true" />}
      <Image
        src={imgSrc}
        alt={cityName}
        fill
        onLoad={() => setImgLoaded(true)}
        onError={() => { setImgSrc("https://picsum.photos/seed/bedouin-region/600/900"); setImgLoaded(true); }}
        className={`object-cover group-hover:scale-[1.08] transition-all duration-700 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
        style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
        sizes="280px"
      />

      {/* Multi-layer gradient — identical to DestinationCard */}
      <div
        className="absolute inset-0"
        style={{
          background: [
            "linear-gradient(to bottom, rgba(16,8,0,0.04) 25%, rgba(16,8,0,0.60) 72%, rgba(8,4,0,0.96) 100%)",
            "linear-gradient(to top right, rgba(70,30,0,0.22) 0%, transparent 55%)",
          ].join(", "),
        }}
      />

      {/* Top gold accent */}
      <div className="absolute top-5 left-5 flex items-center gap-2">
        <div className="w-8 h-[2px] rounded-full" style={{ background: "linear-gradient(90deg, #c49a4f, #f0c84a)" }} />
        <div className="w-2 h-[2px] rounded-full bg-[#c49a4f] opacity-50" />
      </div>

      {/* Hover gold border glow */}
      <div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: "inset 0 0 0 1.5px rgba(196,154,79,0.45)" }}
      />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 px-5 py-6 flex flex-col gap-1.5">
        <p className="text-[#c49a4f] text-[0.6rem] font-bold uppercase tracking-[0.22em]">
          {t("trending.editorial.eyebrow")}
        </p>
        <h3
          className="text-white font-display font-extrabold leading-tight"
          style={{ fontSize: "clamp(1.25rem, 2.2vw, 1.5rem)", letterSpacing: "-0.025em", textShadow: "0 2px 16px rgba(0,0,0,0.40)" }}
        >
          {cityName}
        </h3>
        <p className="text-white/68 text-[0.8rem] leading-snug mt-0.5">{subtitleStr}</p>

        {/* CTA — appears on hover */}
        <div className="flex items-center gap-1.5 mt-3.5 opacity-0 group-hover:opacity-100 transition-all duration-280 translate-y-1.5 group-hover:translate-y-0">
          <span className="text-[#c49a4f] text-[0.7rem] font-bold uppercase tracking-[0.16em]">
            {t("trending.editorial.cta")}
          </span>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="#c49a4f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

// ─── Editorial discovery section (zero real listings) ─────────────────────────

function EditorialDiscoverySection() {
  const { t } = useLanguage();

  return (
    <section className="bg-[#f4efe6] py-16">
      <div className="max-w-[1232px] mx-auto px-6 lg:px-0 flex flex-col gap-8">

        {/* Header */}
        <FadeInSection direction="up" delay={0}>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <div className="h-px w-8" style={{ background: "linear-gradient(90deg, transparent, #c49a4f)" }} />
              <p className="text-[#c49a4f] text-[0.6875rem] font-bold uppercase tracking-[0.22em]">
                {t("trending.eyebrow")}
              </p>
            </div>
            <h2
              className="font-display font-extrabold text-[#1a0e02] leading-tight tracking-tight"
              style={{ fontSize: "clamp(1.9rem, 3.2vw, 2.6rem)" }}
            >
              {t("trending.editorial.heading")}
            </h2>
            <p className="text-[#64707d] text-sm leading-relaxed max-w-md mt-0.5">
              {t("trending.editorial.subtitle")}
            </p>
          </div>
        </FadeInSection>

        {/* Cards */}
        <FadeInSection direction="up" delay={80}>
          <div className="scroll-row -mx-6 px-6 lg:mx-0 lg:px-0 pb-3" style={{ gap: "1.25rem" }}>
            {EDITORIAL_DESTINATIONS.map((card, i) => (
              <div
                key={card.href}
                style={{ animation: `fadeUp 0.55s cubic-bezier(0.16,1,0.3,1) ${i * 70}ms both` }}
              >
                <EditorialDestinationCard card={card} />
              </div>
            ))}
          </div>
        </FadeInSection>
      </div>
    </section>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface TrendingDestinationsProps {
  data: Record<Season, DiscoveryDestinationCard[]>;
}

export default function TrendingDestinations({ data }: TrendingDestinationsProps) {
  const [active, setActive] = useState<Season>("spring");
  const { t, lang } = useLanguage();

  // If no season has any real listings, show the editorial discovery section.
  const hasAnyListings = SEASONS.some(({ key }) => (data[key]?.length ?? 0) > 0);
  if (!hasAnyListings) return <EditorialDiscoverySection />;

  const destinations = data[active] ?? [];

  return (
    <section className="bg-[#f4efe6] py-16">
      <div className="max-w-[1232px] mx-auto px-6 lg:px-0 flex flex-col gap-8">

        {/* Header */}
        <FadeInSection direction="up" delay={0}>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <div className="h-px w-8" style={{ background: "linear-gradient(90deg, transparent, #c49a4f)" }} />
              <p className="text-[#c49a4f] text-[0.6875rem] font-bold uppercase tracking-[0.22em]">
                {t("trending.eyebrow")}
              </p>
            </div>
            <h2 className="font-display font-extrabold text-[#1a0e02] leading-tight tracking-tight" style={{ fontSize: "clamp(1.9rem, 3.2vw, 2.6rem)" }}>
              {t("trending.heading")}
            </h2>
            <p className="text-[#64707d] text-sm leading-relaxed max-w-md mt-0.5">
              {t("trending.subtitle")}
            </p>
          </div>
        </FadeInSection>

        {/* Season tabs */}
        <FadeInSection direction="up" delay={80}>
          <div className="flex flex-wrap gap-2">
            {SEASONS.map(({ key, tabKey, icon }) => {
              const isActive = active === key;
              return (
                <button
                  key={key}
                  onClick={() => setActive(key)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-250"
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
                  <span style={{ opacity: isActive ? 0.88 : 0.55 }}>{icon}</span>
                  {t(tabKey)}
                </button>
              );
            })}
          </div>
        </FadeInSection>

        {/* Cards row */}
        {destinations.length === 0 ? (
          <FadeInSection direction="up" delay={100}>
            <p className="text-[#8b94a4] text-sm py-8 text-center">
              {t("trending.tab.empty") || "Experiences for this season coming soon."}
            </p>
          </FadeInSection>
        ) : (
          <div className="scroll-row -mx-6 px-6 lg:mx-0 lg:px-0 pb-3" style={{ gap: "1.25rem" }}>
            {destinations.map((d, i) => (
              <div
                key={d.id}
                style={{ animation: `fadeUp 0.55s cubic-bezier(0.16,1,0.3,1) ${i * 70}ms both` }}
              >
                <DestinationCard
                  city={localizeText(d.city, lang)}
                  fromPrice={d.fromPrice}
                  description={localizeText(d.description, lang)}
                  image={d.image}
                  href={d.href}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
