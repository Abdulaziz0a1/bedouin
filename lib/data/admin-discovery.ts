import type { DiscoveryOverride, AdminCampaign, DiscoveryAnalytics } from "@/lib/types/admin-discovery";
import { ALL_LISTINGS } from "@/lib/data/listings";
import { computeListingScore, extractCity } from "@/lib/server/discovery/getSeasonalListings";

// ─── Per-listing discovery overrides ─────────────────────────────────────────

export const DISCOVERY_OVERRIDES: DiscoveryOverride[] = [
  {
    listing_id: "alula-stargazing-dome",
    featured: true,
    sponsored: true,
    boost_level: "high",
    trending_score_override: 95,
    pinned_to_homepage: true,
    featured_until: "2026-12-31",
    campaign_id: "winter-escape",
    excluded_from_discovery: false,
    updated_at: "2026-05-01T10:00:00Z",
  },
  {
    listing_id: "alula-rock-dome",
    featured: true,
    sponsored: true,
    boost_level: "high",
    trending_score_override: 88,
    pinned_to_homepage: false,
    featured_until: "2026-12-31",
    campaign_id: "winter-escape",
    excluded_from_discovery: false,
    updated_at: "2026-05-01T10:00:00Z",
  },
  {
    listing_id: "hegra-desert-camp",
    featured: true,
    sponsored: false,
    boost_level: "medium",
    trending_score_override: null,
    pinned_to_homepage: false,
    featured_until: "2026-09-30",
    campaign_id: "winter-escape",
    excluded_from_discovery: false,
    updated_at: "2026-05-03T08:00:00Z",
  },
  {
    listing_id: "asir-highland-cabin",
    featured: true,
    sponsored: false,
    boost_level: "medium",
    trending_score_override: null,
    pinned_to_homepage: false,
    featured_until: "2026-08-31",
    campaign_id: "summer-escape",
    excluded_from_discovery: false,
    updated_at: "2026-05-05T09:00:00Z",
  },
  {
    listing_id: "abha-sky-glamping",
    featured: true,
    sponsored: false,
    boost_level: "low",
    trending_score_override: null,
    pinned_to_homepage: false,
    featured_until: "2026-08-31",
    campaign_id: "summer-escape",
    excluded_from_discovery: false,
    updated_at: "2026-05-05T09:00:00Z",
  },
  {
    listing_id: "strawberry-hill",
    featured: true,
    sponsored: false,
    boost_level: "none",
    trending_score_override: null,
    pinned_to_homepage: false,
    featured_until: null,
    campaign_id: null,
    excluded_from_discovery: false,
    updated_at: "2026-04-20T12:00:00Z",
  },
  {
    listing_id: "jeddah-heritage-riad",
    featured: false,
    sponsored: false,
    boost_level: "none",
    trending_score_override: null,
    pinned_to_homepage: false,
    featured_until: null,
    campaign_id: null,
    excluded_from_discovery: true,
    updated_at: "2026-04-28T14:30:00Z",
  },
];

// ─── Campaigns ───────────────────────────────────────────────────────────────

