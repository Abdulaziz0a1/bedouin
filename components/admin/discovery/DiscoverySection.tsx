"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import type { Listing } from "@/lib/data/listings";
import { useLanguage } from "@/context/LanguageProvider";
import { getListingText } from "@/lib/utils/listing-locale";
import type { DiscoveryOverride, AdminCampaign, CampaignStatus, DiscoveryAnalytics } from "@/lib/types/admin-discovery";
import type { BoostLevel, Season } from "@/lib/types/discovery";
import {
  DISCOVERY_OVERRIDES as INITIAL_OVERRIDES,
  ADMIN_CAMPAIGNS as INITIAL_CAMPAIGNS,
  computeDiscoveryAnalytics,
  getOverrideForListing,
} from "@/lib/data/admin-discovery";
import { ALL_LISTINGS } from "@/lib/data/listings";

// ─── Sub-tab type ─────────────────────────────────────────────────────────────

type SubTab = "listings" | "campaigns";

// ─── Boost level config ───────────────────────────────────────────────────────

const BOOST_CONFIG: Record<BoostLevel, { label: string; color: string; bg: string; border: string }> = {
  none:   { label: "None",   color: "text-[#64707d]",  bg: "bg-[#f0e8de]",  border: "border-[#e8dfd4]" },
  low:    { label: "Low",    color: "text-[#0046cc]",  bg: "bg-[#f0f9ff]",  border: "border-[#b3d7ff]" },
  medium: { label: "Medium", color: "text-[#8b6a1f]",  bg: "bg-[#fdf8ee]",  border: "border-[#ead9a6]" },
  high:   { label: "High",   color: "text-[#049153]",  bg: "bg-[#f0faf5]",  border: "border-[#c8ead8]" },
};

const BOOST_ORDER: BoostLevel[] = ["none", "low", "medium", "high"];

// ─── Campaign status config ───────────────────────────────────────────────────

const CAMPAIGN_STATUS_CONFIG: Record<CampaignStatus, { label: string; color: string; bg: string; border: string }> = {
  active:    { label: "Active",    color: "text-[#049153]", bg: "bg-[#f0faf5]", border: "border-[#c8ead8]" },
  scheduled: { label: "Scheduled", color: "text-[#0046cc]", bg: "bg-[#f0f9ff]", border: "border-[#b3d7ff]" },
  archived:  { label: "Archived",  color: "text-[#64707d]", bg: "bg-[#f0e8de]", border: "border-[#e8dfd4]" },
};

const SEASONS: { id: Season | ""; label: string }[] = [
  { id: "",       label: "All seasons" },
  { id: "spring", label: "Spring" },
  { id: "summer", label: "Summer" },
  { id: "autumn", label: "Autumn" },
  { id: "winter", label: "Winter" },
];

// ─── Analytics Strip ─────────────────────────────────────────────────────────

