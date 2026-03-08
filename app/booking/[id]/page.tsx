import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { getListingDetail } from "@/lib/data/listing-details";
import BookingFlow from "@/components/booking/BookingFlow";

interface Props {
  params: Promise<{ id: string }>;
  searchParams?: { [key: string]: string | undefined };
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const listing = getListingDetail(id);
  if (!listing) return { title: "Booking – Bedouin" };
  return {
    title: `Book ${listing.title} – Bedouin`,
    description: `Complete your booking for ${listing.title} in ${listing.location}.`,
  };
}

export default async function BookingPage({ params, searchParams }: Props) {
  const { id } = await params;
  const listing = getListingDetail(id);
  if (!listing) notFound();

  const checkInStr  = searchParams?.checkIn  ?? "";
  const checkOutStr = searchParams?.checkOut ?? "";
  const adults      = Math.max(1, parseInt(searchParams?.adults   ?? "1",  10));
  const children    = Math.max(0, parseInt(searchParams?.children ?? "0", 10));

  return (
    <div className="min-h-screen bg-[#f4efe6]">
      <Navbar />
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
