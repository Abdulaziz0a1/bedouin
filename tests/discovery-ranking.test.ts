import { describe, it, expect } from "vitest";
import {
  sortByScore,
  getDestinationsForSeason,
  getDestinationsBySeason,
  getActiveCampaigns,
  getPromotionsForCampaign,
  getFeaturedPromotions,
  filterPromotionsBySeason,
  getCollection,
  getActivitiesForCategory,
  getCurrentSeason,
} from "@/lib/utils/discovery-ranking";
import type {
  TrendingDestination,
  FeaturedCampaign,
  ListingPromotion,
  FeaturedCollection,
  Season,
} from "@/lib/types/discovery";

// ─── Fixture factories ────────────────────────────────────────────────────────
// Small factory functions keep each test focused on the fields that matter.

function makeDest(
  overrides: Partial<TrendingDestination> & { id: string; ranking_score: number }
): TrendingDestination {
  return {
    slug: overrides.id,
    city: { en: overrides.id },
    description: { en: "" },
    image: "",
    season: "spring",
    fromPrice: 100,
    visible: true,
    seasonal: { seasons: ["spring"] },
    ...overrides,
  } as TrendingDestination;
}

function makeCampaign(
  overrides: Partial<FeaturedCampaign> & { id: string; ranking_score: number }
): FeaturedCampaign {
  return {
    name: { en: overrides.id },
    badge: { en: "Hot" },
    active: true,
    visible: true,
    ...overrides,
  } as FeaturedCampaign;
}

function makePromo(
  overrides: Partial<ListingPromotion> & { id: string; ranking_score: number },
  boost: "none" | "low" | "medium" | "high" = "medium",
  campaignId = "c1"
): ListingPromotion {
  return {
    title: { en: overrides.id },
    location: { en: "Taif" },
    image: "",
    price: 100,
    score: 4.5,
    review_count: 10,
    visible: true,
    promotion: { sponsored: false, boost_level: boost, campaign_id: campaignId },
    ...overrides,
  } as ListingPromotion;
}

function makeCollection(
  overrides: Partial<FeaturedCollection> & { id: string; ranking_score: number }
): FeaturedCollection {
  return {
    category: "explore",
    labelKey: "things.cat.explore",
    activities: [],
    visible: true,
    ...overrides,
  } as FeaturedCollection;
}

// ─── sortByScore ──────────────────────────────────────────────────────────────

describe("sortByScore", () => {
  it("UT-23 sorts items descending by ranking_score", () => {
    const items = [
      { ranking_score: 30, id: "a" },
      { ranking_score: 90, id: "b" },
      { ranking_score: 60, id: "c" },
    ];
    const result = sortByScore(items);
    expect(result.map((i) => i.ranking_score)).toEqual([90, 60, 30]);
  });

  it("UT-24 returns an empty array unchanged", () => {
    expect(sortByScore([])).toEqual([]);
  });

  it("UT-25 does not mutate the original array", () => {
    const original = [{ ranking_score: 10 }, { ranking_score: 50 }];
    const copy = [...original];
    sortByScore(original);
    expect(original).toEqual(copy);
  });
});

// ─── getDestinationsForSeason ─────────────────────────────────────────────────

describe("getDestinationsForSeason", () => {
  const destinations: TrendingDestination[] = [
    makeDest({ id: "spring-high", ranking_score: 90, season: "spring", visible: true }),
    makeDest({ id: "spring-low",  ranking_score: 40, season: "spring", visible: true }),
    makeDest({ id: "winter",      ranking_score: 80, season: "winter", visible: true }),
    makeDest({ id: "spring-hide", ranking_score: 95, season: "spring", visible: false }),
  ];

  it("UT-26 returns only destinations matching the requested season", () => {
    const result = getDestinationsForSeason(destinations, "spring");
    result.forEach((d) => expect(d.season).toBe("spring"));
  });

  it("UT-27 excludes destinations with visible: false", () => {
    const result = getDestinationsForSeason(destinations, "spring");
    expect(result.find((d) => d.id === "spring-hide")).toBeUndefined();
  });

  it("UT-28 returns results sorted descending by ranking_score", () => {
    const result = getDestinationsForSeason(destinations, "spring");
    // spring-high (90) should come before spring-low (40)
    expect(result[0].id).toBe("spring-high");
    expect(result[1].id).toBe("spring-low");
  });

  it("UT-29 returns empty array when no destinations match the season", () => {
    const result = getDestinationsForSeason(destinations, "autumn");
    expect(result).toHaveLength(0);
  });
});

// ─── getDestinationsBySeason ──────────────────────────────────────────────────

