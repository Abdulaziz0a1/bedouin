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

// Gradient swatches used as editorial image placeholders
const POST_GRADIENTS = [
  "linear-gradient(135deg, #2d1a06 0%, #3d2610 50%, #1a0e02 100%)",
  "linear-gradient(135deg, #0d2518 0%, #1a3d2a 50%, #0a1f14 100%)",
  "linear-gradient(135deg, #1a1206 0%, #2e2008 50%, #1a0e02 100%)",
  "linear-gradient(135deg, #0d1a2d 0%, #1a2d3d 50%, #0a1525 100%)",
  "linear-gradient(135deg, #2d1a1a 0%, #3d2020 50%, #1a0a0a 100%)",
];

export default function BlogPage() {
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";

  const posts = [1, 2, 3, 4, 5].map((n, i) => ({
    gradient: POST_GRADIENTS[i],
    category: t(`blog.post.${n}.category`),
    title: t(`blog.post.${n}.title`),
    excerpt: t(`blog.post.${n}.excerpt`),
    readtime: t(`blog.post.${n}.readtime`),
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
          {/* Thin gold top line */}
          <div
            className="absolute top-0 inset-x-0 h-[2px] pointer-events-none"
            style={{ background: "linear-gradient(to right, transparent 0%, #c49a4f 30%, #e8c47a 50%, #c49a4f 70%, transparent 100%)", opacity: 0.5 }}
            aria-hidden="true"
          />
          <div className="relative max-w-[860px] mx-auto px-6 text-center">
            <motion.div {...fadeUp(0)}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-7"
                style={{ background: "rgba(196,154,79,0.14)", border: "1px solid rgba(196,154,79,0.32)" }}>
                <span className="w-1.5 h-1.5 rounded-sm rotate-45 inline-block" style={{ background: "#c49a4f" }} />
                <span className="text-[#d4aa5f] text-[0.65rem] font-bold uppercase tracking-[0.26em]">
                  {t("blog.eyebrow")}
                </span>
              </div>
            </motion.div>
            <motion.h1
              className="font-display font-extrabold text-white leading-[1.06] mb-5"
              style={{ fontSize: "clamp(2.6rem, 6vw, 4.8rem)", letterSpacing: "-0.03em" }}
              {...fadeUp(0.08)}
            >
              {t("blog.hero.headline")}
            </motion.h1>
            <motion.p
              className="text-white/58 max-w-[520px] mx-auto"
              style={{ fontSize: "clamp(0.97rem, 1.4vw, 1.1rem)", lineHeight: 1.76 }}
              {...fadeUp(0.16)}
            >
              {t("blog.hero.subtitle")}
            </motion.p>
          </div>
        </section>

        {/* ── Featured Article ──────────────────────────────────────────────── */}
        <section className="py-16 sm:py-20">
          <div className="max-w-[1232px] mx-auto px-6 lg:px-0">
            <motion.div {...fadeUp(0)}>
              <Link
                href="#"
                className="group block rounded-[24px] overflow-hidden"
                style={{
                  background: "#1a0e02",
                  boxShadow: "0 24px 64px rgba(26,14,2,0.26), 0 8px 24px rgba(26,14,2,0.14)",
                }}
              >
                <div className={`grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] ${isAr ? "lg:grid-cols-[1fr_1.2fr]" : ""}`}>
                  {/* Image panel */}
                  <div
                    className={`relative h-[280px] lg:h-[440px] overflow-hidden ${isAr ? "lg:order-2" : ""}`}
                    style={{ background: POST_GRADIENTS[0] }}
                  >
                    {/* Decorative dune pattern */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-30" aria-hidden="true">
                      <svg width="220" height="120" viewBox="0 0 220 120" fill="none">
                        <path d="M0 120 Q55 20 110 60 Q165 100 220 0" stroke="#c49a4f" strokeWidth="1" fill="none" opacity="0.6"/>
                        <path d="M0 120 Q55 50 110 80 Q165 110 220 30" stroke="#c49a4f" strokeWidth="1" fill="none" opacity="0.4"/>
                        <circle cx="110" cy="20" r="40" stroke="#c49a4f" strokeWidth="0.5" fill="none" opacity="0.3"/>
                      </svg>
                    </div>
                    {/* Gradient overlay toward text */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: isAr
                          ? "linear-gradient(to right, rgba(26,14,2,0.70) 0%, rgba(26,14,2,0.24) 40%, transparent 70%)"
                          : "linear-gradient(to left, rgba(26,14,2,0.70) 0%, rgba(26,14,2,0.24) 40%, transparent 70%)",
                      }}
                      aria-hidden="true"
                    />
                    {/* Category badge */}
                    <div
                      className={`absolute top-5 ${isAr ? "right-5" : "left-5"} px-3 py-1.5 rounded-lg text-[0.7rem] font-bold uppercase tracking-[0.14em]`}
                      style={{ background: "rgba(196,154,79,0.22)", border: "1px solid rgba(196,154,79,0.40)", color: "#d4aa5f" }}
                    >
                      {t("blog.featured.category")}
                    </div>
                  </div>

                  {/* Text panel */}
                  <div className={`flex flex-col justify-center px-9 py-10 lg:px-12 lg:py-14 ${isAr ? "lg:order-1 text-right" : ""}`}>
                    <div
                      className={`inline-flex items-center gap-1.5 mb-5 ${isAr ? "flex-row-reverse self-end" : ""}`}
                    >
                      <span
                        className="w-1 h-1 rounded-full flex-shrink-0"
                        style={{ background: "#c49a4f" }}
                        aria-hidden="true"
                      />
                      <span className="text-[#c49a4f] text-[0.65rem] font-bold uppercase tracking-[0.22em]">
                        {t("blog.featured.label")}
                      </span>
                    </div>
                    <h2
                      className="font-display font-extrabold text-white leading-[1.08] mb-4"
                      style={{ fontSize: "clamp(1.4rem, 2.4vw, 2rem)", letterSpacing: "-0.02em" }}
                    >
                      {t("blog.featured.title")}
                    </h2>
                    <div
                      className={`h-px w-14 mb-5 ${isAr ? "ml-auto" : ""}`}
                      style={{ background: isAr ? "linear-gradient(to left, #c49a4f, transparent)" : "linear-gradient(to right, #c49a4f, transparent)" }}
                      aria-hidden="true"
                    />
                    <p className="text-white/62 text-[0.93rem] leading-[1.76] mb-7">
                      {t("blog.featured.excerpt")}
                    </p>
                    <div className={`flex items-center gap-3 ${isAr ? "flex-row-reverse" : ""}`}>
                      <span
                        className={`inline-flex items-center gap-2 text-[0.85rem] font-semibold text-[#d4aa5f] group-hover:text-[#e8c47a] transition-colors ${isAr ? "flex-row-reverse" : ""}`}
                      >
                        {t("blog.read_more")}
                        <svg
                          width="14" height="14" viewBox="0 0 24 24" fill="none"
                          className={`transition-transform duration-200 group-hover:translate-x-0.5 ${isAr ? "rotate-180" : ""}`}
                          aria-hidden="true"
                        >
                          <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                      <span className="text-white/30 text-[0.8rem]">·</span>
                      <span className="text-white/40 text-[0.8rem]">{t("blog.featured.readtime")}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ── Article Grid ──────────────────────────────────────────────────── */}
        <section className="py-8 sm:py-12 pb-24 sm:pb-32">
          <div className="max-w-[1232px] mx-auto px-6 lg:px-0">
            <motion.div className={`mb-10 ${isAr ? "text-right" : ""}`} {...fadeUp(0)}>
              <Eyebrow text={t("blog.grid.eyebrow")} isAr={isAr} />
              <h2
                className="font-display font-extrabold text-[#1a0e02] leading-tight"
                style={{ fontSize: "clamp(1.6rem, 2.8vw, 2.4rem)", letterSpacing: "-0.02em" }}
              >
                {t("blog.grid.heading")}
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post, i) => (
                <motion.div key={i} {...fadeUp(i * 0.06)}>
                  <Link
                    href="#"
                    className="group flex flex-col h-full rounded-2xl overflow-hidden transition-transform duration-300 hover:-translate-y-1"
                    style={{
                      background: "white",
                      border: "1px solid #e8dfd4",
                      boxShadow: "0 4px 20px rgba(26,14,2,0.06)",
                    }}
                  >
                    {/* Image placeholder */}
                    <div
                      className="relative h-[180px] overflow-hidden flex-shrink-0"
                      style={{ background: post.gradient }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center opacity-20" aria-hidden="true">
                        <svg width="100" height="60" viewBox="0 0 100 60" fill="none">
                          <path d="M0 60 Q25 10 50 30 Q75 50 100 0" stroke="#c49a4f" strokeWidth="1" fill="none"/>
                          <circle cx="50" cy="15" r="18" stroke="#c49a4f" strokeWidth="0.5" fill="none"/>
                        </svg>
                      </div>
                      {/* Category badge */}
                      <div
                        className={`absolute bottom-4 ${isAr ? "right-4" : "left-4"} px-2.5 py-1 rounded-lg text-[0.67rem] font-bold uppercase tracking-[0.14em]`}
                        style={{ background: "rgba(196,154,79,0.20)", border: "1px solid rgba(196,154,79,0.36)", color: "#d4aa5f" }}
                      >
                        {post.category}
                      </div>
                    </div>

                    {/* Text */}
                    <div className={`flex flex-col flex-1 p-6 ${isAr ? "text-right" : ""}`}>
                      <h3
                        className="font-display font-bold text-[#1a0e02] leading-snug mb-3 group-hover:text-[#8b5e1a] transition-colors"
                        style={{ fontSize: "1.04rem", letterSpacing: "-0.01em" }}
                      >
                        {post.title}
                      </h3>
                      <p className="text-[#64503c] text-[0.88rem] leading-[1.72] mb-5 flex-1">
                        {post.excerpt}
                      </p>
                      <div className={`flex items-center justify-between pt-4 ${isAr ? "flex-row-reverse" : ""}`}
                        style={{ borderTop: "1px solid #f0e8de" }}>
                        <span
                          className={`text-[#c49a4f] text-[0.8rem] font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all ${isAr ? "flex-row-reverse" : ""}`}
                        >
                          {t("blog.read_more")}
                          <svg
                            width="12" height="12" viewBox="0 0 24 24" fill="none"
                            className={isAr ? "rotate-180" : ""}
                            aria-hidden="true"
                          >
                            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                        <span className="text-[#a08060] text-[0.78rem]">{post.readtime}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
