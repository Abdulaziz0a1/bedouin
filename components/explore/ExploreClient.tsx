"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ui/ProductCard";
import RatingBadge from "@/components/ui/RatingBadge";
import {
  CATEGORIES,
  REGIONS,
  PRICE_RANGES,
  filterListings,
  type Listing,
} from "@/lib/data/listings";

/* ─── Icon primitives ────────────────────────────────────────────────────── */

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
  </svg>
);
const ChevronDown = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9l6 6 6-6" />
  </svg>
);
const GridIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);
const ListIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="9" y1="6" x2="21" y2="6" /><line x1="9" y1="12" x2="21" y2="12" /><line x1="9" y1="18" x2="21" y2="18" />
    <circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);
const XIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);
const PinIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" fill="currentColor" />
  </svg>
);

/* ─── Sort options ───────────────────────────────────────────────────────── */

const SORT_OPTIONS = [
  { id: "popular",    label: "Most Popular"   },
  { id: "rating",     label: "Top Rated"      },
  { id: "price-asc",  label: "Price: Low–High" },
  { id: "price-desc", label: "Price: High–Low" },
];

/* ─── Styled native select ───────────────────────────────────────────────── */

function FilterSelect({
  value, onChange, options, label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { id: string; label: string }[];
  label: string;
}) {
  const isActive = value !== options[0].id;
  return (
    <div className="relative shrink-0">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 appearance-none pl-3.5 pr-7 rounded-xl border text-sm font-medium cursor-pointer outline-none transition-all"
        style={{
          borderColor:  isActive ? "#c49a4f"  : "#e8dfd4",
          color:        isActive ? "#8b5e38"  : "#5a4a3a",
          background:   isActive ? "#fdf8f0"  : "white",
          boxShadow:    isActive ? "0 0 0 1px #c49a4f40" : "none",
        }}
        aria-label={label}
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>{o.label}</option>
        ))}
      </select>
      <span
        className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: isActive ? "#c49a4f" : "#9b8878" }}
      >
        <ChevronDown />
      </span>
    </div>
  );
}

/* ─── Active filter chip ─────────────────────────────────────────────────── */

function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="flex items-center gap-1.5 bg-[#fdf8f0] border border-[#e8c89a] text-[#8b5e38] text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-[#f5e4c8] hover:border-[#c49a4f] transition-all group"
    >
      {label}
      <span className="opacity-50 group-hover:opacity-100 transition-opacity"><XIcon /></span>
    </button>
  );
}

/* ─── List view card ─────────────────────────────────────────────────────── */

