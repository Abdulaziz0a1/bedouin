const pillars = [
  {
    icon: (
      /* Dollar / no-hidden-fees */
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path
          d="M14 4v2m0 16v2M10 8.5C10 6.57 11.79 5 14 5s4 1.57 4 3.5c0 2.1-1.79 3.1-4 3.5-2.5.47-4 1.87-4 4S11.79 23 14 23s4-1.57 4-3.5"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "No Hidden Fees",
    body: "Transparent pricing with no hidden fees.",
  },
  {
    icon: (
      /* Shield checkmark / instant booking */
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path
          d="M14 3L5 7v7c0 5.25 3.85 10.15 9 11.33C19.15 24.15 23 19.25 23 14V7l-9-4z"
          stroke="white"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M10 14l3 3 5-5"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Instant Booking",
    body: "Get confirmation right after you reserve.",
  },
  {
    icon: (
      /* Calendar / flexibility */
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="4" y="6" width="20" height="18" rx="2" stroke="white" strokeWidth="1.8" />
        <path d="M9 4v4M19 4v4M4 12h20" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M9 17h2m4 0h2M9 21h2" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    title: "Flexibility",
    body: "Flexible options with cancellation on many listings.",
  },
];

export default function TrustSection() {
  return (
    <section className="bg-white py-16 border-b border-[#e8dfd4]">
      <div className="max-w-[1232px] mx-auto px-6 lg:px-0">

        {/* Relative wrapper for the connecting wave overlay */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16">

          {/* ── Decorative connecting lines (desktop only) ── */}
          <div className="hidden md:block absolute inset-0 pointer-events-none" aria-hidden="true">
            {/* First wave: between col 1 and col 2 */}
            <svg
              className="absolute"
              style={{ left: "calc(33.33% - 40px)", top: "28px", width: "80px", height: "40px" }}
              viewBox="0 0 80 40"
              fill="none"
            >
              <path
                d="M0 20 C20 20, 20 5, 40 5 C60 5, 60 35, 80 20"
                stroke="#ddd4c4"
                strokeWidth="2"
                strokeDasharray="5 4"
                strokeLinecap="round"
              />
              <circle cx="0"  cy="20" r="3" fill="#ddd4c4" />
              <circle cx="80" cy="20" r="3" fill="#ddd4c4" />
            </svg>

            {/* Second wave: between col 2 and col 3 */}
            <svg
              className="absolute"
              style={{ left: "calc(66.67% - 40px)", top: "28px", width: "80px", height: "40px" }}
              viewBox="0 0 80 40"
              fill="none"
            >
              <path
                d="M0 20 C20 20, 20 35, 40 35 C60 35, 60 5, 80 20"
                stroke="#ddd4c4"
                strokeWidth="2"
                strokeDasharray="5 4"
                strokeLinecap="round"
              />
              <circle cx="0"  cy="20" r="3" fill="#ddd4c4" />
              <circle cx="80" cy="20" r="3" fill="#ddd4c4" />
            </svg>
          </div>

          {pillars.map(({ icon, title, body }) => (
            <div key={title} className="flex flex-col items-center text-center gap-5 relative z-10">
              {/* Icon badge */}
              <div className="w-[72px] h-[72px] bg-[#9b7355] rounded-2xl flex items-center justify-center shrink-0 shadow-md">
                {icon}
              </div>
              {/* Text */}
              <div className="flex flex-col gap-1.5">
                <h3 className="font-display font-bold text-[#1a0e02] text-lg leading-tight">
                  {title}
                </h3>
                <p className="text-[#64707d] text-sm leading-relaxed max-w-[220px]">
                  {body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
