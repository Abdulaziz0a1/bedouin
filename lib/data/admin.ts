/* ─────────────────────────────────────────────────────────────────────────────
   Bedouin – Admin Approval mock data
   Production integration:
     - ADMIN_LISTINGS → query(collection(db,"listings"), orderBy("submittedAt","desc"))
     - Approve  → updateDoc(ref, { status:"approved", reviewedAt, reviewedBy })
     - Reject   → updateDoc(ref, { status:"rejected", rejectionReason, reviewedAt, reviewedBy })
     - Audit    → addDoc(collection(db,"listings",id,"decisions"), decision)
     - Host notified via Cloud Function that triggers on status change
───────────────────────────────────────────────────────────────────────────── */

import type { AdminListing, QueueStats } from "@/lib/types/admin";

// ──────────────────────────────────────────────────────────────────────────────
// Shared host stubs
// ──────────────────────────────────────────────────────────────────────────────

const HOST_MOHAMMED = {
  id: "host-001",
  name: "Mohammed Al-Rashidi",
  avatar: "https://i.pravatar.cc/80?img=52",
  email: "m.rashidi@example.com",
  phone: "+966 55 112 3344",
  joinedAt: "2024-03-15",
  totalListings: 4,
  approvedListings: 2,
  responseRate: 98,
  superhost: true,
};

const HOST_HESSA = {
  id: "host-002",
  name: "Hessa Al-Dossari",
  avatar: "https://i.pravatar.cc/80?img=44",
  email: "hessa.dossari@example.com",
  phone: "+966 55 887 6655",
  joinedAt: "2025-01-20",
  totalListings: 2,
  approvedListings: 1,
  responseRate: 92,
  superhost: false,
};

const HOST_TURKI = {
  id: "host-003",
  name: "Turki Al-Shammari",
  avatar: "https://i.pravatar.cc/80?img=67",
  email: "turki.s@example.com",
  phone: "+966 55 334 9900",
  joinedAt: "2024-09-08",
  totalListings: 3,
  approvedListings: 1,
  responseRate: 85,
  superhost: false,
};

const HOST_SARA = {
  id: "host-004",
  name: "Sara Al-Otaibi",
  avatar: "https://i.pravatar.cc/80?img=31",
  email: "sara.otaibi@example.com",
  phone: "+966 55 229 4411",
  joinedAt: "2025-06-01",
  totalListings: 1,
  approvedListings: 0,
  responseRate: 100,
  superhost: false,
};

const HOST_WALEED = {
  id: "host-005",
  name: "Waleed Al-Anazi",
  avatar: "https://i.pravatar.cc/80?img=15",
  email: "waleed.anazi@example.com",
  phone: "+966 55 778 2200",
  joinedAt: "2024-11-14",
  totalListings: 2,
  approvedListings: 0,
  responseRate: 77,
  superhost: false,
};

// ──────────────────────────────────────────────────────────────────────────────
// All listings in the moderation system
// ──────────────────────────────────────────────────────────────────────────────

