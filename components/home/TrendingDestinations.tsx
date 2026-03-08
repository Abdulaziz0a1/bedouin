"use client";

import { useState } from "react";
import DestinationCard from "@/components/ui/DestinationCard";

const seasons = [
  { key: "spring", label: "🌸 Spring Picks"    },
  { key: "summer", label: "☀️ Summer Hotspot"  },
  { key: "autumn", label: "🍂 Autumn Escape"   },
  { key: "winter", label: "❄️ Winter Getaway"  },
];

const destinations: Record<string, {
  city: string; fromPrice: number; description: string; image: string;
}[]> = {
  spring: [
    { city: "Dammam",    fromPrice: 128, description: "Coastal vibes and calm nights.",             image: "https://picsum.photos/seed/dammam/600/900"    },
    { city: "Taif",      fromPrice: 225, description: "Mountain breeze and rose-scented sunsets.",  image: "https://picsum.photos/seed/taif/600/900"      },
    { city: "Al Madinah",fromPrice: 160, description: "Spiritual calm and peaceful moments.",       image: "https://picsum.photos/seed/madinah/600/900"   },
    { city: "Riyadh",    fromPrice: 190, description: "Modern skyline and vibrant desert energy.",  image: "https://picsum.photos/seed/riyadh/600/900"    },
  ],
  summer: [
    { city: "Abha",     fromPrice: 150, description: "Cool highlands escape from the summer heat.", image: "https://picsum.photos/seed/abha/600/900"     },
    { city: "AlUla",    fromPrice: 340, description: "Ancient wonders under the open sky.",          image: "https://picsum.photos/seed/alula/600/900"    },
    { city: "Tabuk",    fromPrice: 110, description: "Rugged beauty and desert adventures.",         image: "https://picsum.photos/seed/tabuk/600/900"    },
    { city: "Hail",     fromPrice: 98,  description: "Heritage and calm desert landscapes.",         image: "https://picsum.photos/seed/hail/600/900"     },
  ],
  autumn: [
    { city: "Jeddah",   fromPrice: 210, description: "Historic old town by the Red Sea.",            image: "https://picsum.photos/seed/jeddah/600/900"   },
    { city: "Al Bahah", fromPrice: 175, description: "Green valleys and lush fruit farms.",          image: "https://picsum.photos/seed/albahah/600/900"  },
    { city: "Najran",   fromPrice: 90,  description: "Ancient fortresses and desert culture.",       image: "https://picsum.photos/seed/najran/600/900"   },
    { city: "Yanbu",    fromPrice: 140, description: "Diving and coastal calm.",                     image: "https://picsum.photos/seed/yanbu/600/900"    },
  ],
  winter: [
    { city: "AlUla",       fromPrice: 320, description: "Golden dunes under winter stars.",          image: "https://picsum.photos/seed/alula2/600/900"    },
    { city: "Empty Quarter",fromPrice:260, description: "The Rub al Khali — breathtaking.",          image: "https://picsum.photos/seed/rubkhali/600/900"  },
    { city: "Riyadh",      fromPrice: 170, description: "Warm city life in cool months.",            image: "https://picsum.photos/seed/riyadh2/600/900"   },
    { city: "Dammam",      fromPrice: 105, description: "Mild sea air and open skies.",              image: "https://picsum.photos/seed/dammam2/600/900"   },
  ],
};

export default function TrendingDestinations() {
  const [active, setActive] = useState("spring");

  return (
    <section className="bg-[#f4efe6] py-14">
      <div className="max-w-[1232px] mx-auto px-6 lg:px-0 flex flex-col gap-7">

        {/* Header */}
        <div className="flex flex-col gap-1">
          <p className="text-[#c49a4f] text-xs font-bold uppercase tracking-[0.16em]">Discover Saudi Arabia</p>
          <h2 className="font-display font-bold text-[#1a0e02] text-4xl leading-tight">
            Trending Destinations
          </h2>
        </div>

        {/* Season chips */}
        <div className="flex flex-wrap gap-2.5">
          {seasons.map(({ key, label }) => (
            <button key={key} onClick={() => setActive(key)}
              className={`px-4 py-2.5 rounded-3xl text-sm font-semibold transition-all duration-200 ${
                active === key
                  ? "bg-[#461e00] text-white shadow-sm"
                  : "bg-white border border-[#e8dfd4] text-[#2b3037] hover:border-[#461e00] hover:text-[#461e00]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="scroll-row -mx-6 px-6 lg:mx-0 lg:px-0">
          {destinations[active].map((d) => (
            <DestinationCard key={d.city} {...d} />
          ))}
        </div>
      </div>
    </section>
  );
}
