import type { Metadata } from "next";
import { destinationRegions } from "@/lib/data/discovery/destination-regions";
import { trendingDestinations } from "@/lib/data/discovery/trending-destinations";

// ─── Static params ────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const regionSlugs = destinationRegions.map((r) => ({ slug: r.slug }));
  const destinationSlugs = trendingDestinations.map((d) => ({ slug: d.slug }));

  // Deduplicate by slug
  const seen = new Set<string>();
  return [...regionSlugs, ...destinationSlugs].filter(({ slug }) => {
    if (seen.has(slug)) return false;
    seen.add(slug);
    return true;
  });
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  // Prefer a named region entry for richer metadata
  const region = destinationRegions.find((r) => r.slug === slug);
  const destination = trendingDestinations.find((d) => d.slug === slug);

  const nameEn = region?.name.en ?? destination?.city.en ?? slug;
  const nameAr = region?.name.ar ?? destination?.city.ar;
  const descriptionEn =
    region?.description.en ??
    destination?.description.en ??
    `Discover ${nameEn} — authentic Saudi experiences with Bedouin.`;

  return {
    title: `${nameEn} | Bedouin`,
    description: descriptionEn,
    alternates: {
      canonical: `/destinations/${slug}`,
      languages: nameAr
        ? {
            en: `/destinations/${slug}`,
            ar: `/destinations/${slug}`,
          }
        : undefined,
    },
    openGraph: {
      title: nameEn,
      description: descriptionEn,
      images: region?.image ?? destination?.image
        ? [{ url: (region?.image ?? destination?.image)! }]
        : [],
      locale: "en_SA",
      alternateLocale: nameAr ? ["ar_SA"] : [],
    },
  };
}

// ─── Page scaffold ────────────────────────────────────────────────────────────

export default async function DestinationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Placeholder — full page implementation pending backend integration
  return (
    <main className="min-h-screen bg-[#f4efe6] flex items-center justify-center">
      <p className="text-[#64707d] text-sm font-medium">
        {slug}
      </p>
    </main>
  );
}
