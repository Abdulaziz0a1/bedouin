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

    if (error || !data || !data.listing_details) {
      // INTENTIONAL FALLBACK: no Supabase detail row for this slug — using mock data.
      return getListingDetail(slug);
    }

    const d = data.listing_details as unknown as Record<string, unknown>;

    // Normalize: snake_case DB columns + JSONB fields → ListingDetail interface
    const detail: ListingDetail = {
      // Base Listing fields (slug used as id for URL routing compatibility)
      id:            data.slug ?? data.id,
      image:         data.image,
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

      // Detail fields
      images:          (d.images as string[]) ?? [],
      description:     (d.description as string) ?? "",
      highlights:      (d.highlights as string[]) ?? [],
      host:            (d.host as Host),
      amenities:       (d.amenities as Amenity[]) ?? [],
      reviews:         (d.reviews as Review[]) ?? [],
      ratingBreakdown: (d.rating_breakdown as RatingBreakdown),
      maxGuests:       Number(d.max_guests),
      bedrooms:        Number(d.bedrooms),
      beds:            Number(d.beds),
      baths:           Number(d.baths),
      checkInTime:     (d.check_in_time as string) ?? "3:00 PM",
      checkOutTime:    (d.check_out_time as string) ?? "11:00 AM",
      minNights:       Number(d.min_nights),
      houseRules:      (d.house_rules as string[]) ?? [],
    };

    return detail;
  } catch {
    // INTENTIONAL FALLBACK: Supabase client threw unexpectedly — using mock data.
    return getListingDetail(slug);
  }
}
