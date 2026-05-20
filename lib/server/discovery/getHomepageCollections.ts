import { createAdminClient } from "@/lib/supabase-admin";
import type { Category, Listing } from "@/lib/data/listings";
import type { DiscoveryActivityCard, DiscoveryCollection, CollectionCategory } from "@/lib/types/discovery";
import { computeListingScore } from "./getSeasonalListings";

// ─── Listing category → experiential collection mapping ───────────────────────

const CATEGORY_TO_COLLECTION: Record<Category, CollectionCategory> = {
  farms:      "explore",
  cabins:     "explore",
  guesthouse: "shows",
  house:      "shows",
  glamping:   "nightlife",
  doms:       "nightlife",
};

const COLLECTION_META: Record<CollectionCategory, { labelKey: string }> = {
  explore:   { labelKey: "things.cat.explore" },
  shows:     { labelKey: "things.cat.shows" },
  nightlife: { labelKey: "things.cat.nightlife" },
};

const MAX_ACTIVITIES_PER_COLLECTION = 6;

/**
 * Builds activity tile collections from real approved listings.
 * Each listing becomes one activity tile; categories map to three experiential
 * buckets: explore / shows / nightlife.
 * Returns [] when no real approved listings exist.
 */
export async function getHomepageCollections(): Promise<DiscoveryCollection[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("listings")
      .select("id, slug, title, title_ar, category, score, review_count, badge, image, created_at")
      .not("submission_id", "is", null)
      .order("score", { ascending: false });

    if (error || !data || data.length === 0) return [];

    const byCollection = new Map<CollectionCategory, DiscoveryActivityCard[]>();
    for (const cat of ["explore", "shows", "nightlife"] as CollectionCategory[]) {
      byCollection.set(cat, []);
    }

    for (const row of data) {
      const category = row.category as Category;
      const collectionCat = CATEGORY_TO_COLLECTION[category];
      if (!collectionCat) continue;

      const bucket = byCollection.get(collectionCat);
      if (!bucket || bucket.length >= MAX_ACTIVITIES_PER_COLLECTION) continue;

      const slug = (row.slug ?? row.id) as string;
      const scoreLike = {
        score:         Number(row.score ?? 0),
        reviewCount:   Number(row.review_count ?? 0),
        price:         0,
        originalPrice: undefined,
        badge:         (row.badge as string | undefined) ?? undefined,
      } as Pick<Listing, "score" | "reviewCount" | "price" | "originalPrice" | "badge">;

      bucket.push({
        id:            slug,
        name:          { en: (row.title as string) ?? "", ar: (row.title_ar as string | undefined) ?? undefined },
        image:         (row.image as string) || "",
        href:          `/listing/${slug}`,
        ranking_score: computeListingScore(scoreLike as Listing),
      });
    }

    return (["explore", "shows", "nightlife"] as CollectionCategory[])
      .filter((cat) => (byCollection.get(cat)?.length ?? 0) > 0)
      .map((cat) => ({
        category: cat,
        labelKey: COLLECTION_META[cat].labelKey,
        activities: byCollection.get(cat) ?? [],
      }));
  } catch {
    return [];
  }
}
