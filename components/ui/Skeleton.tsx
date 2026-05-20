import type { CSSProperties } from "react";

// ─── Base atom ────────────────────────────────────────────────────────────────

interface SkProps {
  className?: string;
  style?: CSSProperties;
  /** Use .skeleton-img for image-area placeholders (slightly richer tone) */
  variant?: "default" | "img";
}

export function Sk({ className = "", style, variant = "default" }: SkProps) {
  return (
    <div
      className={`${variant === "img" ? "skeleton-img" : "skeleton"} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

// ─── Section header skeleton ──────────────────────────────────────────────────

export function SkeletonSectionHeader({ hasSubtitle = false }: { hasSubtitle?: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2.5">
        <Sk className="h-px w-8 rounded-none" style={{ height: 1 }} />
        <Sk className="h-2.5 w-24 rounded-full" />
      </div>
      <Sk className="h-8 w-64 rounded-lg" />
      {hasSubtitle && <Sk className="h-3.5 w-80 rounded-md mt-1" />}
    </div>
  );
}

// ─── Product card skeleton — matches ProductCard exactly ─────────────────────
// Width: 296px, minHeight: 416, image: 238px

export function SkeletonProductCard({ className }: { className?: string }) {
  return (
    <div
      className={`flex flex-col ${className ?? "shrink-0 w-[296px]"}`}
      style={{ minHeight: 416 }}
      aria-hidden="true"
    >
      <div
        className="flex flex-col flex-1 bg-white rounded-[1.25rem] overflow-hidden"
        style={{
          border: "1px solid rgba(232,223,212,0.85)",
          boxShadow: "0 4px 24px rgba(70,30,0,0.05)",
          minHeight: 416,
        }}
      >
        {/* Image placeholder */}
        <Sk variant="img" className="w-full h-[238px] rounded-none" />

        {/* Body */}
        <div className="flex flex-col gap-3 px-4 pt-3.5 pb-4 flex-1">
          {/* Rating badge */}
          <Sk className="h-5 w-20 rounded-full" />

          {/* Title lines */}
          <div className="flex flex-col gap-1.5">
            <Sk className="h-3.5 w-full rounded-md" />
            <Sk className="h-3.5 w-3/4 rounded-md" />
          </div>

          {/* Location */}
          <Sk className="h-3 w-36 rounded-full" />

          {/* Tags */}
          <div className="flex gap-1.5">
            <Sk className="h-5 w-16 rounded-full" />
            <Sk className="h-5 w-20 rounded-full" />
          </div>

          {/* Price row */}
          <div className="mt-auto pt-3 flex items-center justify-between border-t border-[#f0e8de]">
            <Sk className="h-3 w-14 rounded" />
            <Sk className="h-5 w-20 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Destination card skeleton — matches DestinationCard (272 × 460) ─────────

export function SkeletonDestinationCard() {
  return (
    <div
      className="shrink-0 w-[272px] h-[460px] rounded-[1.5rem] overflow-hidden"
      aria-hidden="true"
      style={{ boxShadow: "0 4px 24px rgba(70,30,0,0.05)" }}
    >
      <Sk variant="img" className="w-full h-full rounded-none" />
    </div>
  );
}

// ─── Activity card skeleton — matches TopThingsToDo grid item (h-[156px]) ────

export function SkeletonActivityCard() {
  return (
    <div className="flex flex-col gap-2.5" aria-hidden="true">
      <Sk variant="img" className="h-[156px] w-full rounded-2xl" />
      <Sk className="h-3 w-4/5 rounded" />
    </div>
  );
}

// ─── Scroll row of skeleton cards ─────────────────────────────────────────────

export function SkeletonScrollRow({
  count = 4,
  card = "product",
}: {
  count?: number;
  card?: "product" | "destination";
}) {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: count }, (_, i) =>
        card === "destination" ? (
          <SkeletonDestinationCard key={i} />
        ) : (
          <SkeletonProductCard key={i} />
        )
      )}
    </div>
  );
}

// ─── Listing detail page skeleton ─────────────────────────────────────────────

export function SkeletonListingDetail() {
  return (
    <div className="min-h-screen bg-[#f4efe6] pt-[72px]" aria-hidden="true">
      {/* Image gallery */}
      <div className="relative w-full">
        <Sk variant="img" className="w-full h-[480px] rounded-none" style={{ borderRadius: 0 }} />
      </div>

      {/* Content area */}
      <div className="max-w-[1232px] mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">
          {/* Left: listing info */}
          <div className="flex flex-col gap-6">
            {/* Title block */}
            <div className="flex flex-col gap-3">
              <Sk className="h-9 w-3/4 rounded-xl" />
              <Sk className="h-4 w-1/2 rounded-lg" />
              <div className="flex gap-3 mt-1">
                <Sk className="h-5 w-20 rounded-full" />
                <Sk className="h-5 w-16 rounded-full" />
                <Sk className="h-5 w-24 rounded-full" />
              </div>
            </div>

            {/* Host card */}
            <div className="flex items-center gap-3 py-4 border-y border-[#e8dfd4]">
              <Sk variant="img" className="w-12 h-12 rounded-full" />
              <div className="flex flex-col gap-1.5">
                <Sk className="h-4 w-32 rounded" />
                <Sk className="h-3 w-20 rounded" />
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <Sk className="h-3.5 w-full rounded" />
              <Sk className="h-3.5 w-full rounded" />
              <Sk className="h-3.5 w-5/6 rounded" />
              <Sk className="h-3.5 w-3/4 rounded" />
              <Sk className="h-3.5 w-full rounded" />
              <Sk className="h-3.5 w-2/3 rounded" />
            </div>

            {/* Amenities */}
            <div className="flex flex-col gap-3">
              <Sk className="h-5 w-32 rounded" />
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Sk className="w-5 h-5 rounded" />
                    <Sk className="h-3 w-24 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: booking card */}
          <div className="hidden lg:block">
            <div
              className="bg-white rounded-2xl overflow-hidden"
              style={{
                border: "1px solid #e8dfd4",
                boxShadow: "0 8px 40px rgba(70,30,0,0.10)",
              }}
            >
              {/* Price header */}
              <div className="px-6 py-5 border-b border-[#f0e8de]">
                <div className="flex items-center justify-between">
                  <Sk className="h-7 w-28 rounded-lg" />
                  <Sk className="h-5 w-20 rounded-full" />
                </div>
              </div>

              {/* Date pickers */}
              <div className="px-6 py-4 grid grid-cols-2 gap-3 border-b border-[#f0e8de]">
                <div className="flex flex-col gap-1.5">
                  <Sk className="h-2.5 w-14 rounded" />
                  <Sk className="h-10 w-full rounded-xl" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Sk className="h-2.5 w-16 rounded" />
                  <Sk className="h-10 w-full rounded-xl" />
                </div>
              </div>

              {/* Guests */}
              <div className="px-6 py-4 border-b border-[#f0e8de]">
                <Sk className="h-10 w-full rounded-xl" />
              </div>

              {/* Price breakdown */}
              <div className="px-6 py-4 flex flex-col gap-3">
                <div className="flex justify-between">
                  <Sk className="h-3 w-24 rounded" />
                  <Sk className="h-3 w-16 rounded" />
                </div>
                <div className="flex justify-between">
                  <Sk className="h-3 w-20 rounded" />
                  <Sk className="h-3 w-14 rounded" />
                </div>
                <div className="flex justify-between pt-2 border-t border-[#f0e8de]">
                  <Sk className="h-4 w-16 rounded" />
                  <Sk className="h-4 w-20 rounded" />
                </div>
              </div>

              {/* CTA */}
              <div className="px-6 pb-6">
                <Sk className="h-12 w-full rounded-2xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Related listings */}
        <div className="mt-16 flex flex-col gap-6">
          <SkeletonSectionHeader />
          <SkeletonScrollRow count={4} />
        </div>
      </div>
    </div>
  );
}

// ─── Booking flow skeleton ─────────────────────────────────────────────────────

export function SkeletonBookingFlow() {
  return (
    <div className="min-h-screen bg-[#f4efe6] pt-[72px]" aria-hidden="true">
      <div className="max-w-2xl mx-auto px-6 py-12 flex flex-col gap-6">
        <Sk className="h-8 w-48 rounded-xl" />
        <div
          className="bg-white rounded-2xl overflow-hidden"
          style={{ border: "1px solid #e8dfd4", boxShadow: "0 8px 40px rgba(70,30,0,0.08)" }}
        >
          {/* Step progress */}
          <div className="flex gap-2 px-6 py-4 border-b border-[#f0e8de]">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex items-center gap-2 flex-1">
                <Sk className="w-7 h-7 rounded-full" />
                {n < 3 && <Sk className="h-px flex-1 rounded-none" style={{ height: 1 }} />}
              </div>
            ))}
          </div>
          <div className="p-6 flex flex-col gap-4">
            <Sk className="h-6 w-40 rounded-xl" />
            <Sk className="h-3.5 w-full rounded" />
            <Sk className="h-3.5 w-3/4 rounded" />
            <div className="grid grid-cols-2 gap-4 mt-2">
              <Sk className="h-12 w-full rounded-xl" />
              <Sk className="h-12 w-full rounded-xl" />
            </div>
            <Sk className="h-12 w-full rounded-xl mt-2" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard skeleton ───────────────────────────────────────────────────────

export function SkeletonDashboard() {
  return (
    <div className="min-h-screen bg-[#f4efe6] pt-[72px]" aria-hidden="true">
      {/* Stats row */}
      <div className="bg-white border-b border-[#e8dfd4] px-6 py-4">
        <div className="max-w-[1232px] mx-auto flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }, (_, i) => (
            <Sk key={i} className="h-20 w-48 rounded-2xl shrink-0" />
          ))}
        </div>
      </div>

      <div className="max-w-[1232px] mx-auto px-6 py-8 flex flex-col gap-6">
        {/* Section header */}
        <SkeletonSectionHeader />

        {/* Content rows */}
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-4 flex items-center gap-4"
            style={{ border: "1px solid #e8dfd4" }}
          >
            <Sk variant="img" className="w-16 h-16 rounded-xl shrink-0" />
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              <Sk className="h-4 w-48 rounded" />
              <Sk className="h-3 w-32 rounded" />
              <Sk className="h-3 w-24 rounded" />
            </div>
            <Sk className="h-8 w-20 rounded-xl shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Admin table skeleton ─────────────────────────────────────────────────────

export function SkeletonAdminTable({ rows = 6 }: { rows?: number }) {
  return (
    <div className="flex flex-col" aria-hidden="true">
      {/* Header */}
      <div className="flex gap-4 px-4 py-3 border-b border-[#f0e8de]">
        {[120, 200, 80, 80, 80, 120].map((w, i) => (
          <Sk key={i} className="h-2.5 rounded" style={{ width: w }} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3.5 border-b border-[#f9f5f0]">
          <Sk variant="img" className="w-10 h-10 rounded-lg shrink-0" />
          <Sk className="h-3 rounded" style={{ width: 140 }} />
          <Sk className="h-3 rounded" style={{ width: 180 }} />
          <Sk className="h-5 w-16 rounded-full" />
          <Sk className="h-5 w-16 rounded-full" />
          <Sk className="h-5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ─── Message thread skeleton ──────────────────────────────────────────────────

export function SkeletonMessageThread() {
  return (
    <div className="flex flex-col gap-4 p-6" aria-hidden="true">
      {/* Sent */}
      <div className="flex justify-end">
        <Sk className="h-10 w-52 rounded-2xl" style={{ borderRadius: "1rem 1rem 0.25rem 1rem" }} />
      </div>
      {/* Received */}
      <div className="flex gap-2 items-end">
        <Sk variant="img" className="w-8 h-8 rounded-full shrink-0" />
        <Sk className="h-14 w-64 rounded-2xl" style={{ borderRadius: "0.25rem 1rem 1rem 1rem" }} />
      </div>
      <div className="flex justify-end">
        <Sk className="h-16 w-44 rounded-2xl" style={{ borderRadius: "1rem 1rem 0.25rem 1rem" }} />
      </div>
      <div className="flex gap-2 items-end">
        <Sk variant="img" className="w-8 h-8 rounded-full shrink-0" />
        <Sk className="h-10 w-72 rounded-2xl" style={{ borderRadius: "0.25rem 1rem 1rem 1rem" }} />
      </div>
    </div>
  );
}

// ─── Notification list skeleton ───────────────────────────────────────────────

export function SkeletonNotificationList({ count = 5 }: { count?: number }) {
  return (
    <div className="flex flex-col" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex gap-3 px-4 py-3.5 border-b border-[#f0e8de]">
          <Sk variant="img" className="w-9 h-9 rounded-full shrink-0" />
          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            <Sk className="h-3 w-4/5 rounded" />
            <Sk className="h-3 w-3/5 rounded" />
            <Sk className="h-2.5 w-16 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
