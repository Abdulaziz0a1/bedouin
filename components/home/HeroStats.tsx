"use client";

import FadeInSection from "@/components/ui/FadeInSection";
import { useLanguage } from "@/context/LanguageProvider";

const STATS = [
  { valueKey: "hero.stat1.value", labelKey: "hero.stat1.label" },
  { valueKey: "hero.stat2.value", labelKey: "hero.stat2.label" },
  { valueKey: "hero.stat3.value", labelKey: "hero.stat3.label" },
] as const;

export default function HeroStats() {
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";

  return (
    <FadeInSection direction="up" delay={0}>
      <div
        className="py-6"
        style={{
          background: "#1a0e02",
          borderBottom: "1px solid rgba(196,154,79,0.14)",
        }}
      >
        <div className="max-w-[1232px] mx-auto px-6 lg:px-0">
          <div className={`flex items-center justify-center gap-0 divide-x ${isAr ? "flex-row-reverse divide-x-reverse" : ""}`}
            style={{ "--tw-divide-opacity": "1", borderColor: "rgba(196,154,79,0.18)" } as React.CSSProperties}
          >
            {STATS.map(({ valueKey, labelKey }, i) => (
              <div
                key={labelKey}
                className="flex flex-col items-center gap-0.5 px-8 sm:px-14 first:pl-0 last:pr-0"
              >
                <span
                  className="font-display font-extrabold leading-none"
                  style={{
                    fontSize: "clamp(1.25rem, 2.2vw, 1.6rem)",
                    background: "linear-gradient(135deg, #d4aa5f 0%, #f0c84a 50%, #c49a4f 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {t(valueKey)}
                </span>
                <span className="text-white/50 text-[0.72rem] font-medium uppercase tracking-[0.12em]">
                  {t(labelKey)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </FadeInSection>
  );
}
