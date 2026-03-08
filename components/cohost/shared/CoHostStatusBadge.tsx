import type { CoHostStatus } from "@/lib/types/cohost";

const CONFIG: Record<CoHostStatus, { label: string; cls: string }> = {
  available: { label: "Available",  cls: "bg-[#f0faf5] text-[#049153] border border-[#9edcbb]" },
  invited:   { label: "Invited",    cls: "bg-[#fdf8ee] text-[#8b6a1f] border border-[#ead9a6]" },
  accepted:  { label: "Accepted",   cls: "bg-[#eef3ff] text-[#0036a3] border border-[#b3c8f5]" },
  assigned:  { label: "Co-hosting", cls: "bg-[#fdf5ee] text-[#8b5e38] border border-[#e8c89a]" },
  declined:  { label: "Declined",   cls: "bg-red-50    text-red-600   border border-red-200"    },
};

interface Props {
  status: CoHostStatus;
  size?: "sm" | "md";
}

export default function CoHostStatusBadge({ status, size = "sm" }: Props) {
  const { label, cls } = CONFIG[status];
  return (
    <span className={`font-bold rounded-full ${size === "sm" ? "text-[9px] px-2 py-0.5" : "text-xs px-2.5 py-1"} ${cls}`}>
      {label}
    </span>
  );
}
