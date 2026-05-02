"use client";

import { useState } from "react";

type Variant = "warning" | "error" | "success" | "info";

const STYLES: Record<Variant, {
  wrapper:    string;
  iconColor:  string;
  titleColor: string;
  descColor:  string;
  closeHover: string;
}> = {
  warning: {
    wrapper:    "bg-[#fdf8ee] border-[#ead9a6]",
    iconColor:  "text-[#c49a4f]",
    titleColor: "text-[#8b6a1f]",
    descColor:  "text-[#a08040]",
    closeHover: "hover:bg-[#ead9a6] text-[#a08040]",
  },
  error: {
    wrapper:    "bg-red-50 border-red-200",
    iconColor:  "text-red-500",
    titleColor: "text-red-700",
    descColor:  "text-red-600",
    closeHover: "hover:bg-red-100 text-red-400",
  },
  success: {
    wrapper:    "bg-[#f0faf5] border-[#c3e8d6]",
    iconColor:  "text-[#049153]",
    titleColor: "text-[#049153]",
    descColor:  "text-[#049153]",
    closeHover: "hover:bg-[#c3e8d6] text-[#049153]",
  },
  info: {
    wrapper:    "bg-[#f0f4ff] border-[#b3c8f5]",
    iconColor:  "text-[#0046cc]",
    titleColor: "text-[#0036a3]",
    descColor:  "text-[#0036a3]",
    closeHover: "hover:bg-[#d4e0ff] text-[#0046cc]",
  },
};

function DefaultIcon({ variant, size }: { variant: Variant; size: number }) {
  if (variant === "success") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

interface AlertBannerProps {
  variant:      Variant;
  title:        string;
  description?: React.ReactNode;
  icon?:        React.ReactNode;
  dismissible?: boolean;
  /** Renders a smaller inline pill instead of the full-block banner. */
  compact?:     boolean;
  className?:   string;
}

export default function AlertBanner({
  variant,
  title,
  description,
  icon,
  dismissible = false,
  compact     = false,
  className   = "",
}: AlertBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const s = STYLES[variant];

  if (compact) {
    return (
      <div
        className={[
          "w-fit flex items-center gap-2 border rounded-xl px-3 py-2 text-sm",
          s.wrapper, s.titleColor, className,
        ].join(" ")}
      >
        <span className={`shrink-0 ${s.iconColor}`}>
          {icon ?? <DefaultIcon variant={variant} size={14} />}
        </span>
        <span>{title}</span>
        {dismissible && (
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className={`ml-1 p-0.5 rounded transition-colors shrink-0 ${s.closeHover}`}
            aria-label="Dismiss"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={[
        "border rounded-2xl px-5 py-4 flex items-start gap-3",
        s.wrapper, className,
      ].join(" ")}
    >
      <span className={`shrink-0 mt-0.5 ${s.iconColor}`}>
        {icon ?? <DefaultIcon variant={variant} size={18} />}
      </span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${s.titleColor}`}>{title}</p>
        {description && (
          <div className={`text-xs mt-0.5 leading-relaxed ${s.descColor}`}>{description}</div>
        )}
      </div>
      {dismissible && (
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className={`p-1 rounded-lg transition-colors shrink-0 ${s.closeHover}`}
          aria-label="Dismiss"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
