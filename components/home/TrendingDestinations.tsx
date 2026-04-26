"use client";

import { useState } from "react";
import DestinationCard from "@/components/ui/DestinationCard";
import FadeInSection from "@/components/ui/FadeInSection";

const seasons = [
  { key: "spring", label: "Spring Picks",    emoji: "🌸" },
  { key: "summer", label: "Summer Hotspot",  emoji: "☀️" },
  { key: "autumn", label: "Autumn Escape",   emoji: "🍂" },
  { key: "winter", label: "Winter Getaway",  emoji: "❄️" },
];

const destinations: Record<string, {
  city: string; fromPrice: number; description: string; image: string;
}[]> = {
  spring: [
    { city: "Dammam",    fromPrice: 128, description: "Coastal vibes and calm nights.",             image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=900&fit=crop" },
    { city: "Taif",      fromPrice: 225, description: "Mountain breeze and rose-scented sunsets.",  image: "https://images.unsplash.com/photo-1444930694458-01babf71870c?w=600&h=900&fit=crop" },
    { city: "Al Madinah",fromPrice: 160, description: "Spiritual calm and peaceful moments.",       image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=900&fit=crop" },
    { city: "Riyadh",    fromPrice: 190, description: "Modern skyline and vibrant desert energy.",  image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&h=900&fit=crop" },
  ],
  summer: [
    { city: "Abha",     fromPrice: 150, description: "Cool highlands escape from the summer heat.", image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=900&fit=crop" },
    { city: "AlUla",    fromPrice: 340, description: "Ancient wonders under the open sky.",          image: "https://images.unsplash.com/photo-1548092372-0d1bd40894a3?w=600&h=900&fit=crop"   },
    { city: "Tabuk",    fromPrice: 110, description: "Rugged beauty and desert adventures.",         image: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600&h=900&fit=crop" },
    { city: "Hail",     fromPrice: 98,  description: "Heritage and calm desert landscapes.",         image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=900&fit=crop"   },
  ],
  autumn: [
    { city: "Jeddah",   fromPrice: 210, description: "Historic old town by the Red Sea.",            image: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=600&h=900&fit=crop" },
    { city: "Al Bahah", fromPrice: 175, description: "Green valleys and lush fruit farms.",          image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=900&fit=crop" },
    { city: "Najran",   fromPrice: 90,  description: "Ancient fortresses and desert culture.",       image: "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=600&h=900&fit=crop" },
    { city: "Yanbu",    fromPrice: 140, description: "Diving and coastal calm.",                     image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=900&fit=crop" },
  ],
  winter: [
    { city: "AlUla",         fromPrice: 320, description: "Golden dunes under winter stars.",          image: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=600&h=900&fit=crop" },
    { city: "Empty Quarter", fromPrice: 260, description: "The Rub al Khali — breathtaking.",          image: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600&h=900&fit=crop" },
    { city: "Riyadh",        fromPrice: 170, description: "Warm city life in cool months.",            image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=900&fit=crop" },
    { city: "Dammam",        fromPrice: 105, description: "Mild sea air and open skies.",              image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&h=900&fit=crop" },
  ],
};

export default function TrendingDestinations() {
  const [active, setActive] = useState("spring");

  return (
    <section className="bg-[#f4efe6] py-16">
      <div className="max-w-[1232px] mx-auto px-6 lg:px-0 flex flex-col gap-8">

        {/* Header */}
        <FadeInSection direction="up" delay={0}>
          <div className="flex flex-col gap-1.5">
            <p className="text-[#c49a4f] text-xs font-bold uppercase tracking-[0.20em]">
              Discover Saudi Arabia
            </p>
            <h2 className="font-display font-extrabold text-[#1a0e02] text-4xl leading-tight tracking-tight">
              Trending Destinations
            </h2>
            <p className="text-[#64707d] text-sm mt-0.5 max-w-md">
              Handpicked escapes across the Kingdom, updated by season.
            </p>
          </div>
        </FadeInSection>

        {/* Season chips */}
        <FadeInSection direction="up" delay={80}>
          <div className="flex flex-wrap gap-2.5">
            {seasons.map(({ key, label, emoji }) => {
              const isActive = active === key;
              return (
                <button
                  key={key}
                  onClick={() => setActive(key)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-3xl text-sm font-semibold transition-all duration-200"
                  style={{
                    background: isActive
                      ? "linear-gradient(135deg, #461e00 0%, #5a2a00 100%)"
                      : "white",
                    color: isActive ? "white" : "#2b3037",
                    border: isActive
                      ? "1.5px solid transparent"
                      : "1.5px solid #e8dfd4",
                    boxShadow: isActive
                      ? "0 4px 16px rgba(70,30,0,0.28)"
                      : "none",
                    transform: isActive ? "translateY(-1px)" : "none",
                  }}
                >
                  <span style={{ fontSize: "0.9rem" }}>{emoji}</span>
                  {label}
                </button>
              );
            })}
          </div>
        </FadeInSection>

        {/* Cards row */}
        <div
          className="scroll-row -mx-6 px-6 lg:mx-0 lg:px-0 pb-3"
          style={{ gap: "1.25rem" }}
        >
          {destinations[active].map((d, i) => (
            <div
              key={d.city}
              style={{
                animation: `fadeUp 0.55s cubic-bezier(0.16,1,0.3,1) ${i * 70}ms both`,
              }}
            >
              <DestinationCard {...d} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