function ListCard({ listing }: { listing: Listing }) {
  const [saved, setSaved] = useState(false);

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="bg-white border border-[#e8dfd4] rounded-2xl overflow-hidden flex group hover:shadow-[0_6px_28px_rgba(70,30,0,0.11)] hover:-translate-y-px transition-all duration-300"
      style={{ minHeight: 160 }}
    >
      {/* Image */}
      <div className="relative shrink-0 w-[220px] sm:w-[280px] overflow-hidden">
        <Image
          src={listing.image}
          alt={listing.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="280px"
        />
        {listing.badge && (
          <span
            className="absolute top-3 left-3 text-[10px] font-bold text-white px-2.5 py-1 rounded-xl shadow-sm"
            style={{ backgroundColor: listing.badgeColor }}
          >
            {listing.badge}
          </span>
        )}
        {/* Wishlist */}
        <button
          aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
          type="button"
          onClick={(e) => { e.preventDefault(); setSaved((v) => !v); }}
          className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full w-7 h-7 flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 21S3 14 3 8.5C3 5.42 5.42 3 8.5 3 10.24 3 11.91 3.81 13 5.09 14.09 3.81 15.76 3 17.5 3 20.58 3 23 5.42 23 8.5 23 14 12 21 12 21z"
              stroke={saved ? "#c0392b" : "#8b5e38"}
              fill={saved ? "#c0392b" : "none"}
              strokeWidth="1.7"
            />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-1.5 px-5 py-4 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <RatingBadge score={listing.score} reviewCount={listing.reviewCount} />
          <span className="font-display font-bold text-[#1a0e02] text-xl leading-none shrink-0">
            SAR {listing.price}
            <span className="text-[#64707d] text-xs font-normal ml-1">/ person</span>
          </span>
        </div>

        <h3 className="font-display font-bold text-[#1a0e02] text-lg leading-snug mt-1">
          {listing.title}
        </h3>

        <div className="flex items-center gap-1 text-[#64707d] text-sm">
          <PinIcon />
          <span className="truncate">{listing.location}</span>
        </div>

        {listing.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {listing.tags.slice(0, 4).map((t) => (
              <span
                key={t}
                className="text-[11px] font-medium text-[#8b5e38] bg-[#fdf5ee] border border-[#f0dcc8] px-2.5 py-0.5 rounded-full"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {listing.originalPrice && (
          <p className="mt-auto text-sm text-[#a09080]">
            <span className="line-through">SAR {listing.originalPrice}</span>
            <span className="text-[#049153] font-semibold ml-2">
              Save SAR {listing.originalPrice - listing.price}
            </span>
          </p>
        )}
      </div>
    </Link>
  );
}

/* ─── Empty state ────────────────────────────────────────────────────────── */

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-28 text-center">
      <div className="w-20 h-20 bg-[#fdf5ee] border border-[#f0dcc8] rounded-3xl flex items-center justify-center mb-6">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="8" stroke="#c49a4f" strokeWidth="1.6" />
          <path d="M21 21l-4.35-4.35" stroke="#c49a4f" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M8 11h6M11 8v6" stroke="#c49a4f" strokeWidth="1.4" strokeLinecap="round" opacity=".5" />
        </svg>
      </div>
      <h3 className="font-display font-bold text-[#1a0e02] text-2xl mb-2">
        No experiences found
      </h3>
      <p className="text-[#64707d] text-base mb-8 max-w-xs leading-relaxed">
        Try adjusting your filters or searching with different keywords.
      </p>
      <button
        type="button"
        onClick={onClear}
        style={{ color: "#fff" }}
        className="px-7 py-3 bg-[#8b5e38] font-semibold rounded-xl hover:bg-[#7a5030] active:bg-[#6a4228] transition-colors"
      >
        Clear all filters
      </button>
    </div>
  );
}

/* ─── Main ExploreClient ─────────────────────────────────────────────────── */

export default function ExploreClient({
  initialQuery = "",
  initialRegion = "",
  initialListings,
}: {
  initialQuery?: string;
  initialRegion?: string;
  initialListings: Listing[];
}) {
  const [query,      setQuery]      = useState(initialQuery);
  const [category,   setCategory]   = useState("all");
  const [region,     setRegion]     = useState(initialRegion || "All");
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy,     setSortBy]     = useState("popular");
  const [viewMode,   setViewMode]   = useState<"grid" | "list">("grid");

  const results = useMemo(
    () => filterListings(initialListings, { query, category, region, priceRange, sortBy }),
    [initialListings, query, category, region, priceRange, sortBy]
  );

  const clearAll = useCallback(() => {
    setQuery("");
    setCategory("all");
    setRegion("All");
    setPriceRange("all");
    setSortBy("popular");
  }, []);

  const activeFilters: { label: string; clear: () => void }[] = [];
  if (category !== "all")
    activeFilters.push({ label: CATEGORIES.find((c) => c.id === category)?.label ?? category, clear: () => setCategory("all") });
  if (region !== "All")
    activeFilters.push({ label: region, clear: () => setRegion("All") });
  if (priceRange !== "all")
    activeFilters.push({ label: PRICE_RANGES.find((p) => p.id === priceRange)?.label ?? priceRange, clear: () => setPriceRange("all") });

  const regionOptions = REGIONS.map((r) => ({ id: r, label: r === "All" ? "All Regions" : r }));
  const hasFilters = activeFilters.length > 0 || query !== "";

  return (
    <>
      {/* ── Sticky filter bar ───────────────────────────────────────────── */}
      <div
        className="sticky z-30 bg-white/98 backdrop-blur-sm border-b border-[#e8dfd4]"
        style={{ top: "72px", boxShadow: "0 2px 16px rgba(70,30,0,0.07)" }}
      >
        <div className="max-w-[1232px] mx-auto px-6 lg:px-0">

          {/* Row 1 — Search + Sort + View */}
          <div className="flex items-center gap-3 pt-3 pb-2.5">
            {/* Search */}
            <div className="relative flex-1 max-w-[440px]">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9b8878] pointer-events-none">
                <SearchIcon />
              </span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search experiences, locations, tags…"
                className="w-full h-10 pl-10 pr-10 text-sm border border-[#e8dfd4] rounded-xl bg-[#fdfaf7] outline-none transition-all"
                style={{ color: "#1a0e02" }}
                onFocus={(e) => (e.target.style.borderColor = "#c49a4f")}
                onBlur={(e) => (e.target.style.borderColor = "#e8dfd4")}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9b8878] hover:text-[#1a0e02] transition-colors"
                  aria-label="Clear search"
                >
                  <XIcon />
                </button>
              )}
            </div>

            <div className="flex-1" />

            {/* Sort */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[#9b8878] hidden sm:block">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 6h18M7 12h10M11 18h2" />
                </svg>
              </span>
              <FilterSelect value={sortBy} onChange={setSortBy} options={SORT_OPTIONS} label="Sort by" />
            </div>

            {/* View toggle */}
            <div
              className="flex items-center rounded-xl overflow-hidden border border-[#e8dfd4] shrink-0"
              role="group"
              aria-label="View mode"
            >
              {(["grid", "list"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setViewMode(v)}
                  aria-label={v === "grid" ? "Grid view" : "List view"}
                  aria-pressed={viewMode === v}
                  className="w-9 h-9 flex items-center justify-center transition-colors"
                  style={{
                    background: viewMode === v ? "#8b5e38" : "white",
                    color:      viewMode === v ? "white"    : "#9b8878",
                  }}
                >
                  {v === "grid" ? <GridIcon /> : <ListIcon />}
                </button>
              ))}
            </div>
          </div>

          {/* Row 2 — Categories + dropdowns */}
          <div className="flex items-center gap-2.5 pb-3 overflow-x-auto scrollbar-hide">
            {/* Category chip bar — same pill-container as SearchSection */}
            <div className="flex items-center bg-[#f5f1ec] rounded-2xl p-1 gap-0.5 shrink-0">
              {CATEGORIES.map((cat) => {
                const active = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className="px-3.5 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all"
                    style={{
                      background:  active ? "#1c1510"  : "transparent",
                      color:       active ? "#fff"     : "#5a4a3a",
                      boxShadow:   active ? "0 1px 4px rgba(0,0,0,0.18)" : "none",
                    }}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Separator */}
            <div className="w-px h-7 bg-[#e8dfd4] shrink-0 mx-0.5" />

            {/* Dropdown filters */}
            <FilterSelect value={region}     onChange={setRegion}     options={regionOptions} label="Region"      />
            <FilterSelect value={priceRange} onChange={setPriceRange} options={PRICE_RANGES}  label="Price range" />
          </div>
        </div>
      </div>

      {/* ── Content area ────────────────────────────────────────────────── */}
      <div className="bg-[#f4efe6] min-h-[60vh]">
        <div className="max-w-[1232px] mx-auto px-6 lg:px-0 py-7 flex flex-col gap-5">

          {/* Results meta row */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <p className="text-sm text-[#64707d]">
                <span className="font-bold text-[#1a0e02] text-base">{results.length}</span>
                {"  "}experience{results.length !== 1 ? "s" : ""} found
              </p>

              {/* Active filter chips */}
              {activeFilters.map(({ label, clear }) => (
                <ActiveChip key={label} label={label} onRemove={clear} />
              ))}

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-xs font-semibold text-[#8b5e38] hover:text-[#6a4228] transition-colors underline underline-offset-2"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Grid / List results */}
          {results.length === 0 ? (
            <EmptyState onClear={clearAll} />
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {results.map((listing) => (
                <ProductCard
                  key={listing.id}
                  {...listing}
                  className="w-full"
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4 max-w-[860px]">
              {results.map((listing) => (
                <ListCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
