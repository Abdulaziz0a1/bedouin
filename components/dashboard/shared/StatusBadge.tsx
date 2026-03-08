"use client";

import type { DashboardListing } from "@/lib/data/dashboard";

type Status = DashboardListing["status"];

const CONFIG: Record<Status, { label: string; dot: string; bg: string; text: string; border: string }> = {
  approved: {
    label: "Live",
    dot:   "bg-[#049153]",
    bg:    "bg-[#f0faf5]",
    text:  "text-[#049153]",
    border:"border-[#c3e8d6]",
  },
  pending_review: {
    label: "In Review",
    dot:   "bg-[#c49a4f]",
    bg:    "bg-[#fdf8ee]",
    text:  "text-[#8b6a1f]",
    border:"border-[#ead9a6]",
  },
  rejected: {
    label: "Rejected",
    dot:   "bg-red-500",
    bg:    "bg-red-50",
    text:  "text-red-700",
    border:"border-red-200",
  },
  draft: {
    label: "Draft",
    dot:   "bg-[#a0aab8]",
    bg:    "bg-[#f4f6f8]",
    text:  "text-[#64707d]",
    border:"border-[#dddfe3]",
  },
};

export default function StatusBadge({ status }: { status: Status }) {
  const c = CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}
