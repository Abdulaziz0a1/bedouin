/* ─────────────────────────────────────────────────────────────────────────────
   Bedouin – Admin types
   Prepared for Firebase/Firestore integration:
     - AdminListing   → listings/{id} document (with review metadata)
     - AdminDecision  → listings/{id}/decisions sub-collection (audit trail)
     - AdminSession   → admins/{uid} (role-based access in production)
───────────────────────────────────────────────────────────────────────────── */

export type AdminListingStatus = "pending_review" | "approved" | "rejected";

export interface AdminHost {
  id: string;
  name: string;
  avatar:    string | null;
  email:     string | null;   // not exposed from profiles; shown as "—"
  phone:     string | null;
  joinedAt:  string | null;   // ISO date from profiles.created_at
  totalListings: number;
  approvedListings: number;
  responseRate: number | null; // 0–100, or null when not yet computable
  superhost: boolean;
}

export interface AdminListing {
  /* Identity */
  id: string;               // Firestore document ID
  listingRef: string;       // human-readable "BDN-LST-XXXXXX"

  /* Core content (mirrors ListingDraft) */
  title: string;
  category: string;
  region: string;
  location: string;
  description: string;
  highlights: string[];
  amenities: string[];      // display labels
  houseRules: string[];
  imageUrls: string[];      // Firebase Storage URLs (or picsum for mock)

  /* Capacity */
  maxGuests: number;
  bedrooms: number;
  beds: number;
  baths: number;
  minNights: number;
  checkInTime: string;
  checkOutTime: string;

  /* Pricing */
  price: number;
  originalPrice: number;    // 0 = no discount
  priceUnit: string;

  /* Review lifecycle */
  status: AdminListingStatus;
  submittedAt: string;      // ISO
  reviewedAt?: string;      // ISO — set after approve/reject
  reviewedBy?: string;      // admin display name
  rejectionReason?: string;
  adminNotes?: string;      // internal notes not shown to host

  /* Relationships */
  host: AdminHost;
}

/** Audit trail entry for each moderation decision */
export interface AdminDecision {
  id: string;
  listingId: string;
  decision: "approved" | "rejected" | "changes_requested";
  adminId: string;
  adminName: string;
  reason?: string;
  notes?: string;
  decidedAt: string;  // ISO
}

/** Moderation queue statistics */
export interface QueueStats {
  pendingCount: number;
  approvedToday: number;
  rejectedToday: number;
  avgReviewHours: number;
}
