"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Footer from "@/components/layout/Footer";
import { useLanguage } from "@/context/LanguageProvider";

function Eyebrow({ text, isAr }: { text: string; isAr: boolean }) {
  return (
    <div className={`flex items-center gap-2.5 mb-4 ${isAr ? "flex-row-reverse" : ""}`}>
      <div
        className="h-px w-6 flex-shrink-0"
        style={{
          background: isAr
            ? "linear-gradient(to left, transparent, #c49a4f)"
            : "linear-gradient(to right, transparent, #c49a4f)",
        }}
      />
      <p className="text-[#c49a4f] text-[0.65rem] font-bold uppercase tracking-[0.22em]">{text}</p>
    </div>
  );
}

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay },
  };
}

const PRESERVE_ICONS = [
  // Palm tree
  <svg key="1" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 22V12M12 12C12 8 8 5 4 6M12 12C12 8 16 5 20 6M12 12C10 9 6 9 4 12M12 12C14 9 18 9 20 12" stroke="#c49a4f" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  // Camel silhouette (simplified)
  <svg key="2" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 17c1-3 3-4 5-4h8c2 0 3 1 4 4M9 13V9a3 3 0 016 0v1" stroke="#c49a4f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  // Coffee cup
  <svg key="3" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 8h14l-1.5 9H6.5L5 8z" stroke="#c49a4f" strokeWidth="1.5" strokeLinejoin="round"/><path d="M19 10h1a2 2 0 010 4h-1" stroke="#c49a4f" strokeWidth="1.5" strokeLinecap="round"/><path d="M8 8V6M12 8V5M16 8V6" stroke="#c49a4f" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  // Mountain
  <svg key="4" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M2 20l7-12 4 6 3-4 6 10H2z" stroke="#c49a4f" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
];

