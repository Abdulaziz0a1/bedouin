/* ─────────────────────────────────────────────────────────────────────────────
   Bedouin – Booking Flow types
   Prepared for Firebase/backend integration:
     - GuestDetails  → bookings/{id}/guest
     - CardDetails   → handled server-side / payment provider
     - BookingConfirmation → bookings/{id} document
───────────────────────────────────────────────────────────────────────────── */

export interface GuestDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationality: string;
  requests: string;
  agreedToRules: boolean;
}

export interface CardDetails {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
}

export type PaymentMethod = "card" | "mada" | "apple_pay";

export type BookingStep = 1 | 2 | 3 | "confirmed";

/** Shape of a completed booking – maps directly to a Firestore document */
export interface BookingConfirmation {
  reference: string;         // e.g. "BDN-A1B2C3D4"
  listingId: string;
  listingTitle: string;
  location: string;
  image: string;
  checkIn: string;           // human-readable, e.g. "Mar 10, 2026"
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  subtotal: number;
  serviceFee: number;
  totalPrice: number;
  guestName: string;
  guestEmail: string;
  paymentMethod: PaymentMethod;
  createdAt: string;         // ISO string – set to new Date().toISOString()
}

/** Intermediate state flowing through all booking steps */
export interface BookingFormState {
  checkIn: Date | null;
  checkOut: Date | null;
  adults: number;
  children: number;
  guestDetails: GuestDetails;
  paymentMethod: PaymentMethod;
  cardDetails: CardDetails;
}
