/* ─────────────────────────────────────────────────────────────────────────────
   Bedouin – User Dashboard mock data
   Replace with Firestore queries in production:
     - MOCK_USER     → users/{uid}
     - MOCK_BOOKINGS → query(collection(db,"bookings"), where("userId","==",uid))
     - MOCK_SAVED    → collection(db,"users",uid,"saved")
     - MOCK_ACTIVITY → collection(db,"users",uid,"activity")
───────────────────────────────────────────────────────────────────────────── */

import type {
  UserProfile,
  UserBooking,
  SavedListing,
  ActivityEvent,
} from "@/lib/types/user";

// ──────────────────────────────────────────────────────────────
// User profile
// ──────────────────────────────────────────────────────────────

export const MOCK_USER: UserProfile = {
  id: "user-001",
  firstName: "Layla",
  lastName: "Al-Harbi",
  email: "layla.alharbi@example.com",
  phone: "+966 55 234 1122",
  nationality: "Saudi Arabia",
  avatar: "https://i.pravatar.cc/80?img=47",
  joinedAt: "2025-06-12",
  totalBookings: 5,
  totalNights: 14,
  totalSpent: 8340,
  savedCount: 9,
};

// ──────────────────────────────────────────────────────────────
// Bookings
// ──────────────────────────────────────────────────────────────

export const MOCK_USER_BOOKINGS: UserBooking[] = [
  {
    id: "ubk-001",
    reference: "BDN-48291734",
    listingId: "alula-stargazing-dome",
    listingTitle: "AlUla Stargazing Dome",
    listingCategory: "Dome",
    listingImage: "https://picsum.photos/seed/alula-dome/600/400",
    region: "AlUla",
    location: "Wadi Rum, AlUla",
    checkIn: "2026-03-22",
    checkOut: "2026-03-25",
    nights: 3,
    adults: 2,
    children: 0,
    subtotal: 1860,
    serviceFee: 223,
    totalPrice: 2083,
    paymentMethod: "card",
    hostId: null,
    hostName: "Mohammed Al-Rashidi",
    hostAvatar: "",
    status: "upcoming",
    canCancel: true,
    createdAt: "2026-03-05",
  },
  {
    id: "ubk-002",
    reference: "BDN-38847521",
    listingId: "asir-highland-cabin",
    listingTitle: "Asir Highland Cabin",
    listingCategory: "Cabin",
    listingImage: "https://picsum.photos/seed/asir-cabin/600/400",
    region: "Abha",
    location: "Al Soudah, Abha",
    checkIn: "2026-04-10",
    checkOut: "2026-04-13",
    nights: 3,
    adults: 2,
    children: 1,
    subtotal: 1350,
    serviceFee: 162,
    totalPrice: 1512,
    paymentMethod: "mada",
    hostId: null,
    hostName: "Saad Al-Qahtani",
    hostAvatar: "",
    status: "confirmed",
    canCancel: true,
    createdAt: "2026-03-07",
  },
  {
    id: "ubk-003",
    reference: "BDN-29034851",
    listingId: "taif-rose-glamping",
    listingTitle: "Taif Rose Garden Glamping",
    listingCategory: "Glamping",
    listingImage: "https://picsum.photos/seed/taif-glamp/600/400",
    region: "Taif",
    location: "Rose Valley, Taif",
    checkIn: "2026-02-10",
    checkOut: "2026-02-12",
    nights: 2,
    adults: 2,
    children: 0,
    subtotal: 700,
    serviceFee: 84,
    totalPrice: 784,
    paymentMethod: "apple_pay",
    hostId: null,
    hostName: "Hessa Al-Dossari",
    hostAvatar: "",
    status: "completed",
    canCancel: false,
    createdAt: "2026-01-28",
  },
  {
    id: "ubk-004",
    reference: "BDN-18274509",
    listingId: "hail-desert-camp",
    listingTitle: "Hail Desert Bedouin Camp",
    listingCategory: "Camp",
    listingImage: "https://picsum.photos/seed/hail-camp/600/400",
    region: "Hail",
    location: "Nafud Desert, Hail",
    checkIn: "2025-12-24",
    checkOut: "2025-12-26",
    nights: 2,
    adults: 4,
    children: 2,
    subtotal: 960,
    serviceFee: 115,
    totalPrice: 1075,
    paymentMethod: "card",
    hostId: null,
    hostName: "Turki Al-Shammari",
    hostAvatar: "",
    status: "completed",
    canCancel: false,
    createdAt: "2025-12-10",
  },
  {
    id: "ubk-005",
    reference: "BDN-07182634",
    listingId: "madinah-palm-farm",
    listingTitle: "Madinah Palm Farm Retreat",
    listingCategory: "Farm",
    listingImage: "https://picsum.photos/seed/madinah-farm/600/400",
    region: "Madinah",
    location: "Al Aqoul, Madinah",
    checkIn: "2025-11-15",
    checkOut: "2025-11-17",
    nights: 2,
    adults: 2,
    children: 0,
    subtotal: 580,
    serviceFee: 70,
    totalPrice: 650,
    paymentMethod: "mada",
    hostId: null,
    hostName: "Waleed Al-Anazi",
    hostAvatar: "",
    status: "cancelled",
    canCancel: false,
    createdAt: "2025-11-01",
  },
];