export default function AboutPage() {
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";

  const preserveItems = [1, 2, 3, 4].map((n) => ({
    icon: PRESERVE_ICONS[n - 1],
    title: t(`about.preserve.${n}.title`),
    body: t(`about.preserve.${n}.body`),
  }));

  return (
    <div className="min-h-screen bg-[#f4efe6]" dir={isAr ? "rtl" : "ltr"}>
      <main className="pt-[72px]">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden py-28 sm:py-36"
          style={{ background: "linear-gradient(160deg, #1a0e02 0%, #2d1a06 55%, #1a0e02 100%)" }}
        >
          {/* Radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 50% 60%, rgba(196,154,79,0.12) 0%, transparent 70%)" }}
            aria-hidden="true"
          />
          <div className="relative max-w-[860px] mx-auto px-6 text-center">
            <motion.div {...fadeUp(0)}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-7"
                style={{ background: "rgba(196,154,79,0.14)", border: "1px solid rgba(196,154,79,0.32)" }}>
                <span className="w-1.5 h-1.5 rounded-sm rotate-45 inline-block flex-shrink-0" style={{ background: "#c49a4f" }} />
                <span className="text-[#d4aa5f] text-[0.65rem] font-bold uppercase tracking-[0.26em]">
                  {t("about.eyebrow")}
                </span>
              </div>
            </motion.div>
            <motion.h1
              className="font-display font-extrabold text-white leading-[1.06] mb-6"
              style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)", letterSpacing: "-0.025em" }}
              {...fadeUp(0.08)}
            >
              {t("about.hero.headline")}
            </motion.h1>
            <motion.p
              className="text-white/60 max-w-[600px] mx-auto"
              style={{ fontSize: "clamp(1rem, 1.5vw, 1.15rem)", lineHeight: 1.72 }}
              {...fadeUp(0.16)}
            >
              {t("about.hero.subtitle")}
            </motion.p>
          </div>
        </section>

        {/* ── Our Story ─────────────────────────────────────────────────────── */}
        <section className="py-20 sm:py-28">
          <div className="max-w-[1232px] mx-auto px-6 lg:px-0">
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${isAr ? "lg:flex lg:flex-row-reverse" : ""}`}>
              {/* Text */}
              <motion.div {...fadeUp(0)}>
                <Eyebrow text={t("about.story.eyebrow")} isAr={isAr} />
                <h2
                  className="font-display font-extrabold text-[#1a0e02] mb-6 leading-tight"
                  style={{ fontSize: "clamp(1.7rem, 3vw, 2.6rem)", letterSpacing: "-0.02em" }}
                >
                  {t("about.story.heading")}
                </h2>
                <p className="text-[#4a3420] leading-[1.8] mb-5" style={{ fontSize: "1.02rem" }}>
                  {t("about.story.body1")}
                </p>
                <p className="text-[#4a3420] leading-[1.8]" style={{ fontSize: "1.02rem" }}>
                  {t("about.story.body2")}
                </p>
              </motion.div>
              {/* Decorative panel */}
              <motion.div {...fadeUp(0.1)} className="relative hidden lg:block">
                <div
                  className="w-full h-[420px] rounded-[24px] overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, #1a0e02 0%, #3d2610 50%, #2d1a06 100%)",
                    boxShadow: "0 24px 64px rgba(26,14,2,0.22)",
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div
                        className="text-[6rem] leading-none mb-4 opacity-60"
                        style={{ fontFamily: "serif" }}
                        aria-hidden="true"
                      >
                        🏕
                      </div>
                      <div
                        className="h-px w-24 mx-auto"
                        style={{ background: "linear-gradient(to right, transparent, #c49a4f, transparent)" }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Mission ───────────────────────────────────────────────────────── */}
        <section
          className="py-20 sm:py-24"
          style={{ background: "linear-gradient(180deg, #ede5d8 0%, #f4efe6 100%)" }}
        >
          <div className="max-w-[820px] mx-auto px-6 text-center">
            <motion.div {...fadeUp(0)}>
              <Eyebrow text={t("about.mission.eyebrow")} isAr={isAr} />
              <div className="flex justify-center mb-4">
                <Eyebrow text="" isAr={false} />
              </div>
            </motion.div>
            <motion.h2
              className="font-display font-extrabold text-[#1a0e02] mb-6 leading-tight"
              style={{ fontSize: "clamp(1.7rem, 3.2vw, 2.8rem)", letterSpacing: "-0.022em" }}
              {...fadeUp(0.06)}
            >
              {t("about.mission.heading")}
            </motion.h2>
            <motion.p
              className="text-[#4a3420] leading-[1.82] max-w-[640px] mx-auto"
              style={{ fontSize: "1.05rem" }}
              {...fadeUp(0.12)}
            >
              {t("about.mission.body")}
            </motion.p>
          </div>
        </section>

        {/* ── What We Preserve ──────────────────────────────────────────────── */}
        <section className="py-20 sm:py-28">
          <div className="max-w-[1232px] mx-auto px-6 lg:px-0">
            <motion.div className={`mb-14 ${isAr ? "text-right" : ""}`} {...fadeUp(0)}>
              <Eyebrow text={t("about.preserve.eyebrow")} isAr={isAr} />
              <h2
                className="font-display font-extrabold text-[#1a0e02] leading-tight"
                style={{ fontSize: "clamp(1.7rem, 3vw, 2.6rem)", letterSpacing: "-0.02em" }}
              >
                {t("about.preserve.heading")}
              </h2>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {preserveItems.map((item, i) => (
                <motion.div
                  key={i}
                  className="rounded-2xl p-7 flex flex-col gap-4"
                  style={{
                    background: "white",
                    border: "1px solid #e8dfd4",
                    boxShadow: "0 4px 20px rgba(26,14,2,0.06)",
                  }}
                  {...fadeUp(i * 0.07)}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(196,154,79,0.10)", border: "1px solid rgba(196,154,79,0.22)" }}
                  >
                    {item.icon}
                  </div>
                  <h3 className="font-display font-bold text-[#1a0e02] text-[1.05rem]">{item.title}</h3>
                  <p className="text-[#64503c] text-[0.9rem] leading-[1.75]">{item.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why It Matters ────────────────────────────────────────────────── */}
        <section
          className="py-20 sm:py-28"
          style={{ background: "linear-gradient(160deg, #1a0e02 0%, #2d1a06 60%, #1a0e02 100%)" }}
        >
          <div className="max-w-[780px] mx-auto px-6 text-center">
            <motion.div {...fadeUp(0)}>
              <div className={`flex items-center gap-2.5 mb-4 justify-center ${isAr ? "flex-row-reverse" : ""}`}>
                <div className="h-px w-6 flex-shrink-0" style={{ background: "linear-gradient(to right, transparent, #c49a4f)" }} />
                <p className="text-[#c49a4f] text-[0.65rem] font-bold uppercase tracking-[0.22em]">
                  {t("about.impact.eyebrow")}
                </p>
                <div className="h-px w-6 flex-shrink-0" style={{ background: "linear-gradient(to left, transparent, #c49a4f)" }} />
              </div>
            </motion.div>
            <motion.h2
              className="font-display font-extrabold text-white leading-tight mb-6"
              style={{ fontSize: "clamp(1.8rem, 3.5vw, 3rem)", letterSpacing: "-0.022em" }}
              {...fadeUp(0.08)}
            >
              {t("about.impact.heading")}
            </motion.h2>
            <motion.p
              className="text-white/62 leading-[1.82] max-w-[580px] mx-auto mb-12"
              style={{ fontSize: "1.04rem" }}
              {...fadeUp(0.14)}
            >
              {t("about.impact.body")}
            </motion.p>
            <motion.div
              className={`flex flex-wrap gap-3 justify-center ${isAr ? "flex-row-reverse" : ""}`}
              {...fadeUp(0.20)}
            >
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 font-display font-bold px-7 py-3.5 rounded-xl text-[0.9rem] transition-all duration-200 hover:-translate-y-[2px]"
                style={{
                  background: "linear-gradient(135deg, #c49a4f 0%, #d4aa5f 55%, #b88e3e 100%)",
                  color: "#1a0e02",
                  boxShadow: "0 4px 22px rgba(196,154,79,0.42)",
                }}
              >
                {t("about.cta.explore")}
              </Link>
              <Link
                href="/host"
                className="inline-flex items-center gap-2 font-display font-semibold px-7 py-3.5 rounded-xl text-[0.9rem] transition-all duration-200 hover:-translate-y-[2px]"
                style={{
                  background: "rgba(255,255,255,0.10)",
                  border: "1px solid rgba(255,255,255,0.22)",
                  color: "white",
                  backdropFilter: "blur(10px)",
                }}
              >
                {t("about.cta.host")}
              </Link>
            </motion.div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
