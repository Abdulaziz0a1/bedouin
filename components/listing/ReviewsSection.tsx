"use client";

import Image from "next/image";
import { useState } from "react";
import { Review, RatingBreakdown } from "@/lib/data/listing-details";

interface ReviewsSectionProps {
  score: number;
  reviewCount: number;
  reviews: Review[];
  breakdown: RatingBreakdown;
}

function StarRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-[#2b3037] w-36 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-[#e8dfd4] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#1a0e02] rounded-full transition-all"
          style={{ width: `${(value / 5) * 100}%` }}
        />
      </div>
      <span className="text-sm font-semibold text-[#1a0e02] w-7 text-right shrink-0">
        {value.toFixed(1)}
      </span>
    </div>
  );
}

function StarIcons({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} width="12" height="12" viewBox="0 0 24 24" fill={n <= rating ? "#c49a4f" : "#e8dfd4"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export default function ReviewsSection({
  score,
  reviewCount,
  reviews,
  breakdown,
}: ReviewsSectionProps) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? reviews : reviews.slice(0, 4);

  return (
    <div className="flex flex-col gap-8">
      {/* Score header */}
      <div className="flex flex-col sm:flex-row gap-8">
        {/* Big score */}
        <div className="flex flex-col items-center justify-center bg-[#1a0e02] rounded-2xl px-8 py-6 shrink-0 min-w-[140px]">
          <p className="font-display font-extrabold text-white text-5xl leading-none">
            {score.toFixed(1)}
          </p>
          <div className="flex gap-0.5 mt-2">
            {[1,2,3,4,5].map((n) => (
              <svg key={n} width="14" height="14" viewBox="0 0 24 24" fill={n <= Math.round(score) ? "#c49a4f" : "#3d2f20"}>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          <p className="text-white/60 text-xs mt-1">{reviewCount} reviews</p>
        </div>

        {/* Breakdown bars */}
        <div className="flex-1 flex flex-col gap-3 justify-center">
          <StarRow label="Cleanliness"    value={breakdown.cleanliness} />
          <StarRow label="Accuracy"       value={breakdown.accuracy} />
          <StarRow label="Check-in"       value={breakdown.checkin} />
          <StarRow label="Communication"  value={breakdown.communication} />
          <StarRow label="Location"       value={breakdown.location} />
          <StarRow label="Value"          value={breakdown.value} />
        </div>
      </div>

      {/* Reviews grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {visible.map((review) => (
          <div
            key={review.id}
            className="bg-white border border-[#e8dfd4] rounded-2xl p-5 flex flex-col gap-3"
          >
            {/* Reviewer */}
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
                <Image
                  src={review.avatar}
                  alt={review.reviewer}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
              <div>
                <p className="font-semibold text-[#1a0e02] text-sm leading-tight">{review.reviewer}</p>
                <p className="text-[#64707d] text-xs">{review.country} · {review.date}</p>
              </div>
              <div className="ml-auto">
                <StarIcons rating={review.rating} />
              </div>
            </div>
            <p className="text-sm text-[#2b3037] leading-relaxed">{review.comment}</p>
          </div>
        ))}
      </div>

      {reviews.length > 4 && (
        <button
          onClick={() => setShowAll((v) => !v)}
          className="self-start px-5 py-2.5 border border-[#1a0e02] text-[#1a0e02] text-sm font-semibold rounded-xl hover:bg-[#1a0e02] hover:text-white transition-colors"
        >
          {showAll ? "Show fewer reviews" : `Show all ${reviewCount} reviews`}
        </button>
      )}
    </div>
  );
}
