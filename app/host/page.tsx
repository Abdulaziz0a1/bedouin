"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/layout/Footer";
import { useLanguage } from "@/context/LanguageProvider";

/* ─── Icons ─────────────────────────────────────────────────────────────────── */

function IconPen() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconShieldCheck() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconStar() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconEarnings() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.9 10.8 19.79 19.79 0 0 1 1.87 2.18 2 2 0 0 1 3.86 0h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 7.91A16 16 0 0 0 14.4 14.22l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconGlobe() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10A15.3 15.3 0 0 1 8 12 15.3 15.3 0 0 1 12 2z"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconChecklist() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 5h6M9 12l2 2 4-4"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconLeaf() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10z"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 21c0-3 1.9-5.4 5.1-6.4"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconHeritage() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path d="M3 21h18M5 21V9l7-7 7 7v12"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 21v-6a3 3 0 0 1 6 0v6"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconGuestHouse() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path d="M2 22h20M3 22V12l9-9 9 9v10"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="9" y="15" width="6" height="7" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function IconMountain() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path d="M8 3l4 7 4-7"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 21l10-14 10 14H2z"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconTent() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path d="M3.5 21L12 3l8.5 18H3.5z"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 3v18"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconDome() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path d="M3 12a9 9 0 1 0 18 0"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M3 12h18"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M7.8 12a4.2 4.2 0 1 0 8.4 0"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconArrow() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.2"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconChevron({ open }: { open: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.25s ease-out" }}>
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Page ─────────────────────────────────────────────────────────────────── */

export default function HostPage() {
  const { t, lang } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const isRTL = lang === "ar";

  const STATS = [
    { value: t("host_page.stat1.value"), label: t("host_page.stat1.label") },
    { value: t("host_page.stat2.value"), label: t("host_page.stat2.label") },
    { value: t("host_page.stat3.value"), label: t("host_page.stat3.label") },
    { value: t("host_page.stat4.value"), label: t("host_page.stat4.label") },
  ];

  const HOW_IT_WORKS = [
    { n: "01", title: t("host_page.step1.title"), desc: t("host_page.step1.desc"), Icon: IconPen },
    { n: "02", title: t("host_page.step2.title"), desc: t("host_page.step2.desc"), Icon: IconShieldCheck },
    { n: "03", title: t("host_page.step3.title"), desc: t("host_page.step3.desc"), Icon: IconStar },
  ];

  const CATEGORIES = [
    { id: "farms",      labelKey: "host_page.cat.farms",      descKey: "host_page.cat.farms_desc",      Icon: IconLeaf },
    { id: "house",      labelKey: "host_page.cat.house",      descKey: "host_page.cat.house_desc",      Icon: IconHeritage },
    { id: "guesthouse", labelKey: "host_page.cat.guesthouse", descKey: "host_page.cat.guesthouse_desc", Icon: IconGuestHouse },
    { id: "cabins",     labelKey: "host_page.cat.cabins",     descKey: "host_page.cat.cabins_desc",     Icon: IconMountain },
    { id: "glamping",   labelKey: "host_page.cat.glamping",   descKey: "host_page.cat.glamping_desc",   Icon: IconTent },
    { id: "doms",       labelKey: "host_page.cat.doms",       descKey: "host_page.cat.doms_desc",       Icon: IconDome },
  ];

  const PERKS = [
    { Icon: IconEarnings,  titleKey: "host_page.perk1.title", descKey: "host_page.perk1.desc" },
    { Icon: IconShield,    titleKey: "host_page.perk2.title", descKey: "host_page.perk2.desc" },
    { Icon: IconCalendar,  titleKey: "host_page.perk3.title", descKey: "host_page.perk3.desc" },
    { Icon: IconPhone,     titleKey: "host_page.perk4.title", descKey: "host_page.perk4.desc" },
    { Icon: IconGlobe,     titleKey: "host_page.perk5.title", descKey: "host_page.perk5.desc" },
    { Icon: IconChecklist, titleKey: "host_page.perk6.title", descKey: "host_page.perk6.desc" },
  ];

  const FAQS = [
    { qKey: "host_page.faq1.q", aKey: "host_page.faq1.a" },
    { qKey: "host_page.faq2.q", aKey: "host_page.faq2.a" },
    { qKey: "host_page.faq3.q", aKey: "host_page.faq3.a" },
    { qKey: "host_page.faq4.q", aKey: "host_page.faq4.a" },
    { qKey: "host_page.faq5.q", aKey: "host_page.faq5.a" },
  ];

  return (
    <div className="min-h-screen bg-[#f4efe6]">
      <main className="pt-[72px]">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section
          className="relative w-full overflow-hidden flex items-center"
          style={{ minHeight: "calc(100svh - 72px)" }}
        >
          <Image
            src="/images/saudi-desert-story.jpg"
            alt="Saudi desert landscape at golden hour"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div
            className="absolute inset-0"
            style={{
              background: isRTL
                ? "linear-gradient(to left, rgba(10,4,0,0.82) 0%, rgba(10,4,0,0.65) 45%, rgba(10,4,0,0.25) 100%)"
                : "linear-gradient(to right, rgba(10,4,0,0.82) 0%, rgba(10,4,0,0.65) 45%, rgba(10,4,0,0.25) 100%)",
            }}
          />

          <div className="relative z-10 w-full max-w-[1232px] mx-auto px-6 lg:px-0 py-20">
            <div className="max-w-2xl flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-[#c49a4f]" />
                <span className="text-[#c49a4f] text-xs font-bold uppercase tracking-[0.20em]">
                  {t("host_page.eyebrow")}
                </span>
              </div>

              <h1
                className="font-display font-extrabold text-white leading-[1.06]"
                style={{ fontSize: "clamp(2.4rem, 5.5vw, 4.5rem)" }}
              >
                {t("host_page.hero_headline")}
              </h1>

              <p
                className="text-white/72 leading-relaxed max-w-[480px]"
                style={{ fontSize: "clamp(1rem, 1.8vw, 1.15rem)" }}
              >
                {t("host_page.hero_sub")}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mt-1">
                <Link
                  href="/host/new"
                  className="inline-flex items-center justify-center gap-2 bg-[#c49a4f] text-[#1a0e02] font-bold px-8 py-4 rounded-2xl hover:bg-[#d4aa5f] transition-colors shadow-lg text-base"
                >
                  {t("host_page.cta_start")}
                  <IconArrow />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold px-6 py-4 rounded-2xl hover:bg-white/18 transition-colors text-base"
                >
                  {t("host_page.cta_how")}
                </a>
              </div>

              {/* Trust stats strip */}
              <div className="flex flex-wrap gap-x-8 gap-y-4 mt-5 pt-6 border-t border-white/12">
                {STATS.map(({ value, label }) => (
                  <div key={label} className="flex flex-col gap-0.5">
                    <span className="font-display font-extrabold text-[#c49a4f] text-xl leading-none">
                      {value}
                    </span>
                    <span className="text-white/50 text-xs leading-none mt-1">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────────────────── */}
        <section id="how-it-works" className="bg-white py-24">
          <div className="max-w-[1232px] mx-auto px-6 lg:px-0">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-7 bg-[#c49a4f]" />
              <span className="text-[#c49a4f] text-xs font-bold uppercase tracking-[0.18em]">
                {t("host_page.how_eyebrow")}
              </span>
            </div>
            <h2
              className="font-display font-extrabold text-[#1a0e02] mb-16"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.75rem)" }}
            >
              {t("host_page.how_heading")}
            </h2>

            <div className="relative">
              {/* Connector line — desktop only, runs between the three icon circles */}
              <div
                aria-hidden
                className="hidden md:block absolute h-px bg-[#e8dfd4] z-0"
                style={{ top: 27, left: "16.67%", right: "16.67%" }}
              />

              <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
                {HOW_IT_WORKS.map(({ n, title, desc, Icon }) => (
                  <div key={n} className="flex flex-col items-center text-center gap-5">
                    <div className="w-14 h-14 rounded-full bg-white ring-2 ring-[#c49a4f] flex items-center justify-center text-[#8b5e38] shrink-0">
                      <Icon />
                    </div>
                    <div>
                      <span className="block font-display font-extrabold text-[#ede6db] text-6xl leading-none select-none">
                        {n}
                      </span>
                      <h3 className="font-display font-bold text-[#1a0e02] text-xl mt-2 mb-2">
                        {title}
                      </h3>
                      <p className="text-[#64707d] text-sm leading-relaxed max-w-[260px] mx-auto">
                        {desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-14 text-center">
              <Link
                href="/host/new"
                className="inline-flex items-center gap-2 bg-[#1a0e02] text-white font-bold px-8 py-4 rounded-2xl hover:bg-[#2d1a07] transition-colors"
              >
                {t("host_page.how_cta")}
                <IconArrow />
              </Link>
            </div>
          </div>
        </section>

        {/* ── What can you list ────────────────────────────────────────────── */}
        <section className="py-24" style={{ backgroundColor: "#f4efe6" }}>
          <div className="max-w-[1232px] mx-auto px-6 lg:px-0">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-7 bg-[#c49a4f]" />
              <span className="text-[#c49a4f] text-xs font-bold uppercase tracking-[0.18em]">
                {t("host_page.cat_eyebrow")}
              </span>
            </div>
            <h2
              className="font-display font-extrabold text-[#1a0e02] mb-12"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.75rem)" }}
            >
              {t("host_page.cat_heading")}
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {CATEGORIES.map(({ id, labelKey, descKey, Icon }) => (
                <Link
                  key={id}
                  href="/host/new"
                  className="group bg-white border border-[#e8dfd4] rounded-2xl p-5 flex flex-col items-center gap-3.5 text-center hover:border-[#c49a4f] hover:shadow-[0_6px_28px_rgba(139,94,56,0.14)] transition-all duration-300 cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-xl bg-[#f4efe6] flex items-center justify-center text-[#8b5e38] group-hover:bg-[#f0e6d8] transition-colors duration-300">
                    <Icon />
                  </div>
                  <div>
                    <p className="font-display font-semibold text-[#1a0e02] text-sm leading-snug mb-1.5">
                      {t(labelKey)}
                    </p>
                    <p className="text-[#7a8490] text-[11px] leading-relaxed">{t(descKey)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why host on Bedouin ──────────────────────────────────────────── */}
        <section className="bg-white py-24">
          <div className="max-w-[1232px] mx-auto px-6 lg:px-0">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-7 bg-[#c49a4f]" />
              <span className="text-[#c49a4f] text-xs font-bold uppercase tracking-[0.18em]">
                {t("host_page.perks_eyebrow")}
              </span>
            </div>
            <h2
              className="font-display font-extrabold text-[#1a0e02] mb-14"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.75rem)" }}
            >
              {t("host_page.perks_heading")}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-14 gap-y-11">
              {PERKS.map(({ Icon, titleKey, descKey }) => (
                <div key={titleKey} className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-[#f4efe6] rounded-xl flex items-center justify-center text-[#8b5e38] shrink-0 mt-0.5">
                    <Icon />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-[#1a0e02] text-base mb-1.5">
                      {t(titleKey)}
                    </h3>
                    <p className="text-[#64707d] text-sm leading-relaxed">{t(descKey)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Host Story / Editorial ────────────────────────────────────────── */}
        <section className="overflow-hidden" style={{ backgroundColor: "#140a01" }}>
          <div className="max-w-[1440px] mx-auto grid md:grid-cols-2" style={{ minHeight: 520 }}>
            {/* Image side */}
            <div className="relative min-h-[320px] md:min-h-0">
              <Image
                src="https://picsum.photos/seed/bedouin-host-story/800/900"
                alt="Saudi host welcoming guests on a date farm at dusk"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: isRTL
                    ? "linear-gradient(to right, rgba(20,10,1,0.7) 0%, transparent 60%)"
                    : "linear-gradient(to left, rgba(20,10,1,0.7) 0%, transparent 60%)",
                }}
              />
            </div>

            {/* Text side */}
            <div className="flex flex-col justify-center px-8 py-16 md:px-16 lg:px-20 gap-7">
              <div className="flex items-center gap-3">
                <div className="h-px w-7 bg-[#c49a4f]" />
                <span className="text-[#c49a4f] text-xs font-bold uppercase tracking-[0.18em]">
                  {t("host_page.story_eyebrow")}
                </span>
              </div>

              <h2
                className="font-display font-extrabold text-white leading-tight"
                style={{ fontSize: "clamp(1.5rem, 2.8vw, 2.25rem)" }}
              >
                {t("host_page.story_heading")}
              </h2>

              <p className="text-white/60 text-sm leading-[1.85] max-w-prose">
                {t("host_page.story_body")}
              </p>

              <div className="pt-2">
                <p className="text-[#c49a4f] font-display font-semibold text-base leading-relaxed italic">
                  &ldquo;{t("host_page.story_quote")}&rdquo;
                </p>
                <div className="flex items-center gap-3 mt-4">
                  <div className="w-6 h-px bg-[#c49a4f]/45" />
                  <span className="text-white/75 text-sm font-semibold">
                    {t("host_page.story_author")}
                  </span>
                  <span className="text-white/35 text-xs">{t("host_page.story_role")}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────────── */}
        <section className="bg-white py-24">
          <div className="max-w-[680px] mx-auto px-6 lg:px-0">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-7 bg-[#c49a4f]" />
              <span className="text-[#c49a4f] text-xs font-bold uppercase tracking-[0.18em]">
                {t("host_page.faq_eyebrow")}
              </span>
            </div>
            <h2
              className="font-display font-extrabold text-[#1a0e02] mb-10"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)" }}
            >
              {t("host_page.faq_heading")}
            </h2>

            <div className="flex flex-col divide-y divide-[#e8dfd4]">
              {FAQS.map(({ qKey, aKey }, i) => (
                <div key={i}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between gap-4 py-5 text-start hover:text-[#8b5e38] transition-colors"
                    aria-expanded={openFaq === i}
                  >
                    <span className="font-display font-semibold text-[#1a0e02] text-base leading-snug">
                      {t(qKey)}
                    </span>
                    <span className="text-[#8b5e38] shrink-0">
                      <IconChevron open={openFaq === i} />
                    </span>
                  </button>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateRows: openFaq === i ? "1fr" : "0fr",
                      transition: "grid-template-rows 0.28s ease-out",
                    }}
                  >
                    <div className="overflow-hidden">
                      <p className="text-[#64707d] text-sm leading-relaxed pb-5 pt-0.5">
                        {t(aKey)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ─────────────────────────────────────────────────────── */}
        <section
          className="py-28"
          style={{
            background: "linear-gradient(150deg, #1a0e02 0%, #2d1a07 55%, #1a0e02 100%)",
          }}
        >
          <div className="max-w-[1232px] mx-auto px-6 lg:px-0 text-center flex flex-col items-center gap-6">
            <div className="flex items-center gap-3 justify-center">
              <div className="h-px w-8 bg-[#c49a4f]/60" />
              <span className="text-[#c49a4f] text-xs font-bold uppercase tracking-[0.20em]">
                {t("host_page.cta_eyebrow")}
              </span>
              <div className="h-px w-8 bg-[#c49a4f]/60" />
            </div>

            <h2
              className="font-display font-extrabold text-white leading-tight"
              style={{ fontSize: "clamp(1.9rem, 4vw, 3.25rem)" }}
            >
              {t("host_page.cta_heading")}
            </h2>

            <p className="text-white/55 text-base max-w-md leading-relaxed">
              {t("host_page.cta_sub")}
            </p>

            <Link
              href="/host/new"
              className="inline-flex items-center gap-2.5 bg-[#c49a4f] text-[#1a0e02] font-bold px-10 py-4 rounded-2xl hover:bg-[#d4aa5f] transition-colors text-base shadow-lg mt-2"
            >
              {t("host_page.cta_button")}
              <IconArrow />
            </Link>

            <p className="text-white/30 text-xs mt-1">{t("host_page.cta_note")}</p>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
