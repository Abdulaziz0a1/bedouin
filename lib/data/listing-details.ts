import { ALL_LISTINGS, Listing } from "./listings";

/* ─── Extended types ──────────────────────────────────────────────────────── */

export interface Host {
  name: string;
  avatar?: string;   // empty string or undefined → HostCard renders initials
  joinedYear: number;
  reviewCount: number;
  responseRate: number;  // 0–100
  responseTime: string;
  languages: string[];
  bio: string;
  superhost: boolean;
  userId?: string | null; // Supabase auth.users UUID — null for seeded/mock listings
}

export interface Amenity {
  icon: string; // emoji or icon name key
  label: string;
  category: "essentials" | "outdoor" | "food" | "comfort" | "safety";
}

export interface Review {
  id: string;
  reviewer: string;
  avatar: string;
  date: string;          // e.g. "March 2025"
  rating: number;        // 1–5
  comment: string;
  country: string;
}

export interface RatingBreakdown {
  cleanliness: number;
  accuracy: number;
  checkin: number;
  communication: number;
  location: number;
  value: number;
}

export interface ListingDetail extends Listing {
  images: string[];      // all gallery images (6+)
  description: string;
  highlights: string[];
  host: Host;
  amenities: Amenity[];
  reviews: Review[];
  ratingBreakdown: RatingBreakdown;
  maxGuests: number;
  bedrooms: number;
  beds: number;
  baths: number;
  checkInTime: string;
  checkOutTime: string;
  minNights: number;
  houseRules: string[];
  mapsUrl?: string;      // Google Maps / GPS link — optional, set by host on submission
  listingDbId?: string | null; // Real Supabase UUID — null for mock/fallback listings
}

/* ─── Mock detail data ────────────────────────────────────────────────────── */

