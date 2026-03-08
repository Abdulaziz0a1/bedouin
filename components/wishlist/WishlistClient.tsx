"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  WISHLIST_ITEMS,
  RECOMMENDED_LISTINGS,
  getWishlistCategories,
  getWishlistRegions,
} from "@/lib/data/wishlist";
import type { SavedListing } from "@/lib/types/user";
import WishlistCard from "./WishlistCard";
import WishlistEmpty from "./WishlistEmpty";

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────

type SortKey   = "recent" | "price_asc" | "price_desc" | "rating";
type ViewMode  = "grid" | "list";

interface ActiveFilters {
  category: string;
  region:   string;
  maxPrice: number | null;
}

const SORT_OPTIONS: { id: SortKey; label: string }[] = [
  { id: "recent",     label: "Recently saved" },
  { id: "price_asc",  label: "Price: Low – High" },
  { id: "price_desc", label: "Price: High – Low" },
  { id: "rating",     label: "Highest rated" },
];

const MAX_PRICE_OPTIONS = [
  { label: "Any price", value: null },
  { label: "Under SAR 300", value: 300 },
  { label: "Under SAR 500", value: 500 },
  { label: "Under SAR 800", value: 800 },
];

// ──────────────────────────────────────────────────────────────────────────────
// Sort helper
// ──────────────────────────────────────────────────────────────────────────────

function sortItems(items: SavedListing[], key: SortKey): SavedListing[] {
  return [...items].sort((a, b) => {
    switch (key) {
      case "price_asc":  return a.price - b.price;
      case "price_desc": return b.price - a.price;
      case "rating":     return b.score - a.score;
      default:           return b.savedAt.localeCompare(a.savedAt); // recent
    }
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────────────────────

function ViewToggle({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {
  return (
    <div className="flex items-center gap-0.5 bg-[#f0e8de] rounded-xl p-1">
      {(["grid", "list"] as ViewMode[]).map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          aria-label={`${m} view`}
          className={[
            "w-8 h-8 flex items-center justify-center rounded-lg transition-all",
            mode === m ? "bg-white text-[#1a0e02] shadow-sm" : "text-[#a09080] hover:text-[#64707d]",
          ].join(" ")}
        >
          {m === "grid" ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <rect x="3" y="3" width="18" height="4" rx="1" />
              <rect x="3" y="10" width="18" height="4" rx="1" />
              <rect x="3" y="17" width="18" height="4" rx="1" />
            </svg>
          )}
        </button>
      ))}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
  count,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold border transition-all whitespace-nowrap",
        active
          ? "bg-[#1a0e02] text-white border-transparent"
          : "bg-white text-[#64707d] border-[#e8dfd4] hover:border-[#8b5e38] hover:text-[#8b5e38]",
      ].join(" ")}
    >
      {label}
      {count !== undefined && (
        <span className={`text-[10px] font-bold ${active ? "opacity-60" : "text-[#a09080]"}`}>
          {count}
        </span>
      )}
    </button>
  );
}

