"use client";

interface DashboardEmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; href: string };
}

export default function DashboardEmptyState({ icon, title, description, action }: DashboardEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {/* Icon with ambient glow ring */}
      <div className="relative mb-5">
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(196,154,79,0.12) 0%, transparent 72%)",
            transform: "scale(2.2)",
          }}
          aria-hidden="true"
        />
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-[#8b5e38] relative"
          style={{
            background: "linear-gradient(135deg, #f9f1e7 0%, #ede4d4 100%)",
            border: "1.5px solid rgba(196,154,79,0.28)",
            boxShadow: "0 4px 18px rgba(139,94,60,0.13), 0 1px 4px rgba(139,94,60,0.08)",
          }}
        >
          {icon}
        </div>
      </div>

      {/* Gold accent rule */}
      <div className="gold-rule mb-4" />

      <h3 className="font-display font-semibold text-[#1a0e02] text-base mb-2">{title}</h3>
      <p className="text-sm text-[#64707d] max-w-xs leading-relaxed">{description}</p>
      {action && (
        <a
          href={action.href}
          className="mt-6 inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 hover:-translate-y-px"
          style={{
            background: "linear-gradient(135deg, #8b5e38 0%, #7a5030 100%)",
            color: "white",
            boxShadow: "0 4px 14px rgba(139,94,60,0.28)",
          }}
        >
          {action.label}
        </a>
      )}
    </div>
  );
}
