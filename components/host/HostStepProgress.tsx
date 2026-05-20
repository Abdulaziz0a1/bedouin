"use client";

import { useLanguage } from "@/context/LanguageProvider";

const STEPS = [
  { n: 1, labelKey: "host.step.type"      },
  { n: 2, labelKey: "host.step.about"     },
  { n: 3, labelKey: "host.step.details"   },
  { n: 4, labelKey: "host.step.amenities" },
  { n: 5, labelKey: "host.step.pricing"   },
  { n: 6, labelKey: "host.step.review"    },
] as const;

interface HostStepProgressProps {
  currentStep:   1 | 2 | 3 | 4 | 5 | 6;
  /** Step numbers (1–6) that admin flagged as needing fixes. */
  rejectedSteps?: number[];
}

export default function HostStepProgress({ currentStep, rejectedSteps = [] }: HostStepProgressProps) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col gap-3">
      {/* Desktop: circles + labels */}
      <div className="hidden sm:flex items-center justify-center">
        {STEPS.map((step, i) => {
          const done      = step.n < currentStep;
          const active    = step.n === currentStep;
          const rejected  = rejectedSteps.includes(step.n);

          return (
            <div key={step.n} className="flex items-center">
              {i > 0 && (
                <div
                  className={`h-0.5 transition-colors ${
                    step.n <= currentStep ? "bg-[#8b5e38]" : "bg-[#e8dfd4]"
                  }`}
                  style={{ width: "3rem" }}
                />
              )}
              <div className="flex flex-col items-center gap-1.5 relative">
                <div
                  className={[
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                    active && rejected ? "bg-red-600 text-white ring-4 ring-red-600/15" : "",
                    active && !rejected ? "bg-[#1a0e02] text-white ring-4 ring-[#1a0e02]/10" : "",
                    done && rejected ? "bg-red-500 text-white" : "",
                    done && !rejected ? "bg-[#8b5e38] text-white" : "",
                    !done && !active && rejected ? "bg-red-50 border-2 border-red-400 text-red-600" : "",
                    !done && !active && !rejected ? "bg-white border-2 border-[#e8dfd4] text-[#a09080]" : "",
                  ].join(" ")}
                >
                  {done && !rejected ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12l5 5 9-9"
                        stroke="white" strokeWidth="2.5"
                        strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : rejected && !active ? (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                      <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  ) : (
                    step.n
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium whitespace-nowrap transition-colors ${
                    active && rejected ? "text-red-600 font-semibold"
                    : active ? "text-[#1a0e02] font-semibold"
                    : rejected ? "text-red-500 font-semibold"
                    : done   ? "text-[#8b5e38]"
                    : "text-[#a09080]"
                  }`}
                >
                  {t(step.labelKey)}
                  {rejected && (
                    <span className="block text-[9px] text-red-400 font-bold">{t("host.step.fix")}</span>
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile: text + progress bar */}
      <div className="sm:hidden flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-[#1a0e02]">
            {t("host.step.step")} {currentStep} {t("host.step.of")} {STEPS.length} — {t(STEPS[currentStep - 1].labelKey)}
            {rejectedSteps.includes(currentStep) && (
              <span className="ml-1.5 text-xs font-bold text-red-500">{t("host.step.fix_needed")}</span>
            )}
          </span>
          <span className="text-xs text-[#64707d]">
            {Math.round(((currentStep - 1) / STEPS.length) * 100)}{t("host.step.pct_complete")}
          </span>
        </div>
        <div className="w-full h-1.5 bg-[#e8dfd4] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#8b5e38] rounded-full transition-all duration-500"
            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
