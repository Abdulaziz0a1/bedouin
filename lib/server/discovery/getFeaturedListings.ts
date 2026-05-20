import { createAdminClient } from "@/lib/supabase-admin";
import type { Listing } from "@/lib/data/listings";
import { computeListingScore } from "./getSeasonalListings";

/** Maps a Supabase listings row to the camelCase Listing interface. */
function mapRow(row: Record<string, unknown>): Listing {
  return {
    id:            row.slug as string,
    image:         (row.image as string) || "",
    title:         (row.title as string) ?? "",
    location:      (row.location as string) ?? "",
    region:        row.region as Listing["region"],
    category:      row.category as Listing["category"],
    price:         Number(row.price ?? 0),
    originalPrice: (row.original_price as number) ?? undefined,
    priceUnit:     (row.price_unit as string) ?? undefined,
    score:         Number(row.score ?? 0),
    reviewCount:   Number(row.review_count ?? 0),
    badge:         (row.badge as string) ?? undefined,
    badgeColor:    (row.badge_color as string) ?? undefined,
    tags:          (row.tags as string[]) ?? [],
  };
}

async function fetchAllApproved(): Promise<Listing[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("listings")
      .select("id, slug, title, location, region, category, price, original_price, price_unit, score, review_count, badge, badge_color, tags, image, created_at")
      .not("submission_id", "is", null)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) return [];
    return data.map(mapRow);
  } catch {
    return [];
  }
}

/**
 * Returns listings eligible for the "This Weekend in Rural Saudi" carousel.
 *
 * Priority:
 *   1. Discounted listings (original_price > price) — highest ranked first
 *   2. Top-rated non-discounted listings to fill up to maxCount
 *
 * Returns [] when no real approved listings exist.
 */
export async function getWeekendDeals(maxCount = 4): Promise<Listing[]> {
  const listings = await fetchAllApproved();
  if (listings.length === 0) return [];

  const sorted  = [...listings].sort((a, b) => computeListingScore(b) - computeListingScore(a));
  const deals   = sorted.filter((l) => l.originalPrice && l.originalPrice > l.price);
  const rest    = sorted.filter((l) => !l.originalPrice || l.originalPrice <= l.price);

  return [...deals, ...rest].slice(0, maxCount);
}

/**
 * Returns farm-category listings for the "Farms Guests Love" carousel.
 * Returns [] when no real approved farm listings exist.
 */
export async function getFarmListings(maxCount = 6): Promise<Listing[]> {
  const listings = await fetchAllApproved();
  if (listings.length === 0) return [];

  return listings
    .filter((l) => l.category === "farms")
    .sort((a, b) => computeListingScore(b) - computeListingScore(a))
    .slice(0, maxCount);
}
