/* ─────────────────────────────────────────────────────────────────────────────
   Bedouin – Co-host mock data
   Production integration:
     Browse:      getDocs(query(collection(db,"cohosts"), where("status","==","available")))
     Invite:      addDoc(collection(db,"collaborations"), invitation)
     Assignments: getDocs(collection(db,"listings",listingId,"coHosts"))
     Invitations: getDocs(query(collection(db,"collaborations"),
                    where("hostId","==",uid), orderBy("sentAt","desc")))
───────────────────────────────────────────────────────────────────────────── */

import type {
  CoHost,
  CoHostInvitation,
  CoHostAssignment,
  InviteModalListing,
  CoHostService,
} from "@/lib/types/cohost";

// ──────────────────────────────────────────────────────────────────────────────
// Display labels (shared with components)
// ──────────────────────────────────────────────────────────────────────────────

export const SERVICE_LABELS: Record<CoHostService, string> = {
  guest_checkin:       "Guest Check-in",
  guest_communication: "Guest Communication",
  cleaning:            "Cleaning Coordination",
  maintenance:         "Maintenance",
  local_guide:         "Local Guide",
  calendar:            "Calendar Management",
  listing_support:     "Listing Support",
  photography:         "Photography",
  emergency:           "Emergency Response",
};

export const SERVICE_ICONS: Record<CoHostService, string> = {
  guest_checkin:       "🏠",
  guest_communication: "💬",
  cleaning:            "✨",
  maintenance:         "🔧",
  local_guide:         "🧭",
  calendar:            "📅",
  listing_support:     "📋",
  photography:         "📷",
  emergency:           "🚨",
};

export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  desert_camp:   "Desert Camp",
  farm:          "Farm & Ranch",
  cabin:         "Mountain Cabin",
  glamping:      "Glamping",
  cultural_site: "Cultural Site",
  mountain:      "Mountain",
  coastal:       "Coastal",
};

// ──────────────────────────────────────────────────────────────────────────────
// Co-host profiles
// ──────────────────────────────────────────────────────────────────────────────

