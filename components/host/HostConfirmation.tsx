import Link from "next/link";
import Image from "next/image";
import { SubmittedListing } from "@/lib/types/host";

const CATEGORY_LABELS: Record<string, string> = {
  farms:      "Farm Stay",
  house:      "Heritage House",
  guesthouse: "Guest House",
  cabins:     "Highland Cabin",
  glamping:   "Desert Glamping",
  doms:       "Dome Suite",
};

interface HostConfirmationProps {
  listing: SubmittedListing;
}

export default function HostConfirmation({ listing }: HostConfirmationProps) {
  return (
    <div className="bg-[#f4efe6] min-h-[calc(100vh-72px)] py-12">
      <div className="max-w-[560px] mx-auto px-6 flex flex-col gap-8 items-center text-center">

        {/* ── Success icon ─────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-[#fff4e5] border-2 border-[#c49a4f] flex items-center justify-center shadow-[0_0_0_8px_rgba(196,154,79,0.08)]">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                fill="rgba(196,154,79,0.15)"
                stroke="#c49a4f" strokeWidth="1.8" />
              <path d="M9 12l2 2 4-4"
                stroke="#c49a4f" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div>
            <h1 className="font-display font-extrabold text-[#1a0e02] text-3xl mb-2">
              Listing Submitted!
            </h1>
            <p className="text-[#64707d] text-base leading-relaxed max-w-sm">
              Your listing is now under review by the Bedouin team.
              We'll get back to you within 1–2 business days.
            </p>
          </div>
        </div>

        {/* ── Listing reference ─────────────────────────────────────────── */}
        <div className="bg-[#1a0e02] px-7 py-4 rounded-2xl flex flex-col items-center gap-1 w-full max-w-xs">
          <p className="text-[10px] font-bold text-white/50 uppercase tracking-[0.16em]">
            Listing Reference
          </p>
          <p className="font-display font-extrabold text-[#c49a4f] text-xl tracking-[0.06em]">
            {listing.listingRef}
          </p>
        </div>

        {/* ── Listing card preview ──────────────────────────────────────── */}
        <div className="w-full bg-white border border-[#e8dfd4] rounded-3xl overflow-hidden text-left shadow-sm">
          {/* Image */}
          <div className="relative w-full h-44">
            {listing.imageUrl ? (
              <Image
                src={listing.imageUrl}
                alt={listing.title}
                fill
                className="object-cover"
                sizes="560px"
              />
            ) : (
              <div className="w-full h-full bg-[#f4efe6] flex items-center justify-center">
                <span className="text-4xl">🏡</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-5">
              <p className="font-display font-bold text-white text-lg leading-tight">
                {listing.title}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {listing.category && (
                  <span className="text-white/70 text-xs">
                    {CATEGORY_LABELS[listing.category] ?? listing.category}
                  </span>
                )}
                {listing.region && (
                  <>
                    <span className="text-white/40 text-xs">·</span>
                    <span className="text-white/70 text-xs">{listing.region}</span>
                  </>
                )}
              </div>
            </div>

            {/* Pending badge */}
            <span className="absolute top-3 right-3 bg-[#f5c842] text-[#1a0e02] text-[10px] font-bold px-2.5 py-1 rounded-xl">
              Pending Review
            </span>
          </div>

          {/* Details */}
          <div className="p-5 grid grid-cols-2 gap-4">
            {[
              { label: "Category",   value: CATEGORY_LABELS[listing.category] ?? "—" },
              { label: "Region",     value: listing.region || "—" },
              { label: "Price",      value: listing.price > 0 ? `SAR ${listing.price} / person` : "—" },
              { label: "Status",     value: "Pending Review" },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[10px] font-bold text-[#64707d] uppercase tracking-widest mb-0.5">
                  {label}
                </p>
                <p className="text-sm font-semibold text-[#1a0e02]">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── What happens next ────────────────────────────────────────── */}
        <div className="w-full bg-white border border-[#e8dfd4] rounded-2xl p-5 text-left">
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#f4efe6] flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#8b5e38" strokeWidth="1.8" />
                <path d="M12 8v4M12 16h.01"
                  stroke="#8b5e38" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-[#1a0e02] text-sm mb-2">What happens next?</p>
              <ul className="flex flex-col gap-2">
                {[
                  "Our team reviews your listing for quality and policy compliance (1–2 business days).",
                  "You'll receive an email notification once your listing is approved or if changes are needed.",
                  "Once approved, your listing goes live and guests can start booking.",
                  "You can manage bookings, update pricing, and track earnings from your Host Dashboard.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-[#64707d] leading-relaxed">
                    <span className="w-4 h-4 rounded-full bg-[#f4efe6] border border-[#e8dfd4] text-[#8b5e38] text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
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
            Explore the Platform
          </Link>
          <Link
            href="/host/new"
            className="flex-1 py-3.5 bg-[#8b5e38] font-bold text-sm rounded-2xl text-center hover:bg-[#7a5030] transition-colors"
            style={{ color: "#fff" }}
          >
            Add Another Listing
          </Link>
        </div>
      </div>
    </div>
  );
}