function UndoToast({ title, onUndo }: { title: string; onUndo: () => void }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-[#1a0e02] text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
      <span className="truncate max-w-[200px]">Removed &ldquo;{title}&rdquo;</span>
      <button
        onClick={onUndo}
        className="text-[#c49a4f] font-bold hover:text-white transition-colors shrink-0"
      >
        Undo
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main client component
// ──────────────────────────────────────────────────────────────────────────────

export default function WishlistClient() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [items,      setItems]      = useState<SavedListing[]>(WISHLIST_ITEMS);
  const [sort,       setSort]       = useState<SortKey>("recent");
  const [viewMode,   setViewMode]   = useState<ViewMode>("grid");
  const [filters,    setFilters]    = useState<ActiveFilters>({ category: "", region: "", maxPrice: null });
  const [toast,      setToast]      = useState<{ id: string; title: string; snapshot: SavedListing[] } | null>(null);

  // ── Derived helpers ────────────────────────────────────────────────────────
  const allCategories = useMemo(() => getWishlistCategories(WISHLIST_ITEMS), []);
  const allRegions    = useMemo(() => getWishlistRegions(WISHLIST_ITEMS), []);

  const filtered = useMemo(() => {
    let result = items;
    if (filters.category) result = result.filter((i) => i.category === filters.category);
    if (filters.region)   result = result.filter((i) => i.region   === filters.region);
    if (filters.maxPrice) result = result.filter((i) => i.price     < filters.maxPrice!);
    return sortItems(result, sort);
  }, [items, filters, sort]);

  const hasActiveFilters =
    !!filters.category || !!filters.region || !!filters.maxPrice;

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleRemove = (id: string) => {
    const removed = items.find((i) => i.id === id);
    if (!removed) return;
    const snapshot = [...items];
    setItems((prev) => prev.filter((i) => i.id !== id));

    // Show undo toast for 4 s
    if (toast?.id) clearTimeout(undefined);
    setToast({ id, title: removed.title, snapshot });
    setTimeout(() => setToast(null), 4000);
  };

  const handleUndo = () => {
    if (toast) {
      setItems(toast.snapshot);
      setToast(null);
    }
  };

  const clearFilters = () =>
    setFilters({ category: "", region: "", maxPrice: null });

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f4efe6]">

      {/* ── Page hero / header ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#e8dfd4]">
        <div className="max-w-[1232px] mx-auto px-6 lg:px-0 pt-10 pb-8">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-[#64707d] mb-5">
            <Link href="/" className="hover:text-[#8b5e38] transition-colors">Home</Link>
            <span>›</span>
            <Link href="/account" className="hover:text-[#8b5e38] transition-colors">My account</Link>
            <span>›</span>
            <span className="text-[#1a0e02] font-medium">Wishlist</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
            <div>
              <p className="text-[#c49a4f] text-xs font-bold uppercase tracking-[0.16em] mb-1.5">My Wishlist</p>
              <h1 className="font-display font-extrabold text-[#1a0e02] text-4xl leading-tight">
                Saved Places
              </h1>
              <p className="text-[#64707d] text-sm mt-2">
                {items.length > 0
                  ? `${items.length} listing${items.length !== 1 ? "s" : ""} saved · Ready to book your next experience`
                  : "Save your favourite listings and come back anytime"}
              </p>
            </div>

            {items.length > 0 && (
              <Link
                href="/explore"
                className="sm:shrink-0 inline-flex items-center gap-2 px-5 py-3 bg-[#8b5e38] text-white text-sm font-semibold rounded-2xl hover:bg-[#7a5030] transition-colors shadow-sm"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                Explore more
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Controls bar ───────────────────────────────────────────────────── */}
      {items.length > 0 && (
        <div className="bg-white border-b border-[#e8dfd4] sticky top-[72px] z-30">
          <div className="max-w-[1232px] mx-auto px-6 lg:px-0">

            {/* Category filter chips (scrollable on mobile) */}
            <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide -mx-6 px-6 lg:mx-0 lg:px-0">
              <FilterChip
                label="All"
                active={!filters.category}
                onClick={() => setFilters((f) => ({ ...f, category: "" }))}
                count={items.length}
              />
              {allCategories.map((cat) => {
                const count = items.filter((i) => i.category === cat).length;
                return (
                  <FilterChip
                    key={cat}
                    label={cat}
                    active={filters.category === cat}
                    onClick={() =>
                      setFilters((f) => ({ ...f, category: f.category === cat ? "" : cat }))
                    }
                    count={count}
                  />
                );
              })}
            </div>

            {/* Sort + region + price + view controls */}
            <div className="flex items-center gap-3 pb-3 flex-wrap">

              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#64707d] font-medium shrink-0">Sort:</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="text-sm font-semibold text-[#1a0e02] bg-white border border-[#e8dfd4] rounded-xl px-3 py-2 focus:outline-none focus:border-[#8b5e38] cursor-pointer"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.id} value={o.id}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* Region filter */}
              <select
                value={filters.region}
                onChange={(e) => setFilters((f) => ({ ...f, region: e.target.value }))}
                className="text-sm text-[#1a0e02] bg-white border border-[#e8dfd4] rounded-xl px-3 py-2 focus:outline-none focus:border-[#8b5e38] appearance-none cursor-pointer"
              >
                <option value="">All regions</option>
                {allRegions.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>

              {/* Price filter */}
              <select
                value={filters.maxPrice ?? ""}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, maxPrice: e.target.value ? Number(e.target.value) : null }))
                }
                className="text-sm text-[#1a0e02] bg-white border border-[#e8dfd4] rounded-xl px-3 py-2 focus:outline-none focus:border-[#8b5e38] appearance-none cursor-pointer"
              >
                {MAX_PRICE_OPTIONS.map((o) => (
                  <option key={o.label} value={o.value ?? ""}>{o.label}</option>
                ))}
              </select>

              {/* Clear filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors flex items-center gap-1"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                  </svg>
                  Clear filters
                </button>
              )}

              {/* Spacer */}
              <div className="flex-1" />

              {/* Results count */}
              <p className="text-xs text-[#64707d] shrink-0">
                {filtered.length} of {items.length}
              </p>

              {/* View toggle */}
              <ViewToggle mode={viewMode} onChange={setViewMode} />
            </div>
          </div>
        </div>
      )}

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <div className="max-w-[1232px] mx-auto px-6 lg:px-0 py-10">

        {items.length === 0 ? (
          <WishlistEmpty recommended={RECOMMENDED_LISTINGS} />
        ) : filtered.length === 0 ? (
          /* No results for active filters */
          <div className="flex flex-col items-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#f0e8de] flex items-center justify-center text-[#8b5e38] mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.6" />
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M8 11h6M11 8v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="font-display font-semibold text-[#1a0e02] text-base mb-1.5">No listings match</h3>
            <p className="text-sm text-[#64707d] max-w-xs mb-5">
              Try adjusting your filters to find something you&apos;ve saved.
            </p>
            <button
              onClick={clearFilters}
              className="px-5 py-2.5 bg-[#8b5e38] text-white text-sm font-semibold rounded-xl hover:bg-[#7a5030] transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            {/* Grid or list */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((listing) => (
                  <WishlistCard
                    key={listing.id}
                    listing={listing}
                    onRemove={handleRemove}
                    layout="grid"
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filtered.map((listing) => (
                  <WishlistCard
                    key={listing.id}
                    listing={listing}
                    onRemove={handleRemove}
                    layout="list"
                  />
                ))}
              </div>
            )}

            {/* Recommendations section — shown below the grid */}
            {RECOMMENDED_LISTINGS.length > 0 && (
              <section className="mt-16 pt-10 border-t border-[#e8dfd4]">
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <p className="text-[#c49a4f] text-[10px] font-bold uppercase tracking-[0.16em] mb-1">
                      You might also love
                    </p>
                    <h2 className="font-display font-extrabold text-[#1a0e02] text-2xl">
                      Recommended for you
                    </h2>
                    <p className="text-[#64707d] text-sm mt-1">
                      Handpicked experiences based on your taste
                    </p>
                  </div>
                  <Link
                    href="/explore"
                    className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-[#8b5e38] hover:underline shrink-0"
                  >
                    Explore all
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                  {RECOMMENDED_LISTINGS.map((rec) => {
                    const discountPct =
                      rec.originalPrice && rec.originalPrice > rec.price
                        ? Math.round(((rec.originalPrice - rec.price) / rec.originalPrice) * 100)
                        : 0;

                    const BADGE_COLORS: Record<string, string> = {
                      Trending: "bg-[#0046cc]",
                      Deal:     "bg-red-500",
                      New:      "bg-[#049153]",
                    };

                    return (
                      <Link
                        key={rec.id}
                        href={`/listing/${rec.id}`}
                        className="bg-white border border-[#e8dfd4] rounded-2xl overflow-hidden flex flex-col group hover:shadow-[0_8px_28px_rgba(70,30,0,0.11)] hover:-translate-y-0.5 transition-all duration-300"
                      >
                        <div className="relative w-full h-[165px] overflow-hidden">
                          <img
                            src={rec.imageUrl}
                            alt={rec.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <span className="absolute bottom-2 left-2 text-[10px] font-bold text-white bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full z-10">
                            {rec.category}
                          </span>
                          {rec.badge ? (
                            <span className={`absolute top-2 left-2 text-[10px] font-bold text-white px-2.5 py-1 rounded-xl z-10 ${BADGE_COLORS[rec.badge] ?? "bg-[#8b5e38]"}`}>
                              {rec.badge}
                            </span>
                          ) : discountPct > 0 ? (
                            <span className="absolute top-2 left-2 text-[10px] font-bold text-white bg-red-500 px-2.5 py-1 rounded-xl z-10">
                              {discountPct}% off
                            </span>
                          ) : null}
                        </div>
                        <div className="px-3.5 pt-3 pb-3.5 flex flex-col gap-1.5 flex-1">
                          <h3 className="font-display font-semibold text-[#1a0e02] text-sm leading-snug line-clamp-2 group-hover:text-[#8b5e38] transition-colors">
                            {rec.title}
                          </h3>
                          <p className="text-[11px] text-[#64707d] flex items-center gap-1 truncate">
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
                              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
                            </svg>
                            {rec.location}
                          </p>
                          <div className="mt-auto pt-2.5 border-t border-[#f0e8de] flex items-center justify-between">
                            <div className="flex items-baseline gap-1">
                              {rec.originalPrice && (
                                <span className="text-[#a09080] text-xs line-through">SAR {rec.originalPrice}</span>
                              )}
                              <span className="font-display font-bold text-[#1a0e02] text-sm">SAR {rec.price}</span>
                            </div>
                            <div className="flex items-center gap-0.5 text-[#c49a4f]">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                              <span className="text-xs font-semibold">{rec.score.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                <div className="mt-6 sm:hidden text-center">
                  <Link
                    href="/explore"
                    className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#e8dfd4] rounded-xl text-sm font-semibold text-[#8b5e38] hover:border-[#8b5e38] transition-colors"
                  >
                    Explore all experiences →
                  </Link>
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {/* ── Undo toast ─────────────────────────────────────────────────────── */}
      {toast && <UndoToast title={toast.title} onUndo={handleUndo} />}
    </div>
  );
}
