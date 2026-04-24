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
  searchParams?: Promise<{ [key: string]: string | undefined }>;
}) {
  const sp = await searchParams;
  const initialQuery  = sp?.q ?? "";
  const initialRegion = sp?.region ?? "";
  const listings = await fetchListings();

  return (
    <div className="min-h-screen bg-[#f4efe6]">
      <Navbar />

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div
        className="pt-[72px] relative overflow-hidden"
        style={{
          background: "linear-gradient(to bottom, #ffffff 0%, #fdfaf6 70%, #f8f2ea 100%)",
          borderBottom: "1px solid rgba(232,223,212,0.8)",
        }}
      >
        {/* Subtle background radial */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 80% 50%, rgba(196,154,79,0.04) 0%, transparent 60%)",
          }}
          aria-hidden="true"
        />
        <div className="relative max-w-[1232px] mx-auto px-6 lg:px-0 pt-10 pb-9">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            {/* Title block */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2.5">
                <div
                  className="h-px w-8"
                  style={{ background: "linear-gradient(90deg, transparent, #c49a4f)" }}
                />
                <p className="text-[#c49a4f] text-xs font-bold uppercase tracking-[0.20em]">
                  Discover Saudi Arabia
                </p>
              </div>
              <h1
                className="font-display font-extrabold text-[#1a0e02] leading-tight tracking-tight"
                style={{ fontSize: "clamp(2rem, 3.5vw, 2.75rem)" }}
              >
                Explore Experiences
              </h1>
              <p className="text-[#64707d] text-base max-w-lg leading-relaxed mt-0.5">
                Farm stays, desert glamping, mountain cabins, and heritage
                houses — hosted by Saudi families.
              </p>
            </div>

            {/* Stats strip */}
            <div className="flex items-center gap-0 shrink-0 pb-1">
              {HEADER_STATS.map(({ value, label }, i) => (
                <div key={label} className="flex items-center">
                  {i > 0 && <div className="w-px h-8 bg-[#e8dfd4] mx-5" />}
                  <div className="text-right">
                    <p
                      className="font-display font-extrabold text-2xl leading-none"
                      style={{
                        background: "linear-gradient(135deg, #c49a4f 0%, #d4aa5f 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
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

      <ExploreClient initialQuery={initialQuery} initialRegion={initialRegion} initialListings={listings} />

      <Footer />
    </div>
  );
}
