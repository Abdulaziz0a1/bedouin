"use client";

import { useRef } from "react";
import ProductCard from "@/components/ui/ProductCard";

const deals = [
  { id: "sunrise-camel",  image: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600&h=500&fit=crop", title: "Sunrise Camel Herding",  location: "Taif, Al Hada",    price: 220, originalPrice: 400, score: 4.7, reviewCount: 312, badge: "Weekend Deal" },
  { id: "goat-milking",   image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=500&fit=crop", title: "Goat Milking & Farm Day", location: "Abha, Rijal Almaa", price: 120, originalPrice: 170, score: 4.3, reviewCount: 210, badge: "Weekend Deal" },
  { id: "farm-visit",     image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=500&fit=crop", title: "Traditional Farm Visit", location: "Al Ahsa",           price: 170, originalPrice: 230, score: 4.9, reviewCount: 185, badge: "Weekend Deal" },
  { id: "night-stars",    image: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=600&h=500&fit=crop", title: "Night Under the Stars",  location: "AlUla",             price: 300, originalPrice: 450, score: 4.6, reviewCount: 142, badge: "Weekend Deal" },
];

export default function WeekendDeals() {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") =>
    ref.current?.scrollBy({ left: dir === "right" ? 316 : -316, behavior: "smooth" });

  return (
    <section className="bg-white py-14 border-y border-[#e8dfd4]">
      <div className="max-w-[1232px] mx-auto px-6 lg:px-0 flex flex-col gap-7">

        {/* Header */}
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-[#c49a4f] text-xs font-bold uppercase tracking-[0.16em]">Limited time</p>
            <h2 className="font-display font-bold text-[#1a0e02] text-4xl leading-tight">
              This Weekend in Rural Saudi
            </h2>
          </div>
          {/* Scroll arrows */}
          <div className="flex gap-2 shrink-0 pb-1">
            <button onClick={() => scroll("left")} aria-label="Previous"
              className="w-10 h-10 rounded-full bg-[#f4efe6] border border-[#e8dfd4] flex items-center justify-center hover:border-[#461e00] transition-colors">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="#1a0e02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button onClick={() => scroll("right")} aria-label="Next"
              className="w-10 h-10 rounded-full bg-[#461e00] flex items-center justify-center hover:bg-[#5a2900] transition-colors">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>

        <div ref={ref} className="scroll-row -mx-6 px-6 lg:mx-0 lg:px-0">
          {deals.map((d) => <ProductCard key={d.id} {...d} />)}
        </div>
      </div>
    </section>
  );
}
