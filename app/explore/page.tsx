import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ExploreClient from "@/components/explore/ExploreClient";
import { fetchListings } from "@/lib/services/listings";

export const metadata = {
  title: "Explore Experiences – Bedouin",
  description:
    "Browse authentic Saudi farm stays, camel herding, desert glamping, and rural experiences across 12 regions.",
};

const HEADER_STATS = [
  { value: "18+",  label: "Experiences"  },
  { value: "10",   label: "Regions"      },
  { value: "6",    label: "Categories"   },
  { value: "850+", label: "Verified hosts" },
];

export default async function ExplorePage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | undefined };
}) {
  const initialQuery = searchParams?.location ?? searchParams?.q ?? "";
  const listings = await fetchListings();

  return (
    <div className="min-h-screen bg-[#f4efe6]">
      <Navbar />

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div
        className="pt-[72px] bg-white border-b border-[#e8dfd4]"
        style={{ background: "linear-gradient(to bottom, #fff 0%, #fdfaf6 100%)" }}
      >
        <div className="max-w-[1232px] mx-auto px-6 lg:px-0 pt-10 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            {/* Title block */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="h-[1px] w-6 bg-[#c49a4f]" />
                <p className="text-[#c49a4f] text-xs font-bold uppercase tracking-[0.16em]">
                  Discover Saudi Arabia
                </p>
              </div>
              <h1 className="font-display font-extrabold text-[#1a0e02] leading-tight"
                  style={{ fontSize: "clamp(2rem, 3.5vw, 2.75rem)" }}>
                Explore Experiences
              </h1>
              <p className="text-[#64707d] text-base max-w-lg leading-relaxed">
                Farm stays, desert glamping, mountain cabins, and heritage
                houses — hosted by Saudi families.
              </p>
            </div>

            {/* Stats strip */}
            <div className="flex items-center gap-6 shrink-0 pb-1">
              {HEADER_STATS.map(({ value, label }, i) => (
                <div key={label} className="flex items-center gap-5">
                  {i > 0 && (
                    <div className="w-px h-8 bg-[#e8dfd4]" />
                  )}
                  <div className="text-right">
                    <p className="font-display font-extrabold text-[#1a0e02] text-2xl leading-none">
                      {value}
                    </p>
                    <p className="text-[#64707d] text-xs mt-0.5">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ExploreClient initialQuery={initialQuery} initialListings={listings} />

      <Footer />
    </div>
  );
}
