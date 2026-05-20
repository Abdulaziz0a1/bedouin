import { Sk, SkeletonProductCard } from "@/components/ui/Skeleton";

export default function ExploreLoading() {
  return (
    <div className="min-h-screen bg-[#f4efe6] pt-[72px]">

      {/* ── Filter / search bar ── */}
      <div className="bg-white border-b border-[#e8dfd4] py-4 px-6 sticky top-[72px] z-10">
        <div className="max-w-[1232px] mx-auto flex flex-wrap items-center gap-3">
          {/* Search input ghost */}
          <Sk className="h-10 w-64 rounded-2xl shrink-0" />
          {/* Category pill row */}
          <div className="flex gap-2 overflow-hidden">
            {["w-14", "w-16", "w-20", "w-16", "w-18", "w-14"].map((w, i) => (
              <Sk key={i} className={`h-9 ${w} rounded-full shrink-0`} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Results count ghost ── */}
      <div className="max-w-[1232px] mx-auto px-6 pt-6 pb-1">
        <Sk className="h-3 w-24 rounded" />
      </div>

      {/* ── Card grid ── */}
      <div className="max-w-[1232px] mx-auto px-6 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }, (_, i) => (
            <SkeletonProductCard
              key={i}
              className="w-full"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
