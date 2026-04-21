import { createClient } from "@/lib/supabase-server";
import {
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

    if (error || !data) return [];
    if (data.length === 0) return [];

    // Build a slug map for approved submissions by querying the listings table.
    // listing_submissions.listing_id is set by approveSubmission() and is the FK
    // to listings.id. We need the slug to construct the correct /listing/{slug} URL.
    const approvedListingIds = data
      .filter((row) => row.status === "approved" && row.listing_id)
      .map((row) => row.listing_id as string);

    const slugMap: Record<string, string> = {};
    if (approvedListingIds.length > 0) {
      const { data: listings } = await supabase
        .from("listings")
        .select("id, slug")
        .in("id", approvedListingIds);
      (listings ?? []).forEach((l) => { slugMap[l.id] = l.slug; });
    }

    return data
      .filter((row) => {
        // If a submission is marked approved but listing_id is NULL, the live listing
        // was deleted after approval (ON DELETE SET NULL). Exclude it — there is no
        // live listing to show, and displaying it as "Approved" would be misleading.
        if (row.status === "approved" && !row.listing_id) return false;
        return true;
      })
      .map((row): DashboardListing => ({
        id:               row.id,
        listingSlug:      row.listing_id ? slugMap[row.listing_id as string] : undefined,
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
        totalBookings:    0,
        totalEarned:      0,
        avgRating:        0,
        reviewCount:      0,
      }));
  } catch {
    return [];
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

    if (error || !data) return [];
    if (data.length === 0) return [];

    return data.map((row): DashboardBooking => ({
      id:               row.id,
      reference:        row.reference,
      listingId:        row.listing_slug,
      listingTitle:     row.listing_title,
      listingImage:     row.image,
      guestName:        row.guest_name,
      guestAvatar:      "",   // no fake avatar; BookingsSection renders initials
      guestNationality: row.guest_nationality ?? "",
      checkIn:          row.check_in,
      checkOut:         row.check_out,
      nights:           row.nights,
      adults:           row.adults,
      children:         row.children,
      totalPrice:       row.total_price,
      // Platform fee: 8% of the host's listed subtotal (before guest service fee).
      // Host receives 92% of subtotal. Guest pays an additional 12% service fee
      // on top, which goes entirely to the platform — so total_price is NOT used here.
      hostPayout:       Math.round((row.subtotal ?? row.total_price) * 0.92),
      status:           deriveBookingStatus(row.status, row.check_in, row.check_out),
      paymentMethod:    row.payment_method as DashboardBooking["paymentMethod"],
      createdAt:        row.created_at?.slice(0, 10) ?? "",
    }));
  } catch {
    return [];
  }
}