// ──────────────────────────────────────────────────────────────
// Saved / Wishlist listings
// ──────────────────────────────────────────────────────────────

export const MOCK_SAVED_LISTINGS: SavedListing[] = [
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
];

// ──────────────────────────────────────────────────────────────
// Activity feed
// ──────────────────────────────────────────────────────────────

export const MOCK_ACTIVITY: ActivityEvent[] = [
  {
    id: "act-001",
    type: "booking_created",
    title: "Trip booked",
    description: "You booked AlUla Stargazing Dome for Mar 22–25",
    relatedId: "alula-stargazing-dome",
    relatedImage: "https://picsum.photos/seed/alula-dome/80/60",
    timestamp: "2026-03-05T14:32:00Z",
  },
  {
    id: "act-002",
    type: "booking_created",
    title: "Trip booked",
    description: "You booked Asir Highland Cabin for Apr 10–13",
    relatedId: "asir-highland-cabin",
    relatedImage: "https://picsum.photos/seed/asir-cabin/80/60",
    timestamp: "2026-03-07T09:15:00Z",
  },
  {
    id: "act-003",
    type: "listing_saved",
    title: "Listing saved",
    description: "You saved Tabuk Canyon Starcamp to your wishlist",
    relatedId: "tabuk-canyon-camp",
    relatedImage: "https://picsum.photos/seed/tabuk-canyon/80/60",
    timestamp: "2026-02-15T18:44:00Z",
  },
  {
    id: "act-004",
    type: "booking_completed",
    title: "Experience completed",
    description: "Your stay at Taif Rose Garden Glamping is complete",
    relatedId: "taif-rose-glamping",
    relatedImage: "https://picsum.photos/seed/taif-glamp/80/60",
    timestamp: "2026-02-12T11:00:00Z",
  },
  {
    id: "act-005",
    type: "review_submitted",
    title: "Review submitted",
    description: "You left a review for Hail Desert Bedouin Camp",
    relatedId: "hail-desert-camp",
    relatedImage: "https://picsum.photos/seed/hail-camp/80/60",
    timestamp: "2025-12-28T08:20:00Z",
  },
  {
    id: "act-006",
    type: "booking_cancelled",
    title: "Booking cancelled",
    description: "Your trip to Madinah Palm Farm Retreat was cancelled",
    relatedId: "madinah-palm-farm",
    relatedImage: "https://picsum.photos/seed/madinah-farm/80/60",
    timestamp: "2025-11-02T15:10:00Z",
  },
];

// ──────────────────────────────────────────────────────────────
// Derived helpers
// ──────────────────────────────────────────────────────────────

export function getUserKPIs() {
  const upcoming  = MOCK_USER_BOOKINGS.filter((b) => b.status === "upcoming" || b.status === "confirmed");
  const completed = MOCK_USER_BOOKINGS.filter((b) => b.status === "completed");
  const nextTrip  = upcoming.sort((a, b) => a.checkIn.localeCompare(b.checkIn))[0] ?? null;
  const totalSpent = MOCK_USER_BOOKINGS
    .filter((b) => b.status !== "cancelled")
    .reduce((s, b) => s + b.totalPrice, 0);

  return {
    upcomingCount: upcoming.length,
    completedCount: completed.length,
    savedCount: MOCK_SAVED_LISTINGS.length,
    totalSpent,
    nextTrip,
  };
}
