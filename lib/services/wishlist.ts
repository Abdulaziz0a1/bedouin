import { createClient } from "@/lib/supabase-server";
import type { SavedListing } from "@/lib/types/user";

/**
 * Returns all saved listings for a user, joined with live listing data.
 * Rows where the listing has since been deleted are silently skipped.
 */
export async function fetchUserWishlist(userId: string): Promise<SavedListing[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("wishlists")
    .select(`
      id,
      listing_id,
      created_at,
      listings (
        title,
        location,
        region,
        category,
        price,
        original_price,
        price_unit,
        image,
        score,
        review_count,
        tags
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[wishlist] fetchUserWishlist error:", error.message);
    return [];
  }

  return (data ?? [])
    .filter((row) => row.listings !== null)
    .map((row) => {
      const l = row.listings as unknown as Record<string, unknown>;
      return {
        id:           row.id,
        listingId:    row.listing_id,
        title:        (l.title as string)    ?? "",
        location:     (l.location as string) ?? "",
        region:       (l.region as string)   ?? "",
        category:     (l.category as string) ?? "",
        price:        Number(l.price)        || 0,
        originalPrice: l.original_price ? Number(l.original_price) : undefined,
        priceUnit:    (l.price_unit as string) ?? "per night",
        imageUrl:     (l.image as string) || "https://picsum.photos/seed/bedouin-placeholder/600/400",
        score:        Number(l.score)        || 0,
        reviewCount:  Number(l.review_count) || 0,
        savedAt:      row.created_at,
        tags:         (l.tags as string[])   ?? [],
      } satisfies SavedListing;
    });
}

/**
 * Returns the set of listing slugs the user has saved.
 * Efficient O(1) lookup: use .has(slug) to check per-listing saved state.
 */
export async function fetchWishlistSlugs(userId: string): Promise<Set<string>> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("wishlists")
    .select("listing_id")
    .eq("user_id", userId);

  return new Set((data ?? []).map((r) => r.listing_id as string));
}
