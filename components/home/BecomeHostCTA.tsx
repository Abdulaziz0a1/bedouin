import Image from "next/image";
import Link from "next/link";

export default function BecomeHostCTA() {
  return (
    <section className="bg-[#1a0e02] py-20 relative overflow-hidden">
      {/* Decorative background pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, #c49a4f 0%, transparent 50%), radial-gradient(circle at 80% 20%, #c49a4f 0%, transparent 40%)`,
        }}
      />

      {/* Gold top border accent */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#c49a4f] to-transparent" />

      <div className="relative max-w-[1232px] mx-auto px-6 lg:px-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text content */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="h-[1px] w-8 bg-[#c49a4f]" />
              <p className="text-[#c49a4f] text-xs font-bold uppercase tracking-[0.18em]">
                For Hosts
              </p>
            </div>

            <h2
              className="font-display font-extrabold text-white leading-tight"
              style={{ fontSize: "clamp(2rem, 3.5vw, 2.75rem)" }}
            >
              Share Your Saudi Heritage
            </h2>

            <p className="text-[#c4b49a] text-lg leading-relaxed max-w-md">
              Turn your farm, desert retreat, or rural property into an income
              source. Join over 850 hosts already welcoming guests to authentic
              Saudi experiences.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                href="/host"
                className="inline-flex items-center justify-center gap-2 bg-[#c49a4f] text-[#1a0e02] font-bold px-8 py-4 rounded-xl hover:bg-[#d4aa5f] transition-colors text-sm"
              >
                Become a Host
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 18l6-6-6-6"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
              <Link
                href="/faq"
                className="inline-flex items-center justify-center gap-2 border border-[#3d2910] text-[#c4b49a] font-semibold px-8 py-4 rounded-xl hover:border-[#c49a4f] hover:text-[#c49a4f] transition-colors text-sm"
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* Right: Stats grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: "850+", label: "Active hosts", sub: "across 12 regions" },
              { value: "SAR 4,200", label: "Avg monthly earn", sub: "per listing" },
              { value: "2 days", label: "Approval time", sub: "fast onboarding" },
              { value: "4.9★", label: "Host satisfaction", sub: "rated by hosts" },
            ].map(({ value, label, sub }) => (
              <div
                key={label}
                className="bg-[#251408] border border-[#3d2910] rounded-2xl p-6 flex flex-col gap-1"
              >
                <p className="font-display font-bold text-[#c49a4f] text-2xl leading-none">
                  {value}
                </p>
                <p className="text-white text-sm font-semibold mt-1">{label}</p>
                <p className="text-[#8b7355] text-xs">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
