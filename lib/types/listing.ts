import type { SubmittedListing } from "@/lib/types/host";

/**
 * Clean, fully-serializable payload sent from the client for both new
 * submissions and edits.  All fields required — no optionals, no undefined,
 * no blob: URLs.  imagePreviewUrls must contain only final HTTPS storage URLs
 * by the time this payload reaches the server.
 */
export interface ListingPayload {
  category:         string;
  title:            string;
  title_ar?:        string;
  description:      string;
  description_ar?:  string;
  highlights:       string[];
  region:           string;
  location:         string;
  location_ar?:     string;
  mapsUrl:          string;
  maxGuests:        number;
  bedrooms:         number;
  beds:             number;
  baths:            number;
  minNights:        number;
  checkInTime:      string;
  checkOutTime:     string;
  amenities:        string[];
  price:            number;
  originalPrice:    number;
  priceUnit:        string;
  imagePreviewUrls: string[];
  houseRules:       string[];
}

export type SubmitListingResult =
  | { success: true;  listing: SubmittedListing }
  | { success: false; error: string };

export type UpdateListingResult =
  | { success: true }
  | { success: false; error: string };
