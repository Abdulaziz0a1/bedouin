const STEPS = [
  { n: 1, label: "Review" },
  { n: 2, label: "Your Details" },
  { n: 3, label: "Payment" },
] as const;

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3;
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center">
      {STEPS.map((step, i) => {
        const done   = step.n < currentStep;
        const active = step.n === currentStep;

        return (
          <div key={step.n} className="flex items-center">
            {/* Connector line between steps */}
            {i > 0 && (
              <div
                className={`w-16 sm:w-24 h-0.5 transition-colors ${
                  step.n <= currentStep ? "bg-[#8b5e38]" : "bg-[#e8dfd4]"
                }`}
              />
            )}

            <div className="flex flex-col items-center gap-1.5">
              {/* Circle */}
              <div
                className={[
                  "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300",
                  done   ? "bg-[#8b5e38] text-white"                     : "",
                  active ? "bg-[#1a0e02] text-white ring-4 ring-[#1a0e02]/10" : "",
                  !done && !active ? "bg-white border-2 border-[#e8dfd4] text-[#a09080]" : "",
                ].join(" ")}
              >
                {done ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12l5 5 9-9"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  step.n
                )}
              </div>

              {/* Label */}
              <span
                className={`text-xs font-medium whitespace-nowrap transition-colors ${
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
  );
}
