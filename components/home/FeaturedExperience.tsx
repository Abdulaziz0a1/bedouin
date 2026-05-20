"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageProvider";

export default function FeaturedExperience() {
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // React's `muted` JSX prop is a known bug — it does NOT set the DOM
    // attribute, so browsers block autoplay. Setting it imperatively fixes it.
    video.muted = true;
    video.play().catch(() => {
      // Autoplay silently blocked — static warm overlay still provides context.
    });
  }, []);

  return (
    // No padding — section sits flush above and below with zero beige band
    <section
      className="w-full"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div
        className="relative w-full overflow-hidden"
        style={{ minHeight: "clamp(480px, 82vh, 920px)" }}
      >
        {/* ── Video ─────────────────────────────────────────────────────────── */}
        {/* No `controls` attr → browser never renders a native play button.   */}
        {/* `muted` here is kept for SSR/hydration consistency; the imperative  */}
        {/* set in useEffect is what actually enables autoplay in the DOM.      */}
        <video
          ref={videoRef}
          src="/videos/bedouin-brand.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* ── Warm dark base — always present, acts as fallback if video fails  */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, rgba(26,14,2,0.45) 0%, rgba(10,5,0,0.30) 60%, rgba(26,14,2,0.45) 100%)",
            zIndex: 1,
          }}
          aria-hidden="true"
        />

        {/* ── Bottom-up cinematic overlay ───────────────────────────────────── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(6,3,0,0.94) 0%, rgba(6,3,0,0.60) 32%, rgba(6,3,0,0.22) 60%, rgba(6,3,0,0.04) 100%)",
            zIndex: 2,
          }}
          aria-hidden="true"
        />

        {/* ── Radial vignette ───────────────────────────────────────────────── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 40%, rgba(6,3,0,0.50) 100%)",
            zIndex: 2,
          }}
          aria-hidden="true"
        />

        {/* ── Thin gold accent line at top ──────────────────────────────────── */}
        <div
          className="absolute top-0 inset-x-0 h-[2px] pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, transparent 0%, #c49a4f 26%, #e8c47a 50%, #c49a4f 74%, transparent 100%)",
            opacity: 0.60,
            zIndex: 3,
          }}
          aria-hidden="true"
        />

        {/* ── Content ───────────────────────────────────────────────────────── */}
        <div
          className={`
            absolute inset-0 flex flex-col justify-end
            px-6 py-10
            sm:px-10 sm:py-14
            lg:px-16 lg:py-16
            xl:px-20 xl:py-20
            ${isAr ? "items-end text-right" : "items-start text-left"}
          `}
          style={{ zIndex: 10 }}
        >
          <motion.div
            className={`w-full max-w-[620px] ${isAr ? "ml-auto mr-0" : ""}`}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Eyebrow pill */}
            <div
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-5 ${isAr ? "flex-row-reverse" : ""}`}
              style={{
                background: "rgba(196,154,79,0.16)",
                border: "1px solid rgba(196,154,79,0.38)",
                backdropFilter: "blur(8px)",
              }}
            >
              <span
                className="inline-block w-1.5 h-1.5 rounded-sm rotate-45 flex-shrink-0"
                style={{ background: "#c49a4f" }}
                aria-hidden="true"
              />
              <span className="text-[#d4aa5f] text-[0.65rem] font-bold uppercase tracking-[0.26em]">
                {t("brand.eyebrow")}
              </span>
            </div>

            {/* Headline */}
            <h2
              className="font-display font-extrabold text-white leading-[1.05] mb-4"
              style={{
                fontSize: "clamp(2rem, 4.8vw, 3.8rem)",
                letterSpacing: "-0.026em",
                textShadow: "0 4px 36px rgba(0,0,0,0.60)",
              }}
            >
              {t("brand.headline1")}
              <br />
              <span
                style={{
                  background:
                    "linear-gradient(90deg, #d4aa5f 0%, #ecca78 50%, #c49a4f 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {t("brand.headline2")}
              </span>
            </h2>

            {/* Ornamental rule */}
            <div
              className="h-px w-20 mb-5"
              style={{
                background: isAr
                  ? "linear-gradient(to left, #c49a4f, transparent)"
                  : "linear-gradient(to right, #c49a4f, transparent)",
                ...(isAr ? { marginLeft: "auto", marginRight: 0 } : {}),
              }}
              aria-hidden="true"
            />

            {/* Subtitle */}
            <p
              className="mb-9"
              style={{
                color: "rgba(255,255,255,0.70)",
                fontSize: "clamp(0.88rem, 1.35vw, 1.04rem)",
                lineHeight: 1.74,
                textShadow: "0 2px 14px rgba(0,0,0,0.44)",
              }}
            >
              {t("brand.subtitle")}
            </p>

            {/* CTAs */}
            <div className={`flex flex-wrap gap-3 ${isAr ? "flex-row-reverse" : ""}`}>
              <Link
                href="/explore"
                className={`inline-flex items-center gap-2 font-display font-bold px-7 py-3.5 rounded-xl text-[0.9rem] transition-all duration-200 hover:-translate-y-[2px] active:translate-y-0 ${isAr ? "flex-row-reverse" : ""}`}
                style={{
                  background:
                    "linear-gradient(135deg, #c49a4f 0%, #d4aa5f 55%, #b88e3e 100%)",
                  color: "#1a0e02",
                  boxShadow:
                    "0 4px 22px rgba(196,154,79,0.48), inset 0 1px 0 rgba(255,255,255,0.28)",
                }}
              >
                {t("brand.cta.explore")}
                <svg
                  width="15" height="15" viewBox="0 0 24 24" fill="none"
                  className={isAr ? "rotate-180" : ""}
                  aria-hidden="true"
                >
                  <path
                    d="M9 18l6-6-6-6"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>

              <Link
                href="/host"
                className="inline-flex items-center gap-2 font-display font-semibold px-7 py-3.5 rounded-xl text-[0.9rem] transition-all duration-200 hover:-translate-y-[2px] active:translate-y-0"
                style={{
                  background: "rgba(255,255,255,0.10)",
                  border: "1px solid rgba(255,255,255,0.24)",
                  color: "white",
                  backdropFilter: "blur(10px)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
                }}
              >
                {t("brand.cta.host")}
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
