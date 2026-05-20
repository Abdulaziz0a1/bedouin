import type { Listing, Region } from "@/lib/data/listings";
import type { Season } from "@/lib/types/discovery";

// ─── Region → primary season mapping ─────────────────────────────────────────

const REGION_PRIMARY_SEASON: Record<Region, Season> = {
  "Riyadh":           "spring",
  "Makkah":           "spring",   // Taif → spring; Jeddah overridden below
  "Madinah":          "winter",   // AlUla winter prominence
  "Eastern Province": "spring",   // Mild coastal spring
  "Asir":             "summer",   // Cool highlands; peak summer escape
  "Tabuk":            "summer",   // Rugged desert + Red Sea coast
  "Hail":             "summer",   // Nafud desert
  "Al Qassim":        "spring",
  "Jazan":            "autumn",
  "Najran":           "autumn",
  "Al Baha":          "autumn",   // Green valleys peak autumn
  "Al Jouf":          "winter",
  "Northern Borders": "winter",
};

// Fine-grained location overrides (checked before region fallback)
const LOCATION_OVERRIDES: { match: string; season: Season }[] = [
  { match: "AlUla",    season: "winter" },
  { match: "Al Ula",  season: "winter" },
  { match: "Hegra",   season: "winter" },
  { match: "Jeddah",  season: "autumn" },
  { match: "Yanbu",   season: "autumn" },
  { match: "Dammam",  season: "winter" },
];

export function getSeasonForListing(listing: Listing): Season {
  for (const { match, season } of LOCATION_OVERRIDES) {
    if (listing.location.includes(match)) return season;
  }
  return REGION_PRIMARY_SEASON[listing.region] ?? "spring";
}

// ─── Ranking ──────────────────────────────────────────────────────────────────

/**
 * Composite ranking score for a listing on the homepage.
 * Weights: rating (40 pts max) + review volume (30 pts max) + discount (15 pts) + badge (10 pts)
 */
export function computeListingScore(listing: Listing): number {
  const ratingPts  = listing.score * 8;                                // 0–40
  const reviewPts  = Math.min(Math.log10(Math.max(listing.reviewCount, 1)) * 12, 30);
  const discountPts = listing.originalPrice && listing.originalPrice > listing.price ? 15 : 0;
  const badgePts   = listing.badge ? 10 : 0;
  return Math.round(ratingPts + reviewPts + discountPts + badgePts);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Canonical forms for city names that appear in different spellings across listings. */
const CITY_ALIASES: Record<string, string> = {
  "Al Taif": "Taif",
  "Al Ula":  "AlUla",
};

/** "Al Taif, Hada Al Sham" → "Taif" (normalized canonical name) */
export function extractCity(location: string): string {
  const raw = location.split(",")[0].trim();
  return CITY_ALIASES[raw] ?? raw;
}

/** Known Arabic city names for Saudi cities appearing in listing locations. */
export const CITY_AR: Readonly<Record<string, string>> = {
  "Al Taif":          "الطائف",
  "Taif":             "الطائف",
  "Riyadh":           "الرياض",
  "AlUla":            "العُلا",
  "Abha":             "أبها",
  "Tabuk":            "تبوك",
  "Hail":             "حائل",
  "Al Ahsa":          "الأحساء",
  "Jeddah":           "جدة",
  "Al Baha":          "الباحة",
  "Madinah":          "المدينة المنورة",
  "Dammam":           "الدمام",
};

/** Derive a concise description from listing data. Falls back gracefully. */
export function buildListingDescription(listing: Listing): { en: string; ar?: string } {
  const tags = listing.tags.slice(0, 2).join(" · ");
  const en = tags || listing.badge || "Authentic Saudi experience";
  return { en };
}

/** Return listings that map to the given season, sorted by ranking score. */
export function getListingsForSeason(listings: Listing[], season: Season): Listing[] {
  return listings
    .filter((l) => getSeasonForListing(l) === season)
    .sort((a, b) => computeListingScore(b) - computeListingScore(a));
}
