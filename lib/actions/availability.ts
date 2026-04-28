"use server";

import { createClient } from "@/lib/supabase-server";

export interface AvailabilityResult {
  available:    boolean;
  remaining:    number;
  maxGuests?:   number;
  bookedGuests?: number;
  unchecked?:   boolean;   // true for manually-seeded listings not in the DB
}

export type CheckAvailabilityResult =
  | { success: true;  data: AvailabilityResult }
  | { success: false; error: string };

/**
 * Checks remaining capacity for a listing on a specific date range.
 *
 * Calls the check_listing_availability() Postgres function, which:
 *   - Sums adults + children from confirmed, non-cancelled bookings with
 *     overlapping dates (check_in < p_check_out AND check_out > p_check_in)
 *   - Compares the sum against listings.max_guests
 *   - Returns remaining spots and availability flag
 *
 * Used by BookingCard to show live capacity feedback before the user books.
 * No locking — this is read-only and purely for display.
 */
export async function checkAvailability(
  listingSlug:     string,
  checkIn:         string,   // YYYY-MM-DD
  checkOut:        string,   // YYYY-MM-DD
  requestedGuests: number
): Promise<CheckAvailabilityResult> {
  try {
    if (!listingSlug || !checkIn || !checkOut || requestedGuests < 1) {
      return { success: false, error: "Invalid parameters." };
    }

    const supabase = await createClient();

    const { data, error } = await supabase.rpc("check_listing_availability", {
      p_slug:              listingSlug,
      p_check_in:          checkIn,
      p_check_out:         checkOut,
      p_requested_guests:  requestedGuests,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const row = data as {
      available:    boolean;
      remaining:    number;
      max_guests?:  number;
      booked_guests?: number;
      unchecked?:   boolean;
    };

    return {
      success: true,
      data: {
        available:    row.available,
        remaining:    row.remaining,
        maxGuests:    row.max_guests,
        bookedGuests: row.booked_guests,
        unchecked:    row.unchecked,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error.";
    return { success: false, error: message };
  }
}
