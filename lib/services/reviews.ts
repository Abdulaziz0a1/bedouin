import { createClient } from "@/lib/supabase-server";
import type { Review } from "@/lib/data/listing-details";

export interface ListingReviewsResult {
  reviews: Review[];
  avg:     number | null;
  count:   number;
}

/**
 * Fetch all approved reviews for a listing (identified by slug).
 * Returns mapped Review[] compatible with ReviewsSection, or empty on failure.
 */
export async function getListingReviews(slug: string): Promise<ListingReviewsResult> {
  const empty = { reviews: [], avg: null, count: 0 };
  try {
    const supabase = await createClient();

    // Resolve slug → UUID (reviews FK is on the UUID PK)
    const { data: listing } = await supabase
      .from("listings")
      .select("id")
      .eq("slug", slug)
      .single();

    if (!listing) return empty;

    const { data: rows, error } = await supabase
      .from("reviews")
      .select("id, rating, comment, created_at, user_id")
      .eq("listing_id", listing.id)
      .order("created_at", { ascending: false });

    if (error || !rows || rows.length === 0) return empty;

    // Batch-fetch reviewer profiles
    const userIds = [...new Set(rows.map((r) => r.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, avatar_url")
      .in("id", userIds);

    const pMap: Record<string, { first_name: string | null; last_name: string | null; avatar_url: string | null }> =
      Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));

    const reviews: Review[] = rows.map((row) => {
      const p = pMap[row.user_id];
      const name = p
        ? `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || "Guest"
        : "Guest";
      return {
        id:       row.id,
        reviewer: name,
        avatar:   p?.avatar_url ?? "",
        date:     new Date(row.created_at).toLocaleDateString("en-US", {
          month: "long",
          year:  "numeric",
        }),
        rating:   row.rating,
        comment:  row.comment,
        country:  "",
      };
    });

    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

    return { reviews, avg, count: reviews.length };
  } catch {
    return empty;
  }
}

/**
 * Returns the set of booking IDs the user has already reviewed.
 * Used to show "✓ Reviewed" instead of "Leave a review" on past bookings.
 */
export async function getReviewedBookingIds(userId: string): Promise<string[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("reviews")
      .select("booking_id")
      .eq("user_id", userId);
    return (data ?? []).map((r) => r.booking_id);
  } catch {
    return [];
  }
}
