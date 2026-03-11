"use server";

import { createClient } from "@/lib/supabase-server";

/* ─── Input / result types ───────────────────────────────────────────────── */

export interface CreateBookingInput {
  listingSlug:      string;
  listingTitle:     string;
  location:         string;
  image:            string;
  checkIn:          string;   // YYYY-MM-DD
  checkOut:         string;   // YYYY-MM-DD
  nights:           number;
  adults:           number;
  children:         number;
  subtotal:         number;
  serviceFee:       number;
  totalPrice:       number;
  guestName:        string;
  guestEmail:       string;
  guestPhone:       string;
  guestNationality: string;
  specialRequests:  string;
  paymentMethod:    string;
}

export type CreateBookingResult =
  | { success: true;  reference: string }
  | { success: false; error: string };

/* ─── Server Action ──────────────────────────────────────────────────────── */

export async function createBooking(
  input: CreateBookingInput
): Promise<CreateBookingResult> {
  try {
    const supabase = await createClient();

    // Verify the session server-side — never trust client-supplied user IDs.
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "You must be signed in to complete a booking.",
      };
    }

    // Generate UUID + human-readable reference entirely on the server.
    // Reference format: BDN-XXXXXXXX (first 8 hex chars of the UUID).
    const id        = crypto.randomUUID();
    const reference = `BDN-${id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;

    const { error } = await supabase.from("bookings").insert({
      id,
      reference,
      user_id:          user.id,
      listing_slug:     input.listingSlug,
      listing_title:    input.listingTitle,
      location:         input.location,
      image:            input.image,
      check_in:         input.checkIn,
      check_out:        input.checkOut,
      nights:           input.nights,
      adults:           input.adults,
      children:         input.children,
      subtotal:         input.subtotal,
      service_fee:      input.serviceFee,
      total_price:      input.totalPrice,
      guest_name:       input.guestName,
      guest_email:      input.guestEmail,
      guest_phone:      input.guestPhone       || null,
      guest_nationality: input.guestNationality || null,
      special_requests: input.specialRequests  || null,
      payment_method:   input.paymentMethod,
      status:           "confirmed",
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, reference };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    return { success: false, error: message };
  }
}