export const ADMIN_LISTINGS: AdminListing[] = [

  // ── PENDING ──────────────────────────────────────────────────────────────

  {
    id: "adm-001",
    listingRef: "BDN-LST-482910",
    title: "Taif Rose Farm Retreat",
    category: "Farm",
    region: "Taif",
    location: "Rose Valley, Al Hada, Taif",
    description:
      "A tranquil rose farm nestled in the misty highlands of Taif during the rose season. Guests can experience the centuries-old tradition of rose water distillation, walk through 200-year-old rose bushes, and wake up to the fragrance of Ta'if roses. The property sits at 1,900 m above sea level with panoramic mountain views.",
    highlights: [
      "Historic rose garden spanning 3 hectares",
      "Traditional rose water distillation workshop",
      "Panoramic mountain views at 1,900 m",
      "Organic farm breakfast included",
      "Private nature trails",
    ],
    amenities: [
      "Free WiFi", "Air conditioning", "Private garden", "BBQ area",
      "Outdoor shower", "Mountain views", "Hiking trails", "Kitchen",
      "Parking", "Pets allowed",
    ],
    houseRules: [
      "No smoking inside the property",
      "Quiet hours after 10 PM",
      "No outside guests after midnight",
      "Please respect the rose garden",
    ],
    imageUrls: [
      "https://picsum.photos/seed/taif-farm/1200/800",
      "https://picsum.photos/seed/taif-farm2/600/400",
      "https://picsum.photos/seed/taif-farm3/600/400",
      "https://picsum.photos/seed/taif-farm4/600/400",
    ],
    maxGuests: 6,
    bedrooms: 2,
    beds: 3,
    baths: 2,
    minNights: 2,
    checkInTime: "3:00 PM",
    checkOutTime: "11:00 AM",
    price: 390,
    originalPrice: 0,
    priceUnit: "per night",
    status: "pending_review",
    submittedAt: "2026-03-05T09:14:00Z",
    host: HOST_MOHAMMED,
  },

  {
    id: "adm-002",
    listingRef: "BDN-LST-382714",
    title: "Hail Desert Stargazing Camp",
    category: "Camp",
    region: "Hail",
    location: "Nafud Desert, 45 km north of Hail",
    description:
      "An immersive overnight camp experience deep in the Nafud Desert of the Hail region. Guests sleep in traditional Saudi black tents equipped with modern comforts, enjoy camel rides at sunset, and witness some of the clearest night skies in the Arabian Peninsula. Bedouin-style meals prepared on open fire.",
    highlights: [
      "Traditional black Bedouin tents with modern beds",
      "Guided camel rides at sunrise and sunset",
      "Exceptional stargazing — minimal light pollution",
      "Open-fire Bedouin meals included",
      "Sand dune activities available",
    ],
    amenities: [
      "Heating", "Traditional meals included", "Camel rides", "Stargazing equipment",
      "Desert activities", "Guided tours", "Bonfire area", "Private tent",
    ],
    houseRules: [
      "Respect Bedouin cultural traditions",
      "No alcohol on the property",
      "Stay within designated boundaries at night",
      "Modest dress code expected",
    ],
    imageUrls: [
      "https://picsum.photos/seed/hail-camp/1200/800",
      "https://picsum.photos/seed/hail-camp2/600/400",
      "https://picsum.photos/seed/hail-camp3/600/400",
    ],
    maxGuests: 10,
    bedrooms: 0,
    beds: 10,
    baths: 3,
    minNights: 1,
    checkInTime: "4:00 PM",
    checkOutTime: "10:00 AM",
    price: 280,
    originalPrice: 0,
    priceUnit: "per person",
    status: "pending_review",
    submittedAt: "2026-03-06T14:30:00Z",
    host: HOST_TURKI,
  },

  {
    id: "adm-003",
    listingRef: "BDN-LST-294833",
    title: "Jeddah Coastal Heritage Villa",
    category: "Villa",
    region: "Jeddah",
    location: "North Obhur, Jeddah Corniche",
    description:
      "A beautifully restored heritage villa on the Jeddah corniche with direct sea access. Built in the traditional Hijazi style with coral-stone walls and carved wooden mashrabiya screens. The property features a private beach cove, rooftop terrace with Red Sea views, and traditional Al-Balad inspired interior design.",
    highlights: [
      "Direct private beach access on the Red Sea",
      "Authentic Hijazi architecture with mashrabiya screens",
      "Rooftop terrace with 360° sea views",
      "Heritage furniture and local art",
      "Walking distance to the historic Al-Balad district",
    ],
    amenities: [
      "Private beach", "Rooftop terrace", "Sea views", "Free WiFi", "Air conditioning",
      "Full kitchen", "Washing machine", "Private parking", "BBQ area", "Smart TV",
    ],
    houseRules: [
      "No parties or events",
      "Families and couples only",
      "Respect the heritage interiors — no alterations",
      "Quiet hours after 11 PM",
    ],
    imageUrls: [
      "https://picsum.photos/seed/jeddah-villa/1200/800",
      "https://picsum.photos/seed/jeddah-villa2/600/400",
      "https://picsum.photos/seed/jeddah-villa3/600/400",
      "https://picsum.photos/seed/jeddah-villa4/600/400",
      "https://picsum.photos/seed/jeddah-villa5/600/400",
    ],
    maxGuests: 8,
    bedrooms: 3,
    beds: 4,
    baths: 3,
    minNights: 2,
    checkInTime: "2:00 PM",
    checkOutTime: "12:00 PM",
    price: 1200,
    originalPrice: 1500,
    priceUnit: "per night",
    status: "pending_review",
    submittedAt: "2026-03-07T11:05:00Z",
    host: HOST_SARA,
  },

  {
    id: "adm-004",
    listingRef: "BDN-LST-201947",
    title: "Madinah Palm Garden Guesthouse",
    category: "Guesthouse",
    region: "Madinah",
    location: "Al Aqoul district, Madinah",
    description:
      "A serene guesthouse set within a traditional palm garden on the outskirts of Madinah. The property grows over 300 date palm varieties and offers guests a rare glimpse into the ancient oasis agriculture of Hijaz. Guided harvest walks available during date season (July–September).",
    highlights: [
      "300+ date palm varieties in private garden",
      "Traditional oasis agriculture experience",
      "Quiet retreat 20 minutes from Al-Masjid An-Nabawi",
      "Fresh dates and local produce served daily",
      "Guided harvest walks in season",
    ],
    amenities: [
      "Garden access", "Free WiFi", "Air conditioning", "Breakfast included",
      "Prayer room", "Parking", "Farm tours", "Traditional kitchen",
    ],
    houseRules: [
      "This is a family-only property",
      "Respectful conduct aligned with Islamic values",
      "No music after Isha prayer",
      "Guests must be registered at check-in",
    ],
    imageUrls: [
      "https://picsum.photos/seed/madinah-palm/1200/800",
      "https://picsum.photos/seed/madinah-palm2/600/400",
      "https://picsum.photos/seed/madinah-palm3/600/400",
    ],
    maxGuests: 4,
    bedrooms: 2,
    beds: 2,
    baths: 1,
    minNights: 1,
    checkInTime: "1:00 PM",
    checkOutTime: "11:00 AM",
    price: 320,
    originalPrice: 0,
    priceUnit: "per night",
    status: "pending_review",
    submittedAt: "2026-03-07T16:22:00Z",
    host: HOST_WALEED,
  },

  {
    id: "adm-005",
    listingRef: "BDN-LST-158302",
    title: "Abha Misty Mountain Retreat",
    category: "Cabin",
    region: "Abha",
    location: "Al Soudah, Asir region, Abha",
    description:
      "An elevated mountain cabin at 3,000 m in the Asir mountains, surrounded by juniper forests and terraced farms. Guests wake up above the clouds and experience the unique micro-climate of southern Saudi Arabia — lush, green, and cool year-round. Cable car to Al Soudah park within walking distance.",
    highlights: [
      "3,000 m elevation — above the clouds",
      "Ancient juniper forest surroundings",
      "Al Soudah cable car within 500 m",
      "Traditional Asiri architecture restored",
      "Cool temperatures year-round — no air conditioning needed",
    ],
    amenities: [
      "Fireplace", "Mountain views", "Free WiFi", "Full kitchen",
      "Hiking trails", "Terrace", "BBQ", "Parking", "Smart TV",
    ],
    houseRules: [
      "No smoking",
      "Pets welcome with prior notice",
      "Minimum 2 nights on weekends",
      "Guests responsible for own safety on trails",
    ],
    imageUrls: [
      "https://picsum.photos/seed/abha-cabin/1200/800",
      "https://picsum.photos/seed/abha-cabin2/600/400",
      "https://picsum.photos/seed/abha-cabin3/600/400",
      "https://picsum.photos/seed/abha-cabin4/600/400",
    ],
    maxGuests: 5,
    bedrooms: 2,
    beds: 3,
    baths: 2,
    minNights: 2,
    checkInTime: "3:00 PM",
    checkOutTime: "11:00 AM",
    price: 520,
    originalPrice: 650,
    priceUnit: "per night",
    status: "pending_review",
    submittedAt: "2026-03-08T08:45:00Z",
    host: HOST_HESSA,
  },

  // ── APPROVED ─────────────────────────────────────────────────────────────

  {
    id: "adm-006",
    listingRef: "BDN-LST-094571",
    title: "AlUla Stargazing Dome",
    category: "Dome",
    region: "AlUla",
    location: "Wadi Rum, AlUla",
    description:
      "A geodesic dome with a fully transparent ceiling panel that lets you stargaze from your bed, set in the ancient desert landscape of AlUla.",
    highlights: ["Transparent ceiling for stargazing", "AlUla UNESCO heritage", "Private guide available"],
    amenities: ["Air conditioning", "En-suite bathroom", "Stargazing equipment", "Desert breakfast"],
    houseRules: ["No smoking", "Check-in after 5 PM"],
    imageUrls: ["https://picsum.photos/seed/alula-dome/1200/800", "https://picsum.photos/seed/alula-dome2/600/400"],
    maxGuests: 2, bedrooms: 1, beds: 1, baths: 1, minNights: 2,
    checkInTime: "5:00 PM", checkOutTime: "10:00 AM",
    price: 620, originalPrice: 780, priceUnit: "per night",
    status: "approved",
    submittedAt: "2026-04-10T10:00:00Z",
    reviewedAt: "2026-04-13T14:22:00Z",
    reviewedBy: "Admin · Fatima Al-Zahrani",
    adminNotes: "Exceptional listing. Photos are high quality. Location verified.",
    host: HOST_MOHAMMED,
  },

  {
    id: "adm-007",
    listingRef: "BDN-LST-071238",
    title: "Asir Highland Cabin",
    category: "Cabin",
    region: "Abha",
    location: "Al Soudah, Abha",
    description: "A cosy highland cabin in the Asir mountains with spectacular views of the Green Mountain.",
    highlights: ["Mountain views", "Fireplace", "Freshly renovated"],
    amenities: ["Fireplace", "Mountain views", "Free WiFi", "Full kitchen", "Parking"],
    houseRules: ["No smoking", "No pets"],
    imageUrls: ["https://picsum.photos/seed/asir-cabin/1200/800", "https://picsum.photos/seed/asir-cabin2/600/400"],
    maxGuests: 4, bedrooms: 2, beds: 2, baths: 1, minNights: 1,
    checkInTime: "3:00 PM", checkOutTime: "11:00 AM",
    price: 450, originalPrice: 0, priceUnit: "per night",
    status: "approved",
    submittedAt: "2026-07-22T09:00:00Z",
    reviewedAt: "2026-07-25T11:05:00Z",
    reviewedBy: "Admin · Fatima Al-Zahrani",
    host: HOST_MOHAMMED,
  },

  // ── REJECTED ─────────────────────────────────────────────────────────────

  {
    id: "adm-008",
    listingRef: "BDN-LST-033819",
    title: "Hail Desert Camp (v1)",
    category: "Glamping",
    region: "Hail",
    location: "Nafud Desert, Hail",
    description: "Desert camp experience near Hail.",
    highlights: ["Desert views", "Camel rides"],
    amenities: ["Camping equipment", "Meals"],
    houseRules: ["No outside food"],
    imageUrls: ["https://picsum.photos/seed/hail-v1/1200/800"],
    maxGuests: 6, bedrooms: 0, beds: 6, baths: 2, minNights: 1,
    checkInTime: "4:00 PM", checkOutTime: "9:00 AM",
    price: 280, originalPrice: 0, priceUnit: "per night",
    status: "rejected",
    submittedAt: "2026-01-18T13:00:00Z",
    reviewedAt: "2026-01-20T10:30:00Z",
    reviewedBy: "Admin · Fatima Al-Zahrani",
    rejectionReason:
      "Photos do not meet Bedouin quality standards. Only 1 image submitted — we require a minimum of 4 images covering the sleeping area, bathroom, common areas, and outdoor/surroundings. Please resubmit with high-resolution photos (min. 1200 × 800 px).",
    host: HOST_TURKI,
  },

  {
    id: "adm-009",
    listingRef: "BDN-LST-019204",
    title: "Riyadh Urban Apartment",
    category: "Guesthouse",
    region: "Riyadh",
    location: "Al Olaya, Riyadh",
    description: "Modern apartment in the heart of Riyadh available for short stays.",
    highlights: ["Central location", "Gym access"],
    amenities: ["Free WiFi", "Gym", "Parking", "Air conditioning"],
    houseRules: ["No smoking"],
    imageUrls: ["https://picsum.photos/seed/riyadh-apt/1200/800", "https://picsum.photos/seed/riyadh-apt2/600/400"],
    maxGuests: 2, bedrooms: 1, beds: 1, baths: 1, minNights: 1,
    checkInTime: "2:00 PM", checkOutTime: "12:00 PM",
    price: 450, originalPrice: 0, priceUnit: "per night",
    status: "rejected",
    submittedAt: "2025-12-05T09:00:00Z",
    reviewedAt: "2025-12-07T14:00:00Z",
    reviewedBy: "Admin · Omar Al-Ghamdi",
    rejectionReason:
      "This listing does not align with Bedouin's platform focus. Bedouin specialises in authentic farm, desert, nature, and cultural tourism experiences. Standard urban apartments are outside our scope. We encourage you to list a rural, farm, heritage, or nature-based property instead.",
    host: HOST_SARA,
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// Queue statistics (Firestore: aggregation queries / Cloud Functions in prod)
// ──────────────────────────────────────────────────────────────────────────────

export function getQueueStats(): QueueStats {
  const pending  = ADMIN_LISTINGS.filter((l) => l.status === "pending_review").length;
  const approved = ADMIN_LISTINGS.filter((l) => l.status === "approved").length;
  const rejected = ADMIN_LISTINGS.filter((l) => l.status === "rejected").length;

  return {
    pendingCount: pending,
    approvedToday: approved,
    rejectedToday: rejected,
    avgReviewHours: 52,
  };
}

export function getListingsByStatus(status: "pending_review" | "approved" | "rejected" | "all") {
  if (status === "all") return ADMIN_LISTINGS;
  return ADMIN_LISTINGS.filter((l) => l.status === status);
}
