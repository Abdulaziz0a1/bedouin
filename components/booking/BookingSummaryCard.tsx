import Image from "next/image";
import { ListingDetail } from "@/lib/data/listing-details";

const SHORT_MONTHS = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];

function fmtDate(d: Date): string {
  return `${SHORT_MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

interface BookingSummaryCardProps {
  listing: ListingDetail;
  checkIn:    Date | null;
  checkOut:   Date | null;
  adults:     number;
  children:   number;
  nights:     number;
  subtotal:   number;
  serviceFee: number;
  total:      number;
}

export default function BookingSummaryCard({
  listing, checkIn, checkOut, adults, children,
  nights, subtotal, serviceFee, total,
}: BookingSummaryCardProps) {
  return (
    <div className="bg-white border border-[#e8dfd4] rounded-3xl overflow-hidden shadow-[0_4px_24px_rgba(26,14,2,0.08)]">

      {/* Listing thumbnail + info */}
      <div className="flex gap-3 p-4 border-b border-[#f0e8de]">
        <div className="relative w-[88px] h-[72px] rounded-2xl overflow-hidden shrink-0">
          <Image
            src={listing.images[0]}
            alt={listing.title}
            fill
            className="object-cover"
            sizes="88px"
          />
        </div>
        <div className="flex flex-col gap-0.5 min-w-0 justify-center">
          {listing.badge && (
            <span
              className="self-start text-[10px] font-bold text-white px-2 py-0.5 rounded-lg leading-none mb-0.5"
              style={{ backgroundColor: listing.badgeColor }}
            >
              {listing.badge}
            </span>
          )}
          <p className="font-display font-semibold text-[#1a0e02] text-sm leading-snug line-clamp-2">
            {listing.title}
          </p>
          <p className="text-[#64707d] text-xs truncate">{listing.location}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#c49a4f">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="text-xs font-semibold text-[#1a0e02]">{listing.score.toFixed(1)}</span>
            <span className="text-xs text-[#64707d]">({listing.reviewCount} reviews)</span>
          </div>
        </div>
      </div>

      {/* Booking details */}
      <div className="p-5 flex flex-col gap-4">

        {/* Dates + guests */}
        <div className="flex flex-col gap-2.5">
          <h3 className="text-xs font-bold text-[#64707d] uppercase tracking-widest">Booking details</h3>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#faf7f4] rounded-xl px-3 py-2.5">
              <p className="text-[10px] text-[#64707d] mb-0.5 font-medium">Check-in</p>
              <p className="text-sm font-semibold text-[#1a0e02]">
                {checkIn ? fmtDate(checkIn) : "—"}
              </p>
            </div>
            <div className="bg-[#faf7f4] rounded-xl px-3 py-2.5">
              <p className="text-[10px] text-[#64707d] mb-0.5 font-medium">Check-out</p>
              <p className="text-sm font-semibold text-[#1a0e02]">
                {checkOut ? fmtDate(checkOut) : "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between bg-[#faf7f4] rounded-xl px-3 py-2.5">
            <p className="text-[10px] text-[#64707d] font-medium">Guests</p>
            <p className="text-sm font-semibold text-[#1a0e02]">
              {adults} adult{adults !== 1 ? "s" : ""}
              {children > 0 ? `, ${children} child${children !== 1 ? "ren" : ""}` : ""}
            </p>
          </div>
        </div>

        {/* Price breakdown – only when nights are calculated */}
        {nights > 0 && (
          <>
            <div className="h-px bg-[#f0e8de]" />

            <div className="flex flex-col gap-2.5">
              <h3 className="text-xs font-bold text-[#64707d] uppercase tracking-widest">Price breakdown</h3>

              <div className="flex justify-between text-sm">
                <span className="text-[#64707d]">
                  SAR {listing.price.toLocaleString("en-US")} × {nights} night{nights !== 1 ? "s" : ""}
                </span>
                <span className="text-[#1a0e02] font-medium">SAR {subtotal.toLocaleString("en-US")}</span>
              </div>

              {listing.originalPrice && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#049153] text-xs font-medium">Discount applied</span>
                  <span className="text-[#049153] text-xs font-medium">
                    −SAR {((listing.originalPrice - listing.price) * nights).toLocaleString("en-US")}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-[#64707d]">Service fee (12%)</span>
                <span className="text-[#1a0e02] font-medium">SAR {serviceFee.toLocaleString("en-US")}</span>
              </div>
            </div>

            <div className="h-px bg-[#f0e8de]" />

            <div className="flex justify-between items-center">
              <span className="font-display font-bold text-[#1a0e02] text-base">Total</span>
              <span className="font-display font-bold text-[#1a0e02] text-xl">
                SAR {total.toLocaleString("en-US")}
              </span>
            </div>
          </>
        )}

        {nights === 0 && (
          <p className="text-xs text-[#a09080] text-center py-2">
            Select dates to see the total price
          </p>
        )}

        {/* Trust badge */}
        <div className="flex items-center gap-2.5 mt-1 p-3 bg-[#f0fdf6] border border-[#c3e6d5] rounded-xl">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
              fill="rgba(4,145,83,0.12)" stroke="#049153" strokeWidth="1.5" />
            <path d="M9 12l2 2 4-4"
              stroke="#049153" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-xs text-[#049153] font-semibold">No charge until confirmed</span>
        </div>
      </div>
    </div>
  );
}
