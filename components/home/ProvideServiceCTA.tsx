"use client";

import Link from "next/link";
import FadeInSection from "@/components/ui/FadeInSection";
import { useLanguage } from "@/context/LanguageProvider";

const KeyIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7.5" cy="15.5" r="4.5"/>
    <path d="M21 2l-9.6 9.6"/>
    <path d="M15.5 7.5L17 6l2 2-1.5 1.5"/>
  </svg>
);

const BrushIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.06 11.9l8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"/>
    <path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1 1 2.26 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z"/>
  </svg>
);

const MapIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
    <line x1="9" y1="3" x2="9" y2="18"/>
    <line x1="15" y1="6" x2="15" y2="21"/>
  </svg>
);

const CameraIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

const WrenchIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
);

const ChatIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const SERVICES = [
  { icon: <KeyIcon />,    labelKey: "service_cta.svc.checkin" },
  { icon: <BrushIcon />,  labelKey: "service_cta.svc.cleaning" },
  { icon: <MapIcon />,    labelKey: "service_cta.svc.guide" },
  { icon: <CameraIcon />, labelKey: "service_cta.svc.photography" },
  { icon: <WrenchIcon />, labelKey: "service_cta.svc.maintenance" },
  { icon: <ChatIcon />,   labelKey: "service_cta.svc.support" },
];

const POINT_KEYS = [
  "service_cta.point1",
  "service_cta.point2",
  "service_cta.point3",
];

export default function ProvideServiceCTA() {
  const { t } = useLanguage();

  return (
    <section className="py-20 relative overflow-hidden" style={{ background: "#ffffff" }}>
      {/* Top subtle border */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, #e8dfd4 30%, #e8dfd4 70%, transparent)" }}
      />

      <div className="max-w-[1232px] mx-auto px-6 lg:px-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

          {/* Left: copy */}
          <FadeInSection direction="left" delay={0}>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="h-px w-8"
                  style={{ background: "linear-gradient(90deg, transparent, #c49a4f)" }}
                />
                <span className="text-[#c49a4f] text-xs font-bold uppercase tracking-[0.20em]">
                  {t("service_cta.eyebrow")}
                </span>
              </div>

              <h2
                className="font-display font-extrabold text-[#1a0e02] leading-tight mb-4 tracking-tight"
                style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)" }}
              >
                {t("service_cta.heading")}
              </h2>

              <p className="text-[#64707d] text-base leading-relaxed mb-7 max-w-md">
                {t("service_cta.body")}
              </p>

              <div className="flex flex-col gap-3.5 mb-8">
                {POINT_KEYS.map((key) => (
                  <div key={key} className="flex items-center gap-3">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        background: "linear-gradient(135deg, #f4efe6, #ede4d6)",
                        border: "1px solid #e8dfd4",
                      }}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17l-5-5" stroke="#8b5e38" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span className="text-sm text-[#1a0e02] font-medium">{t(key)}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/provide-service"
                  className="inline-flex items-center justify-center gap-2 font-bold px-7 py-3.5 rounded-2xl text-sm transition-all duration-200 hover:-translate-y-px group"
                  style={{
                    background: "linear-gradient(135deg, #1a0e02 0%, #2d1a07 100%)",
                    color: "white",
                    boxShadow: "0 4px 16px rgba(26,14,2,0.25)",
                  }}
                >
                  {t("service_cta.primary")}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  >
                    <path d="M9 18l6-6-6-6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                <Link
                  href="/cohost"
                  className="inline-flex items-center justify-center gap-2 font-semibold px-7 py-3.5 rounded-2xl text-sm transition-all duration-200 hover:border-[#8b5e38] hover:bg-[#fdf9f6]"
                  style={{
                    border: "1.5px solid #dddfe3",
                    color: "#1a0e02",
                  }}
                >
                  {t("service_cta.secondary")}
                </Link>
              </div>
            </div>
          </FadeInSection>

          {/* Right: service grid */}
          <FadeInSection direction="right" delay={80}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {SERVICES.map(({ icon, labelKey }, i) => (
                <div
                  key={labelKey}
                  className="rounded-[18px] p-5 flex flex-col items-center gap-3 text-center cursor-default"
                  style={{
                    background: "linear-gradient(148deg, #faf5ee 0%, #f4efe6 100%)",
                    border: "1px solid rgba(232,223,212,0.90)",
                    boxShadow: "0 2px 8px rgba(70,30,0,0.04)",
                    animationDelay: `${i * 60}ms`,
                    transition: "transform 0.28s cubic-bezier(0.16,1,0.3,1), box-shadow 0.28s cubic-bezier(0.16,1,0.3,1), border-color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.transform = "translateY(-4px)";
                    el.style.boxShadow = "0 10px 28px rgba(70,30,0,0.10)";
                    el.style.borderColor = "rgba(196,154,79,0.36)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.transform = "";
                    el.style.boxShadow = "0 2px 8px rgba(70,30,0,0.04)";
                    el.style.borderColor = "rgba(232,223,212,0.90)";
                  }}
                >
                  <div className="text-[#8b5e38]">{icon}</div>
                  <span className="text-[11.5px] font-semibold text-[#2b1a0e] leading-tight">{t(labelKey)}</span>
                </div>
              ))}
            </div>
          </FadeInSection>
        </div>
      </div>
    </section>
  );
}
