"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import FadeInSection from "@/components/ui/FadeInSection";
import { useLanguage } from "@/context/LanguageProvider";

const REGIONS = [
  {
    titleKey:  "regions.alula.title",
    subKey:    "regions.alula.sub",
    image:     "/images/bedouin-hero.jpg",
    href:      "/explore?region=Madinah",
    position:  "object-center",
  },
  {
    titleKey:  "regions.abha.title",
    subKey:    "regions.abha.sub",
    image:     "/images/saudi-desert-story.jpg",
    href:      "/explore?region=Asir",
    position:  "object-center",
  },
  {
    titleKey:  "regions.taif.title",
    subKey:    "regions.taif.sub",
    image:     "/images/saudi-farm-story.jpg",
    href:      "/explore?region=Makkah",
    position:  "object-center",
  },
  {
    titleKey:  "regions.alahsa.title",
    subKey:    "regions.alahsa.sub",
    image:     "/images/saudi-hospitality-story.jpg",
    href:      "/explore?region=Eastern Province",
    position:  "object-center",
  },
] as const;

function RegionCard({
  titleKey, subKey, image, href, position, tall, delay,
}: {
  titleKey: string; subKey: string; image: string;
  href: string; position: string; tall?: boolean; delay: number;
}) {
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";

  return (
    <FadeInSection direction="up" delay={delay}>
      <Link
        href={href}
        className="group relative block rounded-2xl overflow-hidden"
        style={{ height: tall ? "480px" : "228px" }}
      >
        {/* Image */}
        <motion.div
          className="absolute inset-0"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image
            src={image}
            alt=""
            fill
            className={`object-cover ${position}`}
            sizes="(max-width: 768px) 100vw, 50vw"
            aria-hidden="true"
          />
        </motion.div>

        {/* Gradient overlay — darkens bottom for text legibility */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to bottom, rgba(10,5,0,0.12) 0%, rgba(10,5,0,0.20) 40%, rgba(10,5,0,0.72) 80%, rgba(10,5,0,0.88) 100%)",
          }}
          aria-hidden="true"
        />

        {/* Content */}
        <div className={`absolute bottom-0 left-0 right-0 p-6 ${isAr ? "text-right" : ""}`}>
          <p className="text-[#f0c84a] text-[0.7rem] font-bold uppercase tracking-[0.22em] mb-1.5 opacity-90">
            {t(subKey)}
          </p>
          <h3 className="font-display font-extrabold text-white leading-tight"
            style={{ fontSize: tall ? "clamp(1.5rem, 2.8vw, 2rem)" : "1.25rem", letterSpacing: "-0.02em" }}
          >
            {t(titleKey)}
          </h3>
          {/* Explore arrow */}
          <div className={`flex items-center gap-1.5 mt-3 ${isAr ? "flex-row-reverse" : ""}`}>
            <span className="text-white/65 text-[0.75rem] font-semibold transition-colors duration-200 group-hover:text-white">
              {t("regions.cta")}
            </span>
            <svg
              width="12" height="12" viewBox="0 0 24 24" fill="none"
              className={`text-white/65 group-hover:text-white transition-all duration-200 group-hover:translate-x-0.5 ${isAr ? "rotate-180" : ""}`}
              aria-hidden="true"
            >
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </Link>
    </FadeInSection>
  );
}

export default function DiscoverRegions() {
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";

  const [alula, abha, taif, alahsa] = REGIONS;

  return (
    <section className="py-20" style={{ background: "#fef9f3" }}>
      <div className="max-w-[1232px] mx-auto px-6 lg:px-0">

        {/* Header */}
        <FadeInSection direction="up" delay={0}>
          <div className={`flex flex-col gap-2 mb-12 ${isAr ? "items-end text-right" : ""}`}>
            <div className={`flex items-center gap-2.5 ${isAr ? "flex-row-reverse" : ""}`}>
              <div
                className="h-px w-8"
                style={{
                  background: isAr
                    ? "linear-gradient(to left, transparent, #c49a4f)"
                    : "linear-gradient(to right, transparent, #c49a4f)",
                }}
              />
              <p className="text-[#c49a4f] text-[0.6875rem] font-bold uppercase tracking-[0.24em]">
                {t("regions.eyebrow")}
              </p>
            </div>
            <h2
              className="font-display font-extrabold text-[#1a0e02] leading-tight tracking-tight"
              style={{ fontSize: "clamp(1.9rem, 3.2vw, 2.6rem)" }}
            >
              {t("regions.heading")}
            </h2>
            <p className="text-[#64707d] text-[0.9rem] leading-relaxed max-w-xl mt-0.5">
              {t("regions.subtitle")}
            </p>
          </div>
        </FadeInSection>

        {/* Asymmetric grid: [AlUla tall left] [Abha + Taif stacked right] + [Al Ahsa full bottom] */}
        <div className="grid grid-cols-1 gap-4">

          {/* Top row */}
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[5fr_4fr] gap-4 ${isAr ? "lg:grid-cols-[4fr_5fr]" : ""}`}>
            <RegionCard {...alula} tall delay={0} />
            <div className="flex flex-col gap-4">
              <RegionCard {...abha} delay={60} />
              <RegionCard {...taif} delay={120} />
            </div>
          </div>

          {/* Bottom full-width */}
          <FadeInSection direction="up" delay={180}>
            <div className="h-[220px] relative rounded-2xl overflow-hidden">
              <Link href={alahsa.href} className="group absolute inset-0">
                <motion.div
                  className="absolute inset-0"
                  whileHover={{ scale: 1.04 }}
                  transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Image
                    src={alahsa.image}
                    alt=""
                    fill
                    className="object-cover object-center"
                    aria-hidden="true"
                  />
                </motion.div>
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: isAr
                      ? "linear-gradient(to left, rgba(10,5,0,0.80) 0%, rgba(10,5,0,0.50) 35%, rgba(10,5,0,0.20) 65%, transparent 100%)"
                      : "linear-gradient(to right, rgba(10,5,0,0.80) 0%, rgba(10,5,0,0.50) 35%, rgba(10,5,0,0.20) 65%, transparent 100%)",
                  }}
                  aria-hidden="true"
                />
                <div className={`absolute inset-0 flex flex-col justify-center px-8 ${isAr ? "items-end text-right" : ""}`}>
                  <p className="text-[#f0c84a] text-[0.7rem] font-bold uppercase tracking-[0.22em] mb-1.5 opacity-90">
                    {t(alahsa.subKey)}
                  </p>
                  <h3 className="font-display font-extrabold text-white text-[1.5rem] leading-tight mb-3" style={{ letterSpacing: "-0.02em" }}>
                    {t(alahsa.titleKey)}
                  </h3>
                  <div className={`flex items-center gap-1.5 ${isAr ? "flex-row-reverse" : ""}`}>
                    <span className="text-white/65 text-[0.75rem] font-semibold group-hover:text-white transition-colors duration-200">
                      {t("regions.cta")}
                    </span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                      className={`text-white/65 group-hover:text-white transition-all duration-200 group-hover:translate-x-0.5 ${isAr ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    >
                      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </Link>
            </div>
          </FadeInSection>
        </div>
      </div>
    </section>
  );
}
