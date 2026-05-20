import { createClient } from "@/lib/supabase-server";

const CANONICAL_CATEGORIES = new Set(["farms", "house", "guesthouse", "cabins", "glamping", "doms"]);

/**
 * Normalizes raw DB category values to the canonical set used by the UI.
 * Handles common variations: different cases, spaces, underscores, synonyms.
 */
function normalizeCategory(raw: string | null | undefined): string {
  if (!raw) return "";
  if (CANONICAL_CATEGORIES.has(raw)) return raw;
  const s = raw.toLowerCase().replace(/[\s_-]+/g, "");
  if (s.startsWith("farm") || s === "agriculture")          return "farms";
  if (s === "house" || s.includes("heritage"))               return "house";
  if (s.includes("guest"))                                   return "guesthouse";
  if (s.includes("cabin") || s.includes("highland"))         return "cabins";
  if (s.includes("glamp") || s.includes("desert") || s.includes("camp")) return "glamping";
  if (s.includes("dom") || s.includes("dome"))               return "doms";
  return raw;
}

export interface HomepageListing {
  id: string;
  image: string;
  title: string;
  title_ar?: string;
  location: string;
  location_ar?: string;
  region: string;
  category: string;
  price: number;
  originalPrice?: number;
  priceUnit?: string;
  score: number;
  reviewCount: number;
  badge?: string;
  badgeColor?: string;
  tags: string[];
  createdAt: string;
}

function computeScore(l: HomepageListing): number {
  const ratingPts   = l.score * 8;
  const reviewPts   = Math.min(Math.log10(Math.max(l.reviewCount, 1)) * 12, 30);
  const discountPts = l.originalPrice && l.originalPrice > l.price ? 15 : 0;
  const badgePts    = l.badge ? 10 : 0;
  return Math.round(ratingPts + reviewPts + discountPts + badgePts);
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Single query for all real approved listings. Selector functions below
 * derive per-section subsets without additional DB round-trips.
 * Returns [] when Supabase is unavailable or no approved listings exist.
 */
export async function getMarketplaceListings(): Promise<HomepageListing[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .not("submission_id", "is", null)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) return [];

    return data.map((row) => {
      const r = row as Record<string, unknown>;
      return {
        id:            ((r.slug ?? r.id) as string) || String(r.id),
        image:         (r.image as string) || "",
        title:         (r.title as string) ?? "",
        title_ar:      (r.title_ar as string | null | undefined) ?? undefined,
        location:      (r.location as string) ?? "",
        location_ar:   (r.location_ar as string | null | undefined) ?? undefined,
        region:        (r.region as string) ?? "",
        category:      normalizeCategory(r.category as string | null),
        price:         Number(r.price ?? 0),
        originalPrice: (r.original_price as number | null | undefined) ?? undefined,
        priceUnit:     (r.price_unit as string | null | undefined) ?? undefined,
        score:         Number(r.score ?? 0),
        reviewCount:   Number(r.review_count ?? 0),
        badge:         (r.badge as string | null | undefined) ?? undefined,
        badgeColor:    (r.badge_color as string | null | undefined) ?? undefined,
        tags:          Array.isArray(r.tags) ? (r.tags as string[]) : [],
        createdAt:     (r.created_at as string) ?? "",
      };
    });
  } catch {
    return [];
  }
}

/** 40% top-rated · 30% recently added · 30% random — no duplicates */
export function selectTrending(listings: HomepageListing[], count = 8): HomepageListing[] {
  if (listings.length === 0) return [];
  const n       = Math.min(count, listings.length);
  const topN    = Math.ceil(n * 0.4);
  const recentN = Math.round(n * 0.3);
  const randomN = n - topN - recentN;

  const byScore    = [...listings].sort((a, b) => computeScore(b) - computeScore(a));
  const topPool    = byScore.slice(0, topN);
  const topIds     = new Set(topPool.map((l) => l.id));

  const rest1      = byScore.filter((l) => !topIds.has(l.id));
  const byDate     = [...rest1].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const recentPool = byDate.slice(0, recentN);
  const recentIds  = new Set(recentPool.map((l) => l.id));

  const rest2      = rest1.filter((l) => !recentIds.has(l.id));
  const randomPool = shuffle(rest2).slice(0, randomN);

  return [...topPool, ...recentPool, ...randomPool];
}

export function selectRecent(listings: HomepageListing[], count = 8): HomepageListing[] {
  return [...listings]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, count);
}

export function selectTopRated(listings: HomepageListing[], count = 8): HomepageListing[] {
  return [...listings]
    .sort((a, b) => computeScore(b) - computeScore(a))
    .slice(0, count);
}

export function selectByCategory(
  listings: HomepageListing[],
  category: string,
  count = 8,
): HomepageListing[] {
  return [...listings]
    .filter((l) => l.category === category)
    .sort((a, b) => computeScore(b) - computeScore(a))
    .slice(0, count);
}

export function selectFeatured(listings: HomepageListing[]): HomepageListing | null {
  if (listings.length === 0) return null;
  return [...listings].sort((a, b) => computeScore(b) - computeScore(a))[0];
}

export function getCategoryCounts(listings: HomepageListing[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const l of listings) {
    counts[l.category] = (counts[l.category] ?? 0) + 1;
  }
  return counts;
}
