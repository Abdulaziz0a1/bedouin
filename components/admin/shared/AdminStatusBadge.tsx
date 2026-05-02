"use client";

import type { AdminListingStatus } from "@/lib/types/admin";

type Size = "sm" | "md" | "lg";

const CONFIG: Record<
  AdminListingStatus,
  { label: string; dot: string; bg: string; text: string; border: string }
> = {
  pending_review: {
    label:  "Pending Review",
    dot:    "bg-[#c49a4f]",
    bg:     "bg-[#fdf8ee]",
    text:   "text-[#8b6a1f]",
    border: "border-[#ead9a6]",
  },
  approved: {
    label:  "Approved",
    dot:    "bg-[#049153]",
    bg:     "bg-[#f0faf5]",
    text:   "text-[#049153]",
    border: "border-[#c3e8d6]",
  },
  rejected: {
    label:  "Rejected",
    dot:    "bg-red-500",
    bg:     "bg-red-50",
    text:   "text-red-700",
    border: "border-red-200",
  },
};

const SIZE_CLS: Record<Size, string> = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-1 text-[11px]",
  lg: "px-3 py-1.5 text-xs",
};

export default function AdminStatusBadge({
  status,
  size = "md",
}: {
  status: AdminListingStatus;
  size?: Size;
}) {
  const c = CONFIG[status] ?? CONFIG.pending_review;
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full border font-semibold",
        SIZE_CLS[size],
        c.bg, c.text, c.border,
      ].join(" ")}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
      {c.label}
    </span>
  );
}
