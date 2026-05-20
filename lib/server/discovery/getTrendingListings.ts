import { createAdminClient } from "@/lib/supabase-admin";
import type { DiscoveryDestinationCard, Season } from "@/lib/types/discovery";
import { getSeasonForListing, computeListingScore } from "./getSeasonalListings";
import type { Listing } from "@/lib/data/listings";



const FALLBACK_IMG = "https://picsum.photos/seed/bedouin-destination/600/900";
const SEASONS: Season[] = ["spring", "summer", "autumn", "winter"];
const CARDS_PER_SEASON = 8;

// Discovery mix weights — must sum to ≤ 1.0 (remainder fills from random)
const WEIGHT_TOP_RATED = 0.4;
const WEIGHT_RECENT    = 0.3;

interface ApprovedListing extends Listing {
  created_at: string;
}

/** Fisher-Yates in-place shuffle. */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Fetches all approved listings from the `listings` table.
 * Every row in `listings` is approved — records arrive there only after admin
 * approval (see lib/actions/admin.ts approveSubmission).
 * Falls back to ALL_LISTINGS mock data when Supabase is unavailable or empty.
 */
async function fetchApprovedListings(): Promise<ApprovedListing[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("listings")
      .select("id, slug, title, location, region, category, price, original_price, score, review_count, badge, badge_color, tags, image, created_at")
      .not("submission_id", "is", null)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) return [];

    return data.map((row) => ({
      id:            row.slug ?? row.id,
      image:         row.image || FALLBACK_IMG,
      title:         row.title ?? "",
      location:      row.location ?? "",
      region:        row.region,
      category:      row.category,
      price:         Number(row.price ?? 0),
      originalPrice: row.original_price ?? undefined,
      score:         Number(row.score ?? 0),
      reviewCount:   Number(row.review_count ?? 0),
      badge:         row.badge ?? undefined,
      badgeColor:    row.badge_color ?? undefined,
      tags:          (row.tags as string[]) ?? [],
      created_at:    row.created_at ?? new Date(0).toISOString(),
    }));
  } catch {
    return [];
  }
}

/**
 * Balanced discovery selection — avoids the same listings dominating every time.
 *
 *   40% top-rated  (composite score: rating + review volume + discount + badge)
 *   30% recently added  (newest listings get exposure)
 *   30% random approved listings  (long-tail listings surface over time)
 *
 * Returns a shuffled result so card order varies between page loads.
 */
function selectBalanced(listings: ApprovedListing[], total: number): ApprovedListing[] {
  if (listings.length === 0) return [];
  if (listings.length <= total) return shuffle([...listings]);

  const topN    = Math.ceil(total * WEIGHT_TOP_RATED);
  const recentN = Math.ceil(total * WEIGHT_RECENT);

  const byScore  = [...listings].sort((a, b) => computeListingScore(b) - computeListingScore(a));
  const byRecent = [...listings].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const selected = new Set<string>();
  const result: ApprovedListing[] = [];

  // Top-rated bucket
  for (const l of byScore) {
    if (result.length >= topN) break;
    if (!selected.has(l.id)) { selected.add(l.id); result.push(l); }
  }

  // Recently added bucket
  for (const l of byRecent) {
    if (result.length >= topN + recentN) break;
    if (!selected.has(l.id)) { selected.add(l.id); result.push(l); }
  }

  // Random bucket — fills remaining slots from the unused pool
  const remaining = shuffle(listings.filter((l) => !selected.has(l.id)));
  for (const l of remaining) {
    if (result.length >= total) break;
    result.push(l);
  }

  return shuffle(result);
}

/**
 * Converts one approved listing into a DiscoveryDestinationCard.
 *
 * The listing title becomes the card heading (city field); the location
 * becomes the description line. Both support Arabic via title_ar / location_ar
 * when the DB schema carries those columns in the future.
 */
function buildCard(listing: ApprovedListing, season: Season): DiscoveryDestinationCard {
  return {
    id:            listing.id,
    slug:          listing.id,
    city:          { en: listing.title, ar: listing.title_ar },
    fromPrice:     listing.price,
    description:   { en: listing.location, ar: listing.location_ar },
    image:         listing.image || FALLBACK_IMG,
    season,
    ranking_score: computeListingScore(listing),
    href:          `/listing/${listing.id}`,
  };
}

/**
 * Returns a balanced, randomised selection of real approved listings grouped
 * by season for the homepage "Destinations Guests Love" section.
 *
 * Discovery mix per season tab:
 *   40% top-rated / high engagement
 *   30% recently added
 *   30% random approved listings
 *
 * Falls back to ALL_LISTINGS (mock data) only when no real listings exist.
 */
export async function getTrendingListings(): Promise<Record<Season, DiscoveryDestinationCard[]>> {
  const listings = await fetchApprovedListings();
  const result = {} as Record<Season, DiscoveryDestinationCard[]>;

  for (const season of SEASONS) {
    const seasonal = listings.filter((l) => getSeasonForListing(l) === season);
    const selected = selectBalanced(seasonal, CARDS_PER_SEASON);
    result[season] = selected.map((l) => buildCard(l, season));
  }

  return result;
}
