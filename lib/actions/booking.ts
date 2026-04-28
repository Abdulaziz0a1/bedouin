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

/**
 * Creates a booking using the create_booking_safe() Postgres RPC.
 *
 * The RPC runs inside a single transaction and:
 *   1. Verifies auth.uid() == p_user_id (security)
 *   2. Validates check-in/out dates are not in the past
 *   3. Acquires a row-level lock on the listings row (FOR UPDATE) to prevent
 *      concurrent double-booking race conditions
 *   4. Sums confirmed guests for overlapping date ranges
 *   5. Rejects if remaining capacity < requested guests
 *   6. Inserts the confirmed booking
 *
 * Capacity is enforced atomically at the database level — client-side checks
 * alone are not trusted.
 */
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
    const { hostId, hostName } = await resolveHostForListing(
      supabase,
      input.listingSlug
    );

    // Generate UUID + human-readable reference entirely on the server.
    const id        = crypto.randomUUID();
    const reference = `BDN-${id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;

    // Call the atomic RPC. It handles the capacity check, row-lock, and insert
    // in one Postgres transaction — race-condition-safe.
    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      "create_booking_safe",
      {
        p_id:               id,
        p_reference:        reference,
        p_user_id:          user.id,
        p_listing_slug:     input.listingSlug,
        p_listing_category: input.listingCategory,
        p_listing_title:    input.listingTitle,
        p_location:         input.location,
        p_image:            input.image,
        p_check_in:         input.checkIn,
        p_check_out:        input.checkOut,
        p_nights:           input.nights,
        p_adults:           input.adults,
        p_children:         input.children,
        p_subtotal:         input.subtotal,
        p_service_fee:      input.serviceFee,
        p_total_price:      input.totalPrice,
        p_guest_name:       input.guestName,
        p_guest_email:      input.guestEmail,
        p_guest_phone:      input.guestPhone       || null,
        p_guest_nationality: input.guestNationality || null,
        p_special_requests: input.specialRequests  || null,
        p_payment_method:   input.paymentMethod,
        p_host_id:          hostId,
        p_host_name:        hostName,
      }
    );

    if (rpcError) {
      return { success: false, error: rpcError.message };
    }

    const result = rpcResult as { success: boolean; error?: string; remaining?: number };

    if (!result.success) {
      return { success: false, error: result.error ?? "Booking could not be completed." };
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
 *
 * @param reason  Optional cancellation reason supplied by the guest.
 */
export async function cancelBooking(
  bookingId: string,
  reason?: string,
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
      .update({
        status:              "cancelled",
        cancellation_type:   "by_tourist",
        cancellation_reason: reason?.trim() || null,
        cancelled_at:        new Date().toISOString(),
        cancelled_by:        user.id,
      })
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
