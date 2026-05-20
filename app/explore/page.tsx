import Footer from "@/components/layout/Footer";
import ExploreClient from "@/components/explore/ExploreClient";
import { fetchListings } from "@/lib/services/listings";

export const metadata = {
  title: "Explore Experiences – Bedouin",
  description:
    "Browse authentic Saudi farm stays, camel herding, desert glamping, and rural experiences across 12 regions.",
};

const VALID_CATEGORIES = new Set(["farms", "house", "guesthouse", "cabins", "glamping", "doms"]);

export default async function ExplorePage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | undefined }>;
}) {
  const sp = await searchParams;
  const initialQuery    = sp?.q ?? "";
  const initialRegion   = sp?.region ?? "";
  const rawCategory     = sp?.category ?? "";
  const initialCategory = VALID_CATEGORIES.has(rawCategory) ? rawCategory : "all";
  const listings = await fetchListings();

  return (
    <div className="min-h-screen bg-[#f4efe6]">
      <ExploreClient
        initialQuery={initialQuery}
        initialRegion={initialRegion}
        initialCategory={initialCategory}
        initialListings={listings}
      />
      <Footer />
    </div>
  );
}
