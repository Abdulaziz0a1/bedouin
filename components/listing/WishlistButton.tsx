"use client";

import { useState, useTransition } from "react";
import { toggleWishlist } from "@/lib/actions/wishlist";

interface WishlistButtonProps {
  listingSlug:        string;
  initialSaved?:      boolean;
}

export default function WishlistButton({ listingSlug, initialSaved = false }: WishlistButtonProps) {
  const [saved, setSaved]          = useState(initialSaved);
  const [pending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const result = await toggleWishlist(listingSlug);
      if ("error" in result) {
        if (result.error === "not_authenticated") {
          window.location.href = `/login?returnTo=${encodeURIComponent(window.location.pathname)}`;
        }
        return;
      }
      setSaved(result.saved);
    });
  };

  return (
    <button
      type="button"
      disabled={pending}
      onClick={handleClick}
      className="flex items-center gap-1.5 px-4 py-2 border border-[#e8dfd4] bg-white rounded-xl text-sm font-medium text-[#1a0e02] hover:border-[#8b5e38] transition-colors disabled:opacity-60"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 21S3 14 3 8.5C3 5.42 5.42 3 8.5 3 10.24 3 11.91 3.81 13 5.09 14.09 3.81 15.76 3 17.5 3 20.58 3 23 5.42 23 8.5 23 14 12 21 12 21z"
          stroke={saved ? "#c0392b" : "#8b5e38"}
          fill={saved ? "#c0392b" : "none"}
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {saved ? "Saved" : "Save"}
    </button>
  );
}