function AnalyticsStrip({ analytics }: { analytics: DiscoveryAnalytics }) {
  const stats = [
    { label: "Featured",         value: analytics.featured_count,   color: "text-[#049153]", bg: "bg-[#f0faf5]" },
    { label: "Sponsored",        value: analytics.sponsored_count,  color: "text-[#0046cc]", bg: "bg-[#f0f9ff]" },
    { label: "Active campaigns", value: analytics.active_campaigns, color: "text-[#8b6a1f]", bg: "bg-[#fdf8ee]" },
    { label: "Boosted",          value: analytics.boosted_count,    color: "text-[#8b5e38]", bg: "bg-[#fdf5ee]" },
    { label: "Pinned",           value: analytics.pinned_count,     color: "text-[#c49a4f]", bg: "bg-[#fefbf3]" },
    { label: "Excluded",         value: analytics.excluded_count,   color: "text-red-600",   bg: "bg-red-50"    },
  ];

  return (
    <div className="px-6 py-3 border-b border-[#f0e8de] flex flex-wrap gap-3 bg-white">
      {stats.map(({ label, value, color, bg }) => (
        <div key={label} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${bg} shrink-0`}>
          <span className={`font-display font-extrabold text-base ${color}`}>{value}</span>
          <span className="text-[10px] text-[#64707d] font-bold uppercase tracking-wide leading-tight">{label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Toggle pill ──────────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  activeColor = "bg-[#049153]",
}: { checked: boolean; onChange: (v: boolean) => void; activeColor?: string }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      className={`relative w-9 h-5 rounded-full transition-colors duration-200 shrink-0 ${checked ? activeColor : "bg-[#e8dfd4]"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${checked ? "translate-x-4" : ""}`} />
    </button>
  );
}

// ─── Boost pills ──────────────────────────────────────────────────────────────

function BoostPills({ value, onChange }: { value: BoostLevel; onChange: (v: BoostLevel) => void }) {
  return (
    <div className="flex gap-1">
      {BOOST_ORDER.map((level) => {
        const cfg = BOOST_CONFIG[level];
        const active = value === level;
        return (
          <button
            key={level}
            onClick={() => onChange(level)}
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all ${
              active
                ? `${cfg.color} ${cfg.bg} ${cfg.border}`
                : "text-[#a09080] bg-white border-[#e8dfd4] hover:border-[#c8b8a8]"
            }`}
          >
            {cfg.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Listing Controls Table ───────────────────────────────────────────────────

function ListingControlsTable({
  listings,
  overrides,
  onUpdateOverride,
  search,
}: {
  listings: Listing[];
  overrides: Map<string, DiscoveryOverride>;
  onUpdateOverride: (listing_id: string, patch: Partial<DiscoveryOverride>) => void;
  search: string;
}) {
  const { lang } = useLanguage();
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return listings;
    return listings.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.location.toLowerCase().includes(q) ||
        l.region.toLowerCase().includes(q)
    );
  }, [listings, search]);

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center text-center py-16 px-6">
        <p className="text-sm text-[#64707d]">No listings match your search.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse min-w-[960px]">
        <thead>
          <tr className="border-b border-[#f0e8de]">
            {["Listing", "Featured", "Sponsored", "Pinned", "Excluded", "Boost", "Score override", "Featured until", "Campaign"].map((h) => (
              <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-[#8b94a4] uppercase tracking-wide whitespace-nowrap bg-white sticky top-0 z-10">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((listing) => {
            const ov = overrides.get(listing.id) ?? getOverrideForListing(listing.id);
            const patch = (p: Partial<DiscoveryOverride>) => onUpdateOverride(listing.id, p);
            return (
              <tr key={listing.id} className={`border-b border-[#f9f5f0] hover:bg-[#fdf9f6] transition-colors ${ov.excluded_from_discovery ? "opacity-50" : ""}`}>
                {/* Listing identity */}
                <td className="px-4 py-3 min-w-[220px]">
                  <div className="flex items-center gap-2.5">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-[#f0e8de]">
                      <Image src={listing.image} alt={listing.title} fill className="object-cover" sizes="40px" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-[#1a0e02] text-xs truncate">{getListingText(listing.title, listing.title_ar, lang)}</p>
                      <p className="text-[10px] text-[#64707d] truncate">{getListingText(listing.location, listing.location_ar, lang)}</p>
                      {ov.pinned_to_homepage && (
                        <span className="text-[9px] font-bold text-[#c49a4f] bg-[#fefbf3] border border-[#f0daa0] px-1.5 py-0.5 rounded-full">PINNED</span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Featured */}
                <td className="px-4 py-3">
                  <Toggle
                    checked={ov.featured}
                    onChange={(v) => patch({ featured: v })}
                    activeColor="bg-[#049153]"
                  />
                </td>

                {/* Sponsored */}
                <td className="px-4 py-3">
                  <Toggle
                    checked={ov.sponsored}
                    onChange={(v) => patch({ sponsored: v })}
                    activeColor="bg-[#0046cc]"
                  />
                </td>

                {/* Pinned */}
                <td className="px-4 py-3">
                  <Toggle
                    checked={ov.pinned_to_homepage}
                    onChange={(v) => patch({ pinned_to_homepage: v })}
                    activeColor="bg-[#c49a4f]"
                  />
                </td>

                {/* Excluded */}
                <td className="px-4 py-3">
                  <Toggle
                    checked={ov.excluded_from_discovery}
                    onChange={(v) => patch({ excluded_from_discovery: v })}
                    activeColor="bg-red-500"
                  />
                </td>

                {/* Boost level */}
                <td className="px-4 py-3">
                  <BoostPills value={ov.boost_level} onChange={(v) => patch({ boost_level: v })} />
                </td>

                {/* Score override */}
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={ov.trending_score_override ?? ""}
                    placeholder="Auto"
                    onChange={(e) => {
                      const raw = e.target.value;
                      patch({ trending_score_override: raw === "" ? null : Math.min(100, Math.max(0, Number(raw))) });
                    }}
                    className="w-20 border border-[#e8dfd4] rounded-xl px-2.5 py-1.5 text-xs text-[#1a0e02] placeholder:text-[#c8b8a8] focus:outline-none focus:border-[#8b5e38] bg-white transition-colors"
                  />
                </td>

                {/* Featured until */}
                <td className="px-4 py-3">
                  <input
                    type="date"
                    value={ov.featured_until ?? ""}
                    onChange={(e) => patch({ featured_until: e.target.value || null })}
                    className="border border-[#e8dfd4] rounded-xl px-2.5 py-1.5 text-xs text-[#1a0e02] focus:outline-none focus:border-[#8b5e38] bg-white transition-colors"
                  />
                </td>

                {/* Campaign */}
                <td className="px-4 py-3 text-[10px] text-[#64707d] whitespace-nowrap">
                  {ov.campaign_id
                    ? <span className="font-semibold text-[#8b5e38]">{ov.campaign_id}</span>
                    : <span className="text-[#c8b8a8]">—</span>
                  }
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Campaign form ────────────────────────────────────────────────────────────

const EMPTY_CAMPAIGN: Omit<AdminCampaign, "id" | "created_at" | "created_by"> = {
  name_en: "",
  name_ar: "",
  description_en: "",
  description_ar: "",
  badge_en: "",
  badge_ar: "",
  season: null,
  status: "scheduled",
  starts_at: "",
  ends_at: "",
  banner_url: "",
  listing_ids: [],
};

function CampaignForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: AdminCampaign | null;
  onSave: (data: Omit<AdminCampaign, "id" | "created_at" | "created_by">) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Omit<AdminCampaign, "id" | "created_at" | "created_by">>(
    initial
      ? {
          name_en: initial.name_en,
          name_ar: initial.name_ar,
          description_en: initial.description_en,
          description_ar: initial.description_ar,
          badge_en: initial.badge_en,
          badge_ar: initial.badge_ar,
          season: initial.season,
          status: initial.status,
          starts_at: initial.starts_at,
          ends_at: initial.ends_at,
          banner_url: initial.banner_url,
          listing_ids: initial.listing_ids,
        }
      : EMPTY_CAMPAIGN
  );

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const toggleListing = (id: string) =>
    set(
      "listing_ids",
      form.listing_ids.includes(id)
        ? form.listing_ids.filter((x) => x !== id)
        : [...form.listing_ids, id]
    );

  const canSave = form.name_en.trim() && form.starts_at && form.ends_at;

  return (
    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display font-bold text-[#1a0e02] text-base">
          {initial ? "Edit Campaign" : "New Campaign"}
        </h3>
        <button onClick={onCancel} className="text-xs text-[#64707d] hover:text-[#1a0e02] transition-colors">
          Cancel
        </button>
      </div>

      {/* Name */}
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-[#8b94a4] uppercase tracking-wide">Name (English)</span>
          <input
            type="text"
            value={form.name_en}
            onChange={(e) => set("name_en", e.target.value)}
            placeholder="AlUla Winter Escape"
            className="border border-[#e8dfd4] rounded-xl px-3 py-2 text-sm text-[#1a0e02] placeholder:text-[#a09080] focus:outline-none focus:border-[#8b5e38] bg-white transition-colors"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-[#8b94a4] uppercase tracking-wide">Name (Arabic)</span>
          <input
            type="text"
            dir="rtl"
            value={form.name_ar}
            onChange={(e) => set("name_ar", e.target.value)}
            placeholder="هروب شتاء العُلا"
            className="border border-[#e8dfd4] rounded-xl px-3 py-2 text-sm text-[#1a0e02] placeholder:text-[#a09080] focus:outline-none focus:border-[#8b5e38] bg-white transition-colors text-right"
          />
        </label>
      </div>

      {/* Badge */}
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-[#8b94a4] uppercase tracking-wide">Badge (English)</span>
          <input
            type="text"
            value={form.badge_en}
            onChange={(e) => set("badge_en", e.target.value)}
            placeholder="Winter Deal"
            className="border border-[#e8dfd4] rounded-xl px-3 py-2 text-sm text-[#1a0e02] placeholder:text-[#a09080] focus:outline-none focus:border-[#8b5e38] bg-white transition-colors"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-[#8b94a4] uppercase tracking-wide">Badge (Arabic)</span>
          <input
            type="text"
            dir="rtl"
            value={form.badge_ar}
            onChange={(e) => set("badge_ar", e.target.value)}
            placeholder="عرض شتوي"
            className="border border-[#e8dfd4] rounded-xl px-3 py-2 text-sm text-[#1a0e02] placeholder:text-[#a09080] focus:outline-none focus:border-[#8b5e38] bg-white transition-colors text-right"
          />
        </label>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold text-[#8b94a4] uppercase tracking-wide">Description (English)</span>
        <textarea
          rows={2}
          value={form.description_en}
          onChange={(e) => set("description_en", e.target.value)}
          placeholder="Showcase the best of AlUla during peak winter season."
          className="border border-[#e8dfd4] rounded-xl px-3 py-2 text-sm text-[#1a0e02] placeholder:text-[#a09080] focus:outline-none focus:border-[#8b5e38] bg-white resize-none transition-colors"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold text-[#8b94a4] uppercase tracking-wide">Description (Arabic)</span>
        <textarea
          rows={2}
          dir="rtl"
          value={form.description_ar}
          onChange={(e) => set("description_ar", e.target.value)}
          placeholder="اعرض أفضل ما في العُلا خلال موسم الشتاء."
          className="border border-[#e8dfd4] rounded-xl px-3 py-2 text-sm text-[#1a0e02] placeholder:text-[#a09080] focus:outline-none focus:border-[#8b5e38] bg-white resize-none transition-colors text-right"
        />
      </div>

      {/* Season + Status */}
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-[#8b94a4] uppercase tracking-wide">Season</span>
          <select
            value={form.season ?? ""}
            onChange={(e) => set("season", (e.target.value as Season) || null)}
            className="border border-[#e8dfd4] rounded-xl px-3 py-2 text-sm text-[#1a0e02] focus:outline-none focus:border-[#8b5e38] bg-white transition-colors"
          >
            {SEASONS.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-[#8b94a4] uppercase tracking-wide">Status</span>
          <select
            value={form.status}
            onChange={(e) => set("status", e.target.value as CampaignStatus)}
            className="border border-[#e8dfd4] rounded-xl px-3 py-2 text-sm text-[#1a0e02] focus:outline-none focus:border-[#8b5e38] bg-white transition-colors"
          >
            <option value="active">Active</option>
            <option value="scheduled">Scheduled</option>
            <option value="archived">Archived</option>
          </select>
        </label>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-[#8b94a4] uppercase tracking-wide">Starts</span>
          <input
            type="date"
            value={form.starts_at}
            onChange={(e) => set("starts_at", e.target.value)}
            className="border border-[#e8dfd4] rounded-xl px-3 py-2 text-sm text-[#1a0e02] focus:outline-none focus:border-[#8b5e38] bg-white transition-colors"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-[#8b94a4] uppercase tracking-wide">Ends</span>
          <input
            type="date"
            value={form.ends_at}
            onChange={(e) => set("ends_at", e.target.value)}
            className="border border-[#e8dfd4] rounded-xl px-3 py-2 text-sm text-[#1a0e02] focus:outline-none focus:border-[#8b5e38] bg-white transition-colors"
          />
        </label>
      </div>

      {/* Banner URL */}
      <label className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold text-[#8b94a4] uppercase tracking-wide">Banner image URL</span>
        <input
          type="text"
          value={form.banner_url}
          onChange={(e) => set("banner_url", e.target.value)}
          placeholder="https://..."
          className="border border-[#e8dfd4] rounded-xl px-3 py-2 text-sm text-[#1a0e02] placeholder:text-[#a09080] focus:outline-none focus:border-[#8b5e38] bg-white transition-colors"
        />
        {form.banner_url && (
          <div className="relative h-20 rounded-xl overflow-hidden border border-[#e8dfd4] mt-1">
            <Image src={form.banner_url} alt="banner preview" fill className="object-cover" sizes="400px" />
          </div>
        )}
      </label>

      {/* Listing selection */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-[#8b94a4] uppercase tracking-wide">
          Listings ({form.listing_ids.length} selected)
        </span>
        <div className="border border-[#e8dfd4] rounded-xl overflow-hidden max-h-48 overflow-y-auto">
          {ALL_LISTINGS.map((l) => {
            const selected = form.listing_ids.includes(l.id);
            return (
              <button
                key={l.id}
                onClick={() => toggleListing(l.id)}
                className={`w-full text-left px-3 py-2.5 flex items-center gap-2.5 border-b border-[#f0e8de] last:border-b-0 transition-colors ${
                  selected ? "bg-[#fdf5ee]" : "hover:bg-[#fdf9f6]"
                }`}
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                  selected ? "bg-[#461e00] border-[#461e00]" : "border-[#e8dfd4] bg-white"
                }`}>
                  {selected && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12l5 5L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#1a0e02] truncate">{l.title}</p>
                  <p className="text-[10px] text-[#64707d] truncate">{l.location}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Save */}
      <button
        onClick={() => { if (canSave) onSave(form); }}
        disabled={!canSave}
        className="w-full py-2.5 rounded-xl bg-[#461e00] text-white text-sm font-bold hover:bg-[#5c2800] disabled:opacity-50 transition-colors"
      >
        {initial ? "Save changes" : "Create campaign"}
      </button>
    </div>
  );
}

// ─── Campaigns panel ──────────────────────────────────────────────────────────

function CampaignsPanel({
  campaigns,
  onUpdate,
  onCreate,
}: {
  campaigns: AdminCampaign[];
  onUpdate: (id: string, patch: Partial<AdminCampaign>) => void;
  onCreate: (data: Omit<AdminCampaign, "id" | "created_at" | "created_by">) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(campaigns[0]?.id ?? null);
  const [creating, setCreating] = useState(false);
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | "all">("all");

  const filtered = statusFilter === "all" ? campaigns : campaigns.filter((c) => c.status === statusFilter);
  const selected = campaigns.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left: campaign queue */}
      <div className="w-[380px] shrink-0 flex flex-col bg-white border-r border-[#e8dfd4] overflow-hidden">
        <div className="px-4 pt-4 pb-3 border-b border-[#f0e8de] flex flex-col gap-3 shrink-0">
          {/* Status filter pills */}
          <div className="flex gap-1 bg-[#f0e8de] rounded-xl p-1">
            {(["all", "active", "scheduled", "archived"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                  statusFilter === s ? "bg-white text-[#1a0e02] shadow-sm" : "text-[#64707d] hover:text-[#1a0e02]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <button
            onClick={() => { setCreating(true); setSelectedId(null); }}
            className="w-full py-2 rounded-xl border-2 border-dashed border-[#e8dfd4] text-xs font-semibold text-[#8b5e38] hover:border-[#8b5e38] hover:bg-[#fdf5ee] transition-all flex items-center justify-center gap-1.5"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            New campaign
          </button>
          <p className="text-[10px] text-[#a09080] font-medium">{filtered.length} campaign{filtered.length !== 1 ? "s" : ""}</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center text-center py-16 px-6">
              <p className="text-sm text-[#64707d]">No campaigns in this view.</p>
            </div>
          ) : (
            filtered.map((campaign) => {
              const sc = CAMPAIGN_STATUS_CONFIG[campaign.status];
              const isSelected = selectedId === campaign.id && !creating;
              return (
                <button
                  key={campaign.id}
                  onClick={() => { setSelectedId(campaign.id); setCreating(false); }}
                  className={`w-full text-left px-4 py-3.5 border-b border-[#f0e8de] flex flex-col gap-1.5 transition-colors ${isSelected ? "bg-[#fdf5ee]" : "hover:bg-[#fdf9f6]"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-[#1a0e02] text-sm truncate">{campaign.name_en}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border shrink-0 ${sc.color} ${sc.bg} ${sc.border}`}>
                      {sc.label}
                    </span>
                  </div>
                  <p className="text-xs text-[#64707d] truncate">{campaign.name_ar}</p>
                  {campaign.season && (
                    <p className="text-[10px] text-[#8b94a4] capitalize">{campaign.season} campaign</p>
                  )}
                  <p className="text-[11px] text-[#a09080]">
                    {new Date(campaign.starts_at).toLocaleDateString()} → {new Date(campaign.ends_at).toLocaleDateString()}
                  </p>
                  <p className="text-[10px] text-[#a09080]">{campaign.listing_ids.length} listing{campaign.listing_ids.length !== 1 ? "s" : ""}</p>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right: campaign detail / form */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {creating ? (
          <CampaignForm
            initial={null}
            onSave={(data) => {
              onCreate(data);
              setCreating(false);
            }}
            onCancel={() => setCreating(false)}
          />
        ) : selected ? (
          <CampaignForm
            initial={selected}
            onSave={(data) => onUpdate(selected.id, data)}
            onCancel={() => setSelectedId(null)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-10">
            <div className="w-16 h-16 rounded-2xl bg-[#f0e8de] flex items-center justify-center text-[#8b5e38] mb-4">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.7" />
                <path d="M8 4V2M16 4V2M3 9h18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="font-display font-semibold text-[#1a0e02] mb-2">Select a campaign</h3>
            <p className="text-sm text-[#64707d] max-w-xs">Choose a campaign from the list to edit it, or create a new one.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main DiscoverySection ────────────────────────────────────────────────────

export default function DiscoverySection() {
  const [subTab, setSubTab] = useState<SubTab>("listings");
  const [listingSearch, setListingSearch] = useState("");

  // Overrides state (keyed by listing_id)
  const [overrides, setOverrides] = useState<Map<string, DiscoveryOverride>>(() => {
    const m = new Map<string, DiscoveryOverride>();
    for (const ov of INITIAL_OVERRIDES) m.set(ov.listing_id, ov);
    return m;
  });

  const [campaigns, setCampaigns] = useState<AdminCampaign[]>(INITIAL_CAMPAIGNS);

  const analytics = useMemo<DiscoveryAnalytics>(() => {
    const ovArr = [...overrides.values()];
    const base = computeDiscoveryAnalytics();
    return {
      featured_count: ovArr.filter((o) => o.featured).length,
      sponsored_count: ovArr.filter((o) => o.sponsored).length,
      active_campaigns: campaigns.filter((c) => c.status === "active").length,
      boosted_count: ovArr.filter((o) => o.boost_level !== "none").length,
      pinned_count: ovArr.filter((o) => o.pinned_to_homepage).length,
      excluded_count: ovArr.filter((o) => o.excluded_from_discovery).length,
      top_destinations: base.top_destinations,
      top_listings: base.top_listings,
    };
  }, [overrides, campaigns]);

  const handleUpdateOverride = (listing_id: string, patch: Partial<DiscoveryOverride>) => {
    setOverrides((prev) => {
      const next = new Map(prev);
      const existing = next.get(listing_id) ?? getOverrideForListing(listing_id);
      next.set(listing_id, { ...existing, ...patch, updated_at: new Date().toISOString() });
      return next;
    });
  };

  const handleUpdateCampaign = (id: string, patch: Partial<AdminCampaign>) => {
    setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const handleCreateCampaign = (data: Omit<AdminCampaign, "id" | "created_at" | "created_by">) => {
    const newCampaign: AdminCampaign = {
      ...data,
      id: `campaign-${Date.now()}`,
      created_at: new Date().toISOString(),
      created_by: "admin",
    };
    setCampaigns((prev) => [newCampaign, ...prev]);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Analytics strip */}
      <AnalyticsStrip analytics={analytics} />

      {/* Sub-tab selector */}
      <div className="bg-white border-b border-[#e8dfd4] px-6 flex items-center gap-1 pt-2">
        {(["listings", "campaigns"] as SubTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setSubTab(t)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors capitalize ${
              subTab === t
                ? "border-[#461e00] text-[#1a0e02]"
                : "border-transparent text-[#64707d] hover:text-[#1a0e02]"
            }`}
          >
            {t === "listings" ? "Listing Controls" : "Campaigns"}
          </button>
        ))}
      </div>

      {/* Listings sub-tab */}
      {subTab === "listings" && (
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {/* Search bar */}
          <div className="px-6 py-3 border-b border-[#f0e8de] shrink-0">
            <div className="relative max-w-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a09080]">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.8" />
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                value={listingSearch}
                onChange={(e) => setListingSearch(e.target.value)}
                placeholder="Search listing, location, region…"
                className="w-full pl-9 pr-3 py-2 border border-[#e8dfd4] rounded-xl text-sm text-[#1a0e02] placeholder:text-[#a09080] focus:outline-none focus:border-[#8b5e38] bg-white transition-colors"
              />
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <ListingControlsTable
              listings={ALL_LISTINGS}
              overrides={overrides}
              onUpdateOverride={handleUpdateOverride}
              search={listingSearch}
            />
          </div>
        </div>
      )}

      {/* Campaigns sub-tab */}
      {subTab === "campaigns" && (
        <CampaignsPanel
          campaigns={campaigns}
          onUpdate={handleUpdateCampaign}
          onCreate={handleCreateCampaign}
        />
      )}
    </div>
  );
}
