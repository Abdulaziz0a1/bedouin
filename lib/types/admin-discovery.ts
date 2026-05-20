import type { Season, BoostLevel } from "@/lib/types/discovery";

// ─── Campaign ────────────────────────────────────────────────────────────────

export type CampaignStatus = "active" | "scheduled" | "archived";

export interface AdminCampaign {
  id: string;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  badge_en: string;
  badge_ar: string;
  season: Season | null;
  status: CampaignStatus;
  starts_at: string;   // ISO date string
  ends_at: string;     // ISO date string
  banner_url: string;
  listing_ids: string[];
  created_at: string;
  created_by: string;
}

// ─── Per-listing discovery controls ─────────────────────────────────────────

export interface DiscoveryOverride {
  listing_id: string;
  /** Show in featured / weekend-deals rows. */
  featured: boolean;
  /** Show sponsored badge; counts toward sponsored quota. */
  sponsored: boolean;
  boost_level: BoostLevel;
  /** When set, replaces the computed ranking score on homepage. */
  trending_score_override: number | null;
  /** Pin to the top of its section regardless of score. */
  pinned_to_homepage: boolean;
  /** ISO date — listing is removed from features after this date. */
  featured_until: string | null;
  /** Campaign this listing is attached to, if any. */
  campaign_id: string | null;
  /** Entirely remove from all public discovery surfaces. */
  excluded_from_discovery: boolean;
  updated_at: string;
}

// ─── Analytics snapshot ──────────────────────────────────────────────────────

export interface TopDestinationStat {
  city: string;
  listing_count: number;
  avg_score: number;
}

export interface TopListingStat {
  listing_id: string;
  title: string;
  score: number;
  region: string;
}

export interface DiscoveryAnalytics {
  featured_count: number;
  sponsored_count: number;
  active_campaigns: number;
  boosted_count: number;
  pinned_count: number;
  excluded_count: number;
  top_destinations: TopDestinationStat[];
  top_listings: TopListingStat[];
}

// ─── Future-ready: paid promotions ───────────────────────────────────────────

export type PromotionTier = "basic" | "standard" | "premium";

export interface PromotionPlan {
  id: string;
  listing_id: string;
  tier: PromotionTier;
  price_sar: number;
  boost_level: BoostLevel;
  duration_days: number;
  starts_at: string;
  ends_at: string;
  paid_at: string | null;
  status: "pending_payment" | "active" | "expired" | "cancelled";
}

// ─── Future-ready: campaign performance ──────────────────────────────────────

export interface CampaignPerformance {
  campaign_id: string;
  impressions: number;
  clicks: number;
  bookings: number;
  revenue_sar: number;
  ctr: number;       // clicks / impressions
  conversion: number; // bookings / clicks
}

// ─── Future-ready: homepage impression tracking ───────────────────────────────

export type HomepageSection = "trending" | "deals" | "farms" | "activities";

export interface HomepageImpression {
  id: string;
  listing_id: string;
  section: HomepageSection;
  timestamp: string;
  session_id: string;
}
