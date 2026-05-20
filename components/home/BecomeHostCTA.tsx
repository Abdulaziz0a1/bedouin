"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import FadeInSection from "@/components/ui/FadeInSection";
import { useAuth } from "@/context/AuthProvider";
import { useLanguage } from "@/context/LanguageProvider";

function DiamondOrn({ size = 5 }: { size?: number }) {
  return (
    <svg width={size * 2.4} height={size * 2.4} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="11" y="1" width="13" height="13" rx="0.7" transform="rotate(45 11 1)" fill="none" stroke="#c49a4f" strokeWidth="1" opacity="0.55"/>
      <rect x="11" y="4.5" width="7" height="7" rx="0.4" transform="rotate(45 11 4.5)" fill="#c49a4f" opacity="0.35"/>
    </svg>
  );
}

export default function BecomeHostCTA() {
  const { hostStatus } = useAuth();
  const { t, lang }    = useLanguage();
  const isAr = lang === "ar";

  const href  = hostStatus === "approved" ? "/dashboard" : "/host/onboarding";
  const label = hostStatus === "approved" ? t("host_banner.cta_dash") : t("host_banner.cta");

  return (
    <section className="relative overflow-hidden" style={{ minHeight: "520px" }}>

      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/images/saudi-hospitality-story.jpg"
          alt=""
          fill
          className="object-cover object-center"
          aria-hidden="true"
        />
      </div>

      {/* Deep warm darkness overlay */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(160deg, rgba(14,6,0,0.96) 0%, rgba(32,14,2,0.92) 45%, rgba(55,22,0,0.82) 100%)" }}
        aria-hidden="true"
      />

      {/* Right-side image reveal */}
      <div
        className={`absolute inset-0`}
        style={{
          background: isAr
            ? "linear-gradient(to left, rgba(55,22,0,0.22) 0%, rgba(14,6,0,0.78) 55%)"
            : "linear-gradient(to right, rgba(55,22,0,0.22) 0%, rgba(14,6,0,0.78) 55%)",
        }}
        aria-hidden="true"
      />

      {/* Horizon gold streak */}
      <motion.div
        className="absolute pointer-events-none left-0 right-0"
        style={{
          height: "1px",
          top: "50%",
          background: "linear-gradient(90deg, transparent 0%, rgba(196,154,79,0.06) 15%, rgba(240,198,80,0.28) 42%, rgba(255,220,100,0.42) 50%, rgba(240,198,80,0.28) 58%, rgba(196,154,79,0.06) 85%, transparent 100%)",
        }}
        initial={{ opacity: 0, scaleX: 0.6 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        aria-hidden="true"
      />

      {/* Gold top rule */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent 0%, rgba(196,154,79,0.45) 25%, rgba(240,200,74,0.70) 50%, rgba(196,154,79,0.45) 75%, transparent 100%)" }}
        aria-hidden="true"
      />

      {/* Gold bottom rule */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent 0%, rgba(196,154,79,0.25) 30%, rgba(196,154,79,0.45) 50%, rgba(196,154,79,0.25) 70%, transparent 100%)" }}
        aria-hidden="true"
      />

      {/* Content — centered column */}
      <div className="relative flex items-center justify-center min-h-[520px]">
        <div className="max-w-[1232px] mx-auto px-6 lg:px-0 py-20 w-full">
          <FadeInSection direction="up" delay={0}>
            <div className={`flex flex-col items-center text-center gap-6 max-w-[680px] mx-auto ${isAr ? "text-right items-end" : ""}`}>

              {/* Eyebrow with ornaments */}
              <div className={`flex items-center gap-3 ${isAr ? "flex-row-reverse" : ""}`}>
                <DiamondOrn size={4} />
                <span className="text-[#c49a4f] text-[0.625rem] font-bold uppercase tracking-[0.30em]">
                  {t("host_cta.eyebrow")}
                </span>
                <DiamondOrn size={4} />
              </div>

              {/* Heading */}
              <h2
                className="font-display font-extrabold text-white leading-[1.04]"
                style={{
                  fontSize: "clamp(2.2rem, 4.5vw, 3.4rem)",
                  letterSpacing: "-0.028em",
                  textShadow: "0 3px 48px rgba(0,0,0,0.55), 0 1px 8px rgba(0,0,0,0.30)",
                }}
              >
                {t("host_banner.headline")}
              </h2>

              {/* Ornamental rule */}
              <div className="flex items-center gap-3">
                <div className="h-px w-12" style={{ background: "linear-gradient(to right, transparent, rgba(196,154,79,0.50))" }} aria-hidden="true" />
                <DiamondOrn size={5} />
                <div className="h-px w-24" style={{ background: "linear-gradient(to right, rgba(196,154,79,0.50), transparent)" }} aria-hidden="true" />
              </div>

              {/* Subtitle */}
              <p
                className="leading-[1.72] max-w-[500px]"
                style={{
                  fontSize: "clamp(0.9rem, 1.5vw, 1.025rem)",
                  color: "rgba(255,255,255,0.52)",
                }}
              >
                {t("host_banner.sub")}
              </p>

              {/* CTA button */}
              <motion.div
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-2"
              >
                <Link
                  href={href}
                  className="inline-flex items-center gap-2.5 font-display font-bold px-10 py-4 rounded-xl text-[0.9rem]"
                  style={{
                    background: "linear-gradient(150deg, #d4aa5f 0%, #c49a4f 55%, #a87c38 100%)",
                    color: "#1a0e02",
                    boxShadow: "0 6px 36px rgba(196,154,79,0.46), 0 2px 10px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.30)",
                  }}
                >
                  {label}
                  <svg
                    width="16" height="16" viewBox="0 0 24 24" fill="none"
                    className={isAr ? "rotate-180" : ""}
                    aria-hidden="true"
                  >
                    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              </motion.div>
            </div>
          </FadeInSection>
        </div>
      </div>
    </section>
  );
}