describe("getDestinationsBySeason", () => {
  it("UT-67 includes a destination whose seasonal.seasons array contains the requested season", () => {
    const destinations: TrendingDestination[] = [
      makeDest({ id: "multi-season", ranking_score: 60, visible: true,
        seasonal: { seasons: ["spring", "summer"] } }),
    ];
    const result = getDestinationsBySeason(destinations, "spring");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("multi-season");
  });

  it("UT-68 excludes a destination whose seasonal.seasons array does not contain the requested season", () => {
    const destinations: TrendingDestination[] = [
      makeDest({ id: "winter-only", ranking_score: 60, visible: true,
        seasonal: { seasons: ["winter"] } }),
    ];
    const result = getDestinationsBySeason(destinations, "spring");
    expect(result).toHaveLength(0);
  });

  it("UT-69 excludes a destination with visible: false even when the season matches", () => {
    const destinations: TrendingDestination[] = [
      makeDest({ id: "hidden",  ranking_score: 90, visible: false,
        seasonal: { seasons: ["spring"] } }),
      makeDest({ id: "visible", ranking_score: 50, visible: true,
        seasonal: { seasons: ["spring"] } }),
    ];
    const result = getDestinationsBySeason(destinations, "spring");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("visible");
  });
});

// ─── getActiveCampaigns ───────────────────────────────────────────────────────

describe("getActiveCampaigns", () => {
  it("UT-30 includes a campaign with active: true, no date restrictions", () => {
    const campaigns = [makeCampaign({ id: "c1", ranking_score: 50 })];
    expect(getActiveCampaigns(campaigns)).toHaveLength(1);
  });

  it("UT-31 excludes a campaign with active: false", () => {
    const campaigns = [
      makeCampaign({ id: "c1", ranking_score: 50, active: false }),
    ];
    expect(getActiveCampaigns(campaigns)).toHaveLength(0);
  });

  it("UT-32 excludes a campaign with visible: false", () => {
    const campaigns = [
      makeCampaign({ id: "c1", ranking_score: 50, visible: false }),
    ];
    expect(getActiveCampaigns(campaigns)).toHaveLength(0);
  });

  it("UT-33 excludes an expired campaign whose ends_at is in the past", () => {
    const campaigns = [
      makeCampaign({ id: "c1", ranking_score: 50, ends_at: "2020-01-01T00:00:00Z" }),
    ];
    expect(getActiveCampaigns(campaigns)).toHaveLength(0);
  });

  it("UT-34 excludes a campaign whose starts_at is in the future", () => {
    const campaigns = [
      makeCampaign({ id: "c1", ranking_score: 50, starts_at: "2099-01-01T00:00:00Z" }),
    ];
    expect(getActiveCampaigns(campaigns)).toHaveLength(0);
  });

  it("UT-35 includes a campaign whose dates surround today", () => {
    const campaigns = [
      makeCampaign({
        id: "c1",
        ranking_score: 50,
        starts_at: "2020-01-01T00:00:00Z",
        ends_at: "2099-12-31T23:59:59Z",
      }),
    ];
    expect(getActiveCampaigns(campaigns)).toHaveLength(1);
  });

  it("UT-36 returns campaigns sorted descending by ranking_score", () => {
    const campaigns = [
      makeCampaign({ id: "low",  ranking_score: 20 }),
      makeCampaign({ id: "high", ranking_score: 80 }),
    ];
    const result = getActiveCampaigns(campaigns);
    expect(result[0].id).toBe("high");
    expect(result[1].id).toBe("low");
  });
});

// ─── getFeaturedPromotions ────────────────────────────────────────────────────

describe("getFeaturedPromotions", () => {
  it("UT-37 sorts promotions by boost level: high > medium > low > none", () => {
    const promos: ListingPromotion[] = [
      makePromo({ id: "none",   ranking_score: 99 }, "none"),
      makePromo({ id: "low",    ranking_score: 99 }, "low"),
      makePromo({ id: "medium", ranking_score: 99 }, "medium"),
      makePromo({ id: "high",   ranking_score: 99 }, "high"),
    ];
    const result = getFeaturedPromotions(promos);
    const order = result.map((p) => p.promotion.boost_level);
    expect(order).toEqual(["high", "medium", "low", "none"]);
  });

  it("UT-38 breaks boost-level ties using ranking_score descending", () => {
    const promos: ListingPromotion[] = [
      makePromo({ id: "p-low-score",  ranking_score: 30 }, "high"),
      makePromo({ id: "p-high-score", ranking_score: 80 }, "high"),
    ];
    const result = getFeaturedPromotions(promos);
    expect(result[0].id).toBe("p-high-score");
    expect(result[1].id).toBe("p-low-score");
  });

  it("UT-39 excludes promotions with visible: false", () => {
    const promos: ListingPromotion[] = [
      makePromo({ id: "visible",  ranking_score: 50 }),
      makePromo({ id: "hidden",   ranking_score: 90, visible: false }),
    ];
    const result = getFeaturedPromotions(promos);
    expect(result.find((p) => p.id === "hidden")).toBeUndefined();
    expect(result).toHaveLength(1);
  });
});

