/* ─────────────────────────────────────────────────────────────────────────────
   Bedouin – Wishlist mock data
   Production integration points:
     - WISHLIST_ITEMS → getDocs(collection(db, "users", uid, "saved"))
       each doc: { listingId, savedAt, ...listing snapshot }
     - removeItem(id) → deleteDoc(doc(db, "users", uid, "saved", id))
     - RECOMMENDED_LISTINGS → query listings not already in saved set
───────────────────────────────────────────────────────────────────────────── */

import type { SavedListing } from "@/lib/types/user";

// ──────────────────────────────────────────────────────────────────────────────
// All distinct categories represented in the wishlist
// ──────────────────────────────────────────────────────────────────────────────
export const WISHLIST_CATEGORIES = [
  "Farm",
  "Dome",
  "Cabin",
  "Glamping",
  "Camp",
  "Villa",
  "Treehouse",
] as const;

export type WishlistCategory = (typeof WISHLIST_CATEGORIES)[number];

// ──────────────────────────────────────────────────────────────────────────────
// Saved items (Firestore: users/{uid}/saved)
// ──────────────────────────────────────────────────────────────────────────────
export const WISHLIST_ITEMS: SavedListing[] = [
  {
    id: "sv-001",
    listingId: "albaha-treehouse",
    title: "Al Baha Treehouse Retreat",
    location: "Al Baha",
    region: "Al Baha",
    category: "Treehouse",
    price: 520,
    priceUnit: "per night",
    imageUrl: "https://picsum.photos/seed/albaha-tree/600/400",
    score: 9.4,
    reviewCount: 41,
    savedAt: "2026-02-20",
    tags: ["Mountain Views", "Private Pool", "Breakfast Included"],
  },
  {
    id: "sv-002",
    listingId: "tabuk-canyon-camp",
    title: "Tabuk Canyon Starcamp",
    location: "Wadi Disah, Tabuk",
    region: "Tabuk",
    category: "Camp",
    price: 380,
    originalPrice: 450,
    priceUnit: "per night",
    imageUrl: "https://picsum.photos/seed/tabuk-canyon/600/400",
    score: 9.2,
    reviewCount: 58,
    savedAt: "2026-02-15",
    tags: ["Desert", "Stargazing", "Guided Tours"],
  },
  {
    id: "sv-003",
    listingId: "alahsa-palm-estate",
    title: "Al Ahsa Palm Estate",
    location: "Al Hofuf, Al Ahsa",
    region: "Al Ahsa",
    category: "Farm",
    price: 290,
    priceUnit: "per night",
    imageUrl: "https://picsum.photos/seed/ahsa-palm/600/400",
    score: 8.8,
    reviewCount: 33,
    savedAt: "2026-01-30",
    tags: ["Heritage", "Date Farm", "Family Friendly"],
  },
  {
    id: "sv-004",
    listingId: "abha-cloud-villa",
    title: "Abha Cloud-Level Villa",
    location: "Al Soudah, Abha",
    region: "Abha",
    category: "Villa",
    price: 850,
    originalPrice: 1050,
    priceUnit: "per night",
    imageUrl: "https://picsum.photos/seed/abha-cloud/600/400",
    score: 9.6,
    reviewCount: 27,
    savedAt: "2026-01-18",
    tags: ["Cloud Views", "Private Chef", "Luxury"],
  },
  {
    id: "sv-005",
    listingId: "alula-stargazing-dome",
    title: "AlUla Stargazing Dome",
    location: "Wadi Rum, AlUla",
    region: "AlUla",
    category: "Dome",
    price: 620,
    originalPrice: 780,
    priceUnit: "per night",
    imageUrl: "https://picsum.photos/seed/alula-dome/600/400",
    score: 9.5,
    reviewCount: 91,
    savedAt: "2026-01-10",
    tags: ["Stargazing", "Desert", "Romantic"],
  },
  {
    id: "sv-006",
    listingId: "asir-highland-cabin",
    title: "Asir Highland Cabin",
    location: "Al Soudah, Abha",
    region: "Abha",
    category: "Cabin",
    price: 450,
    priceUnit: "per night",
    imageUrl: "https://picsum.photos/seed/asir-cabin/600/400",
    score: 9.1,
    reviewCount: 62,
    savedAt: "2025-12-28",
    tags: ["Mountain Views", "Fireplace", "Cozy"],
  },
  {
    id: "sv-007",
    listingId: "taif-rose-glamping",
    title: "Taif Rose Garden Glamping",
    location: "Rose Valley, Taif",
    region: "Taif",
    category: "Glamping",
    price: 350,
    priceUnit: "per night",
    imageUrl: "https://picsum.photos/seed/taif-glamp/600/400",
    score: 8.9,
    reviewCount: 44,
    savedAt: "2025-12-15",
    tags: ["Rose Season", "Nature", "Romantic"],
  },
  {
    id: "sv-008",
    listingId: "hail-rose-farm",
    title: "Hail Heritage Date Farm",
    location: "Al-Hail, Hail",
    region: "Hail",
    category: "Farm",
    price: 220,
    priceUnit: "per night",
    imageUrl: "https://picsum.photos/seed/hail-farm/600/400",
    score: 8.7,
    reviewCount: 29,
    savedAt: "2025-11-30",
    tags: ["Heritage", "Date Harvest", "Local Culture"],
  },
  {
    id: "sv-009",
    listingId: "madinah-palm-farm",
    title: "Madinah Palm Farm Retreat",
    location: "Al Aqoul, Madinah",
    region: "Madinah",
    category: "Farm",
    price: 300,
    originalPrice: 370,
    priceUnit: "per night",
    imageUrl: "https://picsum.photos/seed/madinah-farm/600/400",
    score: 9.0,
    reviewCount: 37,
    savedAt: "2025-11-20",
    tags: ["Dates", "Palm Gardens", "Peaceful"],
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// Recommended listings (shown at the bottom — not in saved set)
// Firestore: query listings where id NOT IN savedIds, ordered by rating
// ──────────────────────────────────────────────────────────────────────────────
export interface RecommendedListing {
  id: string;
  title: string;
  title_ar?: string;
  location: string;
  location_ar?: string;
  region: string;
  category: string;
  price: number;
  originalPrice?: number;
  priceUnit: string;
  imageUrl: string;
  score: number;
  reviewCount: number;
  tags: string[];
  badge?: string;
}

export const RECOMMENDED_LISTINGS: RecommendedListing[] = [
  {
    id: "jeddah-coral-farm",
    title: "Jeddah Coastal Heritage Farm",
    location: "North Obhur, Jeddah",
    region: "Jeddah",
    category: "Farm",
    price: 410,
    priceUnit: "per night",
    imageUrl: "https://picsum.photos/seed/jeddah-coastal/600/400",
    score: 9.3,
    reviewCount: 52,
    tags: ["Sea Views", "Heritage", "Family"],
    badge: "Trending",
  },
  {
    id: "riyadh-desert-dome",
    title: "Riyadh Edge Desert Dome",
    location: "Thumamah, Riyadh",
    region: "Riyadh",
    category: "Dome",
    price: 560,
    originalPrice: 680,
    priceUnit: "per night",
    imageUrl: "https://picsum.photos/seed/riyadh-dome/600/400",
    score: 9.0,
    reviewCount: 38,
    tags: ["Stargazing", "Desert", "Private"],
    badge: "Deal",
  },
  {
    id: "tabuk-neom-glamping",
    title: "Tabuk Luxury Glamping Pod",
    location: "Sharma, Tabuk",
    region: "Tabuk",
    category: "Glamping",
    price: 720,
    priceUnit: "per night",
    imageUrl: "https://picsum.photos/seed/tabuk-glamp/600/400",
    score: 9.7,
    reviewCount: 19,
    tags: ["Luxury", "Mountain + Sea", "Private Pool"],
    badge: "New",
  },
  {
    id: "alula-heritage-camp",
    title: "AlUla Heritage Bedouin Camp",
    location: "Old Town, AlUla",
    region: "AlUla",
    category: "Camp",
    price: 480,
    priceUnit: "per night",
    imageUrl: "https://picsum.photos/seed/alula-camp/600/400",
    score: 9.4,
    reviewCount: 74,
    tags: ["Heritage", "Cultural", "Guided Tours"],
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

/** All unique categories present in the wishlist items */
export function getWishlistCategories(items: SavedListing[]): string[] {
  return Array.from(new Set(items.map((i) => i.category))).sort();
}

/** All unique regions present in the wishlist items */
export function getWishlistRegions(items: SavedListing[]): string[] {
  return Array.from(new Set(items.map((i) => i.region))).sort();
}
