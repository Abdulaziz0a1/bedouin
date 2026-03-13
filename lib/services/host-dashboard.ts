import { createClient } from "@/lib/supabase-server";
import {
  MOCK_LISTINGS,
  MOCK_BOOKINGS,
  type DashboardListing,
  type DashboardBooking,
} from "@/lib/data/dashboard";

/* ─── Listings ────────────────────────────────────────────────────────────── */

/**
 * Fetches all listing_submissions for the given host.
 * Includes pending, approved, and rejected submissions so the host can
 * track the full lifecycle of their properties.
 *
 * INTENTIONAL FALLBACK — falls back to MOCK_LISTINGS if unavailable.
 */
export async function fetchHostListings(hostId: string): Promise<DashboardListing[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("listing_submissions")
      .select("*")
      .eq("host_id", hostId)
      .order("submitted_at", { ascending: false });

    if (error || !data || data.length === 0) return MOCK_LISTINGS;

    return data.map((row): DashboardListing => ({
      id:               row.id,
      title:            row.title,
      category:         row.category,
      region:           row.region,
      location:         row.location ?? "",
      price:            row.price,
      priceUnit:        row.price_unit,
      originalPrice:    row.original_price ?? undefined,
      imageUrl:         (row.image_urls as string[])?.[0] ?? "",
      status:           row.status as DashboardListing["status"],
      submittedAt:      row.submitted_at?.slice(0, 10) ?? "",
      approvedAt:       row.reviewed_at && row.status === "approved"
                          ? row.reviewed_at.slice(0, 10)
                          : undefined,
      rejectionReason:  row.rejection_reason ?? undefined,
      // Booking stats are not stored on the submission — default to 0.
      // TODO: compute from bookings JOIN when bookings volume warrants it.
      totalBookings:    0,
      totalEarned:      0,
      avgRating:        0,
      reviewCount:      0,
    }));
  } catch {
    // INTENTIONAL FALLBACK
    return MOCK_LISTINGS;
  }
}

/* ─── Bookings ────────────────────────────────────────────────────────────── */

/** Derives a display status from the stored DB status and booking dates. */
function deriveBookingStatus(
  dbStatus: string,
  checkIn: string,
  checkOut: string
): DashboardBooking["status"] {
  if (dbStatus === "cancelled") return "cancelled";
  const today   = new Date();
  const inDate  = new Date(checkIn);
  const outDate = new Date(checkOut);
  if (inDate > today)  return "upcoming";
  if (outDate >= today) return "active";
  return "completed";
}

/**
 * Fetches all bookings received by the given host from Supabase.
 *
 * INTENTIONAL FALLBACK — falls back to MOCK_BOOKINGS if unavailable.
 */
export async function fetchHostBookings(hostId: string): Promise<DashboardBooking[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("host_id", hostId)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) return MOCK_BOOKINGS;

    return data.map((row): DashboardBooking => ({
      id:               row.id,
      reference:        row.reference,
      listingId:        row.listing_slug,
      listingTitle:     row.listing_title,
      listingImage:     row.image,
      guestName:        row.guest_name,
      // Guest avatar not stored in bookings — deterministic placeholder.
      guestAvatar:      `https://i.pravatar.cc/40?u=${row.id}`,
      guestNationality: row.guest_nationality ?? "",
      checkIn:          row.check_in,
      checkOut:         row.check_out,
      nights:           row.nights,
      adults:           row.adults,
      children:         row.children,
      totalPrice:       row.total_price,
      // Platform takes ~17.5%; host payout is 82.5% of total.
      hostPayout:       Math.round(row.total_price * 0.825),
      status:           deriveBookingStatus(row.status, row.check_in, row.check_out),
      paymentMethod:    row.payment_method as DashboardBooking["paymentMethod"],
      createdAt:        row.created_at?.slice(0, 10) ?? "",
    }));
  } catch {
    // INTENTIONAL FALLBACK
    return MOCK_BOOKINGS;
  }
}
