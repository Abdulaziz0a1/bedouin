import type {
  TrendingDestination,
  FeaturedCampaign,
  FeaturedCollection,
  ListingPromotion,
  Season,
  CollectionCategory,
} from "@/lib/types/discovery";

// ─── Generic sort ─────────────────────────────────────────────────────────────

/** Sort any discovery items descending by ranking_score. */
export function sortByScore<T extends { ranking_score: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.ranking_score - a.ranking_score);
}

// ─── TrendingDestination helpers ─────────────────────────────────────────────

/** Return visible destinations for a given season, sorted by ranking_score. */
export function getDestinationsForSeason(
  destinations: TrendingDestination[],
  season: Season,
): TrendingDestination[] {
  return sortByScore(destinations.filter((d) => d.visible && d.season === season));
}

/** Return all visible destinations that include `season` in their seasonal.seasons list. */
export function getDestinationsBySeason(
  destinations: TrendingDestination[],
  season: Season,
): TrendingDestination[] {
  return sortByScore(
    destinations.filter((d) => d.visible && d.seasonal.seasons.includes(season)),
  );
}

// ─── FeaturedCampaign helpers ─────────────────────────────────────────────────

/** Return campaigns that are currently active and visible. */
export function getActiveCampaigns(campaigns: FeaturedCampaign[]): FeaturedCampaign[] {
  const now = new Date().toISOString();
  return sortByScore(
    campaigns.filter((c) => {
      if (!c.active || !c.visible) return false;
      if (c.ends_at && c.ends_at < now) return false;
      if (c.starts_at && c.starts_at > now) return false;
      return true;
    }),
  );
}

/** Return promotions belonging to a specific campaign id. */
export function getPromotionsForCampaign(
  promotions: ListingPromotion[],
  campaignId: string,
): ListingPromotion[] {
  return sortByScore(
    promotions.filter(
      (p) => p.visible && p.promotion.campaign_id === campaignId,
    ),
  );
}

// ─── ListingPromotion helpers ─────────────────────────────────────────────────

/** Return visible promotions, highest boost first. */
export function getFeaturedPromotions(promotions: ListingPromotion[]): ListingPromotion[] {
  const boostOrder: Record<string, number> = { high: 3, medium: 2, low: 1, none: 0 };
  return [...promotions]
    .filter((p) => p.visible)
    .sort(
      (a, b) =>
        (boostOrder[b.promotion.boost_level] ?? 0) - (boostOrder[a.promotion.boost_level] ?? 0) ||
        b.ranking_score - a.ranking_score,
    );
}

/** Filter promotions to those valid for a given season. */
export function filterPromotionsBySeason(
  promotions: ListingPromotion[],
  season: Season,
): ListingPromotion[] {
  return promotions.filter(
    (p) => !p.seasonal || p.seasonal.seasons.includes(season),
  );
}

// ─── FeaturedCollection helpers ───────────────────────────────────────────────

/** Return the collection for a given category, or undefined. */
export function getCollection(
  collections: FeaturedCollection[],
  category: CollectionCategory,
): FeaturedCollection | undefined {
  return collections.find((c) => c.category === category && c.visible);
}

/** Return sorted activities for a collection category. */
export function getActivitiesForCategory(
  collections: FeaturedCollection[],
  category: CollectionCategory,
): FeaturedCollection["activities"] {
  const col = getCollection(collections, category);
  if (!col) return [];
  return sortByScore(col.activities);
}

// ─── Seasonal detection ───────────────────────────────────────────────────────

/** Derive the current real-world season for Saudi Arabia (Northern Hemisphere). */
export function getCurrentSeason(): Season {
  const month = new Date().getMonth() + 1; // 1–12
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}