export const COHOSTS: CoHost[] = [

  // 1. Noura — AlUla, check-in specialist
  {
    id: "ch-001",
    userId: "ch-001",
    name: "Noura Al-Dosari",
    firstName: "Noura",
    avatar: "https://i.pravatar.cc/160?img=49",
    bio: "I've been co-hosting in the AlUla region for three years, specialising in stargazing dome properties and desert camp experiences. I grew up in this landscape and love introducing guests to the magic of Wadi Rum sunrises. I handle everything from guest arrivals to late-night questions so hosts can rest easy.",
    region: "AlUla",
    city: "AlUla",
    languages: ["Arabic", "English"],
    services: ["guest_checkin", "guest_communication", "calendar"],
    supportedPropertyTypes: ["desert_camp", "glamping"],
    yearsExperience: 3,
    listingsManaged: 12,
    rating: 4.9,
    reviewCount: 23,
    responseRate: 99,
    responseTime: "within 30 minutes",
    status: "available",
    feeModel: "percentage",
    feeValue: 12,
    joinedAt: "2023-01-14T00:00:00Z",
    reviews: [
      {
        hostName: "Mohammed Al-Rashidi",
        hostAvatar: "https://i.pravatar.cc/80?img=52",
        rating: 5,
        comment: "Noura is exceptional. Guests consistently mention how welcoming she is and my ratings improved significantly after she joined.",
        date: "2026-02-01T00:00:00Z",
        listingTitle: "AlUla Stargazing Dome",
      },
      {
        hostName: "Rayan Al-Mutairi",
        hostAvatar: "https://i.pravatar.cc/80?img=60",
        rating: 5,
        comment: "Very professional. She handled a late-night guest issue without needing to call me. Will definitely keep working with her.",
        date: "2025-11-15T00:00:00Z",
        listingTitle: "Desert Rose Camp",
      },
      {
        hostName: "Badr Al-Anazi",
        hostAvatar: "https://i.pravatar.cc/80?img=68",
        rating: 5,
        comment: "Guests loved her. The review scores for communication jumped from 4.6 to 4.9 within two months.",
        date: "2025-09-03T00:00:00Z",
        listingTitle: "Hegra Sunset Dome",
      },
    ],
  },

  // 2. Faisal — Abha, maintenance + local guide
  {
    id: "ch-002",
    userId: "ch-002",
    name: "Faisal Al-Harthi",
    firstName: "Faisal",
    avatar: "https://i.pravatar.cc/160?img=57",
    bio: "Based in the Asir highlands, I've been supporting mountain cabin and farm hosts for five years. My background is in property management and I know every reliable contractor, cleaning team, and supplier in the Abha region. I take maintenance seriously — a well-kept property earns better reviews, period.",
    region: "Abha",
    city: "Al Soudah",
    languages: ["Arabic", "English"],
    services: ["cleaning", "maintenance", "local_guide", "emergency"],
    supportedPropertyTypes: ["cabin", "mountain", "farm"],
    yearsExperience: 5,
    listingsManaged: 24,
    rating: 4.7,
    reviewCount: 18,
    responseRate: 96,
    responseTime: "within 1 hour",
    status: "available",
    feeModel: "fixed",
    feeValue: 1200,
    joinedAt: "2021-06-01T00:00:00Z",
    reviews: [
      {
        hostName: "Lamia Al-Qahtani",
        hostAvatar: "https://i.pravatar.cc/80?img=43",
        rating: 5,
        comment: "Faisal sorted a plumbing issue at 11 PM with zero fuss. That's the kind of co-host you want for a mountain property.",
        date: "2026-01-10T00:00:00Z",
        listingTitle: "Asir Highland Retreat",
      },
      {
        hostName: "Hassan Al-Zahrani",
        hostAvatar: "https://i.pravatar.cc/80?img=61",
        rating: 4,
        comment: "Reliable and knowledgeable about the region. Guests appreciate his local tips. Communication could be a bit faster sometimes.",
        date: "2025-10-20T00:00:00Z",
        listingTitle: "Soudah Fog Cabin",
      },
    ],
  },

  // 3. Reema — multi-region, ASSIGNED to current host
  {
    id: "ch-003",
    userId: "ch-003",
    name: "Reema Al-Saud",
    firstName: "Reema",
    avatar: "https://i.pravatar.cc/160?img=45",
    bio: "Four years in co-hosting across Riyadh, AlUla, and Taif. I specialise in guest communication and calendar optimisation — I've helped hosts increase their occupancy rate by 30% on average just by improving response times and listing copy. Fluent in Arabic, English, and French.",
    region: "Riyadh",
    city: "Riyadh",
    languages: ["Arabic", "English", "French"],
    services: ["guest_communication", "calendar", "listing_support"],
    supportedPropertyTypes: ["glamping", "cultural_site", "desert_camp"],
    yearsExperience: 4,
    listingsManaged: 19,
    rating: 4.8,
    reviewCount: 31,
    responseRate: 98,
    responseTime: "within 45 minutes",
    status: "assigned",
    feeModel: "negotiable",
    joinedAt: "2022-03-08T00:00:00Z",
    reviews: [
      {
        hostName: "Nasser Al-Rashid",
        hostAvatar: "https://i.pravatar.cc/80?img=70",
        rating: 5,
        comment: "She rewrote our listing description and our bookings doubled. Brilliant at what she does.",
        date: "2026-02-20T00:00:00Z",
        listingTitle: "Riyadh Heritage Glamping",
      },
      {
        hostName: "Mona Al-Otaibi",
        hostAvatar: "https://i.pravatar.cc/80?img=41",
        rating: 5,
        comment: "Reema manages our French-speaking guests perfectly. The three-language support is a huge asset.",
        date: "2025-12-05T00:00:00Z",
        listingTitle: "Diriyah Cultural Camp",
      },
      {
        hostName: "Khaled Al-Shammari",
        hostAvatar: "https://i.pravatar.cc/80?img=62",
        rating: 5,
        comment: "Calendar wizard. She eliminated all our double-bookings and keeps the pricing strategy sharp.",
        date: "2025-08-14T00:00:00Z",
        listingTitle: "AlUla Heritage Dome",
      },
    ],
  },

  // 4. Khalid — Hail desert specialist, INVITED (pending)
  {
    id: "ch-004",
    userId: "ch-004",
    name: "Khalid Al-Otaibi",
    firstName: "Khalid",
    avatar: "https://i.pravatar.cc/160?img=53",
    bio: "I've spent my life in the Nafud desert and now I use that knowledge to make desert camp stays unforgettable. I handle guest arrivals, evening fire setup, camel coordination, and emergency on-call. Guests often say their stay with a host I support was the best experience of their trip.",
    region: "Hail",
    city: "Hail",
    languages: ["Arabic"],
    services: ["guest_checkin", "local_guide", "emergency"],
    supportedPropertyTypes: ["desert_camp"],
    yearsExperience: 2,
    listingsManaged: 8,
    rating: 4.6,
    reviewCount: 14,
    responseRate: 94,
    responseTime: "within 2 hours",
    status: "invited",
    feeModel: "fixed",
    feeValue: 800,
    joinedAt: "2024-01-20T00:00:00Z",
    reviews: [
      {
        hostName: "Turki Al-Shammari",
        hostAvatar: "https://i.pravatar.cc/80?img=67",
        rating: 5,
        comment: "Khalid makes every guest feel like a true Bedouin. Authentic, warm, and always on time.",
        date: "2025-09-18T00:00:00Z",
        listingTitle: "Hail Bedouin Camp",
      },
      {
        hostName: "Salim Al-Dosari",
        hostAvatar: "https://i.pravatar.cc/80?img=63",
        rating: 4,
        comment: "Great local knowledge. He managed an unexpected sandstorm situation very calmly. English would be a bonus.",
        date: "2025-11-02T00:00:00Z",
        listingTitle: "Nafud Star Camp",
      },
    ],
  },

  // 5. Dana — Taif, photography + cleaning
  {
    id: "ch-005",
    userId: "ch-005",
    name: "Dana Al-Zahrani",
    firstName: "Dana",
    avatar: "https://i.pravatar.cc/160?img=47",
    bio: "Based in Taif's rose valleys, I've been co-hosting farm and glamping properties for four years. I'm a certified photographer and my listing shoots have helped hosts achieve 40%+ higher click-through rates on the platform. I also coordinate professional cleaning teams so the property always looks its best between guests.",
    region: "Taif",
    city: "Taif",
    languages: ["Arabic", "English"],
    services: ["guest_checkin", "cleaning", "photography", "listing_support"],
    supportedPropertyTypes: ["farm", "glamping"],
    yearsExperience: 4,
    listingsManaged: 16,
    rating: 4.9,
    reviewCount: 27,
    responseRate: 97,
    responseTime: "within 1 hour",
    status: "available",
    feeModel: "percentage",
    feeValue: 10,
    joinedAt: "2022-07-15T00:00:00Z",
    reviews: [
      {
        hostName: "Reem Al-Osaimi",
        hostAvatar: "https://i.pravatar.cc/80?img=39",
        rating: 5,
        comment: "Dana's photos transformed our listing. Bookings went up 60% the month after she did our shoot.",
        date: "2026-01-25T00:00:00Z",
        listingTitle: "Rose Garden Farm",
      },
      {
        hostName: "Hessa Al-Dossari",
        hostAvatar: "https://i.pravatar.cc/80?img=44",
        rating: 5,
        comment: "The cleaning coordination is seamless. I never have to worry about turnover days anymore.",
        date: "2025-10-08T00:00:00Z",
        listingTitle: "Taif Glamping Retreat",
      },
    ],
  },

  // 6. Omar — Jeddah, coastal + communication
  {
    id: "ch-006",
    userId: "ch-006",
    name: "Omar Al-Qahtani",
    firstName: "Omar",
    avatar: "https://i.pravatar.cc/160?img=56",
    bio: "Two years specialising in coastal and luxury glamping properties along the Red Sea. My multilingual background (Arabic, English, Urdu) helps me support hosts with international guests. I focus on listing optimisation and guest communication — quick responses and thoughtful messaging keep reviews high.",
    region: "Jeddah",
    city: "Jeddah",
    languages: ["Arabic", "English", "Urdu"],
    services: ["guest_communication", "listing_support", "photography"],
    supportedPropertyTypes: ["coastal", "glamping"],
    yearsExperience: 2,
    listingsManaged: 6,
    rating: 4.5,
    reviewCount: 11,
    responseRate: 92,
    responseTime: "within 2 hours",
    status: "available",
    feeModel: "percentage",
    feeValue: 18,
    joinedAt: "2024-03-01T00:00:00Z",
    reviews: [
      {
        hostName: "Ziyad Al-Harbi",
        hostAvatar: "https://i.pravatar.cc/80?img=64",
        rating: 5,
        comment: "Omar handles our international guests brilliantly. Response times are excellent.",
        date: "2025-12-14T00:00:00Z",
        listingTitle: "Red Sea Beach Glamping",
      },
    ],
  },

  // 7. Lujain — Madinah, cultural + local guide
  {
    id: "ch-007",
    userId: "ch-007",
    name: "Lujain Al-Harbi",
    firstName: "Lujain",
    avatar: "https://i.pravatar.cc/160?img=48",
    bio: "I co-host farm and cultural experience properties in and around Madinah. With three languages and a deep connection to the region's agricultural heritage, I help guests feel genuinely welcomed. I specialise in check-in experiences that set the tone for a memorable stay.",
    region: "Madinah",
    city: "Madinah",
    languages: ["Arabic", "English", "Indonesian"],
    services: ["local_guide", "guest_checkin", "guest_communication"],
    supportedPropertyTypes: ["farm", "cultural_site"],
    yearsExperience: 3,
    listingsManaged: 11,
    rating: 4.8,
    reviewCount: 19,
    responseRate: 97,
    responseTime: "within 1 hour",
    status: "available",
    feeModel: "negotiable",
    joinedAt: "2023-05-10T00:00:00Z",
    reviews: [
      {
        hostName: "Waleed Al-Anazi",
        hostAvatar: "https://i.pravatar.cc/80?img=15",
        rating: 5,
        comment: "Lujain greets every guest as if they are family. My review scores for hospitality are now consistently 5 stars.",
        date: "2026-01-05T00:00:00Z",
        listingTitle: "Madinah Palm Farm",
      },
      {
        hostName: "Sara Al-Harbi",
        hostAvatar: "https://i.pravatar.cc/80?img=40",
        rating: 5,
        comment: "Incredible with Indonesian pilgrimage groups. She handles cultural sensitivities with real grace.",
        date: "2025-08-22T00:00:00Z",
        listingTitle: "Al Aqoul Heritage Farm",
      },
    ],
  },

  // 8. Saleh — AlUla, photography + listing, DECLINED previous invite
  {
    id: "ch-008",
    userId: "ch-008",
    name: "Saleh Al-Shamri",
    firstName: "Saleh",
    avatar: "https://i.pravatar.cc/160?img=59",
    bio: "Six years supporting AlUla's heritage tourism properties. I combine deep local knowledge with professional photography and listing expertise. I'm selective about new collaborations as I maintain a small portfolio to keep quality high — which is why my hosts see consistently strong review scores.",
    region: "AlUla",
    city: "AlUla",
    languages: ["Arabic", "English"],
    services: ["local_guide", "listing_support", "photography"],
    supportedPropertyTypes: ["desert_camp", "cultural_site"],
    yearsExperience: 6,
    listingsManaged: 30,
    rating: 4.7,
    reviewCount: 22,
    responseRate: 88,
    responseTime: "within 3 hours",
    status: "declined",
    feeModel: "percentage",
    feeValue: 20,
    joinedAt: "2020-09-01T00:00:00Z",
    reviews: [
      {
        hostName: "Norah Al-Rashidi",
        hostAvatar: "https://i.pravatar.cc/80?img=42",
        rating: 5,
        comment: "Saleh's photos of our dome went viral on social media. He has an artistic eye that no one else matches.",
        date: "2026-02-10T00:00:00Z",
        listingTitle: "Hegra Sunrise Dome",
      },
      {
        hostName: "Abdulaziz Al-Otaibi",
        hostAvatar: "https://i.pravatar.cc/80?img=65",
        rating: 4,
        comment: "Expert in AlUla. He's a bit selective and takes time to respond, but the quality is worth it.",
        date: "2025-07-18T00:00:00Z",
        listingTitle: "AlUla Rock Camp",
      },
    ],
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// Mock invitations sent by the current host
// ──────────────────────────────────────────────────────────────────────────────
// Firestore: getDocs(query(collection(db,"collaborations"), where("hostId","==",uid)))

export const MOCK_INVITATIONS: CoHostInvitation[] = [
  {
    id: "inv-001",
    coHostId: "ch-004",
    coHostName: "Khalid Al-Otaibi",
    coHostAvatar: "https://i.pravatar.cc/80?img=53",
    listingId: "hail-desert-camp",
    listingTitle: "Hail Desert Bedouin Camp",
    listingImage: "https://picsum.photos/seed/hail-camp/400/280",
    message: "Salaam Khalid! I think your knowledge of the Nafud desert would be perfect for our camp. Would you be open to co-hosting with us?",
    sentAt: "2026-03-05T10:00:00Z",
    status: "pending",
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// Mock active co-host assignments
// ──────────────────────────────────────────────────────────────────────────────
// Firestore: getDocs(collection(db,"listings",listingId,"coHosts"))

export const MOCK_ASSIGNMENTS: CoHostAssignment[] = [
  {
    id: "asgn-001",
    coHostId: "ch-003",
    coHostName: "Reema Al-Saud",
    coHostAvatar: "https://i.pravatar.cc/80?img=45",
    coHostRegion: "Riyadh",
    listingId: "alula-stargazing-dome",
    listingTitle: "AlUla Stargazing Dome",
    listingImage: "https://picsum.photos/seed/alula-dome/400/280",
    services: ["guest_communication", "calendar", "listing_support"],
    assignedAt: "2025-11-01T00:00:00Z",
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// Host's listings for the invite modal listing selector
// ──────────────────────────────────────────────────────────────────────────────

export const INVITE_MODAL_LISTINGS: InviteModalListing[] = [
  {
    id: "alula-stargazing-dome",
    title: "AlUla Stargazing Dome",
    region: "AlUla",
    image: "https://picsum.photos/seed/alula-dome/400/280",
    status: "approved",
  },
  {
    id: "asir-highland-cabin",
    title: "Asir Highland Cabin",
    region: "Abha",
    image: "https://picsum.photos/seed/asir-cabin/400/280",
    status: "approved",
  },
  {
    id: "hail-desert-camp",
    title: "Hail Desert Bedouin Camp",
    region: "Hail",
    image: "https://picsum.photos/seed/hail-camp/400/280",
    status: "approved",
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

export function getCoHostById(id: string): CoHost | undefined {
  return COHOSTS.find((c) => c.id === id);
}

export function getCoHostStats() {
  return {
    total:     COHOSTS.length,
    available: COHOSTS.filter((c) => c.status === "available").length,
    avgRating: Number((COHOSTS.reduce((s, c) => s + c.rating, 0) / COHOSTS.length).toFixed(1)),
  };
}