const DETAIL_MAP: Record<string, Omit<ListingDetail, keyof Listing>> = {
  "alula-stargazing-dome": {
    images: [
      "https://picsum.photos/seed/dome-night-sky/1200/800",
      "https://picsum.photos/seed/dome-interior/600/440",
      "https://picsum.photos/seed/dome-bedroom/600/440",
      "https://picsum.photos/seed/alula-landscape/600/440",
      "https://picsum.photos/seed/alula-rocks/600/440",
      "https://picsum.photos/seed/dome-terrace/600/440",
    ],
    description:
      "Wake up to the stars above and ancient sandstone formations around you. Nestled in a private valley minutes from Madain Saleh, this geodesic dome offers an unrivalled combination of astronomy and heritage. The interior is fitted with floor-to-ceiling panoramic glass, a king-size bed, private plunge pool, and a dedicated telescope deck. Our resident astronomer hosts a nightly stargazing session (included). During the day, explore the 2,000-year-old Nabataean tombs or take a guided jeep safari.",
    highlights: [
      "Private plunge pool with rock views",
      "Nightly astronomer-led stargazing",
      "30 min walk to Hegra World Heritage Site",
      "Chef-prepared breakfast delivered to your dome",
    ],
    host: {
      name: "Fahad Al-Rashidi",
      avatar: "https://picsum.photos/seed/host-fahad/200/200",
      joinedYear: 2021,
      reviewCount: 287,
      responseRate: 99,
      responseTime: "within an hour",
      languages: ["Arabic", "English"],
      bio: "Born and raised in AlUla, I have spent the last decade guiding travellers through Hegra's hidden valleys. Sharing this landscape with the world is my greatest joy.",
      superhost: true,
    },
    amenities: [
      { icon: "🔭", label: "Telescope deck", category: "outdoor" },
      { icon: "🏊", label: "Private plunge pool", category: "comfort" },
      { icon: "☕", label: "In-dome kitchen", category: "food" },
      { icon: "📶", label: "StarLink WiFi", category: "essentials" },
      { icon: "❄️", label: "Air conditioning", category: "comfort" },
      { icon: "🚗", label: "Free parking", category: "essentials" },
      { icon: "🍳", label: "Breakfast included", category: "food" },
      { icon: "🔥", label: "Outdoor firepit", category: "outdoor" },
      { icon: "🛡️", label: "24h security", category: "safety" },
      { icon: "🧴", label: "Luxury toiletries", category: "comfort" },
      { icon: "🌿", label: "Desert garden", category: "outdoor" },
      { icon: "🎶", label: "Bose sound system", category: "comfort" },
    ],
    reviews: [
      {
        id: "r1",
        reviewer: "Aisha M.",
        avatar: "https://picsum.photos/seed/reviewer-aisha/80/80",
        date: "February 2026",
        rating: 5,
        comment:
          "One of the most magical experiences of my life. The stargazing session blew our minds, and Fahad was an incredibly knowledgeable and warm host. The dome itself is stunning — we barely left.",
        country: "UAE",
      },
      {
        id: "r2",
        reviewer: "James T.",
        avatar: "https://picsum.photos/seed/reviewer-james/80/80",
        date: "January 2026",
        rating: 5,
        comment:
          "Completely off the charts. We expected nice accommodation but got a full experience: jeep safari, ancient tombs at sunrise, astronomer at night. The plunge pool under the stars sealed it.",
        country: "UK",
      },
      {
        id: "r3",
        reviewer: "Nora K.",
        avatar: "https://picsum.photos/seed/reviewer-nora/80/80",
        date: "December 2025",
        rating: 5,
        comment:
          "The dome is exactly as photographed — even better in person. Fahad responded to every message within minutes and arranged a private tour of Hegra for us. Worth every riyal.",
        country: "Germany",
      },
      {
        id: "r4",
        reviewer: "Omar S.",
        avatar: "https://picsum.photos/seed/reviewer-omar/80/80",
        date: "November 2025",
        rating: 5,
        comment:
          "Honeymooned here and could not have chosen better. The breakfast delivered at dawn, the silence of the desert, the warmth of the hosts — we are already planning to come back.",
        country: "Saudi Arabia",
      },
    ],
    ratingBreakdown: {
      cleanliness: 5.0,
      accuracy: 4.9,
      checkin: 5.0,
      communication: 5.0,
      location: 5.0,
      value: 4.8,
    },
    maxGuests: 2,
    bedrooms: 1,
    beds: 1,
    baths: 1,
    checkInTime: "3:00 PM",
    checkOutTime: "11:00 AM",
    minNights: 2,
    houseRules: [
      "No smoking inside the dome",
      "Pets are not permitted",
      "Quiet hours after 10 PM (observatory area)",
      "Children under 12 not recommended due to pool depth",
    ],
  },

  "asir-highland-cabin": {
    images: [
      "https://picsum.photos/seed/mountain-cabin-1/1200/800",
      "https://picsum.photos/seed/cabin-living/600/440",
      "https://picsum.photos/seed/cabin-deck/600/440",
      "https://picsum.photos/seed/soudah-view/600/440",
      "https://picsum.photos/seed/cabin-bedroom/600/440",
      "https://picsum.photos/seed/asir-fog/600/440",
    ],
    description:
      "Perched at 2,700 metres in the Al Soudah mountains, this hand-crafted timber cabin offers misty valley views, crisp highland air, and some of Saudi's most dramatic hiking trails at your doorstep. The cabin sleeps four across two bedrooms and features a wrap-around deck, wood-burning fireplace, and a hot outdoor shower. Abha city is 25 minutes away for restaurants and souq visits.",
    highlights: [
      "2,700 m elevation — cool weather year-round",
      "Wrap-around deck with Al Soudah valley views",
      "Wood-burning fireplace",
      "Access to Al Soudah cable car (5 min drive)",
    ],
    host: {
      name: "Maha Al-Ghamdi",
      avatar: "https://picsum.photos/seed/host-maha/200/200",
      joinedYear: 2020,
      reviewCount: 198,
      responseRate: 97,
      responseTime: "within a few hours",
      languages: ["Arabic", "English"],
      bio: "I grew up in these mountains and built this cabin myself over two years. My goal is to share the cool, quiet magic of Asir with visitors who would otherwise never find it.",
      superhost: true,
    },
    amenities: [
      { icon: "🔥", label: "Wood fireplace", category: "comfort" },
      { icon: "🏔️", label: "Panoramic deck", category: "outdoor" },
      { icon: "🚿", label: "Outdoor hot shower", category: "comfort" },
      { icon: "🏠", label: "Full kitchen", category: "food" },
      { icon: "📶", label: "WiFi", category: "essentials" },
      { icon: "🚗", label: "Free parking", category: "essentials" },
      { icon: "🌲", label: "Hiking trails", category: "outdoor" },
      { icon: "🛡️", label: "Carbon monoxide alarm", category: "safety" },
      { icon: "❄️", label: "Heating", category: "comfort" },
      { icon: "🧺", label: "Washer/dryer", category: "essentials" },
      { icon: "📺", label: "Smart TV", category: "comfort" },
      { icon: "🍖", label: "BBQ grill", category: "food" },
    ],
    reviews: [
      {
        id: "r1",
        reviewer: "Tariq H.",
        avatar: "https://picsum.photos/seed/reviewer-tariq/80/80",
        date: "January 2026",
        rating: 5,
        comment:
          "The cabin is stunning. Woke up to fog rolling through the valley — it felt like being above the clouds. Maha was wonderful and left us local honey and dates. We'll be back in summer.",
        country: "Saudi Arabia",
      },
      {
        id: "r2",
        reviewer: "Sophie L.",
        avatar: "https://picsum.photos/seed/reviewer-sophie/80/80",
        date: "December 2025",
        rating: 5,
        comment:
          "Stayed for 3 nights. The fireplace was magical at night, and the deck at dawn is indescribable. A proper escape from city life. The discount made it even better.",
        country: "France",
      },
      {
        id: "r3",
        reviewer: "Khalid A.",
        avatar: "https://picsum.photos/seed/reviewer-khalid/80/80",
        date: "November 2025",
        rating: 4,
        comment:
          "Beautiful location, well-built cabin with lots of character. Communication with Maha was great. Minor note: the road to get there is very steep — helpful to have a 4WD.",
        country: "Kuwait",
      },
    ],
    ratingBreakdown: {
      cleanliness: 4.9,
      accuracy: 4.9,
      checkin: 4.8,
      communication: 5.0,
      location: 5.0,
      value: 4.7,
    },
    maxGuests: 4,
    bedrooms: 2,
    beds: 3,
    baths: 2,
    checkInTime: "4:00 PM",
    checkOutTime: "11:00 AM",
    minNights: 2,
    houseRules: [
      "No smoking inside",
      "Max 4 guests",
      "No loud music after 10 PM",
      "4WD vehicle strongly recommended",
    ],
  },
};

