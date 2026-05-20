"use client";

import Link from "next/link";
import { Host } from "@/lib/data/listing-details";
import UserAvatar from "@/components/ui/UserAvatar";
import { useLanguage } from "@/context/LanguageProvider";

interface HostCardProps {
  host: Host;
  messageHref: string | null;
}

export default function HostCard({ host, messageHref }: HostCardProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-5">
      {/* Host header */}
      <div className="flex items-start gap-4">
        <UserAvatar src={host.avatar} name={host.name} size={64} />
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-bold text-[#1a0e02] text-xl leading-tight">
              {t("host.hosted_by").replace("{name}", host.name)}
            </h3>
            {host.superhost && (
              <span className="flex items-center gap-1 bg-[#fff4e5] border border-[#f0dcc8] text-[#8b5e38] text-[10px] font-bold px-2 py-0.5 rounded-full">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#c49a4f">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                {t("host.superhost")}
              </span>
            )}
          </div>
          <p className="text-[#64707d] text-sm">
            {t("host.joined")
              .replace("{year}", String(host.joinedYear))
              .replace("{reviews}", String(host.reviewCount))}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#8b5e38" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="7" r="4" stroke="#8b5e38" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-sm text-[#64707d]">{t("host.response_rate").replace("{rate}", String(host.responseRate))}</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#8b5e38" strokeWidth="1.8" />
            <polyline points="12 6 12 12 16 14" stroke="#8b5e38" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-sm text-[#64707d]">{t("host.responds").replace("{time}", host.responseTime)}</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#8b5e38" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-sm text-[#64707d]">{host.languages.join(", ")}</span>
        </div>
      </div>

      {/* Bio */}
      <p className="text-[#2b3037] text-sm leading-relaxed">{host.bio}</p>

      {messageHref ? (
        <Link
          href={messageHref}
          className="self-start px-5 py-2.5 border border-[#1a0e02] text-[#1a0e02] text-sm font-semibold rounded-xl hover:bg-[#1a0e02] hover:text-white transition-colors"
        >
          {t("host.message")}
        </Link>
      ) : (
        <button
          disabled
          className="self-start px-5 py-2.5 border border-[#dddfe3] text-[#8b94a4] text-sm font-semibold rounded-xl cursor-not-allowed"
        >
          {t("host.message")}
        </button>
      )}
    </div>
  );
}
