/**
 * Pure filter/sort utilities for the Explore page.
 * This file intentionally has NO imports from lib/data/listings.ts so it
 * never bundles mock listing data into the client.
 */
import type { Listing, Category } from "@/lib/data/listings";
import { REGIONS } from "@/lib/constants/regions";

export type { Listing };

/** All categories available in the filter bar, including the "all" sentinel. */
export const EXPLORE_CATEGORIES: { id: Category | "all"; label: string }[] = [
  { id: "all",         label: "All" },
  { id: "farms",       label: "Farms" },
  { id: "house",       label: "Houses" },
  { id: "guesthouse",  label: "Guesthouses" },
  { id: "cabins",      label: "Cabins" },
  { id: "glamping",    label: "Glamping" },
  { id: "doms",        label: "Domes" },
];

/** "All" sentinel + the 13 Saudi administrative regions. */
export const EXPLORE_REGIONS = REGIONS;

/** Price range filter options. */
export const EXPLORE_PRICE_RANGES: { id: string; label: string }[] = [
  { id: "all",     label: "Any price" },
  { id: "u100",    label: "Under SAR 100" },
  { id: "100-250", label: "SAR 100 – 250" },
  { id: "250-500", label: "SAR 250 – 500" },
  { id: "500+",    label: "SAR 500+" },
];

/** Filter and sort a listing array. Pure function — no side effects. */
export function filterListings(
  listings: Listing[],
  opts: {
    query?: string;
    category?: string;
    region?: string;
    priceRange?: string;
    sortBy?: string;
  }
): Listing[] {
  const {
    query = "",
    category = "all",
    region = "All",
    priceRange = "all",
    sortBy = "popular",
  } = opts;

  let result = listings.filter((l) => {
    if (query) {
      const q = query.toLowerCase();
      if (
        !l.title.toLowerCase().includes(q) &&
        !l.location.toLowerCase().includes(q) &&
        !l.tags.some((t) => t.toLowerCase().includes(q))
      )
        return false;
    }
    if (category !== "all" && l.category !== category) return false;
    if (region !== "All" && l.region !== region) return false;
    if (priceRange === "u100"    && l.price >= 100)                  return false;
    if (priceRange === "100-250" && (l.price < 100 || l.price > 250)) return false;
    if (priceRange === "250-500" && (l.price < 250 || l.price > 500)) return false;
    if (priceRange === "500+"    && l.price < 500)                    return false;
    return true;
  });

  if (sortBy === "popular")    result = [...result].sort((a, b) => b.score - a.score || b.reviewCount - a.reviewCount);
  if (sortBy === "price-asc")  result = [...result].sort((a, b) => a.price - b.price);
  if (sortBy === "price-desc") result = [...result].sort((a, b) => b.price - a.price);
  if (sortBy === "rating")     result = [...result].sort((a, b) => b.score - a.score || b.reviewCount - a.reviewCount);
  // "newest" preserves input order — fetchListings already returns created_at DESC

  return result;
}
