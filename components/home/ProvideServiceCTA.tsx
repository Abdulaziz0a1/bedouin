import Link from "next/link";
import FadeInSection from "@/components/ui/FadeInSection";

const SERVICES = [
  { icon: "🔑", label: "Check-in & Check-out" },
  { icon: "🧹", label: "Cleaning & Prep"      },
  { icon: "🗺️", label: "Local Area Guide"     },
  { icon: "📷", label: "Photography"           },
  { icon: "🔧", label: "Maintenance"           },
  { icon: "💬", label: "Guest Support"         },
];

const points = [
  "Apply once — work with multiple hosts",
  "Admin-reviewed profile for quality assurance",
  "Set your own fee model and availability",
];

export default function ProvideServiceCTA() {
  return (
    <section className="py-20 relative overflow-hidden" style={{ background: "#ffffff" }}>
      {/* Top subtle border */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, #e8dfd4 30%, #e8dfd4 70%, transparent)" }}
      />

      <div className="max-w-[1232px] mx-auto px-6 lg:px-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

          {/* Left: copy */}
          <FadeInSection direction="left" delay={0}>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="h-px w-8"
                  style={{ background: "linear-gradient(90deg, transparent, #c49a4f)" }}
                />
                <span className="text-[#c49a4f] text-xs font-bold uppercase tracking-[0.20em]">
                  For Service Providers
                </span>
              </div>

              <h2
                className="font-display font-extrabold text-[#1a0e02] leading-tight mb-4 tracking-tight"
                style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)" }}
              >
                Offer Your Skills to Bedouin Hosts
              </h2>

              <p className="text-[#64707d] text-base leading-relaxed mb-7 max-w-md">
                Are you a cleaning professional, local guide, photographer, or hospitality
                expert? Join the Bedouin co-host network and connect with hosts who need
                your services across Saudi Arabia.
              </p>

              <div className="flex flex-col gap-3.5 mb-8">
                {points.map((point) => (
                  <div key={point} className="flex items-center gap-3">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        background: "linear-gradient(135deg, #f4efe6, #ede4d6)",
                        border: "1px solid #e8dfd4",
                      }}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17l-5-5" stroke="#8b5e38" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span className="text-sm text-[#1a0e02] font-medium">{point}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/provide-service"
                  className="inline-flex items-center justify-center gap-2 font-bold px-7 py-3.5 rounded-2xl text-sm transition-all duration-200 hover:-translate-y-px group"
                  style={{
                    background: "linear-gradient(135deg, #1a0e02 0%, #2d1a07 100%)",
                    color: "white",
                    boxShadow: "0 4px 16px rgba(26,14,2,0.25)",
                  }}
                >
                  Provide a Service
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  >
                    <path d="M9 18l6-6-6-6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                <Link
                  href="/cohost"
                  className="inline-flex items-center justify-center gap-2 font-semibold px-7 py-3.5 rounded-2xl text-sm transition-all duration-200 hover:border-[#8b5e38] hover:bg-[#fdf9f6]"
                  style={{
                    border: "1.5px solid #dddfe3",
                    color: "#1a0e02",
                  }}
                >
                  Browse co-hosts
                </Link>
              </div>
            </div>
          </FadeInSection>

          {/* Right: service grid */}
          <FadeInSection direction="right" delay={80}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {SERVICES.map(({ icon, label }, i) => (
                <div
                  key={label}
                  className="rounded-2xl p-5 flex flex-col items-center gap-3 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(70,30,0,0.10)] cursor-default"
                  style={{
                    background: "linear-gradient(145deg, #f9f4ee, #f4efe6)",
                    border: "1px solid #e8dfd4",
                    animationDelay: `${i * 60}ms`,
                  }}
                >
                  <span className="text-3xl">{icon}</span>
                  <span className="text-xs font-semibold text-[#1a0e02] leading-tight">{label}</span>
                </div>
              ))}
            </div>
          </FadeInSection>
        </div>
      </div>
    </section>
  );
}
