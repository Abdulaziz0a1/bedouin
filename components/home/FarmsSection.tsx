"use client";

import { useRef } from "react";
import ProductCard from "@/components/ui/ProductCard";
import FadeInSection from "@/components/ui/FadeInSection";

const farms = [
  { id: "strawberry-farm",  image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&h=500&fit=crop",  title: "Strawberry Farm",       location: "Al Taif – Al Hada",    price: 70,  score: 5.0, reviewCount: 350 },
  { id: "al-barr-farms",    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=500&fit=crop",  title: "Al Barr Farms",         location: "Northern Al Namas",    price: 120, score: 5.0, reviewCount: 200 },
  { id: "al-baha-fruit",    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=500&fit=crop",  title: "Al Baha Fruit Farms",   location: "Al Baha",              price: 99,  score: 4.8, reviewCount: 160 },
  { id: "date-palm-farm",   image: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=600&h=500&fit=crop", title: "Date Palm Estate",      location: "Al Ahsa",              price: 85,  score: 4.6, reviewCount: 94  },
];

const ArrowBtn = ({
  dir, onClick,
}: { dir: "left" | "right"; onClick: () => void }) => (
  <button
    onClick={onClick}
    aria-label={dir === "left" ? "Previous" : "Next"}
    className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
    style={
      dir === "right"
        ? {
            background: "linear-gradient(135deg, #461e00 0%, #5a2a00 100%)",
            boxShadow: "0 4px 12px rgba(70,30,0,0.30)",
          }
        : {
            background: "white",
            border: "1px solid #e8dfd4",
            boxShadow: "0 2px 8px rgba(70,30,0,0.06)",
          }
    }
    onMouseEnter={(e) => {
      if (dir === "left") (e.currentTarget as HTMLButtonElement).style.borderColor = "#461e00";
    }}
    onMouseLeave={(e) => {
      if (dir === "left") (e.currentTarget as HTMLButtonElement).style.borderColor = "#e8dfd4";
    }}
  >
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      {dir === "left"
        ? <path d="M15 18l-6-6 6-6" stroke="#1a0e02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        : <path d="M9 18l6-6-6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      }
    </svg>
  </button>
);

export default function FarmsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") =>
    ref.current?.scrollBy({ left: dir === "right" ? 316 : -316, behavior: "smooth" });

  return (
    <section className="bg-[#f4efe6] py-16">
      <div className="max-w-[1232px] mx-auto px-6 lg:px-0 flex flex-col gap-8">

        {/* Header */}
        <FadeInSection direction="up" delay={0}>
          <div className="flex items-end justify-between">
            <div className="flex flex-col gap-1.5">
              <p className="text-[#c49a4f] text-xs font-bold uppercase tracking-[0.20em]">Farm stays</p>
              <h2 className="font-display font-extrabold text-[#1a0e02] text-4xl leading-tight tracking-tight">
                Farms Guests Love
              </h2>
              <p className="text-[#64707d] text-sm mt-0.5">
                Handpicked farm experiences across the Kingdom.
              </p>
            </div>
            <div className="flex gap-2 shrink-0 pb-1">
              <ArrowBtn dir="left"  onClick={() => scroll("left")}  />
              <ArrowBtn dir="right" onClick={() => scroll("right")} />
            </div>
          </div>
        </FadeInSection>

        <FadeInSection direction="up" delay={80}>
          <div ref={ref} className="scroll-row -mx-6 px-6 lg:mx-0 lg:px-0">
            {farms.map((f) => <ProductCard key={f.id} {...f} />)}
          </div>
        </FadeInSection>
      </div>
    </section>
  );
}
