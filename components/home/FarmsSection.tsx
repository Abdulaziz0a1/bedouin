"use client";

import Image from "next/image";
import { useRef } from "react";
import ProductCard from "@/components/ui/ProductCard";

const farms = [
  { id: "strawberry-farm",  image: "https://picsum.photos/seed/strawberry/600/500",   title: "Strawberry Farm",       location: "Al Taif – Al Hada",    price: 70,  score: 5.0, reviewCount: 350 },
  { id: "al-barr-farms",    image: "https://picsum.photos/seed/albarr/600/500",        title: "Al Barr Farms",         location: "Northern Al Namas",    price: 120, score: 5.0, reviewCount: 200 },
  { id: "al-baha-fruit",    image: "https://picsum.photos/seed/albaha-fruit/600/500",  title: "Al Baha Fruit Farms",   location: "Al Baha",              price: 99,  score: 4.8, reviewCount: 160 },
  { id: "date-palm-farm",   image: "https://picsum.photos/seed/datepalm/600/500",      title: "Date Palm Estate",      location: "Al Ahsa",              price: 85,  score: 4.6, reviewCount: 94  },
];

export default function FarmsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") =>
    ref.current?.scrollBy({ left: dir === "right" ? 316 : -316, behavior: "smooth" });

  return (
    <section className="bg-[#f4efe6] py-14">
      <div className="max-w-[1232px] mx-auto px-6 lg:px-0 flex flex-col gap-7">

        {/* Header */}
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-1">
            {/* Tractor icon + eyebrow */}
            <div className="flex items-center gap-2 mb-0.5">
              <Image src="/logo-icon.png" alt="" width={18} height={18} className="opacity-60" />
              <p className="text-[#c49a4f] text-xs font-bold uppercase tracking-[0.16em]">Farm stays</p>
            </div>
            <h2 className="font-display font-bold text-[#1a0e02] text-4xl leading-tight">
              Farms Guests Love
            </h2>
          </div>
          <div className="flex gap-2 shrink-0 pb-1">
            <button onClick={() => scroll("left")} aria-label="Previous"
              className="w-10 h-10 rounded-full bg-white border border-[#e8dfd4] flex items-center justify-center hover:border-[#461e00] transition-colors">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="#1a0e02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button onClick={() => scroll("right")} aria-label="Next"
              className="w-10 h-10 rounded-full bg-[#461e00] flex items-center justify-center hover:bg-[#5a2900] transition-colors">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>

        <div ref={ref} className="scroll-row -mx-6 px-6 lg:mx-0 lg:px-0">
          {farms.map((f) => <ProductCard key={f.id} {...f} />)}
        </div>
      </div>
    </section>
  );
}
