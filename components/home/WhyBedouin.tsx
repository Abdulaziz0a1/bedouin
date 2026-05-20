"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import FadeInSection from "@/components/ui/FadeInSection";
import { useLanguage } from "@/context/LanguageProvider";

/* ── Pillar icons — warm gold linework ────────────────────────────────────── */
function PlaceIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <path d="M13 2.5C9.41 2.5 6.5 5.41 6.5 9c0 5.25 6.5 13.5 6.5 13.5S19.5 14.25 19.5 9c0-3.59-2.91-6.5-6.5-6.5z"
        stroke="rgba(196,154,79,0.80)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="13" cy="9" r="2.5" stroke="rgba(196,154,79,0.80)" strokeWidth="1.4"/>
    </svg>
  );
}
function PeopleIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <circle cx="13" cy="9" r="4" stroke="rgba(196,154,79,0.80)" strokeWidth="1.4"/>
      <path d="M4 23.5c0-4.97 4.03-9 9-9s9 4.03 9 9"
        stroke="rgba(196,154,79,0.80)" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M20.5 6.5l1.5 1.5-3 3" stroke="rgba(196,154,79,0.70)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <path d="M13 2L3.5 6.5v8c0 5.8 4.06 11.22 9.5 12.48C18.44 25.72 22.5 20.3 22.5 14.5v-8L13 2z"
        stroke="rgba(196,154,79,0.80)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9.5 13.5l3 3 5-6" stroke="rgba(196,154,79,0.90)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

const PILLARS = [
  { num: "01", titleKey: "why.pillar1.title", bodyKey: "why.pillar1.body", icon: <PlaceIcon /> },
  { num: "02", titleKey: "why.pillar2.title", bodyKey: "why.pillar2.body", icon: <PeopleIcon /> },
  { num: "03", titleKey: "why.pillar3.title", bodyKey: "why.pillar3.body", icon: <ShieldIcon /> },
] as const;

export default function WhyBedouin() {
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";

  return (
    <section style={{ background: "#0a0602", paddingTop: "96px", paddingBottom: "96px" }}>
      <div className="max-w-[1232px] mx-auto px-6 lg:px-0">

        {/* Section header — full width above the split */}
        <FadeInSection direction="up" delay={0}>
          <div className={`flex flex-col gap-3 mb-12 ${isAr ? "items-end text-right" : ""}`}>
            <span className="text-[#c49a4f] text-[0.625rem] font-bold uppercase tracking-[0.30em]">
              {t("why.eyebrow")}
            </span>
            <h2
              className="font-display font-extrabold text-white leading-[1.04]"
              style={{
                fontSize: "clamp(1.9rem, 3.6vw, 3rem)",
                letterSpacing: "-0.030em",
                maxWidth: "520px",
              }}
            >
              {t("why.heading")}
            </h2>
          </div>
        </FadeInSection>

        {/* Editorial split ─────────────────────────────────────────────────── */}
        <div
          className={`grid grid-cols-1 lg:grid-cols-[45%_55%] overflow-hidden rounded-2xl ${isAr ? "lg:grid-cols-[55%_45%]" : ""}`}
          style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.42), 0 8px 24px rgba(0,0,0,0.22)" }}
        >

          {/* ── Left: atmospheric image ──────────────────────────────────── */}
          <FadeInSection direction={isAr ? "right" : "left"} delay={0} className="relative h-[240px] lg:h-auto min-h-[380px]">
            <div className="absolute inset-0 overflow-hidden">
              <Image
                src="/images/saudi-hospitality-story.jpg"
                alt=""
                fill
                className="object-cover object-center scale-[1.04] group-hover:scale-100 transition-transform duration-1000"
                sizes="(max-width: 1024px) 100vw, 45vw"
                aria-hidden="true"
              />

              {/* Subtle grain */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23g)'/%3E%3C/svg%3E\")",
                  backgroundRepeat: "repeat",
                  backgroundSize: "140px 140px",
                  opacity: 0.05,
                  mixBlendMode: "overlay",
                }}
                aria-hidden="true"
              />

              {/* Warmth overlay */}
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(160deg, rgba(16,8,0,0.22) 0%, rgba(8,4,0,0.08) 100%)" }}
                aria-hidden="true"
              />

              {/* Right-edge fade (toward text panel) */}
              <div
                className="absolute inset-0"
                style={{
                  background: isAr
                    ? "linear-gradient(to left, rgba(16,6,0,0.75) 0%, rgba(16,6,0,0.22) 35%, transparent 65%)"
                    : "linear-gradient(to right, rgba(16,6,0,0.75) 0%, rgba(16,6,0,0.22) 35%, transparent 65%)",
                }}
                aria-hidden="true"
              />

              {/* Floating label on image */}
              <div className={`absolute bottom-7 ${isAr ? "right-7" : "left-7"}`}>
                <span
                  className="text-[0.625rem] font-bold uppercase tracking-[0.28em]"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  {t("why.eyebrow")}
                </span>
              </div>
            </div>
          </FadeInSection>

          {/* ── Right: numbered pillars ───────────────────────────────────── */}
          <div
            className={`flex flex-col justify-center ${isAr ? "text-right" : ""}`}
            style={{ background: "#160a04", padding: "clamp(2.5rem, 5vw, 3.5rem) clamp(2rem, 4vw, 3.5rem)" }}
          >
            {PILLARS.map(({ num, titleKey, bodyKey, icon }, i) => (
              <FadeInSection key={titleKey} direction={isAr ? "left" : "right"} delay={i * 100} threshold={0.08}>
                <div
                  className={`flex items-start gap-5 py-8 ${
                    i < PILLARS.length - 1 ? "border-b" : ""
                  } ${isAr ? "flex-row-reverse" : ""}`}
                  style={{ borderColor: "rgba(196,154,79,0.10)" }}
                >
                  {/* Gold number — visible, not hidden */}
                  <div
                    className="shrink-0 font-display font-black tabular-nums leading-none mt-0.5"
                    style={{
                      fontSize: "2.4rem",
                      color: "#c49a4f",
                      opacity: 0.42,
                      letterSpacing: "-0.04em",
                    }}
                    aria-hidden="true"
                  >
                    {num}
                  </div>

                  {/* Content */}
                  <div className={`flex flex-col gap-3 flex-1 ${isAr ? "text-right" : ""}`}>
                    {/* Icon + title row */}
                    <div className={`flex items-center gap-2.5 ${isAr ? "flex-row-reverse" : ""}`}>
                      <div className="shrink-0" aria-hidden="true">
                        {icon}
                      </div>
                      <h3
                        className="font-display font-bold text-white leading-snug"
                        style={{ fontSize: "clamp(1rem, 1.5vw, 1.125rem)", letterSpacing: "-0.016em" }}
                      >
                        {t(titleKey)}
                      </h3>
                    </div>

                    {/* Body */}
                    <p
                      className="leading-[1.76]"
                      style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.48)" }}
                    >
                      {t(bodyKey)}
                    </p>

                    {/* Accent rule — animated entry */}
                    <motion.div
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true, margin: "-30px" }}
                      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.15 + i * 0.1 }}
                      className={`h-px w-8 mt-1 ${isAr ? "origin-right ml-auto" : "origin-left"}`}
                      style={{ background: "linear-gradient(to right, rgba(196,154,79,0.60), transparent)" }}
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
