import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "Become a Host – Bedouin",
  description:
    "List your Saudi farm, desert experience, or rural property on Bedouin and earn income sharing authentic culture.",
};

/* ─── Data ─────────────────────────────────────────────────────────────────── */

const STATS = [
  { value: "850+",   label: "Verified hosts" },
  { value: "SAR 4,200", label: "Avg. monthly earnings" },
  { value: "12",     label: "Regions covered" },
  { value: "97%",    label: "Guest satisfaction" },
];

const HOW_IT_WORKS = [
  {
    n: "01",
    title: "Create your listing",
    desc: "Add photos, write a description, set your pricing, and define your space — guided step by step.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    n: "02",
    title: "Get reviewed & approved",
    desc: "Our team verifies quality and safety within 1–2 business days. We'll notify you when you're live.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 12l2 2 4-4"
          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    n: "03",
    title: "Welcome guests & earn",
    desc: "Receive bookings, share your authentic Saudi experience, and keep 92% of every payment.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const CATEGORIES = [
  { id: "farms",      label: "Farm Stay",     icon: "🌾", desc: "Orchards, date palms, strawberry fields" },
  { id: "house",      label: "Heritage House",icon: "🏛️", desc: "Coral houses, riads, and historic homes" },
  { id: "guesthouse", label: "Guest House",   icon: "🏡", desc: "Traditional Saudi hospitality" },
  { id: "cabins",     label: "Highland Cabin",icon: "🌲", desc: "Mountain retreats in Asir and Al Baha" },
  { id: "glamping",   label: "Desert Glamping",icon: "⛺", desc: "Luxury tents and desert camps" },
  { id: "doms",       label: "Dome Suite",    icon: "🔭", desc: "Geodesic domes with sky-view interiors" },
];

const PERKS = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Keep 92% of earnings",
    desc: "Low platform fee. Your pricing, your income — set it and change it anytime.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Host protection included",
    desc: "SAR 500,000 in property damage protection and comprehensive liability coverage.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
    title: "Full calendar control",
    desc: "Open, block, or adjust dates any time. No obligations, no minimum availability.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.9 10.8 19.79 19.79 0 0 1 1.87 2.18 2 2 0 0 1 3.86 0h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 7.91A16 16 0 0 0 14.4 14.22l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"
          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "24/7 host support",
    desc: "Dedicated Arabic and English support team available around the clock.",
  },
];

/* ─── Page ──────────────────────────────────────────────────────────────────── */

