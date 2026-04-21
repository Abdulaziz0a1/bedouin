import { createClient } from "@/lib/supabase-server";
import {
  getListingDetail,
  type ListingDetail,
  type Host,
  type Amenity,
  type Review,
  type RatingBreakdown,
} from "@/lib/data/listing-details";

/**
 * Fetches a full listing detail from Supabase by slug.
 *
 * Query strategy:
 *   SELECT listings.*, listing_details.*
 *   FROM listings
 *   JOIN listing_details ON listing_details.listing_id = listings.id
 *   WHERE listings.slug = slug
 *
 * Fallback policy (intentional demo/development behavior):
 *   If the Supabase query fails, the join returns no row, or the slug is not
 *   found in the listings table, the app silently falls back to the mock
 *   getListingDetail() from lib/data/listing-details.ts.
 *   This keeps the detail page functional before the Supabase tables are
 *   seeded, and provides resilience against transient errors in production.
 *   Remove the fallback once both tables are consistently seeded in production.
 *
 * NOTE (technical debt): generateMetadata in app/listing/[id]/page.tsx still
 *   uses the synchronous mock getListingDetail() to avoid a second async call
 *   per request. This should be unified once a caching layer (e.g. unstable_cache
 *   or React cache()) is in place so both metadata and page share a single fetch.
 */
export async function fetchListingDetail(slug: string): Promise<ListingDetail | null> {
  try {
    const supabase = await createClient();

    // Join listings + listing_details on internal UUID, filter by public slug
    const { data, error } = await supabase
      .from("listings")
      .select(`
        id,
        slug,
        image,
        title,
        location,
        region,
        category,
        price,
        original_price,
        price_unit,
        score,
        review_count,
        badge,
        badge_color,
        tags,
        maps_url,
        max_guests,
        bedrooms,
        beds,
        baths,
        check_in_time,
        check_out_time,
        min_nights,
        listing_details (
          images,
          description,
          highlights,
          host,
          amenities,
          reviews,
          rating_breakdown,
          max_guests,
          bedrooms,
          beds,
          baths,
          check_in_time,
          check_out_time,
          min_nights,
          house_rules
        )
      `)
      .eq("slug", slug)
      .single();

    if (error || !data) {
      // Listing not found in DB at all — fall back to mock (handles seeded slugs).
      return getListingDetail(slug);
    }

    // Listing exists in DB. Supabase may return listing_details as a single object
    // (one-to-one UNIQUE FK) or as an array (PostgREST default). Handle both.
    // If listing_details is missing entirely, use {} so we render with safe defaults
    // instead of falling back to mock (which returns null for unknown slugs → 404).
    const rawDetails = data.listing_details;
    const d: Record<string, unknown> = (() => {
      if (!rawDetails) return {};
      if (Array.isArray(rawDetails)) return (rawDetails[0] as Record<string, unknown>) ?? {};
      return rawDetails as unknown as Record<string, unknown>;
    })();

    // Safely map the host JSONB from the DB to the full Host interface.
    // The DB stores a compact shape: {name, avatar, tagline, since, responseRate, superhost}.
    // We backfill the richer fields with safe defaults so HostCard never crashes.
    const dbHost = (d.host as Record<string, unknown>) ?? {};
    const mappedHost: Host = {
      name:         (dbHost.name         as string)   || "Host",
      avatar:       (dbHost.avatar       as string)   || "",
      joinedYear:   parseInt(String(dbHost.since ?? new Date().getFullYear())) || new Date().getFullYear(),
      reviewCount:  (dbHost.reviewCount  as number)   || 0,
      responseRate: (dbHost.responseRate as number)   ?? 100,
      responseTime: (dbHost.responseTime as string)   || "within a day",
      languages:    (dbHost.languages    as string[]) || ["Arabic", "English"],
      bio:          (dbHost.bio          as string)   || (dbHost.tagline as string) || "Verified Bedouin host.",
      superhost:    (dbHost.superhost    as boolean)  || false,
    };

    // Normalize: snake_case DB columns + JSONB fields → ListingDetail interface
    const detail: ListingDetail = {
      // Base Listing fields (slug used as id for URL routing compatibility)
      id:            data.slug ?? data.id,
      image:         data.image || `https://picsum.photos/seed/${data.slug ?? data.id}/600/440`,
      title:         data.title,
      location:      data.location,
      region:        data.region as ListingDetail["region"],
      category:      data.category as ListingDetail["category"],
      price:         Number(data.price),
      originalPrice: data.original_price ?? undefined,
      priceUnit:     data.price_unit ?? undefined,
      score:         Number(data.score),
      reviewCount:   Number(data.review_count),
      badge:         data.badge ?? undefined,
      badgeColor:    data.badge_color ?? undefined,
      tags:          (data.tags as string[]) ?? [],

      // Detail fields — filter empty strings; fall back to hero if gallery is empty
      images: (() => {
        const raw = (d.images as string[]) ?? [];
        const valid = raw.filter((u) => u && u.startsWith("http"));
        const fallback = data.image || `https://picsum.photos/seed/${data.slug ?? data.id}/600/440`;
        return valid.length > 0 ? valid : [fallback];
      })(),
      description:     (d.description as string) ?? "",
      highlights:      (d.highlights as string[]) ?? [],
      host:            mappedHost,
      amenities:       (d.amenities as Amenity[]) ?? [],
      reviews:         (d.reviews as Review[]) ?? [],
      ratingBreakdown: (d.rating_breakdown as RatingBreakdown) ?? null,
      // Fall back to the denormalized values on the listings row when details are missing.
      maxGuests:       Number(d.max_guests)  || Number(data.max_guests)  || 1,
      bedrooms:        Number(d.bedrooms)    || Number(data.bedrooms)    || 0,
      beds:            Number(d.beds)        || Number(data.beds)        || 1,
      baths:           Number(d.baths)       || Number(data.baths)       || 1,
      checkInTime:     (d.check_in_time  as string) || (data.check_in_time  as string) || "3:00 PM",
      checkOutTime:    (d.check_out_time as string) || (data.check_out_time as string) || "11:00 AM",
      minNights:       Number(d.min_nights)  || Number(data.min_nights)  || 1,
      houseRules:      (d.house_rules as string[]) ?? [],
      mapsUrl:         (data.maps_url as string | null) ?? undefined,
    };

    return detail;
  } catch {
    // INTENTIONAL FALLBACK: Supabase client threw unexpectedly — using mock data.
    return getListingDetail(slug);
  }
}
