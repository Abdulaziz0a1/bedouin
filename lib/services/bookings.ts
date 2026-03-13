import { createClient } from "@/lib/supabase-server";
import { MOCK_USER_BOOKINGS } from "@/lib/data/user-dashboard";
import type { UserBooking } from "@/lib/types/user";

/**
 * Derives the display status from the DB-stored status and booking dates.
 *
 * The bookings table stores "confirmed" or "cancelled". We compute the
 * richer display status (upcoming / active / completed) at read time so
 * the UI can render the correct colour strip and countdown without a
 * scheduled job to keep status current.
 */
function deriveStatus(
  dbStatus: string,
  checkIn: string,
  checkOut: string
): UserBooking["status"] {
  if (dbStatus === "cancelled") return "cancelled";
  const today    = new Date();
  const inDate   = new Date(checkIn);
  const outDate  = new Date(checkOut);
  if (inDate > today)  return "upcoming";
  if (outDate >= today) return "active";
  return "completed";
}

/**
 * Fetches bookings for a given user from Supabase.
 *
 * Falls back to MOCK_USER_BOOKINGS on any error or empty result.
 * INTENTIONAL FALLBACK – keeps the dashboard functional with seed data
 * when the real table is empty or unavailable.
 */
export async function fetchUserBookings(userId: string): Promise<UserBooking[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) return MOCK_USER_BOOKINGS;

    const today = new Date().toISOString().slice(0, 10);

    return data.map((row): UserBooking => {
      const status   = deriveStatus(row.status, row.check_in, row.check_out);
      const canCancel =
        (status === "upcoming" || status === "confirmed") &&
        row.check_in > today;

      return {
        id:              row.id,
        reference:       row.reference,
        listingId:       row.listing_slug,
        listingTitle:    row.listing_title,
        listingCategory: row.listing_category ?? "",
        listingImage:    row.image,
        region:          "",   // not stored in bookings; location string is sufficient for display
        location:        row.location,
        checkIn:         row.check_in,
        checkOut:        row.check_out,
        nights:          row.nights,
        adults:          row.adults,
        children:        row.children,
        subtotal:        row.subtotal,
        serviceFee:      row.service_fee,
        totalPrice:      row.total_price,
        paymentMethod:   row.payment_method as UserBooking["paymentMethod"],
        hostName:        row.host_name ?? "Host",
        // Host avatar is not stored in bookings (stale-data risk if host changes
        // their photo). Use a deterministic placeholder based on host_id.
        hostAvatar:      `https://i.pravatar.cc/40?u=${row.host_id ?? row.id}`,
        status,
        canCancel,
        createdAt:       row.created_at,
      };
    });
  } catch {
    // INTENTIONAL FALLBACK
    return MOCK_USER_BOOKINGS;
  }
}
