const STEPS = [
  { n: 1, label: "Type"      },
  { n: 2, label: "About"     },
  { n: 3, label: "Details"   },
  { n: 4, label: "Amenities" },
  { n: 5, label: "Pricing"   },
  { n: 6, label: "Review"    },
] as const;

interface HostStepProgressProps {
  currentStep: 1 | 2 | 3 | 4 | 5 | 6;
}

export default function HostStepProgress({ currentStep }: HostStepProgressProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Desktop: circles + labels */}
      <div className="hidden sm:flex items-center justify-center">
        {STEPS.map((step, i) => {
          const done   = step.n < currentStep;
          const active = step.n === currentStep;

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
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={[
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                    done   ? "bg-[#8b5e38] text-white"                           : "",
                    active ? "bg-[#1a0e02] text-white ring-4 ring-[#1a0e02]/10"  : "",
                    !done && !active ? "bg-white border-2 border-[#e8dfd4] text-[#a09080]" : "",
                  ].join(" ")}
                >
                  {done ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12l5 5 9-9"
                        stroke="white" strokeWidth="2.5"
                        strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    step.n
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium whitespace-nowrap transition-colors ${
                    active ? "text-[#1a0e02] font-semibold"
                    : done  ? "text-[#8b5e38]"
                    : "text-[#a09080]"
                  }`}
                >
                  {step.label}
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
            Step {currentStep} of {STEPS.length} — {STEPS[currentStep - 1].label}
          </span>
          <span className="text-xs text-[#64707d]">
            {Math.round(((currentStep - 1) / STEPS.length) * 100)}% complete
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
