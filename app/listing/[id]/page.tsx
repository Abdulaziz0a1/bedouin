import { cache } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import GalleryGrid from "@/components/listing/GalleryGrid";
import BookingCard from "@/components/listing/BookingCard";
import HostCard from "@/components/listing/HostCard";
import AmenitiesGrid from "@/components/listing/AmenitiesGrid";
import ReviewsSection from "@/components/listing/ReviewsSection";
import RelatedListings from "@/components/listing/RelatedListings";
import { createClient } from "@/lib/supabase-server";
import { fetchListingDetail } from "@/lib/services/listing-detail";
import { fetchRelatedListings } from "@/lib/services/listings";
import { fetchWishlistSlugs } from "@/lib/services/wishlist";
import { getListingReviews } from "@/lib/services/reviews";
import WishlistButton from "@/components/listing/WishlistButton";

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
    <div className="min-h-screen bg-[#f4efe6]">

      <main className="pt-[72px]">
        {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
        <div className="max-w-[1232px] mx-auto px-6 lg:px-0 pt-6 pb-3">
          <nav className="flex items-center gap-2 text-xs text-[#64707d]">
            <Link href="/" className="hover:text-[#1a0e02] transition-colors">Home</Link>
            <span>/</span>
            <Link href="/explore" className="hover:text-[#1a0e02] transition-colors">Explore</Link>
            <span>/</span>
            <span className="text-[#1a0e02] font-medium line-clamp-1">{listing.title}</span>
          </nav>
        </div>

        {/* ── Title block ─────────────────────────────────────────────────── */}
        <div className="max-w-[1232px] mx-auto px-6 lg:px-0 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex flex-col gap-1">
              {listing.badge && (
                <span
                  className="self-start text-[11px] font-bold text-white px-2.5 py-1 rounded-xl"
                  style={{ backgroundColor: listing.badgeColor }}
                >
                  {listing.badge}
                </span>
              )}
              <h1 className="font-display font-extrabold text-[#1a0e02] leading-tight"
                  style={{ fontSize: "clamp(1.6rem, 3vw, 2.25rem)" }}>
                {listing.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-[#64707d]">
                <div className="flex items-center gap-1">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="#c49a4f">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span className="font-semibold text-[#1a0e02]">{effectiveScore.toFixed(1)}</span>
                  <span>({effectiveCount} reviews)</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-1">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" fill="#64707d" />
                  </svg>
                  {listing.location}
                </div>
              </div>
            </div>

            {/* Share / Save */}
            <div className="flex items-center gap-2 shrink-0">
              <button className="flex items-center gap-1.5 px-4 py-2 border border-[#e8dfd4] bg-white rounded-xl text-sm font-medium text-[#1a0e02] hover:border-[#8b5e38] transition-colors">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <circle cx="18" cy="5" r="3" stroke="#1a0e02" strokeWidth="1.8" />
                  <circle cx="6" cy="12" r="3" stroke="#1a0e02" strokeWidth="1.8" />
                  <circle cx="18" cy="19" r="3" stroke="#1a0e02" strokeWidth="1.8" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="#1a0e02" strokeWidth="1.8" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="#1a0e02" strokeWidth="1.8" />
                </svg>
                Share
              </button>
              <WishlistButton listingSlug={id} initialSaved={isSaved} />
            </div>
          </div>
        </div>

        {/* ── Gallery ─────────────────────────────────────────────────────── */}
        <div className="max-w-[1232px] mx-auto px-6 lg:px-0 pb-8">
          <GalleryGrid images={listing.images} title={listing.title} />
        </div>

        {/* ── Content + Booking card ───────────────────────────────────────── */}
        <div className="max-w-[1232px] mx-auto px-6 lg:px-0 pb-16">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 items-start">

            {/* ── Left column ─────────────────────────────────────────────── */}
            <div className="flex-1 min-w-0 flex flex-col gap-10">

              {/* Quick stats */}
              <div className="flex flex-wrap gap-6 py-5 border-y border-[#e8dfd4]">
                {[
                  { icon: "👥", label: `${listing.maxGuests} guests max` },
                  { icon: "🛏️", label: `${listing.bedrooms} bedroom${listing.bedrooms !== 1 ? "s" : ""}` },
                  { icon: "🛁", label: `${listing.baths} bath${listing.baths !== 1 ? "s" : ""}` },
                  { icon: "🌙", label: `Min ${listing.minNights} night${listing.minNights !== 1 ? "s" : ""}` },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="text-xl">{icon}</span>
                    <span className="text-sm font-medium text-[#1a0e02]">{label}</span>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div>
                <h2 className="font-display font-bold text-[#1a0e02] text-xl mb-3">About this experience</h2>
                <p className="text-[#2b3037] text-sm leading-[1.8]">{listing.description}</p>
              </div>

              {/* Highlights */}
              {listing.highlights.length > 0 && (
                <div>
                  <h2 className="font-display font-bold text-[#1a0e02] text-xl mb-4">Highlights</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {listing.highlights.map((h) => (
                      <div key={h} className="flex items-start gap-3">
                        <span className="mt-0.5 text-[#c49a4f] shrink-0">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                          </svg>
                        </span>
                        <span className="text-sm text-[#2b3037]">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {listing.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {listing.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-medium text-[#8b5e38] bg-[#fdf5ee] border border-[#f0dcc8] px-3 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Amenities */}
              <div>
                <h2 className="font-display font-bold text-[#1a0e02] text-xl mb-4">What this place offers</h2>
                <AmenitiesGrid amenities={listing.amenities} />
              </div>

              {/* Saudi hospitality tips */}
              <div>
                <h2 className="font-display font-bold text-[#1a0e02] text-xl mb-4">Saudi hospitality tips</h2>
                <div className="bg-white border border-[#e8dfd4] rounded-2xl p-5 flex flex-col gap-3">
                  {[
                    "Ask before taking photos",
                    "Dress comfortably and respectfully",
                    "Arrive on time",
                    "Enjoy Arabic coffee and dates if offered",
                  ].map((tip) => (
                    <div key={tip} className="flex items-start gap-3">
                      <span className="mt-0.5 text-[#c49a4f] shrink-0">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      </span>
                      <span className="text-sm text-[#2b3037]">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* What to expect */}
              <div>
                <h2 className="font-display font-bold text-[#1a0e02] text-xl mb-4">What to expect</h2>
                <div className="flex flex-col">
                  {[
                    { n: 1, label: "Arrive at the location" },
                    { n: 2, label: "Meet your host" },
                    { n: 3, label: "Enjoy the experience" },
                    { n: 4, label: "Leave a review" },
                  ].map(({ n, label }, i) => (
                    <div key={n} className="flex items-start gap-4">
                      <div className="flex flex-col items-center shrink-0">
                        <div className="w-8 h-8 rounded-full bg-[#fdf5ee] border-2 border-[#c49a4f] flex items-center justify-center">
                          <span className="text-xs font-bold text-[#8b5e38]">{n}</span>
                        </div>
                        {i < 3 && <div className="w-px h-6 bg-[#e8dfd4] my-1" />}
                      </div>
                      <p className="text-sm text-[#2b3037] pt-1.5">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* House rules */}
              {listing.houseRules.length > 0 && (
                <div>
                  <h2 className="font-display font-bold text-[#1a0e02] text-xl mb-4">House rules</h2>
                  <div className="flex flex-col gap-2.5">
                    <div className="grid grid-cols-2 gap-2 text-sm text-[#64707d]">
                      <div className="flex items-center gap-2">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="#64707d" strokeWidth="1.8" />
                          <polyline points="12 6 12 12 16 14" stroke="#64707d" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                        Check-in: {listing.checkInTime}
                      </div>
                      <div className="flex items-center gap-2">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="#64707d" strokeWidth="1.8" />
                          <polyline points="12 6 12 12 16 14" stroke="#64707d" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                        Check-out: {listing.checkOutTime}
                      </div>
                    </div>
                    {listing.houseRules.map((rule) => (
                      <div key={rule} className="flex items-start gap-2 text-sm text-[#2b3037]">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0">
                          <circle cx="12" cy="12" r="10" stroke="#e8dfd4" strokeWidth="1.8" />
                          <path d="M15 9l-6 6M9 9l6 6" stroke="#1a0e02" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                        {rule}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Location map link */}
              {listing.mapsUrl && (
                <div>
                  <h2 className="font-display font-bold text-[#1a0e02] text-xl mb-4">Location</h2>
                  <div className="bg-white border border-[#e8dfd4] rounded-2xl p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#fdf5ee] flex items-center justify-center shrink-0 text-[#8b5e38]">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"
                          fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1a0e02]">{listing.location}</p>
                      <p className="text-xs text-[#64707d]">{listing.region} · Exact address shared after booking</p>
                    </div>
                    <a
                      href={listing.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#1a0e02] text-white text-xs font-bold rounded-xl hover:bg-[#2d1a07] transition-colors shrink-0"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <polyline points="15 3 21 3 21 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <line x1="10" y1="14" x2="21" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      View on Maps
                    </a>
                  </div>
                </div>
              )}

              {/* Host */}
              <div>
                <h2 className="font-display font-bold text-[#1a0e02] text-xl mb-5">Meet your host</h2>
                <HostCard
                  host={listing.host}
                  messageHref={
                    user && listing.host.userId && listing.host.userId !== user.id && listing.listingDbId
                      ? `/messages?with=${listing.host.userId}&listing=${listing.listingDbId}`
                      : null
                  }
                />
              </div>

              {/* Divider */}
              <div className="h-px bg-[#e8dfd4]" />

              {/* Reviews */}
              <div>
                <h2 className="font-display font-bold text-[#1a0e02] text-xl mb-6">
                  Guest reviews
                </h2>
                {effectiveReviews.length > 0 ? (
                  <ReviewsSection
                    score={effectiveScore}
                    reviewCount={effectiveCount}
                    reviews={effectiveReviews}
                    breakdown={null}
                  />
                ) : (
                  <div className="flex flex-col gap-1.5 px-5 py-5 bg-white border border-[#e8dfd4] rounded-2xl">
                    <p className="text-sm font-semibold text-[#1a0e02]">
                      Be the first to experience {listing.title} 🌟
                    </p>
                    <p className="text-xs text-[#64707d]">
                      Your story could inspire the next traveler.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Right column: Booking card ───────────────────────────────── */}
            <div className="w-full lg:w-[380px] shrink-0">
              <BookingCard
                price={listing.price}
                originalPrice={listing.originalPrice}
                priceUnit={listing.priceUnit}
                score={effectiveScore}
                reviewCount={effectiveCount}
                minNights={listing.minNights}
                maxGuests={listing.maxGuests}
                listingId={listing.id}
                isOwnListing={!!(user && listing.host.userId && user.id === listing.host.userId)}
              />
            </div>
          </div>
        </div>

        {/* ── Related listings ─────────────────────────────────────────────── */}
        {related.length > 0 && (
          <div className="border-t border-[#e8dfd4] bg-white py-14">
            <div className="max-w-[1232px] mx-auto px-6 lg:px-0">
              <div className="flex items-center justify-between mb-7">
                <h2 className="font-display font-bold text-[#1a0e02] text-xl">
                  You might also like
                </h2>
                <Link
                  href="/explore"
                  className="text-sm font-semibold text-[#8b5e38] hover:text-[#7a5030] transition-colors"
                >
                  View all →
                </Link>
              </div>
              <RelatedListings listings={related} />
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
