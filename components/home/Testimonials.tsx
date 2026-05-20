"use client";

import { motion } from "framer-motion";
import FadeInSection from "@/components/ui/FadeInSection";
import { useLanguage } from "@/context/LanguageProvider";

const TESTIMONIALS = [
  { quoteKey: "testimonials.1.quote", nameKey: "testimonials.1.name", roleKey: "testimonials.1.role", initial: "ن", stars: 5 },
  { quoteKey: "testimonials.2.quote", nameKey: "testimonials.2.name", roleKey: "testimonials.2.role", initial: "خ", stars: 5 },
  { quoteKey: "testimonials.3.quote", nameKey: "testimonials.3.name", roleKey: "testimonials.3.role", initial: "ف", stars: 5 },
] as const;

const AVATAR_COLORS = [
  { bg: "#2d1a0a", text: "#c49a4f" },
  { bg: "#0f2218", text: "#5fad78" },
  { bg: "#1a0e22", text: "#a472c0" },
];

function LargeQuoteMark({ opacity = 0.18 }: { opacity?: number }) {
  return (
    <svg width="48" height="36" viewBox="0 0 48 36" fill="none" aria-hidden="true">
      <path
        d="M0 36V21.6C0 9.2 6.54 2.4 19.6 0L21.8 4C14.5 5.8 11.2 9.8 10.6 16H19.2V36H0zm28 0V21.6C28 9.2 34.54 2.4 47.6 0l2.2 4C42.5 5.8 39.2 9.8 38.6 16H47.2V36H28z"
        fill={`rgba(196,154,79,${opacity})`}
      />
    </svg>
  );
}

function StarRow({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="#c49a4f" opacity="0.80">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";

  return (
    <section style={{ background: "#0a0501", paddingTop: "96px", paddingBottom: "100px" }}>
      <div className="max-w-[1232px] mx-auto px-6 lg:px-0">

        {/* Header */}
        <FadeInSection direction="up" delay={0}>
          <div className={`flex flex-col gap-3 mb-16 ${isAr ? "items-end text-right" : ""}`}>
            <p className="text-[#c49a4f] text-[0.625rem] font-bold uppercase tracking-[0.28em]">
              {t("testimonials.eyebrow")}
            </p>
            <h2
              className="font-display font-extrabold text-white leading-[1.05]"
              style={{
                fontSize: "clamp(1.9rem, 3.4vw, 2.8rem)",
                letterSpacing: "-0.030em",
              }}
            >
              {t("testimonials.heading")}
            </h2>
          </div>
        </FadeInSection>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map(({ quoteKey, nameKey, roleKey, initial, stars }, i) => {
            const palette = AVATAR_COLORS[i];
            return (
              <FadeInSection key={quoteKey} direction="up" delay={i * 80} threshold={0.08}>
                <article
                  className={`flex flex-col gap-7 h-full rounded-2xl p-8 ${isAr ? "text-right" : ""}`}
                  style={{
                    background: "#1a0e06",
                    border: "1px solid rgba(196,154,79,0.10)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.32)",
                  }}
                >
                  {/* Opening quote ornament */}
                  <div className={isAr ? "self-end" : ""}>
                    <LargeQuoteMark opacity={i === 0 ? 0.28 : 0.18} />
                  </div>

                  {/* Stars */}
                  <div className={isAr ? "flex justify-end" : ""}>
                    <StarRow count={stars} />
                  </div>

                  {/* Quote text */}
                  <p
                    className="flex-1 leading-[1.82]"
                    style={{
                      fontSize: "clamp(0.875rem, 1.1vw, 0.9375rem)",
                      color: "rgba(255,255,255,0.72)",
                      fontStyle: "italic",
                    }}
                  >
                    {t(quoteKey)}
                  </p>

                  {/* Separator */}
                  <div
                    className={`h-px w-12 ${isAr ? "ml-auto" : ""}`}
                    style={{ background: "linear-gradient(to right, rgba(196,154,79,0.45), transparent)" }}
                    aria-hidden="true"
                  />

                  {/* Person */}
                  <div className={`flex items-center gap-3.5 ${isAr ? "flex-row-reverse" : ""}`}>
                    <div
                      className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center font-display font-bold text-[0.9rem]"
                      style={{ background: palette.bg, color: palette.text, border: `1px solid ${palette.text}28` }}
                      aria-hidden="true"
                    >
                      {initial}
                    </div>
                    <div className={`flex flex-col gap-0.5 ${isAr ? "text-right" : ""}`}>
                      <span
                        className="font-display font-semibold text-[0.875rem] leading-tight"
                        style={{ color: "#d4aa5f" }}
                      >
                        {t(nameKey)}
                      </span>
                      <span style={{ fontSize: "0.775rem", color: "rgba(255,255,255,0.38)" }}>
                        {t(roleKey)}
                      </span>
                    </div>
                  </div>
                </article>
              </FadeInSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}
