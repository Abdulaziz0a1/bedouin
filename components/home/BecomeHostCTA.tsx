"use client";

import Image from "next/image";
import Link from "next/link";
import FadeInSection from "@/components/ui/FadeInSection";
import { useAuth } from "@/context/AuthProvider";

const stats = [
  { value: "850+",     label: "Active hosts",        sub: "across 12 regions" },
  { value: "SAR 4,200", label: "Avg monthly earn",   sub: "per listing" },
  { value: "2 days",   label: "Approval time",       sub: "fast onboarding" },
  { value: "4.9 ★",   label: "Host satisfaction",   sub: "rated by hosts" },
];

export default function BecomeHostCTA() {
  const { hostStatus } = useAuth();
  // Approved hosts go straight to their dashboard overview; everyone else starts onboarding.
  const hostCtaHref   = hostStatus === "approved" ? "/dashboard" : "/host/onboarding";
  const hostCtaLabel  = hostStatus === "approved" ? "Go to Host Dashboard" : "Become a Host";
  return (
    <section className="relative py-24 overflow-hidden">

      {/* ── Cinematic background: saudi hospitality scene ─────────────────── */}
      <div className="absolute inset-0">
        <Image
          src="/images/saudi-hospitality-story.jpg"
          alt=""
          fill
          className="object-cover object-center"
          aria-hidden="true"
        />
      </div>
      {/* Primary dark overlay — matches the deep warmth of the CSS gradient */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(135deg, rgba(26,14,2,0.90) 0%, rgba(45,26,8,0.86) 50%, rgba(70,30,0,0.82) 100%)" }}
        aria-hidden="true"
      />
      {/* Extra left-side depth for text contrast */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to right, rgba(8,4,0,0.38) 0%, transparent 65%)" }}
        aria-hidden="true"
      />

      {/* Gold top border accent */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(196,154,79,0.6) 30%, rgba(240,200,74,0.8) 50%, rgba(196,154,79,0.6) 70%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-[1232px] mx-auto px-6 lg:px-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

          {/* Left: Text content */}
          <FadeInSection direction="left" delay={0}>
            <div className="flex flex-col gap-7">
              <div className="flex items-center gap-3">
                <div
                  className="h-px w-10"
                  style={{ background: "linear-gradient(90deg, transparent, #c49a4f)" }}
                />
                <p className="text-[#c49a4f] text-xs font-bold uppercase tracking-[0.20em]">
                  For Hosts
                </p>
              </div>

              <h2
                className="font-display font-extrabold text-white leading-[1.06] tracking-tight"
                style={{ fontSize: "clamp(2.1rem, 3.8vw, 2.9rem)" }}
              >
                Share Your{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #c49a4f 0%, #f0c84a 50%, #c49a4f 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Saudi Heritage
                </span>
              </h2>

              <p className="text-[#c4b49a] text-lg leading-relaxed max-w-md">
                Turn your farm, desert retreat, or rural property into an income
                source. Join over 850 hosts already welcoming guests to authentic
                Saudi experiences.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href={hostCtaHref}
                  className="inline-flex items-center justify-center gap-2 font-display font-bold px-8 py-4 rounded-xl text-sm transition-all duration-200 hover:-translate-y-px group"
                  style={{
                    background: "linear-gradient(135deg, #c49a4f 0%, #d4aa5f 60%, #b88e3e 100%)",
                    color: "#1a0e02",
                    boxShadow: "0 4px 20px rgba(196,154,79,0.40), inset 0 1px 0 rgba(255,255,255,0.25)",
                  }}
                >
                  {hostCtaLabel}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  >
                    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                <Link
                  href="/faq"
                  className="inline-flex items-center justify-center gap-2 font-display font-semibold px-8 py-4 rounded-xl text-sm transition-all duration-200 hover:border-[#c49a4f] hover:text-[#c49a4f]"
                  style={{
                    border: "1.5px solid rgba(60,35,12,0.9)",
                    color: "#c4b49a",
                  }}
                >
                  Learn More
                </Link>
              </div>
            </div>
          </FadeInSection>

          {/* Right: Stats grid */}
          <FadeInSection direction="right" delay={100}>
            <div className="grid grid-cols-2 gap-4">
              {stats.map(({ value, label, sub }, i) => (
                <div
                  key={label}
                  className="flex flex-col gap-1.5 rounded-2xl p-6 transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(196,154,79,0.16)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.04)",
                    animationDelay: `${i * 80}ms`,
                  }}
                >
                  <p
                    className="font-display font-extrabold text-2xl leading-none"
                    style={{
                      background: "linear-gradient(135deg, #c49a4f 0%, #f0c84a 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {value}
                  </p>
                  <p className="text-white text-sm font-semibold mt-0.5">{label}</p>
                  <p className="text-[#8b7355] text-xs">{sub}</p>
                </div>
              ))}
            </div>
          </FadeInSection>
        </div>
      </div>
    </section>
  );
}
