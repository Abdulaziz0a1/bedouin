import { createClient } from "@/lib/supabase-server";
import type { Listing } from "@/lib/data/listings";

/** Maps a Supabase listings row to the camelCase Listing interface. */
function mapRow(row: Record<string, unknown>): Listing {
  return {
    id:            row.slug as string,
    image:         (row.image as string) || "",
    title:         (row.title as string) ?? "",
    title_ar:      (row.title_ar as string | null) ?? undefined,
    location:      (row.location as string) ?? "",
    location_ar:   (row.location_ar as string | null) ?? undefined,
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

/**
 * Fetches real approved listings from the Supabase `listings` table.
 * Every row in `listings` is approved — records arrive there only after admin
 * approval (see lib/actions/admin.ts).
 * Returns [] when no listings exist or Supabase is unavailable.
 */
export async function fetchListings(): Promise<Listing[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .not("submission_id", "is", null)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) return [];
    return data.map(mapRow);
  } catch {
    return [];
  }
}

/**
 * Fetches related listings from Supabase — same category or same region,
 * excluding the current listing's slug.
 * Returns [] when Supabase is unavailable or no related listings exist.
 */
export async function fetchRelatedListings(
  slug: string,
  category: string,
  region: string,
  limit = 4
): Promise<Listing[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .not("submission_id", "is", null)
      .or(`category.eq.${category},region.eq.${region}`)
      .neq("slug", slug)
      .limit(limit);

    if (error || !data || data.length === 0) return [];
    return data.map(mapRow);
  } catch {
    return [];
  }
}
