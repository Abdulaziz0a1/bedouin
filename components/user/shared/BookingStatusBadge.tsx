"use client";

import type { UserBooking } from "@/lib/types/user";
import { useLanguage } from "@/context/LanguageProvider";

type Status = UserBooking["status"];

const CONFIG: Record<
  Status,
  { labelKey: string; dot: string; bg: string; text: string; border: string }
> = {
  upcoming: {
    labelKey: "status.upcoming",
    dot:    "bg-[#c49a4f]",
    bg:     "bg-[#fdf8ee]",
    text:   "text-[#8b6a1f]",
    border: "border-[#ead9a6]",
  },
  confirmed: {
    labelKey: "status.confirmed",
    dot:    "bg-[#0046cc]",
    bg:     "bg-[#eef3ff]",
    text:   "text-[#0036a3]",
    border: "border-[#b3c8f5]",
  },
  active: {
    labelKey: "status.checked_in",
    dot:    "bg-[#049153]",
    bg:     "bg-[#f0faf5]",
    text:   "text-[#049153]",
    border: "border-[#c3e8d6]",
  },
  completed: {
    labelKey: "status.completed",
    dot:    "bg-[#a0aab8]",
    bg:     "bg-[#f4f6f8]",
    text:   "text-[#64707d]",
    border: "border-[#dddfe3]",
  },
  cancelled: {
    labelKey: "status.cancelled",
    dot:    "bg-red-400",
    bg:     "bg-red-50",
    text:   "text-red-600",
    border: "border-red-200",
  },
};

export default function BookingStatusBadge({
  status,
  size = "md",
}: {
  status: Status;
  size?: "sm" | "md";
}) {
  const { t } = useLanguage();
  const c = CONFIG[status];
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full border font-semibold",
        size === "sm"
          ? "px-2 py-0.5 text-[10px]"
          : "px-2.5 py-1 text-[11px]",
        c.bg, c.text, c.border,
      ].join(" ")}
    >
      <span className={`rounded-full ${c.dot} ${size === "sm" ? "w-1.5 h-1.5" : "w-1.5 h-1.5"}`} />
      {t(c.labelKey)}
    </span>
  );
}
