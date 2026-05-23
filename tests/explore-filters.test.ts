import { describe, it, expect } from "vitest";
import { filterListings } from "@/lib/utils/explore-filters";
import type { Listing } from "@/lib/utils/explore-filters";

// ─── Minimal fixture listings ─────────────────────────────────────────────────
// Covers all six categories, five Saudi regions, and a spread of prices/scores
// large enough to exercise every filter branch in filterListings().

const LISTINGS: Listing[] = [
  {
    id: "l1",
    image: "",
    title: "Taif Strawberry Farm",
    location: "Taif, Hada Al Sham",
    region: "Makkah",
    category: "farms",
    price: 80,
    score: 4.5,
    reviewCount: 20,
    tags: ["farm", "family"],
  },
  {
    id: "l2",
    image: "",
    title: "Riyadh Guest House",
    location: "Riyadh City",
    region: "Riyadh",
    category: "guesthouse",
    price: 200,
    score: 4.2,
    reviewCount: 10,
    tags: ["city", "business"],
  },
  {
    id: "l3",
    image: "",
    title: "AlUla Stargazing Dome",
    location: "AlUla, Madain Saleh",
    region: "Madinah",
    category: "doms",
    price: 600,
    score: 4.8,
    reviewCount: 50,
    tags: ["glamping", "alula", "desert"],
  },
  {
    id: "l4",
    image: "",
    title: "Abha Mountain Cabin",
    location: "Abha, Asir Highlands",
    region: "Asir",
    category: "cabins",
    price: 150,
    score: 4.0,
    reviewCount: 5,
    tags: ["mountain", "cool-weather"],
  },
  {
    id: "l5",
    image: "",
    title: "Hail Desert Farm",
    location: "Hail City",
    region: "Hail",
    category: "farms",
    price: 90,
    score: 4.7,
    reviewCount: 35,
    tags: ["farm", "desert"],
  },
];

