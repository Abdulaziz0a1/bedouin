import { cache } from "react";
import { notFound } from "next/navigation";
import { fetchListingDetail } from "@/lib/services/listing-detail";
import BookingFlow from "@/components/booking/BookingFlow";

// Deduplicated fetch: generateMetadata and the page share one DB call per request.
const getCachedListingDetail = cache(fetchListingDetail);

interface Props {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | undefined }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const listing = await getCachedListingDetail(id);
  if (!listing) return { title: "Booking – Bedouin" };
  return {
    title: `Book ${listing.title} – Bedouin`,
    description: `Complete your booking for ${listing.title} in ${listing.location}.`,
  };
}

export default async function BookingPage({ params, searchParams }: Props) {
  const { id } = await params;
  const listing = await getCachedListingDetail(id);
  if (!listing) notFound();

  const sp = await searchParams;
  const checkInStr  = sp?.checkIn  ?? "";
  const checkOutStr = sp?.checkOut ?? "";
  const adults      = Math.max(1, parseInt(sp?.adults   ?? "1",  10));
  const children    = Math.max(0, parseInt(sp?.children ?? "0", 10));

  return (
    <div className="min-h-screen bg-[#f4efe6]">
      <main className="pt-[72px]">
        <BookingFlow
          listing={listing}
          checkInStr={checkInStr}
          checkOutStr={checkOutStr}
          initialAdults={adults}
          initialChildren={children}
        />
      </main>
    </div>
  );
}
