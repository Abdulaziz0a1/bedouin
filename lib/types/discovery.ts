import type { Lang } from "@/lib/i18n/translations";

// ─── Primitives ──────────────────────────────────────────────────────────────

export interface BilingualText {
  en: string;
  ar?: string;
}

export type Season = "spring" | "summer" | "autumn" | "winter";

export type BoostLevel = "none" | "low" | "medium" | "high";

export type CollectionCategory = "explore" | "shows" | "nightlife";

// ─── Shared sub-shapes ───────────────────────────────────────────────────────

export interface SeasonalMetadata {
  /** Seasons during which this item should appear. */
  seasons: Season[];
  /** The single best season, used for default tab selection. */
  peak_season?: Season;
}

export interface PromotionMetadata {
  sponsored: boolean;
  boost_level: BoostLevel;
  /** ISO-8601 date string — item is hidden after this date. */
  featured_until?: string;
  campaign_id?: string;
}

// ─── 1. TrendingDestination ──────────────────────────────────────────────────

export interface TrendingDestination {
  id: string;
  slug: string;
  city: BilingualText;
  region?: BilingualText;
  /** Season this entry belongs to (drives tab display). */
  season: Season;
  fromPrice: number;
  currency?: string;
  description: BilingualText;
  image: string;
  /** 0–100. Higher = shown first within the season tab. */
  ranking_score: number;
  seasonal: SeasonalMetadata;
  promotion?: PromotionMetadata;
  /** Set false to hide from all public surfaces without deleting the record. */
  visible: boolean;
  tags?: string[];
}

// ─── 2. FeaturedCampaign ────────────────────────────────────────────────────

export interface FeaturedCampaign {
  id: string;
  name: BilingualText;
  description?: BilingualText;
  badge: BilingualText;
  active: boolean;
  /** ISO-8601 start date. Null means "always active from now". */
  starts_at?: string;
  /** ISO-8601 end date. Null means "no expiry". */
  ends_at?: string;
  ranking_score: number;
  /** Listing IDs attached to this campaign. */
  listing_ids?: string[];
  /** Region slugs this campaign targets. */
  region_slugs?: string[];
  visible: boolean;
}

// ─── 3. DestinationRegion ────────────────────────────────────────────────────

export interface DestinationRegion {
  id: string;
  slug: string;
  name: BilingualText;
  region: BilingualText;
  description: BilingualText;
  image: string;
  href: string;
  ranking_score: number;
  visible: boolean;
  seasonal?: SeasonalMetadata;
  promotion?: PromotionMetadata;
}

// ─── 4. FeaturedCollection ───────────────────────────────────────────────────

export interface CollectionActivity {
  id: string;
  name: BilingualText;
  image: string;
  /** Defaults to /explore if not set. */
  href?: string;
  category: CollectionCategory;
  ranking_score: number;
}

export interface FeaturedCollection {
  id: string;
  category: CollectionCategory;
  /** i18n key for the tab label, e.g. "things.cat.explore". */
  labelKey: string;
  activities: CollectionActivity[];
  visible: boolean;
  ranking_score: number;
  seasonal?: SeasonalMetadata;
}

// ─── 5. ListingPromotion ─────────────────────────────────────────────────────

export interface ListingPromotion {
  id: string;
  listing_id?: string;
  title: BilingualText;
  location: BilingualText;
  image: string;
  price: number;
  original_price?: number;
  currency?: string;
  score: number;
  review_count: number;
  badge?: BilingualText;
  promotion: PromotionMetadata;
  ranking_score: number;
  visible: boolean;
  seasonal?: SeasonalMetadata;
}

// ─── Real-data display shapes (derived from lib/data/listings.ts) ────────────

/**
 * City-level destination card built by aggregating real listings by location.
 * `fromPrice` = minimum listing price in that city.
 * `image` = image from the highest-ranked listing in that city.
 */
export interface DiscoveryDestinationCard {
  id: string;
  slug: string;
  city: BilingualText;
  fromPrice: number;
  description: BilingualText;
  image: string;
  season: Season;
  ranking_score: number;
  href: string;
}

/** Single activity tile in the TopThingsToDo grid, derived from a real listing. */
export interface DiscoveryActivityCard {
  id: string;
  name: BilingualText;
  image: string;
  href: string;
  ranking_score: number;
}

/** One tab in the TopThingsToDo section — groups activities by experiential category. */
export interface DiscoveryCollection {
  category: CollectionCategory;
  labelKey: string;
  activities: DiscoveryActivityCard[];
}

// ─── Utility ─────────────────────────────────────────────────────────────────

/** Resolve a BilingualText to a plain string for the active language. */
export function localizeText(text: BilingualText, lang: Lang): string {
  if (lang === "ar") return text.ar?.trim() ? text.ar : (text.en || "");
  return text.en?.trim() ? text.en : (text.ar || "");
}
