/* ─────────────────────────────────────────────────────────────────────────────
   Bedouin – Host / Add Listing types
   Prepared for Firebase integration:
     - ListingDraft → firestore: listings/{draftId}
     - imageFiles   → firebase storage: listings/{draftId}/images/{fileName}
     - status field drives Admin Approval workflow
───────────────────────────────────────────────────────────────────────────── */

export type DraftCategory =
  | "farms" | "house" | "guesthouse" | "cabins" | "glamping" | "doms" | "";

export type DraftRegion =
  | "AlUla" | "Abha" | "Taif" | "AlBaha" | "AlAhsa"
  | "Tabuk" | "Riyadh" | "Jeddah" | "Hail" | "Madinah" | "";

/** Lifecycle:  draft → pending_review → approved | rejected */
export type DraftStatus = "draft" | "pending_review" | "approved" | "rejected";

export interface ListingDraft {
  /* Step 1 – Property type */
  category: DraftCategory;

  /* Step 2 – About your listing */
  title: string;
  description: string;
  highlights: string[];     // up to 5 short bullet points

  /* Step 3 – Location & capacity */
  region: DraftRegion;
  location: string;         // specific area / neighbourhood
  mapsUrl: string;          // Google Maps / GPS link (required)
  maxGuests: number;
  bedrooms: number;
  beds: number;
  baths: number;
  minNights: number;
  checkInTime: string;
  checkOutTime: string;

  /* Step 4 – Amenities */
  amenities: string[];      // amenity IDs from lib/data/amenities.ts

  /* Step 5 – Pricing */
  price: number;
  originalPrice: number;    // 0 = no discount shown
  priceUnit: string;

  /* Step 6 – Photos, rules & review */
  imagePreviewUrls: string[]; // local blob URLs → replace with Storage URLs on upload
  houseRules: string[];

  /* Meta – maps directly to Firestore document fields */
  status: DraftStatus;
  hostId?: string;          // Firebase auth UID – set on submission
  submittedAt?: string;     // ISO string
  listingRef?: string;      // Firestore document ID – set after creation
}

export const INITIAL_DRAFT: ListingDraft = {
  category:         "",
  title:            "",
  description:      "",
  highlights:       [],
  region:           "",
  location:         "",
  mapsUrl:          "",
  maxGuests:        2,
  bedrooms:         1,
  beds:             1,
  baths:            1,
  minNights:        1,
  checkInTime:      "3:00 PM",
  checkOutTime:     "11:00 AM",
  amenities:        [],
  price:            0,
  originalPrice:    0,
  priceUnit:        "per person",
  imagePreviewUrls: [],
  houseRules:       [],
  status:           "draft",
};

/** Submitted listing confirmation (returned after Firestore write) */
export interface SubmittedListing {
  listingRef: string;       // Firestore doc ID or generated ID
  title: string;
  category: DraftCategory;
  region: DraftRegion;
  price: number;
  imageUrl: string;
  submittedAt: string;
}
