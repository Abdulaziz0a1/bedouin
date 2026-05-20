"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageProvider";

/* ── Grain overlay using SVG fractal noise ───────────────────────────────── */
function GrainOverlay() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.80' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E\")",
        backgroundRepeat: "repeat",
        backgroundSize: "160px 160px",
        opacity: 0.055,
        mixBlendMode: "overlay",
      }}
      aria-hidden="true"
    />
  );
}

/* ── Heritage ornament (diamond cluster) ─────────────────────────────────── */
function DiamondOrn({ size = 6 }: { size?: number }) {
  return (
    <svg
      width={size * 2.2}
      height={size * 2.2}
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden="true"
    >
      <rect x="10" y="1" width="12" height="12" rx="0.6" transform="rotate(45 10 1)" fill="none" stroke="#c49a4f" strokeWidth="0.9" opacity="0.65"/>
      <rect x="10" y="4" width="6.5" height="6.5" rx="0.4" transform="rotate(45 10 4)" fill="#c49a4f" opacity="0.40"/>
    </svg>
  );
}

export default function HeroSection() {
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";

  return (
    <section className="relative w-full h-full overflow-hidden">
      {/* ── Background image: slow cinematic zoom-in ─────────────────────── */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.10 }}
        animate={{ scale: 1 }}
        transition={{ duration: 3.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <Image
          src="/images/bedouin-hero.jpg"
          alt="Golden sand dunes sweeping toward ancient mesa rock formations under a vivid Saudi blue sky"
          fill
          className="object-cover object-center"
          priority
        />
      </motion.div>

      {/* ── Layer 0: top navbar overlay — keeps logo/links readable ─────── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(4,2,0,0.62) 0%, rgba(4,2,0,0.22) 12%, transparent 28%)",
        }}
        aria-hidden="true"
      />

      {/* ── Layer 1: dark bottom gradient — text legibility ──────────────── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, transparent 30%, rgba(6,3,0,0.50) 62%, rgba(8,4,0,0.94) 100%)",
        }}
        aria-hidden="true"
      />

      {/* ── Layer 2: warm left column wash ───────────────────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(108deg, rgba(28,10,0,0.56) 0%, rgba(18,7,0,0.28) 38%, transparent 58%)",
        }}
        aria-hidden="true"
      />

      {/* ── Layer 3: subtle gold warmth at lower third ───────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(160,105,30,0.14) 0%, transparent 38%)",
        }}
        aria-hidden="true"
      />

      {/* ── Layer 4: vignette corners ─────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 92% 88% at 50% 50%, transparent 52%, rgba(4,2,0,0.55) 100%)",
        }}
        aria-hidden="true"
      />

      {/* ── Grain texture (cinematic film grain) ─────────────────────────── */}
      <GrainOverlay />

      {/* ── Sun halo: warm radial at the horizon meeting point ───────────── */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: "80%",
          height: "55%",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at center, rgba(200,130,40,0.10) 0%, rgba(180,100,20,0.06) 40%, transparent 70%)",
          top: "18%",
          left: "10%",
        }}
        aria-hidden="true"
      />

      {/* ── Horizon gold streak — animated luminous shimmer ──────────────── */}
      <motion.div
        className="absolute pointer-events-none left-0 right-0"
        style={{
          height: "1.5px",
          top: "43%",
          background:
            "linear-gradient(90deg, transparent 0%, rgba(196,154,79,0.08) 12%, rgba(240,198,80,0.38) 40%, rgba(255,220,100,0.52) 50%, rgba(240,198,80,0.38) 60%, rgba(196,154,79,0.08) 88%, transparent 100%)",
          filter: "blur(0.5px)",
        }}
        initial={{ opacity: 0, scaleX: 0.7 }}
        animate={{ opacity: [0, 1, 0.75, 1], scaleX: 1 }}
        transition={{ delay: 1.0, duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden="true"
      />

      {/* ── Floating gold orb — upper right (cool sky atmosphere) ────────── */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: 640,
          height: 640,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(196,154,79,0.09) 0%, rgba(180,140,60,0.04) 45%, transparent 68%)",
          top: "-180px",
          right: "2%",
        }}
        animate={{ y: [0, -24, 0], scale: [1, 1.045, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      />

      {/* ── Warm ambient orb — lower left (desert heat glow) ─────────────── */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(200,120,30,0.10) 0%, rgba(180,90,20,0.05) 45%, transparent 68%)",
          bottom: "-80px",
          left: "-40px",
        }}
        animate={{ y: [0, 18, 0], scale: [1, 1.04, 1] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        aria-hidden="true"
      />

      {/* ── Hero text: starts below navbar, flows naturally downward ── */}
      <div
        className={`absolute inset-0 flex flex-col justify-start px-8 sm:px-12 md:px-20 pt-20 md:pt-[96px] pb-[230px] ${isAr ? "items-end" : ""}`}
      >
        <div className="max-w-[780px] w-full">

          {/* Eyebrow label with heritage ornaments */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.28 }}
            className={`flex items-center gap-3 mb-5 ${isAr ? "flex-row-reverse" : ""}`}
          >
            <div className="h-px w-8 bg-[#c49a4f]" />
            <DiamondOrn size={4} />
            <span
              className="text-[#c49a4f] text-[0.62rem] font-bold uppercase tracking-[0.30em]"
              style={{ textShadow: "0 1px 14px rgba(0,0,0,0.65)" }}
            >
              {t("hero.eyebrow")}
            </span>
            <DiamondOrn size={4} />
            <div className="h-px w-8 bg-[#c49a4f] opacity-60" />
          </motion.div>

          {/* Main headline — two lines, second line in gold gradient */}
          <motion.h1
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1], delay: 0.44 }}
            className={`font-display font-extrabold text-white mb-4 ${isAr ? "leading-[1.12] text-right" : "leading-[1.08]"}`}
            style={{
              fontSize: isAr ? "clamp(2.1rem, 4.8vw, 4.2rem)" : "clamp(2.5rem, 5.0vw, 4.8rem)",
              textShadow: "0 2px 48px rgba(0,0,0,0.50), 0 1px 6px rgba(0,0,0,0.28)",
              letterSpacing: isAr ? "-0.010em" : "-0.032em",
            }}
          >
            {t("hero.headline1")}
            <br />
            <span
              style={{
                background:
                  "linear-gradient(132deg, #eecf7e 0%, #f8e499 38%, #d4a84b 70%, #c49a4f 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {t("hero.headline2")}
            </span>
          </motion.h1>

          {/* Ornamental gold rule */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1], delay: 0.68 }}
            className={`flex items-center gap-3 mb-5 ${isAr ? "flex-row-reverse origin-right" : "origin-left"}`}
          >
            <div
              className="h-px w-14"
              style={{
                background: isAr
                  ? "linear-gradient(to left, #c49a4f, rgba(196,154,79,0.20))"
                  : "linear-gradient(to right, #c49a4f, rgba(196,154,79,0.20))",
              }}
            />
            <DiamondOrn size={5} />
            <div
              className="h-px w-28"
              style={{
                background: isAr
                  ? "linear-gradient(to left, rgba(196,154,79,0.35), transparent)"
                  : "linear-gradient(to right, rgba(196,154,79,0.35), transparent)",
              }}
            />
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.90, ease: [0.16, 1, 0.3, 1], delay: 0.82 }}
            className={`text-white/68 leading-relaxed max-w-[500px] ${isAr ? "text-right" : ""}`}
            style={{
              fontSize: "clamp(1rem, 1.65vw, 1.14rem)",
              textShadow: "0 1px 18px rgba(0,0,0,0.48)",
              letterSpacing: "0.010em",
            }}
          >
            {t("hero.subtitle")}
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.90, ease: [0.16, 1, 0.3, 1], delay: 1.0 }}
            className={`flex flex-col sm:flex-row gap-3 mt-6 ${isAr ? "sm:flex-row-reverse" : ""}`}
          >
            <Link
              href="/explore"
              className="inline-flex items-center justify-center gap-2 font-display font-bold px-7 py-3.5 rounded-[14px] text-[0.875rem] transition-all duration-250 hover:-translate-y-0.5 active:translate-y-0 group"
              style={{
                background: "linear-gradient(150deg, #d4aa5f 0%, #c49a4f 50%, #a87c38 100%)",
                color: "#1a0e02",
                boxShadow: "0 4px 28px rgba(196,154,79,0.52), 0 2px 8px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.32), inset 0 -1px 0 rgba(0,0,0,0.06)",
              }}
            >
              {t("hero.cta_explore")}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className={`transition-transform duration-200 ${isAr ? "rotate-180 group-hover:-translate-x-0.5" : "group-hover:translate-x-0.5"}`} aria-hidden="true">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link
              href="/host/onboarding"
              className="inline-flex items-center justify-center gap-2 font-display font-semibold px-7 py-3.5 rounded-[14px] text-[0.875rem] transition-all duration-200 hover:bg-white/10 hover:border-white/50"
              style={{
                border: "1.5px solid rgba(255,255,255,0.25)",
                color: "rgba(255,255,255,0.82)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
              }}
            >
              {t("hero.cta_host")}
            </Link>
          </motion.div>

          {/* Micro trust strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.1, ease: "easeOut", delay: 1.5 }}
            className={`flex items-center gap-0 mt-7 ${isAr ? "flex-row-reverse" : ""}`}
            aria-label="Platform trust indicators"
          >
            {[
              { value: t("hero.stat1.value"), label: t("hero.stat1.label") },
              { value: t("hero.stat2.value"), label: t("hero.stat2.label") },
              { value: t("hero.stat3.value"), label: t("hero.stat3.label") },
            ].map((s, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 ${i > 0 ? (isAr ? "pr-5 mr-5 border-r border-white/14" : "pl-5 ml-5 border-l border-white/14") : ""}`}
              >
                <span className="font-display font-bold text-[#d4aa5f] text-[0.9rem] leading-none tracking-tight">
                  {s.value}
                </span>
                <span className="text-white/38 text-[0.65rem] font-medium uppercase tracking-[0.10em] leading-snug">
                  {s.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

    </section>
  );
}
