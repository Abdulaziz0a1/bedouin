// Mock host dashboard data — replace with Firestore queries in production

export interface DashboardListing {
  id: string;
  /** Slug of the live listing in the `listings` table — only set when status = 'approved'. */
  listingSlug?: string;
  /** UUID of the row in the `listings` table — only set when status = 'approved'.
   *  Used to match co-host invitations/assignments (both reference listings.id). */
  listingId?: string;
  title: string;
  title_ar?: string;
  category: string;
  region: string;
  location: string;
  location_ar?: string;
  price: number;
  priceUnit: string;
  originalPrice?: number;
  imageUrl: string;
  status: "approved" | "pending_review" | "rejected" | "draft" | "cancelled";
  submittedAt: string; // ISO date
  approvedAt?: string;
  rejectionReason?: string;
  /** Legacy single-step field — kept for backward compat with old DB rows. */
  rejectedStep?: string;
  /** Multi-step rejection — array of step keys flagged by admin. */
  rejectedSteps?: string[];
  totalBookings: number;
  totalEarned: number;
  avgRating: number;
  reviewCount: number;
  // Cancellation request state (present when status = 'approved')
  cancellationRequestId?: string;
  cancellationRequestStatus?: "pending" | "approved" | "rejected";
  cancellationRequestAdminNote?: string;
}

export interface DashboardBooking {
  id: string;
  reference: string;
  listingId: string;
  listingTitle: string;
  listingTitle_ar?: string;
  listingImage: string;
  guestId?: string;      // auth user id of the guest — used for messaging
  guestName: string;
  guestAvatar: string;
  guestNationality: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  totalPrice: number;
  hostPayout: number;
  status: "upcoming" | "active" | "completed" | "cancelled";
  paymentMethod: "card" | "mada" | "apple_pay";
  createdAt: string;
  // Cancellation metadata (populated when status = 'cancelled')
  cancellationType?: string;   // 'by_tourist'
  cancellationReason?: string;
  cancelledAt?: string;
}

export interface EarningsMonth {
  month: string; // e.g. "Oct"
  year: number;
  gross: number;
  payout: number;
  bookings: number;
}

export interface PayoutRecord {
  id: string;
  date: string;
  amount: number;
  method: string;
  status: "paid" | "processing" | "scheduled";
  reference: string;
}

export interface HostProfile {
  id: string;
  name: string;
  avatar: string;
  joinedAt: string;
  superhost: boolean;
  responseRate: number;
  avgRating: number;
  totalReviews: number;
  totalEarned: number;
  activeListings: number;
}

// ──────────────────────────────────────────────────────────────
// Mock data
// ──────────────────────────────────────────────────────────────

export const MOCK_HOST: HostProfile = {
  id: "host-001",
  name: "Mohammed Al-Rashidi",
  avatar: "https://i.pravatar.cc/80?img=52",
  joinedAt: "2024-03-15",
  superhost: true,
  responseRate: 98,
  avgRating: 4.87,
  totalReviews: 63,
  totalEarned: 42350,
  activeListings: 2,
};

export const MOCK_LISTINGS: DashboardListing[] = [
  {
    id: "alula-stargazing-dome",
    title: "AlUla Stargazing Dome",
    category: "Dome",
    region: "AlUla",
    location: "Wadi Rum, AlUla",
    price: 620,
    priceUnit: "per night",
    originalPrice: 780,
    imageUrl: "https://picsum.photos/seed/alula-dome/600/400",
    status: "approved",
    submittedAt: "2024-04-10",
    approvedAt: "2024-04-13",
    totalBookings: 38,
    totalEarned: 21760,
    avgRating: 4.92,
    reviewCount: 38,
  },
  {
    id: "asir-highland-cabin",
    title: "Asir Highland Cabin",
    category: "Cabin",
    region: "Abha",
    location: "Al Soudah, Abha",
    price: 450,
    priceUnit: "per night",
    imageUrl: "https://picsum.photos/seed/asir-cabin/600/400",
    status: "approved",
    submittedAt: "2024-07-22",
    approvedAt: "2024-07-25",
    totalBookings: 25,
    totalEarned: 10350,
    avgRating: 4.81,
    reviewCount: 25,
  },
  {
    id: "taif-rose-farm",
    title: "Taif Rose Farm Retreat",
    category: "Farm",
    region: "Taif",
    location: "Rose Valley, Taif",
    price: 390,
    priceUnit: "per night",
    imageUrl: "https://picsum.photos/seed/taif-farm/600/400",
    status: "pending_review",
    submittedAt: "2026-03-05",
    totalBookings: 0,
    totalEarned: 0,
    avgRating: 0,
    reviewCount: 0,
  },
  {
    id: "hail-desert-camp",
    title: "Hail Desert Camp",
    category: "Glamping",
    region: "Hail",
    location: "Nafud Desert, Hail",
    price: 280,
    priceUnit: "per night",
    imageUrl: "https://picsum.photos/seed/hail-camp/600/400",
    status: "rejected",
    submittedAt: "2026-01-18",
    rejectionReason: "Photos do not meet quality standards. Also, the Google Maps location link is missing — please add the exact coordinates.",
    rejectedSteps: ["media", "location"],
    totalBookings: 0,
    totalEarned: 0,
    avgRating: 0,
    reviewCount: 0,
  },
];

