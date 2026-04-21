import { createClient } from "@/lib/supabase-server";
import { ALL_LISTINGS, type Listing } from "@/lib/data/listings";
import { getRelatedListings } from "@/lib/data/listing-details";

/**
 * Fetches listings from the Supabase `listings` table.
 *
 * Fallback policy (intentional demo/development behavior):
 *   If the Supabase query fails OR returns zero rows, the app falls back to
 *   ALL_LISTINGS from lib/data/listings.ts. This keeps the UI functional
 *   during development before the Supabase table is seeded, and provides
 *   resilience against transient network errors in production.
 *   Remove the fallback once the table is consistently seeded in production.
 */
export async function fetchListings(): Promise<Listing[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .order("score", { ascending: false });

    if (error || !data || data.length === 0) {
      // INTENTIONAL FALLBACK: no Supabase data available — using mock data.
      return ALL_LISTINGS;
    }

    // Map snake_case DB columns → camelCase Listing interface
    // IMPORTANT: use slug as id — listing detail page routes on /listing/[slug]
    return data.map((row) => ({
      id:            row.slug,
      image:         row.image || `https://picsum.photos/seed/${row.slug}/600/440`,
      title:         row.title,
      location:      row.location,
      region:        row.region,
      category:      row.category,
      price:         Number(row.price),
      originalPrice: row.original_price ?? undefined,
      priceUnit:     row.price_unit ?? undefined,
      score:         Number(row.score),
      reviewCount:   Number(row.review_count),
      badge:         row.badge ?? undefined,
      badgeColor:    row.badge_color ?? undefined,
      tags:          row.tags ?? [],
    }));
  } catch {
    // INTENTIONAL FALLBACK: Supabase client threw unexpectedly — using mock data.
    return ALL_LISTINGS;
  }
}

/**
 * Fetches related listings from Supabase — same category or same region,
 * excluding the current listing's slug.
 *
 * Inputs are explicit so the caller owns the resolution of the current listing:
 *   - slug     : the current listing's public slug (used to exclude it)
 *   - category : the current listing's category (used for similarity filter)
 *   - region   : the current listing's region   (used for similarity filter)
 *   - limit    : max number of results to return
 *
 * Fallback policy (intentional demo/development behavior):
 *   If the Supabase query fails or returns no rows, the app silently falls
 *   back to the mock getRelatedListings() from lib/data/listing-details.ts.
 *   Remove the fallback once the listings table is consistently seeded.
 */
export async function fetchRelatedListings(
  slug: string,
  category: string,
  region: string,
  limit = 4
): Promise<Listing[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .or(`category.eq.${category},region.eq.${region}`)
      .neq("slug", slug)
      .limit(limit);

    if (error || !data || data.length === 0) {
      // INTENTIONAL FALLBACK: no related listings from Supabase — using mock data.
      return getRelatedListings(slug, limit);
    }

    // Map snake_case DB columns → camelCase Listing interface
    return data.map((row) => ({
      id:            row.slug ?? row.id,
      image:         row.image,
      title:         row.title,
      location:      row.location,
      region:        row.region,
      category:      row.category,
      price:         Number(row.price),
      originalPrice: row.original_price ?? undefined,
      priceUnit:     row.price_unit ?? undefined,
      score:         Number(row.score),
      reviewCount:   Number(row.review_count),
      badge:         row.badge ?? undefined,
      badgeColor:    row.badge_color ?? undefined,
      tags:          row.tags ?? [],
    }));
  } catch {
    // INTENTIONAL FALLBACK: Supabase client threw unexpectedly — using mock data.
    return getRelatedListings(slug, limit);
  }
}
