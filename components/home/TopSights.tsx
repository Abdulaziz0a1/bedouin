import Image from "next/image";
import Link from "next/link";
import FadeInSection from "@/components/ui/FadeInSection";

const sights = [
  {
    name: "AlUla",
    region: "Al Madinah Region",
    description: "Saudi Arabia's crown jewel — ancient Nabataean tombs, rose-red canyons, and the Hegra archaeological city carved into sandstone cliffs 2,000 years ago.",
    image: "https://images.unsplash.com/photo-1548092372-0d1bd40894a3?w=900&h=1000&fit=crop",
    href: "/explore?location=AlUla",
  },
  {
    name: "Abha",
    region: "Aseer Region",
    description: "Misty highlands, jacaranda-lined streets, and a cool green escape in the heart of Saudi Arabia's mountain south.",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=900&h=500&fit=crop",
    href: "/explore?location=Abha",
  },
  {
    name: "Asir Highlands",
    region: "Aseer Region",
    description: "Terraced mountain villages, ancient watchtowers, and Saudi Arabia's most dramatic highland landscape above the clouds.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&h=500&fit=crop",
    href: "/explore?region=Abha",
  },
];

export default function TopSights() {
  return (
    <section className="bg-[#f4efe6] py-16">
      <div className="max-w-[1232px] mx-auto px-6 lg:px-0 flex flex-col gap-8">

        {/* Header */}
        <FadeInSection direction="up" delay={0}>
          <div className="flex flex-col gap-1.5">
            <p className="text-[#c49a4f] text-xs font-bold uppercase tracking-[0.20em]">Bucket list Saudi Arabia</p>
            <h2 className="font-display font-extrabold text-[#1a0e02] text-4xl leading-tight tracking-tight">
              Top Sights to See
            </h2>
          </div>
        </FadeInSection>

        {/* Editorial 2-col grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Large featured */}
          <FadeInSection direction="left" delay={60}>
            <Link href={sights[0].href}
              className="relative rounded-3xl overflow-hidden h-[520px] block group cursor-pointer"
              style={{ boxShadow: "0 8px 32px rgba(26,14,2,0.15)" }}
            >
              <Image src={sights[0].image} alt={sights[0].name} fill
                className="object-cover group-hover:scale-[1.06] transition-transform duration-700"
                style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
                sizes="(max-width:768px) 100vw, 50vw" />
              <div className="absolute inset-0"
                style={{ background: "linear-gradient(to top, rgba(26,14,2,0.88) 0%, rgba(26,14,2,0.15) 55%, transparent 100%)" }}
              />
              {/* Gold accent */}
              <div className="absolute top-5 left-5 flex items-center gap-2">
                <span className="w-5 h-[2px] rounded-full" style={{ background: "linear-gradient(90deg, #c49a4f, #f0c84a)" }} />
                <span className="text-[#c49a4f] text-[10px] font-bold uppercase tracking-widest">{sights[0].region}</span>
              </div>
              {/* Gold border glow on hover */}
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ boxShadow: "inset 0 0 0 1.5px rgba(196,154,79,0.40)" }}
              />
              <div className="absolute bottom-0 left-0 p-6 text-white">
                <h3 className="font-display font-extrabold text-4xl mb-2 tracking-tight">{sights[0].name}</h3>
                <p className="text-white/78 text-sm leading-relaxed max-w-xs">{sights[0].description}</p>
                <div className="flex items-center gap-1.5 mt-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                  <span className="text-[#c49a4f] text-xs font-bold uppercase tracking-[0.14em]">Explore</span>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18l6-6-6-6" stroke="#c49a4f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </Link>
          </FadeInSection>

          {/* Two stacked cards */}
          <div className="flex flex-col gap-5">
            {sights.slice(1).map((s, i) => (
              <FadeInSection key={s.name} direction="right" delay={80 + i * 100}>
                <Link href={s.href}
                  className="relative rounded-3xl overflow-hidden h-[247px] block group cursor-pointer"
                  style={{ boxShadow: "0 6px 24px rgba(26,14,2,0.12)" }}
                >
                  <Image src={s.image} alt={s.name} fill
                    className="object-cover group-hover:scale-[1.06] transition-transform duration-700"
                    style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
                    sizes="(max-width:768px) 100vw, 50vw" />
                  <div className="absolute inset-0"
                    style={{ background: "linear-gradient(to top, rgba(26,14,2,0.85) 0%, transparent 60%)" }}
                  />
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="w-4 h-[1.5px] rounded-full" style={{ background: "linear-gradient(90deg, #c49a4f, #f0c84a)" }} />
                    <span className="text-[#c49a4f] text-[9px] font-bold uppercase tracking-widest">{s.region}</span>
                  </div>
                  <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{ boxShadow: "inset 0 0 0 1.5px rgba(196,154,79,0.40)" }}
                  />
                  <div className="absolute bottom-0 left-0 p-5 text-white">
                    <h3 className="font-display font-bold text-2xl mb-1 tracking-tight">{s.name}</h3>
                    <p className="text-white/72 text-xs leading-relaxed line-clamp-2">{s.description}</p>
                  </div>
                </Link>
              </FadeInSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
