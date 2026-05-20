"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import FadeInSection from "@/components/ui/FadeInSection";
import { useLanguage } from "@/context/LanguageProvider";

/*
  Bedouin luxury palette only — no saturated hues.
  Every accent is a muted warm tone: olive, terracotta, bronze, gold, amber, stone.
*/
const CATEGORIES = [
  {
    id: "farms",
    labelKey: "host.type.farms",
    /* Subtle olive-sage tint on near-black */
    bg: "linear-gradient(150deg, #141904 0%, #0c1102 55%, #070a01 100%)",
    accent: "#9da45a",
    accentRgb: "157,164,90",
    glowRgb: "157,164,90",
    /* Decorative: 3 rising wheat-stalk strokes */
    motif: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <path d="M14 24V8M14 8c0 0-4-2-4-6M14 8c0 0 4-2 4-6M14 12c0 0-3-1.5-3-4.5M14 12c0 0 3-1.5 3-4.5M14 16c0 0-2.5-1-2.5-3.5M14 16c0 0 2.5-1 2.5-3.5"
          stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
    icon: (
      <svg width="46" height="46" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M4 28V14l12-9 12 9v14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 28v-9h8v9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7 22.5c0-2.5 2.24-4.5 5-4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeDasharray="2 1.5"/>
        <path d="M16 9v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "house",
    labelKey: "host.type.house",
    /* Desert terracotta tint */
    bg: "linear-gradient(150deg, #201008 0%, #130904 55%, #0a0502 100%)",
    accent: "#c07844",
    accentRgb: "192,120,68",
    glowRgb: "192,120,68",
    /* Decorative: Arabian arch outline */
    motif: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <path d="M4 24v-9.5C4 9.43 8.48 5 14 5s10 4.43 10 9.5V24M4 24h20" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10 24v-5a4 4 0 0 1 8 0v5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
    icon: (
      <svg width="46" height="46" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M5 28h22M7 28V14M25 28V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M2 14l14-10 14 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M13 20h6v8h-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9.5 19h2M20.5 19h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "guesthouse",
    labelKey: "host.type.guesthouse",
    /* Bronze-copper tint */
    bg: "linear-gradient(150deg, #180e06 0%, #0e0a04 55%, #080502 100%)",
    accent: "#b88e50",
    accentRgb: "184,142,80",
    glowRgb: "184,142,80",
    /* Decorative: interlocked hexagonal rings */
    motif: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <circle cx="10" cy="14" r="7" stroke="currentColor" strokeWidth="1.1"/>
        <circle cx="18" cy="14" r="7" stroke="currentColor" strokeWidth="1.1"/>
      </svg>
    ),
    icon: (
      <svg width="46" height="46" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect x="3" y="10" width="26" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M3 16h26" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        <path d="M10 10V7a6 6 0 0 1 12 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="16" cy="21" r="2" stroke="currentColor" strokeWidth="1.4"/>
      </svg>
    ),
  },
  {
    id: "glamping",
    labelKey: "host.type.glamping",
    /* Muted desert gold tint */
    bg: "linear-gradient(150deg, #1c1504 0%, #120f02 55%, #0c0b01 100%)",
    accent: "#c8a038",
    accentRgb: "200,160,56",
    glowRgb: "200,160,56",
    /* Decorative: crescent moon + star */
    motif: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <path d="M18 6a9 9 0 1 1-9 16 11 11 0 0 0 9-16z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="22" cy="6" r="1.2" fill="currentColor"/>
      </svg>
    ),
    icon: (
      <svg width="46" height="46" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M3 26L16 6l13 20H3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M11 26v-7h10v7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <path d="M5 19h22" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeDasharray="2 1.5"/>
      </svg>
    ),
  },
  {
    id: "cabins",
    labelKey: "host.type.cabins",
    /* Warm amber-cedar tint */
    bg: "linear-gradient(150deg, #160c04 0%, #0f0904 55%, #080604 100%)",
    accent: "#a87030",
    accentRgb: "168,112,48",
    glowRgb: "168,112,48",
    /* Decorative: pine tree silhouette */
    motif: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <path d="M14 4l6 7h-4l5 6h-4l4 5H7l4-5H7l5-6H8L14 4z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
        <path d="M14 22v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
    icon: (
      <svg width="46" height="46" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M5 16H3l13-12 13 12h-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 16v12h22V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 28v-7h8v7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8.5 20h2M21.5 20h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "doms",
    labelKey: "host.type.doms",
    /* Warm stone-bronze midnight tint (no blue) */
    bg: "linear-gradient(150deg, #141010 0%, #0d0a08 55%, #070508 100%)",
    accent: "#a08858",
    accentRgb: "160,136,88",
    glowRgb: "160,136,88",
    /* Decorative: scattered star field */
    motif: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <circle cx="6"  cy="8"  r="1.5" fill="currentColor"/>
        <circle cx="22" cy="6"  r="1"   fill="currentColor" opacity="0.7"/>
        <circle cx="14" cy="5"  r="1.2" fill="currentColor" opacity="0.9"/>
        <circle cx="24" cy="16" r="1"   fill="currentColor" opacity="0.6"/>
        <circle cx="8"  cy="18" r="0.8" fill="currentColor" opacity="0.5"/>
        <circle cx="20" cy="22" r="1.2" fill="currentColor" opacity="0.7"/>
        <circle cx="5"  cy="24" r="0.7" fill="currentColor" opacity="0.45"/>
      </svg>
    ),
    icon: (
      <svg width="46" height="46" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M5 28C5 20.27 9.93 14 16 14s11 6.27 11 14H5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M16 14V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="16" cy="5.5" r="1.5" fill="currentColor"/>
        <circle cx="7" cy="11"  r="0.9" fill="currentColor" opacity="0.55"/>
        <circle cx="25" cy="9"  r="1.1" fill="currentColor" opacity="0.65"/>
      </svg>
    ),
  },
] as const;

