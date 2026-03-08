"use client";

interface UserEmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; href: string };
}

export default function UserEmptyState({
  icon, title, description, action,
}: UserEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-[#f0e8de] flex items-center justify-center text-[#8b5e38] mb-4">
        {icon}
      </div>
      <h3 className="font-display font-semibold text-[#1a0e02] text-base mb-1.5">{title}</h3>
      <p className="text-sm text-[#64707d] max-w-xs leading-relaxed">{description}</p>
      {action && (
        <a
          href={action.href}
          className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-[#8b5e38] text-white text-sm font-semibold rounded-xl hover:bg-[#7a5030] transition-colors"
        >
          {action.label}
        </a>
      )}
    </div>
  );
}
