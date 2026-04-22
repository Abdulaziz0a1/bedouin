"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

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
    <section className="bg-white py-14 border-y border-[#e8dfd4]">
      <div className="max-w-[1232px] mx-auto px-6 lg:px-0 flex flex-col gap-7">

        {/* Header */}
        <div className="flex flex-col gap-1">
          <p className="text-[#c49a4f] text-xs font-bold uppercase tracking-[0.16em]">Things to do</p>
          <h2 className="font-display font-bold text-[#1a0e02] text-4xl leading-tight">
            Top Things to Do in Abha
          </h2>
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2.5">
          {categories.map(({ key, label }) => (
            <button key={key} onClick={() => setActive(key)}
              className={`px-5 py-2.5 rounded-3xl text-sm font-semibold transition-all duration-200 ${
                active === key
                  ? "bg-[#1a0e02] text-white shadow-sm"
                  : "bg-[#f4efe6] border border-[#e8dfd4] text-[#2b3037] hover:border-[#1a0e02] hover:text-[#1a0e02]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Activity grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {activities[active].map(({ name, image }) => (
            <Link key={name} href="/explore" className="flex flex-col gap-2 group">
              <div className="relative h-[156px] rounded-2xl overflow-hidden">
                <Image src={image} alt={name} fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="200px" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              </div>
              <p className="text-[#1a0e02] text-sm font-semibold truncate">{name}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
