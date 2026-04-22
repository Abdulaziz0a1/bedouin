import Image from "next/image";
import Link from "next/link";

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
    <section className="bg-[#f4efe6] py-14">
      <div className="max-w-[1232px] mx-auto px-6 lg:px-0 flex flex-col gap-7">

        {/* Header */}
        <div className="flex flex-col gap-1">
          <p className="text-[#c49a4f] text-xs font-bold uppercase tracking-[0.16em]">Bucket list Saudi Arabia</p>
          <h2 className="font-display font-bold text-[#1a0e02] text-4xl leading-tight">
            Top Sights to See
          </h2>
        </div>

        {/* Editorial 2-col grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Large featured */}
          <Link href={sights[0].href}
            className="relative rounded-2xl overflow-hidden h-[520px] block group cursor-pointer">
            <Image src={sights[0].image} alt={sights[0].name} fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width:768px) 100vw, 50vw" />
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(to top, rgba(26,14,2,0.85) 0%, rgba(26,14,2,0.15) 55%, transparent 100%)" }}
            />
            {/* Gold accent */}
            <div className="absolute top-5 left-5 flex items-center gap-2">
              <span className="w-5 h-[2px] bg-[#c49a4f]" />
              <span className="text-[#c49a4f] text-[10px] font-bold uppercase tracking-widest">{sights[0].region}</span>
            </div>
            <div className="absolute bottom-0 left-0 p-6 text-white">
              <h3 className="font-display font-extrabold text-4xl mb-2">{sights[0].name}</h3>
              <p className="text-white/80 text-sm leading-relaxed max-w-xs">{sights[0].description}</p>
            </div>
          </Link>

          {/* Two stacked cards */}
          <div className="flex flex-col gap-4">
            {sights.slice(1).map((s) => (
              <Link key={s.name} href={s.href}
                className="relative rounded-2xl overflow-hidden h-[252px] block group cursor-pointer">
                <Image src={s.image} alt={s.name} fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width:768px) 100vw, 50vw" />
                <div className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(26,14,2,0.80) 0%, transparent 60%)" }}
                />
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="w-4 h-[2px] bg-[#c49a4f]" />
                  <span className="text-[#c49a4f] text-[9px] font-bold uppercase tracking-widest">{s.region}</span>
                </div>
                <div className="absolute bottom-0 left-0 p-5 text-white">
                  <h3 className="font-display font-bold text-2xl mb-1">{s.name}</h3>
                  <p className="text-white/75 text-xs leading-relaxed line-clamp-2">{s.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
