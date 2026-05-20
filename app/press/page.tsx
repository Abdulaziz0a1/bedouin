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

const KIT_ICONS = [
  <svg key="1" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3" stroke="#c49a4f" strokeWidth="1.5"/><circle cx="8.5" cy="8.5" r="1.5" fill="#c49a4f"/><path d="M21 15l-5-5-4 4-3-3-6 6" stroke="#c49a4f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  <svg key="2" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="8" r="4" stroke="#c49a4f" strokeWidth="1.5"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#c49a4f" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  <svg key="3" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#c49a4f" strokeWidth="1.5" strokeLinejoin="round"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#c49a4f" strokeWidth="1.5" strokeLinecap="round"/></svg>,
];

export default function PressPage() {
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";

  const kitItems = [1, 2, 3].map((n, i) => ({
    icon: KIT_ICONS[i],
    title: t(`press.kit.${n}.title`),
    body: t(`press.kit.${n}.body`),
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
            style={{ background: "radial-gradient(ellipse at 50% 65%, rgba(196,154,79,0.10) 0%, transparent 72%)" }}
            aria-hidden="true"
          />
          <div className="relative max-w-[860px] mx-auto px-6 text-center">
            <motion.div {...fadeUp(0)}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-7"
                style={{ background: "rgba(196,154,79,0.14)", border: "1px solid rgba(196,154,79,0.32)" }}>
                <span className="w-1.5 h-1.5 rounded-sm rotate-45 inline-block" style={{ background: "#c49a4f" }} />
                <span className="text-[#d4aa5f] text-[0.65rem] font-bold uppercase tracking-[0.26em]">
                  {t("press.eyebrow")}
                </span>
              </div>
            </motion.div>
            <motion.h1
              className="font-display font-extrabold text-white leading-[1.06] mb-6"
              style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)", letterSpacing: "-0.025em" }}
              {...fadeUp(0.08)}
            >
              {t("press.hero.headline")}
            </motion.h1>
            <motion.p
              className="text-white/60 max-w-[560px] mx-auto"
              style={{ fontSize: "clamp(1rem, 1.5vw, 1.12rem)", lineHeight: 1.74 }}
              {...fadeUp(0.16)}
            >
              {t("press.hero.subtitle")}
            </motion.p>
          </div>
        </section>

        {/* ── Brand Summary ─────────────────────────────────────────────────── */}
        <section className="py-20 sm:py-28">
          <div className="max-w-[1232px] mx-auto px-6 lg:px-0">
            <div className={`grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-16 items-start ${isAr ? "lg:grid-cols-[1.4fr_1fr]" : ""}`}>
              <motion.div {...fadeUp(0)}>
                <Eyebrow text={t("press.about.eyebrow")} isAr={isAr} />
                <h2
                  className="font-display font-extrabold text-[#1a0e02] leading-tight"
                  style={{ fontSize: "clamp(1.7rem, 3vw, 2.6rem)", letterSpacing: "-0.02em" }}
                >
                  {t("press.about.heading")}
                </h2>
              </motion.div>
              <motion.p
                className="text-[#4a3420] leading-[1.82] pt-2"
                style={{ fontSize: "1.04rem" }}
                {...fadeUp(0.08)}
              >
                {t("press.about.body")}
              </motion.p>
            </div>
          </div>
        </section>

        {/* ── Press Kit ─────────────────────────────────────────────────────── */}
        <section
          className="py-20 sm:py-24"
          style={{ background: "linear-gradient(180deg, #ede5d8 0%, #f4efe6 100%)" }}
        >
          <div className="max-w-[1232px] mx-auto px-6 lg:px-0">
            <motion.div className={`mb-12 ${isAr ? "text-right" : ""}`} {...fadeUp(0)}>
              <h2
                className="font-display font-extrabold text-[#1a0e02] leading-tight"
                style={{ fontSize: "clamp(1.6rem, 2.8vw, 2.4rem)", letterSpacing: "-0.02em" }}
              >
                {t("press.kit.heading")}
              </h2>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {kitItems.map((item, i) => (
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
                  <div>
                    <h3 className="font-display font-bold text-[#1a0e02] text-[1.02rem] mb-1.5">{item.title}</h3>
                    <p className="text-[#64503c] text-[0.9rem] leading-[1.7] mb-4">{item.body}</p>
                  </div>
                  <button
                    type="button"
                    className="mt-auto inline-flex items-center gap-1.5 text-[0.82rem] font-semibold text-[#c49a4f] hover:text-[#b88e3e] transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M12 16l-4-4h3V4h2v8h3l-4 4zM4 20h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {t("press.kit.download")}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Media Inquiries + Latest News ─────────────────────────────────── */}
        <section className="py-20 sm:py-28">
          <div className="max-w-[1232px] mx-auto px-6 lg:px-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

              {/* Inquiries */}
              <motion.div
                className="rounded-2xl p-9"
                style={{ background: "white", border: "1px solid #e8dfd4", boxShadow: "0 4px 20px rgba(26,14,2,0.06)" }}
                {...fadeUp(0)}
              >
                <Eyebrow text="" isAr={isAr} />
                <h2
                  className="font-display font-extrabold text-[#1a0e02] mb-4 leading-tight"
                  style={{ fontSize: "clamp(1.4rem, 2.4vw, 2rem)", letterSpacing: "-0.018em" }}
                >
                  {t("press.inquiries.heading")}
                </h2>
                <p className="text-[#64503c] leading-[1.78] mb-7 text-[0.97rem]">
                  {t("press.inquiries.body")}
                </p>
                <a
                  href={`mailto:${t("press.inquiries.email")}`}
                  className="inline-flex items-center gap-2 font-display font-bold px-6 py-3 rounded-xl text-[0.88rem] transition-all duration-200 hover:-translate-y-[2px]"
                  style={{
                    background: "linear-gradient(135deg, #c49a4f 0%, #d4aa5f 55%, #b88e3e 100%)",
                    color: "#1a0e02",
                    boxShadow: "0 4px 16px rgba(196,154,79,0.36)",
                  }}
                >
                  {t("press.inquiries.email")}
                </a>
              </motion.div>

              {/* Latest News */}
              <motion.div {...fadeUp(0.08)}>
                <h2
                  className={`font-display font-extrabold text-[#1a0e02] mb-6 leading-tight ${isAr ? "text-right" : ""}`}
                  style={{ fontSize: "clamp(1.4rem, 2.4vw, 2rem)", letterSpacing: "-0.018em" }}
                >
                  {t("press.news.heading")}
                </h2>
                <div
                  className="rounded-2xl p-9 text-center"
                  style={{ background: "white", border: "1px solid #e8dfd4", boxShadow: "0 4px 20px rgba(26,14,2,0.06)" }}
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-5"
                    style={{ background: "rgba(196,154,79,0.08)", border: "1px solid rgba(196,154,79,0.18)" }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8L4 6v14a2 2 0 002 2z" stroke="#c49a4f" strokeWidth="1.5" strokeLinejoin="round"/>
                      <path d="M8 2v4H4M9 12h6M9 16h4" stroke="#c49a4f" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <p className="text-[#8b7055] text-[0.92rem] leading-relaxed">{t("press.news.empty")}</p>
                </div>
              </motion.div>

            </div>
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
              {t("press.cta.heading")}
            </motion.h2>
            <motion.div {...fadeUp(0.08)}>
              <a
                href={`mailto:${t("press.inquiries.email")}`}
                className="inline-flex items-center gap-2 font-display font-bold px-9 py-4 rounded-xl text-[0.95rem] transition-all duration-200 hover:-translate-y-[2px]"
                style={{
                  background: "linear-gradient(135deg, #c49a4f 0%, #d4aa5f 55%, #b88e3e 100%)",
                  color: "#1a0e02",
                  boxShadow: "0 4px 22px rgba(196,154,79,0.42)",
                }}
              >
                {t("press.cta.button")}
              </a>
            </motion.div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