export default function HostPage() {
  return (
    <div className="min-h-screen bg-[#f4efe6]">
      <Navbar />

      <main className="pt-[72px]">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="relative w-full overflow-hidden" style={{ minHeight: 560 }}>
          <Image
            src="https://picsum.photos/seed/bedouin-host-hero/1440/560"
            alt="Saudi desert landscape"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          {/* Gradient overlay — heavier on left for text legibility */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, rgba(10,4,0,0.82) 0%, rgba(10,4,0,0.60) 50%, rgba(10,4,0,0.20) 100%)",
            }}
          />

          <div className="relative z-10 max-w-[1232px] mx-auto px-6 lg:px-0 h-full flex flex-col justify-center py-24">
            <div className="max-w-xl flex flex-col gap-6">
              <div className="flex items-center gap-2">
                <div className="h-px w-6 bg-[#c49a4f]" />
                <span className="text-[#c49a4f] text-xs font-bold uppercase tracking-[0.16em]">
                  For Hosts
                </span>
              </div>

              <h1
                className="font-display font-extrabold text-white leading-tight"
                style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)" }}
              >
                Share Your Saudi Experience with the World
              </h1>

              <p className="text-white/75 text-lg leading-relaxed max-w-md">
                Join hundreds of verified hosts earning income while preserving
                authentic Saudi culture — from desert domes to highland farms.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/host/new"
                  className="inline-flex items-center justify-center gap-2 bg-[#8b5e38] text-white font-bold px-8 py-4 rounded-2xl hover:bg-[#7a5030] transition-colors shadow-lg text-base"
                  style={{ color: "#fff" }}
                >
                  Start Your Listing
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18l6-6-6-6" stroke="white" strokeWidth="2.2"
                      strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border border-white/30 text-white font-semibold px-6 py-4 rounded-2xl hover:bg-white/20 transition-colors text-base"
                >
                  How it works
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats strip ──────────────────────────────────────────────────── */}
        <div className="bg-[#1a0e02] py-5">
          <div className="max-w-[1232px] mx-auto px-6 lg:px-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-between gap-6">
              {STATS.map(({ value, label }, i) => (
                <div key={label} className="flex items-center gap-5">
                  {i > 0 && <div className="w-px h-8 bg-white/15 hidden sm:block" />}
                  <div className="text-center sm:text-left">
                    <p className="font-display font-extrabold text-[#c49a4f] text-2xl leading-none">
                      {value}
                    </p>
                    <p className="text-white/60 text-xs mt-0.5">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── How it works ─────────────────────────────────────────────────── */}
        <section id="how-it-works" className="bg-white py-20">
          <div className="max-w-[1232px] mx-auto px-6 lg:px-0">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-px w-6 bg-[#c49a4f]" />
              <span className="text-[#c49a4f] text-xs font-bold uppercase tracking-[0.16em]">
                Simple process
              </span>
            </div>
            <h2 className="font-display font-extrabold text-[#1a0e02] text-3xl mb-12">
              How it works
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {HOW_IT_WORKS.map(({ n, title, desc, icon }) => (
                <div key={n} className="flex flex-col gap-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-[#f4efe6] border border-[#e8dfd4] rounded-2xl flex items-center justify-center text-[#8b5e38] shrink-0">
                      {icon}
                    </div>
                    <span className="font-display font-extrabold text-[#e8dfd4] text-5xl leading-none">
                      {n}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-[#1a0e02] text-xl mb-2">{title}</h3>
                    <p className="text-[#64707d] text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/host/new"
                className="inline-flex items-center gap-2 bg-[#1a0e02] text-white font-bold px-8 py-4 rounded-2xl hover:bg-[#2d1a07] transition-colors"
                style={{ color: "#fff" }}
              >
                Get started — it's free
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18l6-6-6-6" stroke="white" strokeWidth="2.2"
                    strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* ── What you can list ────────────────────────────────────────────── */}
        <section className="py-20">
          <div className="max-w-[1232px] mx-auto px-6 lg:px-0">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-px w-6 bg-[#c49a4f]" />
              <span className="text-[#c49a4f] text-xs font-bold uppercase tracking-[0.16em]">
                Property types
              </span>
            </div>
            <h2 className="font-display font-extrabold text-[#1a0e02] text-3xl mb-10">
              What can you list?
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {CATEGORIES.map(({ id, label, icon, desc }) => (
                <Link
                  key={id}
                  href="/host/new"
                  className="group bg-white border border-[#e8dfd4] rounded-2xl p-5 flex flex-col items-center gap-3 text-center hover:border-[#8b5e38] hover:shadow-[0_4px_20px_rgba(139,94,56,0.12)] transition-all duration-300"
                >
                  <span className="text-3xl">{icon}</span>
                  <div>
                    <p className="font-display font-semibold text-[#1a0e02] text-sm leading-snug mb-1">
                      {label}
                    </p>
                    <p className="text-[#64707d] text-[11px] leading-relaxed">{desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Perks ────────────────────────────────────────────────────────── */}
        <section className="bg-white py-20">
          <div className="max-w-[1232px] mx-auto px-6 lg:px-0">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-px w-6 bg-[#c49a4f]" />
              <span className="text-[#c49a4f] text-xs font-bold uppercase tracking-[0.16em]">
                Why Bedouin
              </span>
            </div>
            <h2 className="font-display font-extrabold text-[#1a0e02] text-3xl mb-12">
              Everything you need to host well
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {PERKS.map(({ icon, title, desc }) => (
                <div key={title} className="flex items-start gap-5">
                  <div className="w-12 h-12 bg-[#f4efe6] border border-[#e8dfd4] rounded-2xl flex items-center justify-center text-[#8b5e38] shrink-0">
                    {icon}
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-[#1a0e02] text-lg mb-1.5">
                      {title}
                    </h3>
                    <p className="text-[#64707d] text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────────────────────── */}
        <section
          className="py-20"
          style={{
            background: "linear-gradient(135deg, #1a0e02 0%, #2d1a07 50%, #1a0e02 100%)",
          }}
        >
          <div className="max-w-[1232px] mx-auto px-6 lg:px-0 text-center flex flex-col items-center gap-6">
            {/* Gold top accent */}
            <div className="w-12 h-px bg-[#c49a4f]" />
            <h2
              className="font-display font-extrabold text-white leading-tight"
              style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)" }}
            >
              Ready to become a Bedouin host?
            </h2>
            <p className="text-white/65 text-base max-w-lg leading-relaxed">
              It takes about 10 minutes. No booking until you're fully ready.
              List for free, get approved, and start welcoming guests.
            </p>
            <Link
              href="/host/new"
              className="inline-flex items-center gap-2 bg-[#c49a4f] text-[#1a0e02] font-bold px-9 py-4 rounded-2xl hover:bg-[#d4aa5f] transition-colors text-base shadow-lg mt-2"
            >
              Start Your Listing — It's Free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="#1a0e02" strokeWidth="2.2"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <p className="text-white/40 text-xs mt-1">
              No commitment · Free to list · 1–2 day review
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
