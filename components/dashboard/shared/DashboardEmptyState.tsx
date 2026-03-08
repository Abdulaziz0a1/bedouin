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
      <div className="w-16 h-16 rounded-full bg-[#f0e8de] flex items-center justify-center text-[#8b5e38] mb-4">
        {icon}
      </div>
      <h3 className="font-display font-semibold text-[#1a0e02] text-base mb-1">{title}</h3>
      <p className="text-sm text-[#64707d] max-w-xs">{description}</p>
      {action && (
        <a
          href={action.href}
          className="mt-5 inline-block px-5 py-2.5 bg-[#8b5e38] text-white text-sm font-semibold rounded-xl hover:bg-[#7a5030] transition-colors"
        >
          {action.label}
        </a>
      )}
    </div>
  );
}