export const MOCK_BOOKINGS: DashboardBooking[] = [
  {
    id: "bk-001",
    reference: "BDN-48291734",
    listingId: "alula-stargazing-dome",
    listingTitle: "AlUla Stargazing Dome",
    listingImage: "https://picsum.photos/seed/alula-dome/120/80",
    guestName: "Sarah Al-Amri",
    guestAvatar: "https://i.pravatar.cc/40?img=31",
    guestNationality: "🇸🇦 Saudi Arabia",
    checkIn: "2026-03-15",
    checkOut: "2026-03-18",
    nights: 3,
    adults: 2,
    children: 0,
    totalPrice: 2090,
    hostPayout: 1724,
    status: "upcoming",
    paymentMethod: "card",
    createdAt: "2026-03-01",
  },
  {
    id: "bk-002",
    reference: "BDN-38847521",
    listingId: "asir-highland-cabin",
    listingTitle: "Asir Highland Cabin",
    listingImage: "https://picsum.photos/seed/asir-cabin/120/80",
    guestName: "Omar Al-Ghamdi",
    guestAvatar: "https://i.pravatar.cc/40?img=12",
    guestNationality: "🇸🇦 Saudi Arabia",
    checkIn: "2026-03-20",
    checkOut: "2026-03-23",
    nights: 3,
    adults: 4,
    children: 2,
    totalPrice: 1514,
    hostPayout: 1249,
    status: "upcoming",
    paymentMethod: "mada",
    createdAt: "2026-03-04",
  },
  {
    id: "bk-003",
    reference: "BDN-29034851",
    listingId: "alula-stargazing-dome",
    listingTitle: "AlUla Stargazing Dome",
    listingImage: "https://picsum.photos/seed/alula-dome/120/80",
    guestName: "Fatima Al-Zahrani",
    guestAvatar: "https://i.pravatar.cc/40?img=44",
    guestNationality: "🇸🇦 Saudi Arabia",
    checkIn: "2026-02-14",
    checkOut: "2026-02-17",
    nights: 3,
    adults: 2,
    children: 0,
    totalPrice: 2090,
    hostPayout: 1724,
    status: "completed",
    paymentMethod: "apple_pay",
    createdAt: "2026-02-01",
  },
  {
    id: "bk-004",
    reference: "BDN-18274509",
    listingId: "asir-highland-cabin",
    listingTitle: "Asir Highland Cabin",
    listingImage: "https://picsum.photos/seed/asir-cabin/120/80",
    guestName: "Khalid Al-Otaibi",
    guestAvatar: "https://i.pravatar.cc/40?img=67",
    guestNationality: "🇸🇦 Saudi Arabia",
    checkIn: "2026-01-25",
    checkOut: "2026-01-27",
    nights: 2,
    adults: 2,
    children: 1,
    totalPrice: 1008,
    hostPayout: 832,
    status: "completed",
    paymentMethod: "card",
    createdAt: "2026-01-10",
  },
  {
    id: "bk-005",
    reference: "BDN-07182634",
    listingId: "alula-stargazing-dome",
    listingTitle: "AlUla Stargazing Dome",
    listingImage: "https://picsum.photos/seed/alula-dome/120/80",
    guestName: "Nora Al-Saud",
    guestAvatar: "https://i.pravatar.cc/40?img=25",
    guestNationality: "🇦🇪 UAE",
    checkIn: "2026-01-10",
    checkOut: "2026-01-14",
    nights: 4,
    adults: 2,
    children: 0,
    totalPrice: 2787,
    hostPayout: 2298,
    status: "completed",
    paymentMethod: "card",
    createdAt: "2025-12-28",
  },
];

export const MOCK_EARNINGS_HISTORY: EarningsMonth[] = [
  { month: "Oct", year: 2025, gross: 4340,  payout: 3580,  bookings: 7  },
  { month: "Nov", year: 2025, gross: 5620,  payout: 4640,  bookings: 9  },
  { month: "Dec", year: 2025, gross: 7480,  payout: 6170,  bookings: 12 },
  { month: "Jan", year: 2026, gross: 6210,  payout: 5130,  bookings: 10 },
  { month: "Feb", year: 2026, gross: 5830,  payout: 4820,  bookings: 9  },
  { month: "Mar", year: 2026, gross: 3180,  payout: 2630,  bookings: 5  },
];

export const MOCK_PAYOUTS: PayoutRecord[] = [
  { id: "p-001", date: "2026-03-01", amount: 4820, method: "Bank Transfer", status: "paid",       reference: "PAY-20260301" },
  { id: "p-002", date: "2026-02-01", amount: 5130, method: "Bank Transfer", status: "paid",       reference: "PAY-20260201" },
  { id: "p-003", date: "2026-01-01", amount: 6170, method: "Bank Transfer", status: "paid",       reference: "PAY-20260101" },
  { id: "p-004", date: "2026-04-01", amount: 2630, method: "Bank Transfer", status: "scheduled",  reference: "PAY-20260401" },
];

// ──────────────────────────────────────────────────────────────
// Derived KPIs
// ──────────────────────────────────────────────────────────────

export function getDashboardKPIs() {
  const totalEarnings = MOCK_EARNINGS_HISTORY.reduce((s, m) => s + m.payout, 0);
  const thisMonth = MOCK_EARNINGS_HISTORY[MOCK_EARNINGS_HISTORY.length - 1].payout;
  const lastMonth = MOCK_EARNINGS_HISTORY[MOCK_EARNINGS_HISTORY.length - 2].payout;
  const earningsDelta = lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : 0;

  const activeListings = MOCK_LISTINGS.filter((l) => l.status === "approved").length;
  const totalBookings  = MOCK_BOOKINGS.length;
  const upcomingCount  = MOCK_BOOKINGS.filter((b) => b.status === "upcoming").length;
  const avgRating      = MOCK_LISTINGS.filter((l) => l.avgRating > 0)
    .reduce((s, l, _, a) => s + l.avgRating / a.length, 0);

  return { totalEarnings, thisMonth, earningsDelta, activeListings, totalBookings, upcomingCount, avgRating };
}
