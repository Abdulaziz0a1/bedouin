"use client";

import Image from "next/image";
import FadeInSection from "@/components/ui/FadeInSection";

const pillars = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path
          d="M14 4v2m0 16v2M10 8.5C10 6.57 11.79 5 14 5s4 1.57 4 3.5c0 2.1-1.79 3.1-4 3.5-2.5.47-4 1.87-4 4S11.79 23 14 23s4-1.57 4-3.5"
          stroke="white" strokeWidth="1.8" strokeLinecap="round"
        />
      </svg>
    ),
    title: "No Hidden Fees",
    body: "Transparent pricing — what you see is what you pay.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 3L5 7v7c0 5.25 3.85 10.15 9 11.33C19.15 24.15 23 19.25 23 14V7l-9-4z"
          stroke="white" strokeWidth="1.8" strokeLinejoin="round"
        />
        <path d="M10 14l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Instant Booking",
    body: "Get confirmation right after you reserve — no waiting.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="4" y="6" width="20" height="18" rx="2" stroke="white" strokeWidth="1.8" />
        <path d="M9 4v4M19 4v4M4 12h20" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M9 17h2m4 0h2M9 21h2" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    title: "Flexible Stays",
    body: "Free cancellation on many listings with flexible plans.",
  },
];

export default function TrustSection() {
  return (
    <section className="relative py-24 overflow-hidden">

      {/* ── Cinematic background: man gazing at sandstone formations ─────── */}
      <div className="absolute inset-0">
        <Image
          src="/images/saudi-desert-story.jpg"
          alt=""
          fill
          className="object-cover object-center"
          aria-hidden="true"
        />
      </div>

      {/* Primary dark overlay — ensures text readability */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, rgba(8,4,0,0.74) 0%, rgba(6,3,0,0.70) 100%)",
        }}
        aria-hidden="true"
      />
      {/* Warm left-side depth wash */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to right, rgba(20,8,0,0.38) 0%, transparent 55%)",
        }}
        aria-hidden="true"
      />

      {/* Gold top accent */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(196,154,79,0.55) 30%, rgba(240,200,74,0.80) 50%, rgba(196,154,79,0.55) 70%, transparent 100%)",
        }}
        aria-hidden="true"
      />
      {/* Gold bottom accent */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(196,154,79,0.30) 30%, rgba(196,154,79,0.30) 70%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-[1232px] mx-auto px-6 lg:px-0">

        {/* Section label */}
        <FadeInSection direction="up" delay={0}>
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="h-px w-8" style={{ background: "rgba(196,154,79,0.60)" }} />
              <p className="text-[#c49a4f] text-[0.65rem] font-bold uppercase tracking-[0.28em]">
                Why Bedouin
              </p>
              <div className="h-px w-8" style={{ background: "rgba(196,154,79,0.60)" }} />
            </div>
            <h2 className="font-display font-bold text-white text-3xl" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.40)" }}>
              Travel with confidence
            </h2>
          </div>
        </FadeInSection>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {/* Connecting dots — gold-tinted for dark background */}
          <div className="hidden md:block absolute inset-0 pointer-events-none" aria-hidden="true">
            <svg className="absolute" style={{ left: "calc(33.33% - 48px)", top: "36px", width: "96px", height: "44px" }} viewBox="0 0 96 44" fill="none">
              <path d="M0 22 C24 22, 24 6, 48 6 C72 6, 72 38, 96 22" stroke="rgba(196,154,79,0.22)" strokeWidth="1.5" strokeDasharray="4 4" strokeLinecap="round" />
              <circle cx="0"  cy="22" r="3.5" fill="rgba(196,154,79,0.22)" />
              <circle cx="96" cy="22" r="3.5" fill="rgba(196,154,79,0.22)" />
            </svg>
            <svg className="absolute" style={{ left: "calc(66.67% - 48px)", top: "36px", width: "96px", height: "44px" }} viewBox="0 0 96 44" fill="none">
              <path d="M0 22 C24 22, 24 38, 48 38 C72 38, 72 6, 96 22" stroke="rgba(196,154,79,0.22)" strokeWidth="1.5" strokeDasharray="4 4" strokeLinecap="round" />
              <circle cx="0"  cy="22" r="3.5" fill="rgba(196,154,79,0.22)" />
              <circle cx="96" cy="22" r="3.5" fill="rgba(196,154,79,0.22)" />
            </svg>
          </div>

          {pillars.map(({ icon, title, body }, i) => (
            <FadeInSection key={title} direction="up" delay={i * 110} threshold={0.1}>
              <div className="flex flex-col items-center text-center gap-5 relative z-10 group">
                <div
                  className="w-[80px] h-[80px] rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1"
                  style={{
                    background: "linear-gradient(135deg, #b17a50 0%, #8b5e38 100%)",
                    boxShadow: "0 8px 32px rgba(139,94,56,0.50), 0 2px 8px rgba(139,94,56,0.25), inset 0 1px 0 rgba(255,255,255,0.15)",
                  }}
                >
                  {icon}
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-display font-bold text-white text-lg leading-tight" style={{ textShadow: "0 1px 12px rgba(0,0,0,0.35)" }}>
                    {title}
                  </h3>
                  <p className="text-white/58 text-sm leading-relaxed max-w-[220px]">
                    {body}
                  </p>
                </div>
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
}