export const ADMIN_CAMPAIGNS: AdminCampaign[] = [
  {
    id: "winter-escape",
    name_en: "AlUla Winter Escape",
    name_ar: "هروب شتاء العُلا",
    description_en: "Showcase the best of AlUla and Hegra during peak winter tourism season.",
    description_ar: "اعرض أفضل ما في العُلا والحِجر خلال موسم السياحة الشتوية.",
    badge_en: "Winter Deal",
    badge_ar: "عرض شتوي",
    season: "winter",
    status: "active",
    starts_at: "2026-01-01",
    ends_at: "2026-12-31",
    banner_url: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1200&h=400&fit=crop",
    listing_ids: ["alula-stargazing-dome", "alula-rock-dome", "hegra-desert-camp"],
    created_at: "2025-12-15T09:00:00Z",
    created_by: "admin",
  },
  {
    id: "summer-escape",
    name_en: "Summer Highlands Retreat",
    name_ar: "ملاذ هضاب الصيف",
    description_en: "Escape the heat — cool Asir highlands, mountain cabins, and sky glamping.",
    description_ar: "اهرب من الحر — المرتفعات الباردة في عسير وكابينات الجبال وتخييم السماء.",
    badge_en: "Summer Pick",
    badge_ar: "اختيار الصيف",
    season: "summer",
    status: "active",
    starts_at: "2026-05-01",
    ends_at: "2026-09-30",
    banner_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop",
    listing_ids: ["asir-highland-cabin", "abha-sky-glamping"],
    created_at: "2026-04-20T10:00:00Z",
    created_by: "admin",
  },
  {
    id: "spring-farms",
    name_en: "Spring Farm Experience",
    name_ar: "تجربة مزارع الربيع",
    description_en: "Farm stays across Saudi Arabia — rose gardens, apple orchards, date palms.",
    description_ar: "إقامات في المزارع عبر المملكة — حدائق الورود وبساتين التفاح والنخيل.",
    badge_en: "Coming Soon",
    badge_ar: "قريباً",
    season: "spring",
    status: "scheduled",
    starts_at: "2027-02-01",
    ends_at: "2027-05-31",
    banner_url: "https://images.unsplash.com/photo-1444930694458-01babf71870c?w=1200&h=400&fit=crop",
    listing_ids: ["strawberry-hill", "taif-rose-farm", "al-namas-orchard", "albaha-fruit-farm"],
    created_at: "2026-05-10T11:00:00Z",
    created_by: "admin",
  },
  {
    id: "national-day",
    name_en: "National Day Special",
    name_ar: "عرض اليوم الوطني",
    description_en: "Celebrate Saudi National Day with special offers on premium stays.",
    description_ar: "احتفل باليوم الوطني السعودي بعروض خاصة على الإقامات المميزة.",
    badge_en: "National Day",
    badge_ar: "اليوم الوطني",
    season: null,
    status: "archived",
    starts_at: "2025-09-20",
    ends_at: "2025-09-25",
    banner_url: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1200&h=400&fit=crop",
    listing_ids: ["red-sand-glamping", "tabuk-cliff-house"],
    created_at: "2025-09-10T08:00:00Z",
    created_by: "admin",
  },
];

// ─── Analytics computation ────────────────────────────────────────────────────

export function computeDiscoveryAnalytics(): DiscoveryAnalytics {
  const featured = DISCOVERY_OVERRIDES.filter((o) => o.featured);
  const sponsored = DISCOVERY_OVERRIDES.filter((o) => o.sponsored);
  const boosted = DISCOVERY_OVERRIDES.filter((o) => o.boost_level !== "none");
  const pinned = DISCOVERY_OVERRIDES.filter((o) => o.pinned_to_homepage);
  const excluded = DISCOVERY_OVERRIDES.filter((o) => o.excluded_from_discovery);
  const activeCampaigns = ADMIN_CAMPAIGNS.filter((c) => c.status === "active");

  // Top destinations by city: group listings by city, compute avg score
  const cityMap = new Map<string, { scores: number[]; count: number }>();
  for (const listing of ALL_LISTINGS) {
    const city = extractCity(listing.location);
    const score = computeListingScore(listing);
    if (!cityMap.has(city)) cityMap.set(city, { scores: [], count: 0 });
    const entry = cityMap.get(city)!;
    entry.scores.push(score);
    entry.count++;
  }

  const top_destinations = [...cityMap.entries()]
    .map(([city, { scores, count }]) => ({
      city,
      listing_count: count,
      avg_score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    }))
    .sort((a, b) => b.avg_score - a.avg_score)
    .slice(0, 5);

  const top_listings = [...ALL_LISTINGS]
    .map((l) => ({
      listing_id: l.id,
      title: l.title,
      score: computeListingScore(l),
      region: l.region,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return {
    featured_count: featured.length,
    sponsored_count: sponsored.length,
    active_campaigns: activeCampaigns.length,
    boosted_count: boosted.length,
    pinned_count: pinned.length,
    excluded_count: excluded.length,
    top_destinations,
    top_listings,
  };
}

// ─── Lookup helpers ──────────────────────────────────────────────────────────

/** Returns the override for a listing, or a default no-op override. */
export function getOverrideForListing(listing_id: string): DiscoveryOverride {
  return (
    DISCOVERY_OVERRIDES.find((o) => o.listing_id === listing_id) ?? {
      listing_id,
      featured: false,
      sponsored: false,
      boost_level: "none",
      trending_score_override: null,
      pinned_to_homepage: false,
      featured_until: null,
      campaign_id: null,
      excluded_from_discovery: false,
      updated_at: new Date().toISOString(),
    }
  );
}
