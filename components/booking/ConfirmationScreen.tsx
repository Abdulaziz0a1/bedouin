import Link from "next/link";
import Image from "next/image";
import { BookingConfirmation } from "@/lib/types/booking";

interface ConfirmationScreenProps {
  booking: BookingConfirmation;
}

const METHOD_LABELS: Record<string, string> = {
  card:      "Credit / Debit Card",
  mada:      "Mada",
  apple_pay: "Apple Pay",
};

export default function ConfirmationScreen({ booking }: ConfirmationScreenProps) {
  const guestCount = booking.adults + booking.children;

  return (
    <div className="bg-[#f4efe6] min-h-[calc(100vh-72px)] py-12">
      <div className="max-w-[600px] mx-auto px-6 flex flex-col gap-8 items-center text-center">

        {/* ── Success animation ────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-[#f0faf5] border-2 border-[#049153] flex items-center justify-center shadow-[0_0_0_8px_rgba(4,145,83,0.08)]">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12l5 5 9-9"
                stroke="#049153"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div>
            <h1 className="font-display font-extrabold text-[#1a0e02] text-3xl mb-2">
              Booking Confirmed!
            </h1>
            <p className="text-[#64707d] text-base leading-relaxed max-w-sm">
              Your experience has been reserved. A confirmation has been sent to{" "}
              <span className="font-semibold text-[#1a0e02]">{booking.guestEmail}</span>.
            </p>
          </div>
        </div>

        {/* ── Booking reference pill ───────────────────────────────────── */}
        <div className="bg-[#1a0e02] px-7 py-4 rounded-2xl flex flex-col items-center gap-1 w-full max-w-xs">
          <p className="text-[10px] font-bold text-white/50 uppercase tracking-[0.16em]">
            Booking Reference
          </p>
          <p className="font-display font-extrabold text-white text-2xl tracking-[0.08em]">
            {booking.reference}
          </p>
        </div>

        {/* ── Booking details card ─────────────────────────────────────── */}
        <div className="w-full bg-white border border-[#e8dfd4] rounded-3xl overflow-hidden text-left shadow-sm">

          {/* Listing hero image */}
          <div className="relative w-full h-52">
            <Image
              src={booking.image}
              alt={booking.listingTitle}
              fill
              className="object-cover"
              sizes="600px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
            <div className="absolute bottom-4 left-5 right-5">
              <p className="font-display font-bold text-white text-xl leading-tight line-clamp-2">
                {booking.listingTitle}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"
                    fill="rgba(255,255,255,0.8)"
                  />
                </svg>
                <span className="text-white/80 text-sm">{booking.location}</span>
              </div>
            </div>
          </div>

          {/* Details grid */}
          <div className="p-5 grid grid-cols-2 gap-4">
            {[
              { label: "Check-in",    value: booking.checkIn  },
              { label: "Check-out",   value: booking.checkOut },
              { label: "Duration",    value: `${booking.nights} night${booking.nights !== 1 ? "s" : ""}` },
              { label: "Guests",      value: `${guestCount} guest${guestCount !== 1 ? "s" : ""}` },
              { label: "Guest name",  value: booking.guestName || "—" },
              { label: "Payment",     value: METHOD_LABELS[booking.paymentMethod] ?? booking.paymentMethod },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[10px] font-bold text-[#64707d] uppercase tracking-widest mb-0.5">
                  {label}
                </p>
                <p className="text-sm font-semibold text-[#1a0e02] leading-snug">{value}</p>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="px-5 py-4 border-t border-[#f0e8de] flex justify-between items-center bg-[#faf7f4]">
            <div>
              <p className="text-[10px] font-bold text-[#64707d] uppercase tracking-widest mb-0.5">
                Total paid
              </p>
              <p className="font-display font-extrabold text-[#1a0e02] text-xl">
                SAR {booking.totalPrice.toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-[#f0faf5] border border-[#c3e6d5] text-[#049153] text-xs font-semibold px-3 py-1.5 rounded-xl">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M5 12l5 5 9-9"
                  stroke="#049153" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Paid
            </div>
          </div>
        </div>

        {/* ── What's next card ──────────────────────────────────────────── */}
        <div className="w-full bg-[#fff4e5] border border-[#f0dcc8] rounded-2xl p-5 text-left">
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#8b5e38]/10 flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"
                  stroke="#8b5e38" strokeWidth="1.8" />
                <polyline points="22,6 12,13 2,6"
                  stroke="#8b5e38" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-[#1a0e02] text-sm mb-1">What happens next?</p>
              <ul className="flex flex-col gap-1.5">
                {[
                  "Your host will contact you within 24 hours with arrival details.",
                  "A confirmation email has been sent to your inbox.",
                  "You can message your host directly from your bookings page.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-[#64707d] leading-relaxed">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                      className="shrink-0 mt-0.5">
                      <path d="M9 12l2 2 4-4"
                        stroke="#8b5e38" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="12" cy="12" r="10" stroke="#8b5e38" strokeWidth="1.5" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ── CTAs ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Link
            href="/explore"
            className="flex-1 py-3.5 border border-[#1a0e02] text-[#1a0e02] font-semibold text-sm rounded-2xl text-center hover:bg-[#1a0e02] hover:text-white transition-colors"
          >
            Explore More Experiences
          </Link>
          <Link
            href="/"
            className="flex-1 py-3.5 bg-[#8b5e38] font-bold text-sm rounded-2xl text-center hover:bg-[#7a5030] transition-colors"
            style={{ color: "#fff" }}
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
