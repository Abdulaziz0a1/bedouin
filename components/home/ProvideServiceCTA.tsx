import Link from "next/link";

const SERVICES = [
  { icon: "🔑", label: "Check-in & Check-out" },
  { icon: "🧹", label: "Cleaning & Prep"      },
  { icon: "🗺️", label: "Local Area Guide"     },
  { icon: "📷", label: "Photography"           },
  { icon: "🔧", label: "Maintenance"           },
  { icon: "💬", label: "Guest Support"         },
];

export default function ProvideServiceCTA() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-[1232px] mx-auto px-6 lg:px-0">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left: copy */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-px w-6 bg-[#c49a4f]" />
              <span className="text-[#c49a4f] text-xs font-bold uppercase tracking-[0.16em]">
                For Service Providers
              </span>
            </div>

            <h2
              className="font-display font-extrabold text-[#1a0e02] leading-tight mb-4"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)" }}
            >
              Offer Your Skills to Bedouin Hosts
            </h2>

            <p className="text-[#64707d] text-base leading-relaxed mb-6 max-w-md">
              Are you a cleaning professional, local guide, photographer, or hospitality
              expert? Join the Bedouin co-host network and connect with hosts who need
              your services across Saudi Arabia.
            </p>

            <div className="flex flex-col gap-3 mb-8">
              {[
                "Apply once — work with multiple hosts",
                "Admin-reviewed profile for quality assurance",
                "Set your own fee model and availability",
              ].map((point) => (
                <div key={point} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#f4efe6] flex items-center justify-center shrink-0">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17l-5-5" stroke="#8b5e38" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-sm text-[#1a0e02]">{point}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/provide-service"
                className="inline-flex items-center justify-center gap-2 bg-[#1a0e02] text-white font-bold px-7 py-3.5 rounded-2xl hover:bg-[#2d1a07] transition-colors text-sm"
              >
                Provide a Service
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18l6-6-6-6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                href="/cohost"
                className="inline-flex items-center justify-center gap-2 border border-[#dddfe3] text-[#1a0e02] font-semibold px-7 py-3.5 rounded-2xl hover:border-[#8b5e38] hover:bg-[#fdf9f6] transition-colors text-sm"
              >
                Browse co-hosts
              </Link>
            </div>
          </div>

          {/* Right: service grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {SERVICES.map(({ icon, label }) => (
              <div
                key={label}
                className="bg-[#f4efe6] border border-[#e8dfd4] rounded-2xl p-5 flex flex-col items-center gap-3 text-center"
              >
                <span className="text-3xl">{icon}</span>
                <span className="text-xs font-semibold text-[#1a0e02] leading-tight">{label}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
