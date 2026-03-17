"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";

// ──────────────────────────────────────────────────────────────────────────────
// Nav links visible to everyone
// ──────────────────────────────────────────────────────────────────────────────

const PUBLIC_LINKS = [
  { href: "/explore", label: "Explore" },
  { href: "/faq",     label: "Help"    },
];

// ──────────────────────────────────────────────────────────────────────────────
// Mode-switch button
// ──────────────────────────────────────────────────────────────────────────────

function ModeSwitchButton({
  activeMode,
  hostStatus,
  isAdmin,
  onSwitch,
  isPending,
}: {
  activeMode: "tourist" | "host";
  hostStatus: "pending" | "approved" | "rejected" | null;
  isAdmin:    boolean;
  onSwitch:   () => void;
  isPending:  boolean;
}) {
  if (isAdmin) return null;

  // Already in host mode → show "Switch to Travelling"
  if (activeMode === "host") {
    return (
      <button
        onClick={onSwitch}
        disabled={isPending}
        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#1a0e02] bg-[#f0e8de] border border-[#dddfe3] rounded-xl hover:bg-[#e8dfd4] transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
          <path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
        {isPending ? "Switching…" : "Switch to Travelling"}
      </button>
    );
  }

  // Pending application → show status pill (not a switch button)
  if (hostStatus === "pending") {
    return (
      <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#b17a50] bg-[#fdf5ee] border border-[#e8dfd4] rounded-xl shrink-0">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        Host Application Pending
      </span>
    );
  }

  // Approved → show "Switch to Hosting"
  if (hostStatus === "approved") {
    return (
      <button
        onClick={onSwitch}
        disabled={isPending}
        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#461e00] rounded-xl hover:bg-[#5a2a00] transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {isPending ? "Switching…" : "Switch to Hosting"}
      </button>
    );
  }

  // null or rejected → prompt to apply / re-apply
  return (
    <Link
      href="/host/onboarding"
      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#461e00] rounded-xl hover:bg-[#5a2a00] transition-colors shadow-sm shrink-0"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {hostStatus === "rejected" ? "Re-apply as Host" : "Become a Host"}
    </Link>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Navbar
// ──────────────────────────────────────────────────────────────────────────────

export default function Navbar() {
  const { user, activeMode, isAdmin, hostStatus, signOut, switchMode } = useAuth();
  const [open,         setOpen]         = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [switchError,  setSwitchErr]    = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDropdownRef = (el: HTMLDivElement | null) => {
    (dropdownRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
  };
  const handleBackdropClick = () => setDropdownOpen(false);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await signOut();
    router.push("/");
    router.refresh();
  };

  // ── Mode switch (only fires when hostStatus === 'approved') ────────────────
  const handleSwitch = () => {
    setSwitchErr(null);
    const targetMode = activeMode === "tourist" ? "host" : "tourist";

    startTransition(async () => {
      const result = await switchMode(targetMode);
      if (result.success) {
        if (targetMode === "host") {
          router.push("/dashboard");
        } else {
          router.push("/account");
        }
        router.refresh();
      } else {
        setSwitchErr(result.error ?? "Could not switch mode.");
      }
    });
  };

  // ── Display helpers ───────────────────────────────────────────────────────
  const firstName   = (user?.user_metadata?.first_name as string | undefined) ?? "";
  const lastName    = (user?.user_metadata?.last_name  as string | undefined) ?? "";
  const initials    = firstName ? firstName.charAt(0).toUpperCase() : (user?.email?.charAt(0).toUpperCase() ?? "?");
  const displayName = firstName || "Account";

  return (
    <>
      {dropdownOpen && (
        <div className="fixed inset-0 z-40" onClick={handleBackdropClick} />
      )}

      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#e8dfd4]">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10 h-[72px] flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-[#e8dfd4] shrink-0">
              <Image src="/logo.png" alt="Bedouin" width={40} height={40} className="object-cover w-full h-full" priority />
            </div>
            <span className="font-display font-bold text-xl text-[#2b1a0e] tracking-tight leading-none group-hover:text-[#8b5e38] transition-colors">
              Bedouin
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6 flex-1">
            {PUBLIC_LINKS.map(({ href, label }) => (
              <Link key={label} href={href} className="text-[#5a4a3a] text-sm font-medium hover:text-[#2b1a0e] transition-colors">
                {label}
              </Link>
            ))}
            {user && activeMode === "host" && !isAdmin && (
              <Link href="/dashboard" className="text-[#5a4a3a] text-sm font-medium hover:text-[#2b1a0e] transition-colors">
                My Listings
              </Link>
            )}
            {user && isAdmin && (
              <Link href="/admin" className="text-[#8b5e38] text-sm font-semibold hover:text-[#7a5030] transition-colors">
                Admin Panel
              </Link>
            )}
          </div>

          {/* Desktop auth area */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            {user ? (
              <>
                <ModeSwitchButton
                  activeMode={activeMode}
                  hostStatus={hostStatus}
                  isAdmin={isAdmin}
                  onSwitch={handleSwitch}
                  isPending={isPending}
                />

                <div ref={handleDropdownRef} className="relative z-50">
                  <button
                    onClick={() => setDropdownOpen((v) => !v)}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-[#f4efe6] transition-colors"
                    aria-label="Account menu"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ring-2 ${
                      isAdmin
                        ? "bg-[#1a0e02] ring-[#461e00]"
                        : activeMode === "host"
                          ? "bg-[#461e00] ring-[#8b5e38]"
                          : "bg-[#8b5e38] ring-[#dddfe3]"
                    }`}>
                      {initials}
                    </div>
                    <span className="text-sm font-semibold text-[#1a0e02]">{displayName}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={`text-[#8b94a4] transition-transform ${dropdownOpen ? "rotate-180" : ""}`}>
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-[#e8dfd4] shadow-[0_8px_32px_rgba(0,0,0,0.10)] overflow-hidden z-50">
                      {/* User info */}
                      <div className="px-4 py-3 border-b border-[#f0e8de]">
                        <p className="text-xs font-bold text-[#1a0e02] truncate">{firstName} {lastName}</p>
                        <p className="text-[11px] text-[#8b94a4] truncate">{user.email}</p>
                        <span className={`inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                          isAdmin
                            ? "bg-[#f4efe6] text-[#461e00]"
                            : activeMode === "host"
                              ? "bg-[#fdf5ee] text-[#8b5e38]"
                              : "bg-[#f0f9ff] text-[#0046cc]"
                        }`}>
                          {isAdmin ? "Admin" : activeMode === "host" ? "Host mode" : "Tourist mode"}
                        </span>
                      </div>

                      <Link href="/account" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-3 text-sm text-[#1a0e02] hover:bg-[#f4efe6] transition-colors">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-[#8b5e38]">
                          <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
                          <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                        My Account
                      </Link>

                      {(activeMode === "host" || isAdmin) && (
                        <Link href="/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-3 text-sm text-[#1a0e02] hover:bg-[#f4efe6] transition-colors">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-[#8b5e38]">
                            <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
                            <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
                            <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
                            <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
                          </svg>
                          Host Dashboard
                        </Link>
                      )}

                      {activeMode === "host" && !isAdmin && (
                        <Link href="/host/new" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-3 text-sm text-[#1a0e02] hover:bg-[#f4efe6] transition-colors">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-[#8b5e38]">
                            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                          </svg>
                          Add Listing
                        </Link>
                      )}

                      {isAdmin && (
                        <Link href="/admin" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-3 text-sm text-[#8b5e38] hover:bg-[#f4efe6] transition-colors font-semibold">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-[#8b5e38]">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                          </svg>
                          Admin Panel
                        </Link>
                      )}

                      <div className="border-t border-[#f0e8de]" />

                      <button onClick={handleLogout} className="flex items-center gap-2.5 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-red-500">
                          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Log Out
                      </button>
                    </div>
                  )}
                </div>

                {switchError && (
                  <p className="absolute top-[72px] right-4 text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-xl shadow-sm z-50">
                    {switchError}
                  </p>
                )}
              </>
            ) : (
              <>
                <Link href="/host" className="px-4 py-2 text-sm font-semibold text-white bg-[#8b5e38] rounded-xl hover:bg-[#7a5030] transition-colors shadow-sm">
                  Become A Bedouin
                </Link>
                <Link href="/login" className="px-4 py-2 text-sm font-semibold text-white bg-[#8b5e38] rounded-xl hover:bg-[#7a5030] transition-colors shadow-sm">
                  Login
                </Link>
                <button aria-label="Support" className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#f4efe6] transition-colors text-[#5a4a3a]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
                    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2 text-[#2b1a0e] rounded-lg hover:bg-[#f4efe6] transition-colors" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
            {open ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <div className="md:hidden bg-white border-t border-[#e8dfd4] px-6 py-4 flex flex-col gap-3">
            {PUBLIC_LINKS.map(({ href, label }) => (
              <Link key={label} href={href} onClick={() => setOpen(false)} className="text-sm font-medium text-[#5a4a3a] py-1">
                {label}
              </Link>
            ))}

            <div className="flex flex-col gap-2 pt-3 border-t border-[#e8dfd4]">
              {user ? (
                <>
                  <div className="flex items-center gap-2.5 py-1">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                      isAdmin ? "bg-[#1a0e02]" : activeMode === "host" ? "bg-[#461e00]" : "bg-[#8b5e38]"
                    }`}>
                      {initials}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-[#1a0e02]">{displayName}</span>
                      <span className={`ml-2 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                        isAdmin ? "bg-[#f4efe6] text-[#461e00]" : activeMode === "host" ? "bg-[#fdf5ee] text-[#8b5e38]" : "bg-[#f0f9ff] text-[#0046cc]"
                      }`}>
                        {isAdmin ? "Admin" : activeMode === "host" ? "Host" : "Tourist"}
                      </span>
                    </div>
                  </div>

                  <Link href="/account"  onClick={() => setOpen(false)} className="py-2 text-sm font-medium text-[#5a4a3a]">My Account</Link>

                  {(activeMode === "host" || isAdmin) && (
                    <Link href="/dashboard" onClick={() => setOpen(false)} className="py-2 text-sm font-medium text-[#5a4a3a]">Host Dashboard</Link>
                  )}
                  {activeMode === "host" && !isAdmin && (
                    <Link href="/host/new" onClick={() => setOpen(false)} className="py-2 text-sm font-medium text-[#5a4a3a]">Add Listing</Link>
                  )}
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setOpen(false)} className="py-2 text-sm font-semibold text-[#8b5e38]">Admin Panel</Link>
                  )}

                  {/* Mode switch */}
                  {!isAdmin && (
                    activeMode === "host"
                      ? (
                        <button
                          onClick={() => { setOpen(false); handleSwitch(); }}
                          disabled={isPending}
                          className="text-left py-2 text-sm font-semibold text-[#0046cc] disabled:opacity-60"
                        >
                          {isPending ? "Switching…" : "Switch to Travelling"}
                        </button>
                      )
                      : hostStatus === "pending"
                        ? (
                          <span className="py-2 text-sm text-[#b17a50] font-semibold">
                            Host Application Pending
                          </span>
                        )
                        : hostStatus === "approved"
                          ? (
                            <button
                              onClick={() => { setOpen(false); handleSwitch(); }}
                              disabled={isPending}
                              className="text-left py-2 text-sm font-semibold text-[#461e00] disabled:opacity-60"
                            >
                              {isPending ? "Switching…" : "Switch to Hosting"}
                            </button>
                          )
                          : (
                            <Link
                              href="/host/onboarding"
                              onClick={() => setOpen(false)}
                              className="py-2 text-sm font-semibold text-[#461e00]"
                            >
                              {hostStatus === "rejected" ? "Re-apply as Host" : "Become a Host"}
                            </Link>
                          )
                  )}

                  <button onClick={() => { setOpen(false); handleLogout(); }} className="text-left py-2 text-sm font-semibold text-red-600">
                    Log Out
                  </button>
                </>
              ) : (
                <div className="flex gap-3">
                  <Link href="/login"  onClick={() => setOpen(false)} className="flex-1 text-center py-2.5 text-sm font-semibold text-white bg-[#8b5e38] rounded-xl">Login</Link>
                  <Link href="/signup" onClick={() => setOpen(false)} className="flex-1 text-center py-2.5 text-sm font-semibold text-white bg-[#8b5e38] rounded-xl">Sign up</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
