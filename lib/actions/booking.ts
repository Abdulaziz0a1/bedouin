"use server";

import { createClient } from "@/lib/supabase-server";

/* ─── Input / result types ───────────────────────────────────────────────── */

export interface CreateBookingInput {
  listingSlug:      string;
  listingCategory:  string;   // display-only; passed from listing.category client-side
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

/* ─── Host resolution ────────────────────────────────────────────────────── */

/**
 * Resolves the host_id and host_name for a given listing slug.
 *
 * Strategy:
 *   1. Look up the listing row by slug to find its host_id (set when a
 *      submission is approved and promoted to a live listing).
 *   2. If host_id exists, query profiles for the display name.
 *
 * Returns null for both fields if the listing was manually seeded and
 * has no host_id — accepted MVP limitation, documented intentionally.
 */
async function resolveHostForListing(
  supabase: Awaited<ReturnType<typeof createClient>>,
  slug: string
): Promise<{ hostId: string | null; hostName: string | null }> {
  const { data: listing } = await supabase
    .from("listings")
    .select("host_id")
    .eq("slug", slug)
    .single();

  const hostId = listing?.host_id ?? null;
  if (!hostId) return { hostId: null, hostName: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", hostId)
    .single();

  const hostName = profile
    ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || null
    : null;

  return { hostId, hostName };
}

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

    // Resolve host identity server-side from the listings table.
    // host_id and host_name will be null for manually seeded listings.
    const { hostId, hostName } = await resolveHostForListing(
      supabase,
      input.listingSlug
    );

    // Generate UUID + human-readable reference entirely on the server.
    // Format: BDN-XXXXXXXX (first 8 hex chars of the UUID, uppercased).
    const id        = crypto.randomUUID();
    const reference = `BDN-${id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;

    const { error } = await supabase.from("bookings").insert({
      id,
      reference,
      user_id:           user.id,
      listing_slug:      input.listingSlug,
      listing_category:  input.listingCategory,
      listing_title:     input.listingTitle,
      location:          input.location,
      image:             input.image,
      check_in:          input.checkIn,
      check_out:         input.checkOut,
      nights:            input.nights,
      adults:            input.adults,
      children:          input.children,
      subtotal:          input.subtotal,
      service_fee:       input.serviceFee,
      total_price:       input.totalPrice,
      guest_name:        input.guestName,
      guest_email:       input.guestEmail,
      guest_phone:       input.guestPhone       || null,
      guest_nationality: input.guestNationality || null,
      special_requests:  input.specialRequests  || null,
      payment_method:    input.paymentMethod,
      host_id:           hostId,
      host_name:         hostName,
      status:            "confirmed",
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

/* ─── Cancel Booking ─────────────────────────────────────────────────────── */

export type CancelBookingResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Cancels a guest's own booking.
 *
 * Rules enforced server-side:
 *   1. The caller must be authenticated.
 *   2. The booking must belong to the caller (user_id = auth.uid()).
 *   3. The booking must be in "confirmed" status (i.e. not already cancelled).
 *   4. check_in must be in the future — past/active stays cannot be cancelled here.
 */
export async function cancelBooking(
  bookingId: string
): Promise<CancelBookingResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "You must be signed in to cancel a booking." };
    }

    // Fetch the booking to verify ownership and eligibility.
    const { data: booking, error: fetchErr } = await supabase
      .from("bookings")
      .select("id, user_id, status, check_in")
      .eq("id", bookingId)
      .single();

    if (fetchErr || !booking) {
      return { success: false, error: "Booking not found." };
    }

    if (booking.user_id !== user.id) {
      return { success: false, error: "You do not have permission to cancel this booking." };
    }

    if (booking.status === "cancelled") {
      return { success: false, error: "This booking is already cancelled." };
    }

    const today = new Date().toISOString().slice(0, 10);
    if (booking.check_in <= today) {
      return {
        success: false,
        error: "Check-in is today or has already passed — cancellations are no longer accepted.",
      };
    }

    const { error: updateErr } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId)
      .eq("user_id", user.id); // double-check at DB layer

    if (updateErr) {
      return { success: false, error: updateErr.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred.";
    return { success: false, error: message };
  }
}
