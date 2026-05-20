import { cache } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { fetchListingDetail } from "@/lib/services/listing-detail";
import { fetchRelatedListings } from "@/lib/services/listings";
import { fetchWishlistSlugs } from "@/lib/services/wishlist";
import { getListingReviews } from "@/lib/services/reviews";
import ListingDetailContent from "@/components/listing/ListingDetailContent";

// Deduplicated fetch: generateMetadata and the page share one DB call per request.
const getCachedListingDetail = cache(fetchListingDetail);

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const listing = await getCachedListingDetail(id);
  if (!listing) return { title: "Not Found – Bedouin" };
  return {
    title: `${listing.title} – Bedouin`,
    description: listing.description?.slice(0, 150) ?? listing.title,
  };
}

export default async function ListingPage({ params }: Props) {
  const { id } = await params;
  const listing = await getCachedListingDetail(id);
  if (!listing) notFound();

  // Resolve wishlist state server-side so the Save button renders with correct initial state.
  // Parallelise independent fetches
  const supabase = await createClient();
  const [{ data: { user } }, related, realReviews] = await Promise.all([
    supabase.auth.getUser(),
    fetchRelatedListings(id, listing.category, listing.region, 4),
    getListingReviews(id),
  ]);
  const wishlistSlugs = user ? await fetchWishlistSlugs(user.id) : new Set<string>();
  const isSaved = wishlistSlugs.has(id);

  // Use real DB reviews when they exist; fall back to nothing (no fake data shown)
  const effectiveReviews = realReviews.count > 0 ? realReviews.reviews : [];
  const effectiveScore   = realReviews.count > 0 ? (realReviews.avg ?? 0) : listing.score;
  const effectiveCount   = realReviews.count > 0 ? realReviews.count     : listing.reviewCount;

  return (
    <ListingDetailContent
      listing={listing}
      related={related}
      effectiveReviews={effectiveReviews}
      effectiveScore={effectiveScore}
      effectiveCount={effectiveCount}
      isSaved={isSaved}
      userId={user?.id ?? null}
      listingSlug={id}
    />
  );
}
