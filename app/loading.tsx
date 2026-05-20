import {
  Sk,
  SkeletonSectionHeader,
  SkeletonScrollRow,
  SkeletonActivityCard,
} from "@/components/ui/Skeleton";

// ─── Inline helpers ───────────────────────────────────────────────────────────

function TrustPillarSkeleton() {
  return (
    <div className="flex flex-col items-center gap-3 flex-1 min-w-[180px]">
      <Sk className="w-12 h-12 rounded-2xl" />
      <Sk className="h-4 w-28 rounded-lg" />
      <Sk className="h-3 w-40 rounded" />
      <Sk className="h-3 w-32 rounded" />
    </div>
  );
}

function SeasonTabSkeleton() {
  return (
    <div className="flex gap-2">
      {["w-20", "w-16", "w-16", "w-20"].map((w, i) => (
        <Sk key={i} className={`h-9 ${w} rounded-2xl`} />
      ))}
    </div>
  );
}

// ─── Homepage loading skeleton ────────────────────────────────────────────────

export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-[#f4efe6]">

      {/* ── Hero ── dark bg, no shimmer needed — it's a color not a content area */}
      <div className="relative h-screen min-h-[700px] bg-[#120a02] overflow-hidden">
        {/* Warm radial glow hint */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1/3 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 80% 100% at 50% 100%, rgba(196,154,79,0.07) 0%, transparent 70%)",
          }}
        />
        {/* Search card ghost */}
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 pb-14 sm:pb-16">
          <div
            className="max-w-[780px] mx-auto rounded-2xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(20px)",
              height: 100,
            }}
          />
        </div>
      </div>

      <main className="flex flex-col">

        {/* ── TrustSection ── */}
        <section className="bg-white py-14">
          <div className="max-w-[1232px] mx-auto px-6">
            <div className="flex flex-wrap gap-10 justify-center">
              <TrustPillarSkeleton />
              <TrustPillarSkeleton />
              <TrustPillarSkeleton />
            </div>
          </div>
        </section>

        {/* ── TrendingDestinations ── */}
        <section
          className="py-16"
          style={{ background: "linear-gradient(180deg, #fef9f3 0%, white 100%)" }}
        >
          <div className="max-w-[1232px] mx-auto px-6 lg:px-0 flex flex-col gap-8">
            <div className="flex items-end justify-between">
              <SkeletonSectionHeader hasSubtitle />
              <SeasonTabSkeleton />
            </div>
            <SkeletonScrollRow count={4} card="destination" />
          </div>
        </section>

        {/* ── WeekendDeals ── */}
        <section
          className="py-16"
          style={{ background: "linear-gradient(180deg, white 0%, #fef9f3 100%)" }}
        >
          <div className="max-w-[1232px] mx-auto px-6 lg:px-0 flex flex-col gap-8">
            <div className="flex items-end justify-between">
              <SkeletonSectionHeader hasSubtitle />
              {/* Arrow nav ghost */}
              <div className="flex gap-2 shrink-0">
                <Sk className="w-10 h-10 rounded-full" />
                <Sk className="w-10 h-10 rounded-full" />
              </div>
            </div>
            <SkeletonScrollRow count={4} card="product" />
          </div>
        </section>

        {/* ── TopSights ── */}
        <section
          className="py-16"
          style={{ background: "linear-gradient(180deg, #fef9f3 0%, white 100%)" }}
        >
          <div className="max-w-[1232px] mx-auto px-6 lg:px-0 flex flex-col gap-8">
            <SkeletonSectionHeader hasSubtitle />
            {/* 6-column mini card grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Sk variant="img" className="h-[120px] w-full rounded-2xl" />
                  <Sk className="h-3 w-3/4 rounded" />
                  <Sk className="h-2.5 w-1/2 rounded" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TopThingsToDo ── */}
        <section
          className="py-16"
          style={{ background: "linear-gradient(180deg, #fef9f3 0%, white 100%)" }}
        >
          <div className="max-w-[1232px] mx-auto px-6 lg:px-0 flex flex-col gap-8">
            <SkeletonSectionHeader />
            {/* Category chips */}
            <div className="flex flex-wrap gap-2.5">
              {["w-20", "w-16", "w-24"].map((w, i) => (
                <Sk key={i} className={`h-9 ${w} rounded-2xl`} />
              ))}
            </div>
            {/* 6-column activity grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }, (_, i) => (
                <SkeletonActivityCard key={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ── FarmsSection ── dark header banner */}
        <section className="bg-[#f4efe6]">
          {/* Dark banner ghost */}
          <div
            className="relative h-[320px] overflow-hidden"
            style={{ background: "linear-gradient(to bottom, #1a0e02, #0d0700)" }}
          >
            {/* Warm radial hint */}
            <div
              className="absolute bottom-0 left-0 right-0 h-1/2 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse 60% 100% at 20% 100%, rgba(196,154,79,0.06) 0%, transparent 70%)",
              }}
            />
            {/* Text ghosts on dark bg */}
            <div className="relative h-full max-w-[1232px] mx-auto px-6 lg:px-0 flex items-end pb-10">
              <div className="flex items-end justify-between w-full">
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-3">
                    <div className="h-px w-8 bg-white/20 rounded-none" style={{ height: 1 }} />
                    <div className="h-2.5 w-20 rounded-full bg-white/15" />
                  </div>
                  <div className="h-8 w-64 rounded-xl bg-white/15" />
                  <div className="h-3 w-80 rounded bg-white/10" />
                </div>
                <div className="flex gap-2 shrink-0">
                  <div className="w-10 h-10 rounded-full bg-white/12" />
                  <div className="w-10 h-10 rounded-full bg-white/20" />
                </div>
              </div>
            </div>
          </div>
          {/* Card row */}
          <div className="py-10">
            <div className="max-w-[1232px] mx-auto px-6 lg:px-0">
              <SkeletonScrollRow count={6} card="product" />
            </div>
          </div>
        </section>

        {/* ── CTA blocks ── */}
        <section className="py-16 bg-white">
          <div className="max-w-[1232px] mx-auto px-6">
            <Sk className="h-40 w-full rounded-3xl" />
          </div>
        </section>
        <section className="py-10 bg-[#f4efe6]">
          <div className="max-w-[1232px] mx-auto px-6">
            <Sk className="h-36 w-full rounded-3xl" />
          </div>
        </section>
      </main>
    </div>
  );
}
