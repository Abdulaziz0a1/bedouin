"use client";

// Messaging backend is not yet implemented.
// This component renders an honest empty state for authenticated users.
// When a real-time messaging service is integrated, this file will be the
// entry point for wiring conversations from Supabase Realtime or a similar channel.

export default function MessagesClient({ userId }: { userId: string }) {
  return (
    <div className="flex flex-col" style={{ height: "100dvh" }}>

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-[#e8dfd4] sticky top-0 z-40 shrink-0">
        <div className="max-w-[1440px] mx-auto px-5 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <a href="/" className="font-display font-extrabold text-[#1a0e02] text-xl tracking-tight">
              Bedouin
            </a>
            <span className="text-[#e8dfd4]">·</span>
            <span className="text-sm font-semibold text-[#64707d]">Messages</span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/account"
              className="p-2 rounded-xl hover:bg-[#f4f6f8] transition-colors text-[#64707d]"
              title="My account"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </a>
            <a
              href="/"
              className="p-2 rounded-xl hover:bg-[#f4f6f8] transition-colors text-[#64707d]"
              title="Home"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      {/* ── Empty state ──────────────────────────────────────────────────────── */}
      <div className="flex flex-1 items-center justify-center bg-[#f4efe6] px-6">
        <div className="flex flex-col items-center text-center max-w-sm">

          {/* Icon */}
          <div className="w-20 h-20 rounded-2xl bg-white border border-[#e8dfd4] flex items-center justify-center text-[#8b5e38] mb-5 shadow-sm">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Heading + label */}
          <div className="flex items-center gap-2 mb-2">
            <h2 className="font-display font-bold text-[#1a0e02] text-xl">Messages</h2>
            <span className="text-[10px] font-bold text-[#8b6a1f] bg-[#fdf8ee] border border-[#ead9a6] px-2 py-0.5 rounded-full uppercase tracking-wide">
              Coming Soon
            </span>
          </div>

          <p className="text-sm text-[#64707d] leading-relaxed mb-6">
            Real-time messaging between guests and hosts is under development.
            Once live, all your booking conversations will appear here.
          </p>

          {/* CTA */}
          <a
            href="/explore"
            className="px-5 py-2.5 bg-[#8b5e38] text-white text-sm font-semibold rounded-xl hover:bg-[#7a5030] transition-colors"
          >
            Explore experiences
          </a>
        </div>
      </div>

    </div>
  );
}
