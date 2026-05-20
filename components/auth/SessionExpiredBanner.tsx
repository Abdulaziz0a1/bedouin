"use client";

import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageProvider";

interface SessionExpiredBannerProps {
  /** Override the returnTo path. Defaults to the current pathname. */
  returnTo?: string;
}

export default function SessionExpiredBanner({ returnTo }: SessionExpiredBannerProps) {
  const { t, dir }  = useLanguage();
  const pathname    = usePathname();
  const destination = returnTo ?? pathname;
  const loginUrl    = `/login?returnTo=${encodeURIComponent(destination)}`;

  return (
    <div
      dir={dir}
      className="flex flex-col gap-3 bg-[#fdf5ee] border border-[#e8c89a] rounded-xl px-4 py-4 mb-4"
    >
      <div className="flex items-start gap-2.5">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          className="shrink-0 mt-0.5 text-[#8b5e38]"
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="M12 8v4M12 16h.01"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <p className="text-sm text-[#7a4f22]">{t("session.expired")}</p>
      </div>
      <a
        href={loginUrl}
        className="self-start text-sm font-semibold text-white bg-[#8b5e38] hover:bg-[#7a5030] px-4 py-2 rounded-lg transition-colors"
      >
        {t("session.login_again")}
      </a>
    </div>
  );
}