// ─── Helper: extract ids for readable assertions ───────────────────────────────
const ids = (result: Listing[]) => result.map((l) => l.id);

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("filterListings", () => {

  // ── 1. No filters ─────────────────────────────────────────────────────────
  it("UT-01 returns all listings when no filter options are provided", () => {
    const result = filterListings(LISTINGS, {});
    expect(result).toHaveLength(5);
  });

  // ── 2. Category filter ─────────────────────────────────────────────────────
  it("UT-02 filters by category: farms returns only farm listings", () => {
    const result = filterListings(LISTINGS, { category: "farms" });
    expect(ids(result)).toEqual(expect.arrayContaining(["l1", "l5"]));
    expect(result).toHaveLength(2);
    result.forEach((l) => expect(l.category).toBe("farms"));
  });

  it("UT-03 filters by category: doms returns only dome listings", () => {
    const result = filterListings(LISTINGS, { category: "doms" });
    expect(ids(result)).toEqual(["l3"]);
  });

  // ── 3. Region filter ───────────────────────────────────────────────────────
  it("UT-04 filters by region: Riyadh returns only Riyadh listings", () => {
    const result = filterListings(LISTINGS, { region: "Riyadh" });
    expect(ids(result)).toEqual(["l2"]);
  });

  it("UT-05 region All returns every listing", () => {
    const result = filterListings(LISTINGS, { region: "All" });
    expect(result).toHaveLength(5);
  });

  // ── 4. Price range filter ──────────────────────────────────────────────────
  it("UT-06 priceRange u100 returns only listings priced under SAR 100", () => {
    const result = filterListings(LISTINGS, { priceRange: "u100" });
    result.forEach((l) => expect(l.price).toBeLessThan(100));
    expect(ids(result)).toEqual(expect.arrayContaining(["l1", "l5"]));
    expect(result).toHaveLength(2);
  });

  it("UT-07 priceRange 100-250 returns listings between SAR 100 and 250 inclusive", () => {
    const result = filterListings(LISTINGS, { priceRange: "100-250" });
    result.forEach((l) => {
      expect(l.price).toBeGreaterThanOrEqual(100);
      expect(l.price).toBeLessThanOrEqual(250);
    });
    expect(ids(result)).toEqual(expect.arrayContaining(["l2", "l4"]));
    expect(result).toHaveLength(2);
  });

  it("UT-08 priceRange 250-500 returns listings between SAR 250 and 500 inclusive", () => {
    // None of the fixtures fall in this range — expects an empty result.
    const result = filterListings(LISTINGS, { priceRange: "250-500" });
    expect(result).toHaveLength(0);
  });

  it("UT-09 priceRange 500+ returns only listings priced SAR 500 or above", () => {
    const result = filterListings(LISTINGS, { priceRange: "500+" });
    result.forEach((l) => expect(l.price).toBeGreaterThanOrEqual(500));
    expect(ids(result)).toEqual(["l3"]);
  });

  // ── 5. Text search (query) ─────────────────────────────────────────────────
  it("UT-10 query matches listing title (case-insensitive)", () => {
    const result = filterListings(LISTINGS, { query: "alula" });
    expect(ids(result)).toEqual(["l3"]);
  });

  it("UT-11 query matches listing location", () => {
    const result = filterListings(LISTINGS, { query: "abha" });
    expect(ids(result)).toEqual(["l4"]);
  });

  it("UT-12 query matches listing tags", () => {
    const result = filterListings(LISTINGS, { query: "mountain" });
    expect(ids(result)).toEqual(["l4"]);
  });

  it("UT-13 query with no matches returns an empty array", () => {
    const result = filterListings(LISTINGS, { query: "does-not-exist-xyz" });
    expect(result).toHaveLength(0);
  });

  // ── 6. Sort orders ─────────────────────────────────────────────────────────
  it("UT-14 sortBy price-asc returns listings cheapest first", () => {
    const result = filterListings(LISTINGS, { sortBy: "price-asc" });
    const prices = result.map((l) => l.price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it("UT-15 sortBy price-desc returns listings most expensive first", () => {
    const result = filterListings(LISTINGS, { sortBy: "price-desc" });
    const prices = result.map((l) => l.price);
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  it("UT-16 sortBy popular returns listings with highest score first", () => {
    const result = filterListings(LISTINGS, { sortBy: "popular" });
    const scores = result.map((l) => l.score);
    for (let i = 0; i < scores.length - 1; i++) {
      expect(scores[i]).toBeGreaterThanOrEqual(scores[i + 1]);
    }
  });

  it("UT-17 sortBy rating returns listings with highest score first", () => {
    const result = filterListings(LISTINGS, { sortBy: "rating" });
    const scores = result.map((l) => l.score);
    for (let i = 0; i < scores.length - 1; i++) {
      expect(scores[i]).toBeGreaterThanOrEqual(scores[i + 1]);
    }
  });

  // ── 7. Combined filters ────────────────────────────────────────────────────
  it("UT-18 combining category + region returns the intersection", () => {
    const result = filterListings(LISTINGS, { category: "farms", region: "Hail" });
    expect(ids(result)).toEqual(["l5"]);
  });

  it("UT-19 combining category + priceRange returns the intersection", () => {
    // farms with price < 100: l1(80) and l5(90)
    const result = filterListings(LISTINGS, { category: "farms", priceRange: "u100" });
    expect(result).toHaveLength(2);
    result.forEach((l) => {
      expect(l.category).toBe("farms");
      expect(l.price).toBeLessThan(100);
    });
  });

  it("UT-20 no listings match the combined filters — returns empty array", () => {
    const result = filterListings(LISTINGS, { category: "glamping", region: "Riyadh" });
    expect(result).toHaveLength(0);
  });

  // ── 8. Input edge cases ────────────────────────────────────────────────────
  it("UT-21 empty input array always returns empty array regardless of filters", () => {
    const result = filterListings([], { category: "farms", query: "taif" });
    expect(result).toHaveLength(0);
  });

  it("UT-22 does not mutate the original listings array", () => {
    const original = [...LISTINGS];
    filterListings(LISTINGS, { sortBy: "price-asc" });
    expect(LISTINGS).toEqual(original);
  });
});
