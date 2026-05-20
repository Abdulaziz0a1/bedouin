"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Footer from "@/components/layout/Footer";
import { useLanguage } from "@/context/LanguageProvider";

function Eyebrow({ text, isAr, centered }: { text: string; isAr: boolean; centered?: boolean }) {
  return (
    <div className={`flex items-center gap-2.5 mb-4 ${isAr ? "flex-row-reverse" : ""} ${centered ? "justify-center" : ""}`}>
      <div
        className="h-px w-6 flex-shrink-0"
        style={{
          background: isAr
            ? "linear-gradient(to left, transparent, #c49a4f)"
            : "linear-gradient(to right, transparent, #c49a4f)",
        }}
      />
      <p className="text-[#c49a4f] text-[0.65rem] font-bold uppercase tracking-[0.22em]">{text}</p>
      {centered && (
        <div className="h-px w-6 flex-shrink-0" style={{ background: "linear-gradient(to left, transparent, #c49a4f)" }} />
      )}
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

const VALUES_ICONS = [
  <svg key="1" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" stroke="#c49a4f" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  <svg key="2" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="#c49a4f" strokeWidth="1.5"/><path d="M12 8v4l3 3" stroke="#c49a4f" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  <svg key="3" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="#c49a4f" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  <svg key="4" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M18 20V10M12 20V4M6 20v-6" stroke="#c49a4f" strokeWidth="1.5" strokeLinecap="round"/></svg>,
];

export default function CareersPage() {
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";

  const values = [1, 2, 3, 4].map((n, i) => ({
    icon: VALUES_ICONS[i],
    title: t(`careers.values.${n}.title`),
    body: t(`careers.values.${n}.body`),
  }));

  return (
    <div className="min-h-screen bg-[#f4efe6]" dir={isAr ? "rtl" : "ltr"}>
      <main className="pt-[72px]">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden py-28 sm:py-36"
          style={{ background: "linear-gradient(160deg, #1a0e02 0%, #2d1a06 55%, #1a0e02 100%)" }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 50% 60%, rgba(196,154,79,0.10) 0%, transparent 70%)" }}
            aria-hidden="true"
          />
          <div className="relative max-w-[860px] mx-auto px-6 text-center">
            <motion.div {...fadeUp(0)}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-7"
                style={{ background: "rgba(196,154,79,0.14)", border: "1px solid rgba(196,154,79,0.32)" }}>
                <span className="w-1.5 h-1.5 rounded-sm rotate-45 inline-block" style={{ background: "#c49a4f" }} />
                <span className="text-[#d4aa5f] text-[0.65rem] font-bold uppercase tracking-[0.26em]">
                  {t("careers.eyebrow")}
                </span>
              </div>
            </motion.div>
            <motion.h1
              className="font-display font-extrabold text-white leading-[1.06] mb-6"
              style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)", letterSpacing: "-0.025em" }}
              {...fadeUp(0.08)}
            >
              {t("careers.hero.headline")}
            </motion.h1>
            <motion.p
              className="text-white/60 max-w-[580px] mx-auto"
              style={{ fontSize: "clamp(1rem, 1.5vw, 1.12rem)", lineHeight: 1.74 }}
              {...fadeUp(0.16)}
            >
              {t("careers.hero.subtitle")}
            </motion.p>
          </div>
        </section>

        {/* ── Why Work With Bedouin ─────────────────────────────────────────── */}
        <section className="py-20 sm:py-28">
          <div className="max-w-[820px] mx-auto px-6 text-center">
            <motion.div {...fadeUp(0)}>
              <Eyebrow text={t("careers.why.eyebrow")} isAr={isAr} centered />
            </motion.div>
            <motion.h2
              className="font-display font-extrabold text-[#1a0e02] mb-6 leading-tight"
              style={{ fontSize: "clamp(1.7rem, 3.2vw, 2.8rem)", letterSpacing: "-0.022em" }}
              {...fadeUp(0.06)}
            >
              {t("careers.why.heading")}
            </motion.h2>
            <motion.p
              className="text-[#4a3420] leading-[1.82] max-w-[620px] mx-auto"
              style={{ fontSize: "1.04rem" }}
              {...fadeUp(0.12)}
            >
              {t("careers.why.body")}
            </motion.p>
          </div>
        </section>

        {/* ── Culture Values ────────────────────────────────────────────────── */}
        <section
          className="py-20 sm:py-24"
          style={{ background: "linear-gradient(180deg, #ede5d8 0%, #f4efe6 100%)" }}
        >
          <div className="max-w-[1232px] mx-auto px-6 lg:px-0">
            <motion.div className={`mb-12 ${isAr ? "text-right" : ""}`} {...fadeUp(0)}>
              <Eyebrow text={t("careers.values.eyebrow")} isAr={isAr} />
              <h2
                className="font-display font-extrabold text-[#1a0e02] leading-tight"
                style={{ fontSize: "clamp(1.7rem, 3vw, 2.6rem)", letterSpacing: "-0.02em" }}
              >
                {t("careers.values.heading")}
              </h2>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {values.map((v, i) => (
                <motion.div
                  key={i}
                  className={`rounded-2xl p-8 flex gap-5 ${isAr ? "flex-row-reverse text-right" : ""}`}
                  style={{
                    background: "white",
                    border: "1px solid #e8dfd4",
                    boxShadow: "0 4px 20px rgba(26,14,2,0.06)",
                  }}
                  {...fadeUp(i * 0.07)}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: "rgba(196,154,79,0.10)", border: "1px solid rgba(196,154,79,0.22)" }}
                  >
                    {v.icon}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-[#1a0e02] text-[1.05rem] mb-2">{v.title}</h3>
                    <p className="text-[#64503c] text-[0.92rem] leading-[1.75]">{v.body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Open Roles ────────────────────────────────────────────────────── */}
        <section className="py-20 sm:py-28">
          <div className="max-w-[1232px] mx-auto px-6 lg:px-0">
            <motion.div className={`mb-10 ${isAr ? "text-right" : ""}`} {...fadeUp(0)}>
              <h2
                className="font-display font-extrabold text-[#1a0e02] leading-tight"
                style={{ fontSize: "clamp(1.6rem, 2.8vw, 2.4rem)", letterSpacing: "-0.02em" }}
              >
                {t("careers.roles.heading")}
              </h2>
            </motion.div>
            <motion.div
              className="rounded-2xl p-12 text-center"
              style={{
                background: "white",
                border: "1px solid #e8dfd4",
                boxShadow: "0 4px 20px rgba(26,14,2,0.06)",
              }}
              {...fadeUp(0.08)}
            >
              {/* Empty state illustration */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ background: "rgba(196,154,79,0.08)", border: "1px solid rgba(196,154,79,0.18)" }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="3" y="7" width="18" height="13" rx="2" stroke="#c49a4f" strokeWidth="1.5"/>
                  <path d="M8 7V5a4 4 0 018 0v2" stroke="#c49a4f" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M12 12v3M10.5 13.5h3" stroke="#c49a4f" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="font-display font-bold text-[#1a0e02] text-xl mb-3">
                {t("careers.roles.empty")}
              </p>
              <p className="text-[#8b7055] text-[0.92rem] leading-relaxed max-w-[400px] mx-auto">
                {t("careers.roles.empty.sub")}
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────────────── */}
        <section
          className="py-20 sm:py-28"
          style={{ background: "linear-gradient(160deg, #1a0e02 0%, #2d1a06 60%, #1a0e02 100%)" }}
        >
          <div className="max-w-[640px] mx-auto px-6 text-center">
            <motion.h2
              className="font-display font-extrabold text-white mb-8 leading-tight"
              style={{ fontSize: "clamp(1.8rem, 3.5vw, 3rem)", letterSpacing: "-0.022em" }}
              {...fadeUp(0)}
            >
              {t("careers.cta.heading")}
            </motion.h2>
            <motion.div {...fadeUp(0.08)}>
              <Link
                href="mailto:careers@bedouin.sa"
                className="inline-flex items-center gap-2 font-display font-bold px-9 py-4 rounded-xl text-[0.95rem] transition-all duration-200 hover:-translate-y-[2px]"
                style={{
                  background: "linear-gradient(135deg, #c49a4f 0%, #d4aa5f 55%, #b88e3e 100%)",
                  color: "#1a0e02",
                  boxShadow: "0 4px 22px rgba(196,154,79,0.42)",
                }}
              >
                {t("careers.cta.button")}
              </Link>
            </motion.div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
