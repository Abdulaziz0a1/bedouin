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
    { name: "Mountain View",   image: "https://picsum.photos/seed/abha-mountain/400/300" },
    { name: "Nature Escape",   image: "https://picsum.photos/seed/nature-escape/400/300" },
    { name: "Local Events",    image: "https://picsum.photos/seed/local-events/400/300"  },
    { name: "Heritage Site",   image: "https://picsum.photos/seed/heritage/400/300"      },
    { name: "Jacaranda Walk",  image: "https://picsum.photos/seed/jacaranda/400/300"     },
    { name: "Scenic Lookout",  image: "https://picsum.photos/seed/scenic/400/300"        },
  ],
  shows: [
    { name: "Folk Festival",   image: "https://picsum.photos/seed/folk-festival/400/300"  },
    { name: "Heritage Show",   image: "https://picsum.photos/seed/heritage-show/400/300"  },
    { name: "Desert Theatre",  image: "https://picsum.photos/seed/desert-theatre/400/300" },
    { name: "Cultural Night",  image: "https://picsum.photos/seed/cultural-night/400/300" },
    { name: "Craft Market",    image: "https://picsum.photos/seed/craft-market/400/300"   },
    { name: "Story Night",     image: "https://picsum.photos/seed/story-night/400/300"    },
  ],
  nightlife: [
    { name: "Stargazing",      image: "https://picsum.photos/seed/stargazing/400/300"     },
    { name: "Campfire",        image: "https://picsum.photos/seed/campfire/400/300"       },
    { name: "Night Hike",      image: "https://picsum.photos/seed/night-hike/400/300"     },
    { name: "Desert Dinner",   image: "https://picsum.photos/seed/desert-dinner/400/300"  },
    { name: "Bonfire Party",   image: "https://picsum.photos/seed/bonfire/400/300"        },
    { name: "Moon Watching",   image: "https://picsum.photos/seed/moon-watch/400/300"     },
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