/* ── Subtle grain texture ─────────────────────────────────────────────────── */
function TileGrain() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23g)'/%3E%3C/svg%3E\")",
        backgroundRepeat: "repeat",
        backgroundSize: "140px 140px",
        opacity: 0.038,
        mixBlendMode: "overlay",
      }}
      aria-hidden="true"
    />
  );
}

interface Props {
  counts: Record<string, number>;
}

export default function ExperienceCategories({ counts }: Props) {
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";

  return (
    <section style={{ background: "#0d0602", paddingTop: "88px", paddingBottom: "96px" }}>
      <div className="max-w-[1232px] mx-auto px-6 lg:px-0">

        {/* Section header */}
        <FadeInSection direction="up" delay={0}>
          <div className={`flex flex-col gap-3 mb-14 ${isAr ? "items-end text-right" : ""}`}>
            <span className="text-[#c49a4f] text-[0.625rem] font-bold uppercase tracking-[0.30em]">
              {t("exp_cats.eyebrow")}
            </span>
            <h2
              className="font-display font-extrabold text-white leading-tight"
              style={{
                fontSize: "clamp(1.8rem, 3.2vw, 2.6rem)",
                letterSpacing: "-0.028em",
              }}
            >
              {t("exp_cats.heading")}
            </h2>
          </div>
        </FadeInSection>

        {/* Tile grid — editorial bottom-anchored layout */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {CATEGORIES.map((cat, i) => {
            const count = counts[cat.id] ?? 0;
            return (
              <FadeInSection key={cat.id} direction="up" delay={i * 50} threshold={0.06}>
                <motion.div
                  whileHover={{ y: -5, scale: 1.015 }}
                  transition={{ duration: 0.30, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={`/explore?category=${cat.id}`}
                    className="group relative flex flex-col justify-between rounded-[18px] overflow-hidden"
                    style={{ height: "272px", background: cat.bg }}
                    aria-label={t(cat.labelKey)}
                  >
                    {/* Grain overlay */}
                    <TileGrain />

                    {/* Warm ambient glow on hover */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-600 pointer-events-none"
                      style={{
                        background: `radial-gradient(ellipse 85% 55% at 50% 108%, rgba(${cat.glowRgb},0.18) 0%, transparent 68%)`,
                      }}
                      aria-hidden="true"
                    />

                    {/* Bottom dark vignette — always, ensures text legibility */}
                    <div
                      className="absolute bottom-0 left-0 right-0 pointer-events-none"
                      style={{
                        height: "55%",
                        background: "linear-gradient(to top, rgba(4,2,0,0.82) 0%, rgba(4,2,0,0.30) 60%, transparent 100%)",
                      }}
                      aria-hidden="true"
                    />

                    {/* Top: decorative motif (corner) */}
                    <div
                      className={`relative z-10 flex pt-5 ${isAr ? "flex-row-reverse pr-5" : "justify-end pr-5"} opacity-[0.10] group-hover:opacity-[0.20] transition-opacity duration-400`}
                      style={{ color: cat.accent }}
                      aria-hidden="true"
                    >
                      {cat.motif}
                    </div>

                    {/* Middle: icon centered */}
                    <div className="relative z-10 flex items-center justify-center flex-1">
                      <div
                        className="flex items-center justify-center w-[72px] h-[72px] rounded-2xl transition-transform duration-300 group-hover:scale-110"
                        style={{
                          color: cat.accent,
                          background: `rgba(${cat.accentRgb},0.10)`,
                          border: `1px solid rgba(${cat.accentRgb},0.20)`,
                          boxShadow: `0 4px 24px rgba(${cat.glowRgb},0.08)`,
                        }}
                      >
                        {cat.icon}
                      </div>
                    </div>

                    {/* Bottom: text anchored to the bottom */}
                    <div className={`relative z-10 px-5 pb-5 ${isAr ? "text-right" : ""}`}>
                      {/* Thin accent rule */}
                      <div
                        className={`h-px w-8 mb-3 ${isAr ? "ml-auto" : ""}`}
                        style={{
                          background: isAr
                            ? `linear-gradient(to left, rgba(${cat.accentRgb},0.70), transparent)`
                            : `linear-gradient(to right, rgba(${cat.accentRgb},0.70), transparent)`,
                        }}
                        aria-hidden="true"
                      />

                      {/* Category name */}
                      <span
                        className="block font-display font-bold text-white leading-snug tracking-tight"
                        style={{ fontSize: "clamp(0.875rem, 1.4vw, 1rem)" }}
                      >
                        {t(cat.labelKey)}
                      </span>

                      {/* Count or explore prompt */}
                      <span
                        className="block mt-1"
                        style={{
                          fontSize: "0.7rem",
                          color: `rgba(${cat.accentRgb},0.70)`,
                          fontWeight: 600,
                          letterSpacing: "0.06em",
                        }}
                      >
                        {count > 0
                          ? `${count} ${count === 1 ? t("exp_cats.listings_singular") : t("exp_cats.listings_plural")}`
                          : t("exp_cats.explore")}
                      </span>
                    </div>

                    {/* Hover: top highlight edge */}
                    <div
                      className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-60 transition-opacity duration-400 pointer-events-none"
                      style={{
                        background: `linear-gradient(90deg, transparent 0%, rgba(${cat.accentRgb},0.80) 50%, transparent 100%)`,
                      }}
                      aria-hidden="true"
                    />
                  </Link>
                </motion.div>
              </FadeInSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}
