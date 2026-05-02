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
      .is("removed_at", null)
      .order("submitted_at", { ascending: false, nullsFirst: false });

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

    // ── Booking stats per listing (single batch query) ────────────────────────
    //
    // Fetches all non-cancelled bookings for every approved listing in one query,
    // then groups in JS. No N+1 — two extra queries total regardless of how many
    // listings the host has.
    //
    // totalBookings: all non-cancelled bookings received.
    // totalEarned:   SUM(hostPayout) for bookings whose checkout is in the past
    //                (i.e. stay is complete). hostPayout = subtotal * 0.92.

    type BookingStat = { totalBookings: number; totalEarned: number };
    const bookingStatsMap: Record<string, BookingStat> = {};

    const slugList = Object.values(slugMap);
    if (slugList.length > 0) {
      const todayIso = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

      const { data: bkRows } = await supabase
        .from("bookings")
        .select("listing_slug, total_price, subtotal, status, check_out")
        .eq("host_id", hostId)
        .in("listing_slug", slugList)
        .neq("status", "cancelled");

      (bkRows ?? []).forEach((row) => {
        const slug = row.listing_slug as string;
        if (!bookingStatsMap[slug]) {
          bookingStatsMap[slug] = { totalBookings: 0, totalEarned: 0 };
        }
        bookingStatsMap[slug].totalBookings += 1;
        // A booking is "completed" once checkout has passed
        if ((row.check_out as string) < todayIso) {
          const payout = Math.round(((row.subtotal ?? row.total_price) as number) * 0.92);
          bookingStatsMap[slug].totalEarned += payout;
        }
      });
    }

    // ── Review stats per listing UUID (single batch query) ────────────────────
    //
    // Fetches all reviews for the host's approved listings in one query,
    // then groups in JS to compute avg rating and review count per listing.

    type ReviewStat = { avgRating: number; reviewCount: number };
    const reviewStatsMap: Record<string, ReviewStat> = {};

    if (approvedListingIds.length > 0) {
      const { data: rvRows } = await supabase
        .from("reviews")
        .select("listing_id, rating")
        .in("listing_id", approvedListingIds);

      const ratingGroups: Record<string, number[]> = {};
      (rvRows ?? []).forEach((row) => {
        const lid = row.listing_id as string;
        if (!ratingGroups[lid]) ratingGroups[lid] = [];
        ratingGroups[lid].push(row.rating as number);
      });

      Object.entries(ratingGroups).forEach(([lid, ratings]) => {
        const avg = ratings.reduce((s, r) => s + r, 0) / ratings.length;
        reviewStatsMap[lid] = {
          avgRating:   Math.round(avg * 10) / 10,
          reviewCount: ratings.length,
        };
      });
    }

    // ── Cancellation requests per submission (single batch query) ─────────────
    //
    // Fetches the most-recent cancellation request per submission so the host
    // card can show a "Cancellation requested" badge or rejection feedback.

    type CancelReqInfo = {
      requestId: string;
      status: "pending" | "approved" | "rejected";
      adminNote?: string;
    };
    const cancelReqMap: Record<string, CancelReqInfo> = {};

    const allSubmissionIds = data.map((row) => row.id as string);
    if (allSubmissionIds.length > 0) {
      const { data: crRows } = await supabase
        .from("listing_cancellation_requests")
        .select("id, listing_submission_id, status, admin_note")
        .in("listing_submission_id", allSubmissionIds)
        .order("created_at", { ascending: false });

      // Keep only the most-recent request per submission
      (crRows ?? []).forEach((row) => {
        const sid = row.listing_submission_id as string;
        if (!cancelReqMap[sid]) {
          cancelReqMap[sid] = {
            requestId: row.id as string,
            status:    row.status as CancelReqInfo["status"],
            adminNote: row.admin_note ?? undefined,
          };
        }
      });
    }

    return data
      .filter((row) => {
        // If a submission is marked approved but listing_id is NULL, the live listing
        // was deleted after approval (ON DELETE SET NULL). Exclude it — there is no
        // live listing to show, and displaying it as "Approved" would be misleading.
        if (row.status === "approved" && !row.listing_id) return false;
        return true;
      })
      .map((row): DashboardListing => {
        const slug    = row.listing_id ? slugMap[row.listing_id as string] : undefined;
        const bkStats = slug
          ? (bookingStatsMap[slug] ?? { totalBookings: 0, totalEarned: 0 })
          : { totalBookings: 0, totalEarned: 0 };
        const rvStats = row.listing_id
          ? (reviewStatsMap[row.listing_id as string] ?? { avgRating: 0, reviewCount: 0 })
          : { avgRating: 0, reviewCount: 0 };
        const crInfo  = cancelReqMap[row.id as string];

        return {
          id:               row.id,
          listingSlug:      slug,
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
          rejectedStep:     row.rejected_step    ?? undefined,
          // Merge new array column + legacy single column for backward compat
          rejectedSteps:    (row.rejected_steps as string[] | null)?.length
                              ? (row.rejected_steps as string[])
                              : row.rejected_step
                                ? [row.rejected_step as string]
                                : undefined,
          totalBookings:    bkStats.totalBookings,
          totalEarned:      bkStats.totalEarned,
          avgRating:        rvStats.avgRating,
          reviewCount:      rvStats.reviewCount,
          cancellationRequestId:         crInfo?.requestId,
          cancellationRequestStatus:     crInfo?.status,
          cancellationRequestAdminNote:  crInfo?.adminNote,
        };
      });
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
      cancellationType:   row.cancellation_type   ?? undefined,
      cancellationReason: row.cancellation_reason ?? undefined,
      cancelledAt:        row.cancelled_at        ?? undefined,
    }));
  } catch {
    return [];
  }
}