/* Default detail data for listings without specific overrides */
function buildDefault(listing: Listing): Omit<ListingDetail, keyof Listing> {
  return {
    images: [
      listing.image.replace("/600/440", "/1200/800"),
      `https://picsum.photos/seed/${listing.id}-2/600/440`,
      `https://picsum.photos/seed/${listing.id}-3/600/440`,
      `https://picsum.photos/seed/${listing.id}-4/600/440`,
      `https://picsum.photos/seed/${listing.id}-5/600/440`,
      `https://picsum.photos/seed/${listing.id}-6/600/440`,
    ],
    description: `Experience the beauty of ${listing.location} with this authentic Saudi stay. Your host has curated an unforgettable itinerary combining local culture, nature, and genuine Saudi hospitality. From the moment you arrive until your last morning, every detail is designed to make you feel at home in the heart of the region.`,
    highlights: listing.tags.map((t) => t),
    host: {
      name: "Abdullah Al-Harbi",
      avatar: `https://picsum.photos/seed/host-${listing.id}/200/200`,
      joinedYear: 2022,
      reviewCount: listing.reviewCount,
      responseRate: 96,
      responseTime: "within a few hours",
      languages: ["Arabic", "English"],
      bio: `I am a proud local of ${listing.region} and have been welcoming guests since 2022. My mission is to share the real Saudi Arabia — its warmth, its landscapes, and its traditions.`,
      superhost: listing.score >= 4.8,
    },
    amenities: [
      { icon: "📶", label: "WiFi", category: "essentials" },
      { icon: "❄️", label: "Air conditioning", category: "comfort" },
      { icon: "🚗", label: "Free parking", category: "essentials" },
      { icon: "🏠", label: "Kitchen", category: "food" },
      { icon: "🔥", label: "Outdoor firepit", category: "outdoor" },
      { icon: "🛡️", label: "First aid kit", category: "safety" },
      { icon: "☕", label: "Arabic coffee & dates", category: "food" },
      { icon: "🌿", label: "Outdoor seating", category: "outdoor" },
    ],
    reviews: [
      {
        id: "r1",
        reviewer: "Reem S.",
        avatar: `https://picsum.photos/seed/rev-${listing.id}-1/80/80`,
        date: "February 2026",
        rating: 5,
        comment: "Absolutely wonderful stay. The host was incredibly welcoming and the location is breathtaking. Highly recommend to anyone looking for an authentic Saudi experience.",
        country: "Saudi Arabia",
      },
      {
        id: "r2",
        reviewer: "David P.",
        avatar: `https://picsum.photos/seed/rev-${listing.id}-2/80/80`,
        date: "January 2026",
        rating: Math.round(listing.score),
        comment: "A truly memorable experience. Everything was as described and the host went above and beyond to make us feel welcome. Would definitely return.",
        country: "Australia",
      },
    ],
    ratingBreakdown: {
      cleanliness: Math.min(5, listing.score + 0.1),
      accuracy: listing.score,
      checkin: Math.min(5, listing.score + 0.05),
      communication: Math.min(5, listing.score + 0.1),
      location: listing.score,
      value: Math.max(4, listing.score - 0.2),
    },
    maxGuests: 4,
    bedrooms: 2,
    beds: 2,
    baths: 1,
    checkInTime: "3:00 PM",
    checkOutTime: "11:00 AM",
    minNights: 1,
    houseRules: [
      "No smoking on the property",
      "Respect quiet hours after 11 PM",
      "No unregistered guests",
    ],
  };
}

export function getListingDetail(id: string): ListingDetail | null {
  const base = ALL_LISTINGS.find((l) => l.id === id);
  if (!base) return null;
  const extra = DETAIL_MAP[id] ?? buildDefault(base);
  return { ...base, ...extra };
}

export function getRelatedListings(id: string, limit = 4): Listing[] {
  const current = ALL_LISTINGS.find((l) => l.id === id);
  if (!current) return ALL_LISTINGS.slice(0, limit);
  return ALL_LISTINGS
    .filter((l) => l.id !== id && (l.category === current.category || l.region === current.region))
    .slice(0, limit);
}
