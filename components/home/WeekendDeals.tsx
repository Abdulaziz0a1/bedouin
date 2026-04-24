"use client";

import { useRef } from "react";
import ProductCard from "@/components/ui/ProductCard";
import FadeInSection from "@/components/ui/FadeInSection";

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
    <section className="py-16 relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, white 0%, #fef9f3 100%)" }}
    >
      {/* Subtle top/bottom borders */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, #e8dfd4 30%, #e8dfd4 70%, transparent)" }}
      />
      <div className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, #e8dfd4 30%, #e8dfd4 70%, transparent)" }}
      />

      <div className="max-w-[1232px] mx-auto px-6 lg:px-0 flex flex-col gap-8">

        {/* Header */}
        <FadeInSection direction="up" delay={0}>
          <div className="flex items-end justify-between">
            <div className="flex flex-col gap-1.5">
              <p className="text-[#c49a4f] text-xs font-bold uppercase tracking-[0.20em]">Limited time</p>
              <h2 className="font-display font-extrabold text-[#1a0e02] text-4xl leading-tight tracking-tight">
                This Weekend in Rural Saudi
              </h2>
              <p className="text-[#64707d] text-sm mt-0.5">
                Exclusive weekend rates — book before Sunday.
              </p>
            </div>

            {/* Scroll arrows */}
            <div className="flex gap-2 shrink-0 pb-1">
              <button
                onClick={() => scroll("left")}
                aria-label="Previous"
                className="w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-200 hover:-translate-x-0.5"
                style={{
                  background: "#f4efe6",
                  border: "1px solid #e8dfd4",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#461e00"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#e8dfd4"; }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18l-6-6 6-6" stroke="#1a0e02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button
                onClick={() => scroll("right")}
                aria-label="Next"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:translate-x-0.5"
                style={{
                  background: "linear-gradient(135deg, #461e00 0%, #5a2a00 100%)",
                  boxShadow: "0 4px 12px rgba(70,30,0,0.30)",
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18l6-6-6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </FadeInSection>

        <FadeInSection direction="up" delay={80}>
          <div ref={ref} className="scroll-row -mx-6 px-6 lg:mx-0 lg:px-0">
            {deals.map((d) => <ProductCard key={d.id} {...d} />)}
          </div>
        </FadeInSection>
      </div>
    </section>
  );
}
