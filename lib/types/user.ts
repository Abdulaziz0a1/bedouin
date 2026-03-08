/* ─────────────────────────────────────────────────────────────────────────────
   Bedouin – User / Guest types
   Prepared for Firebase/Firestore integration:
     - UserProfile   → users/{uid}
     - UserBooking   → bookings collection (query by userId)
     - SavedListing  → users/{uid}/saved sub-collection  OR  wishlist/{uid}
     - ActivityEvent → users/{uid}/activity sub-collection
───────────────────────────────────────────────────────────────────────────── */

export interface UserProfile {
  id: string;             // Firestore uid
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  nationality?: string;
  avatar?: string;
  joinedAt: string;       // ISO date
  totalBookings: number;
  totalNights: number;
  totalSpent: number;
  savedCount: number;
}

/** A booking as seen by the guest (user-side view of a reservation) */
export interface UserBooking {
  id: string;
  reference: string;          // e.g. "BDN-48291734"
  listingId: string;
  listingTitle: string;
  listingCategory: string;
  listingImage: string;
  region: string;
  location: string;
  checkIn: string;            // ISO date
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  subtotal: number;
  serviceFee: number;
  totalPrice: number;
  paymentMethod: "card" | "mada" | "apple_pay";
  hostName: string;
  hostAvatar: string;
  status: "upcoming" | "confirmed" | "active" | "completed" | "cancelled";
  canCancel: boolean;
  createdAt: string;
}

/** A listing the user has saved / wishlisted */
export interface SavedListing {
  id: string;             // Firestore document id
  listingId: string;
  title: string;
  location: string;
  region: string;
  category: string;
  price: number;
  originalPrice?: number;
  priceUnit: string;
  imageUrl: string;
  score: number;
  reviewCount: number;
  savedAt: string;        // ISO date
  tags?: string[];
}

/** A single user activity event */
export type ActivityType =
  | "booking_created"
  | "booking_confirmed"
  | "booking_completed"
  | "booking_cancelled"
  | "listing_saved"
  | "listing_unsaved"
  | "review_submitted"
  | "profile_updated";

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  relatedId?: string;     // listingId or bookingId
  relatedImage?: string;
  timestamp: string;      // ISO
}