// ─── filterPromotionsBySeason ─────────────────────────────────────────────────

describe("filterPromotionsBySeason", () => {
  it("UT-40 includes a promotion with no seasonal restriction in any season", () => {
    const promos: ListingPromotion[] = [
      makePromo({ id: "p1", ranking_score: 50, seasonal: undefined }),
    ];
    expect(filterPromotionsBySeason(promos, "summer")).toHaveLength(1);
    expect(filterPromotionsBySeason(promos, "winter")).toHaveLength(1);
  });

  it("UT-41 includes a promotion whose seasons list contains the requested season", () => {
    const promos: ListingPromotion[] = [
      makePromo({ id: "p1", ranking_score: 50, seasonal: { seasons: ["spring", "summer"] } }),
    ];
    expect(filterPromotionsBySeason(promos, "spring")).toHaveLength(1);
    expect(filterPromotionsBySeason(promos, "summer")).toHaveLength(1);
  });

  it("UT-42 excludes a promotion whose seasons list does not contain the requested season", () => {
    const promos: ListingPromotion[] = [
      makePromo({ id: "p1", ranking_score: 50, seasonal: { seasons: ["winter"] } }),
    ];
    expect(filterPromotionsBySeason(promos, "spring")).toHaveLength(0);
  });
});

// ─── getPromotionsForCampaign ─────────────────────────────────────────────────

describe("getPromotionsForCampaign", () => {
  const promos: ListingPromotion[] = [
    makePromo({ id: "p1", ranking_score: 60 }, "high",   "campaign-A"),
    makePromo({ id: "p2", ranking_score: 80 }, "medium", "campaign-A"),
    makePromo({ id: "p3", ranking_score: 40 }, "low",    "campaign-B"),
    makePromo({ id: "p4", ranking_score: 90, visible: false }, "high", "campaign-A"),
  ];

  it("UT-43 returns only visible promotions belonging to the specified campaign", () => {
    const result = getPromotionsForCampaign(promos, "campaign-A");
    expect(result.every((p) => p.promotion.campaign_id === "campaign-A")).toBe(true);
    // p4 is not visible — should be excluded
    expect(result.find((p) => p.id === "p4")).toBeUndefined();
    expect(result).toHaveLength(2);
  });

  it("UT-44 returns empty array when campaign id matches no promotions", () => {
    expect(getPromotionsForCampaign(promos, "campaign-X")).toHaveLength(0);
  });
});

// ─── getCollection ────────────────────────────────────────────────────────────

describe("getCollection", () => {
  const collections: FeaturedCollection[] = [
    makeCollection({ id: "col-explore",   ranking_score: 70, category: "explore",   visible: true }),
    makeCollection({ id: "col-shows",     ranking_score: 50, category: "shows",     visible: true }),
    makeCollection({ id: "col-nightlife", ranking_score: 40, category: "nightlife", visible: false }),
  ];

  it("UT-45 returns the visible collection for a matching category", () => {
    const result = getCollection(collections, "explore");
    expect(result?.id).toBe("col-explore");
  });

  it("UT-46 returns undefined for a category that has no visible collection", () => {
    const result = getCollection(collections, "nightlife");
    expect(result).toBeUndefined();
  });

  it("UT-47 returns undefined when the category is not present at all", () => {
    const result = getCollection([], "explore");
    expect(result).toBeUndefined();
  });
});

// ─── getActivitiesForCategory ──────────────────────────────────────────────────

describe("getActivitiesForCategory", () => {
  const collections: FeaturedCollection[] = [
    makeCollection({
      id: "col-explore",
      ranking_score: 70,
      category: "explore",
      visible: true,
      activities: [
        { id: "a1", name: { en: "Hiking" },    image: "", category: "explore", ranking_score: 40 },
        { id: "a2", name: { en: "Camel ride" }, image: "", category: "explore", ranking_score: 80 },
      ],
    }),
  ];

  it("UT-48 returns activities sorted descending by ranking_score", () => {
    const result = getActivitiesForCategory(collections, "explore");
    expect(result[0].id).toBe("a2");
    expect(result[1].id).toBe("a1");
  });

  it("UT-49 returns empty array for a category with no collection", () => {
    const result = getActivitiesForCategory(collections, "nightlife");
    expect(result).toEqual([]);
  });
});

// ─── getCurrentSeason ─────────────────────────────────────────────────────────

describe("getCurrentSeason", () => {
  const VALID_SEASONS: Season[] = ["spring", "summer", "autumn", "winter"];

  it("UT-50 returns one of the four valid Season values", () => {
    const result = getCurrentSeason();
    expect(VALID_SEASONS).toContain(result);
  });
});
