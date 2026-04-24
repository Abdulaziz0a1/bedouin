"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import FadeInSection from "@/components/ui/FadeInSection";

const categories = [
  { key: "explore",   label: "Explore"    },
  { key: "shows",     label: "Shows"      },
  { key: "nightlife", label: "Night Life" },
];

const activities: Record<string, { name: string; image: string }[]> = {
  explore: [
    { name: "Mountain View",   image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop" },
    { name: "Nature Escape",   image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop" },
    { name: "Farm Visit",      image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop" },
    { name: "Heritage Site",   image: "https://images.unsplash.com/photo-1548092372-0d1bd40894a3?w=400&h=300&fit=crop"   },
    { name: "Desert Hike",     image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop" },
    { name: "Scenic Lookout",  image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=300&fit=crop" },
  ],
  shows: [
    { name: "Folk Festival",   image: "https://images.unsplash.com/photo-1490750967868-88df5691cc06?w=400&h=300&fit=crop" },
    { name: "Heritage Show",   image: "https://images.unsplash.com/photo-1548092372-0d1bd40894a3?w=400&h=300&fit=crop"   },
    { name: "Desert Theatre",  image: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400&h=300&fit=crop" },
    { name: "Cultural Night",  image: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=300&fit=crop" },
    { name: "Craft Market",    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop" },
    { name: "Story Night",     image: "https://images.unsplash.com/photo-1537225228614-56cc3556d7ed?w=400&h=300&fit=crop" },
  ],
  nightlife: [
    { name: "Stargazing",      image: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=300&fit=crop" },
    { name: "Campfire",        image: "https://images.unsplash.com/photo-1537225228614-56cc3556d7ed?w=400&h=300&fit=crop" },
    { name: "Night Hike",      image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=300&fit=crop" },
    { name: "Desert Dinner",   image: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400&h=300&fit=crop" },
    { name: "Bonfire Night",   image: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=400&h=300&fit=crop" },
    { name: "Moon Watching",   image: "https://images.unsplash.com/photo-1534796636912-3b952d0d5a35?w=400&h=300&fit=crop" },
  ],
};

export default function TopThingsToDo() {
  const [active, setActive] = useState("explore");

  return (
    <section className="py-16 relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #fef9f3 0%, white 100%)" }}
    >
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, #e8dfd4 30%, #e8dfd4 70%, transparent)" }}
      />
      <div className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, #e8dfd4 30%, #e8dfd4 70%, transparent)" }}
      />

      <div className="max-w-[1232px] mx-auto px-6 lg:px-0 flex flex-col gap-8">

        {/* Header */}
        <FadeInSection direction="up" delay={0}>
          <div className="flex flex-col gap-1.5">
            <p className="text-[#c49a4f] text-xs font-bold uppercase tracking-[0.20em]">Things to do</p>
            <h2 className="font-display font-extrabold text-[#1a0e02] text-4xl leading-tight tracking-tight">
              Top Things to Do in Abha
            </h2>
          </div>
        </FadeInSection>

        {/* Category chips */}
        <FadeInSection direction="up" delay={60}>
          <div className="flex flex-wrap gap-2.5">
            {categories.map(({ key, label }) => {
              const isActive = active === key;
              return (
                <button
                  key={key}
                  onClick={() => setActive(key)}
                  className="px-5 py-2.5 rounded-3xl text-sm font-semibold transition-all duration-200"
                  style={{
                    background: isActive
                      ? "linear-gradient(135deg, #1a0e02 0%, #2d1a08 100%)"
                      : "#f4efe6",
                    color: isActive ? "white" : "#2b3037",
                    border: isActive ? "1.5px solid transparent" : "1.5px solid #e8dfd4",
                    boxShadow: isActive ? "0 4px 14px rgba(26,14,2,0.25)" : "none",
                    transform: isActive ? "translateY(-1px)" : "none",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </FadeInSection>

        {/* Activity grid */}
        <FadeInSection direction="up" delay={100}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {activities[active].map(({ name, image }, i) => (
              <Link
                key={name}
                href="/explore"
                className="flex flex-col gap-2.5 group"
                style={{
                  animation: `fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 55}ms both`,
                }}
              >
                <div
                  className="relative h-[156px] rounded-2xl overflow-hidden"
                  style={{
                    boxShadow: "0 4px 16px rgba(70,30,0,0.10)",
                    transition: "box-shadow 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 10px 32px rgba(70,30,0,0.22)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(70,30,0,0.10)";
                  }}
                >
                  <Image
                    src={image} alt={name} fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="200px"
                  />
                  {/* Dark overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <p className="text-[#1a0e02] text-sm font-semibold truncate group-hover:text-[#8b5e38] transition-colors duration-200">
                  {name}
                </p>
              </Link>
            ))}
          </div>
        </FadeInSection>
      </div>
    </section>
  );
}
