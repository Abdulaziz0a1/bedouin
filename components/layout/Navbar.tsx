"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useTransition, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { createClient } from "@/lib/supabase";
import UserAvatar from "@/components/ui/UserAvatar";

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
  const { user, loading, activeMode, isAdmin, hostStatus, signOut, switchMode } = useAuth();
  const [open,          setOpen]          = useState(false);
  const [dropdownOpen,  setDropdownOpen]  = useState(false);
  const [switchError,   setSwitchErr]     = useState<string | null>(null);
  const [isSigningOut,  setIsSigningOut]  = useState(false);
  const [scrolled,      setScrolled]      = useState(false);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router    = useRouter();
  const pathname  = usePathname();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const refreshUnread = useCallback(async () => {
    if (!user) { setUnreadCount(0); return; }
    try {
      const sb = createClient();
      const { count } = await sb
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("receiver_id", user.id)
        .eq("is_read", false)
        .eq("is_deleted", false);
      setUnreadCount(count ?? 0);
    } catch {
      // silent — badge stays at previous value
    }
  }, [user]);

  // Refresh badge on mount, when user changes, and when navigating away from /messages
  useEffect(() => {
    refreshUnread();
  }, [refreshUnread, pathname]);

  const handleDropdownRef = (el: HTMLDivElement | null) => {
    (dropdownRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
  };
  const handleBackdropClick = () => setDropdownOpen(false);

  const handleLogout = () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    setDropdownOpen(false);
    router.push("/");        // navigate immediately — don't wait for network
    signOut().catch(() => {}); // clear session in background
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
      } else {
        setSwitchErr(result.error ?? "Could not switch mode.");
      }
    });
  };

  // ── Display helpers ───────────────────────────────────────────────────────
  const firstName   = (user?.user_metadata?.first_name as string | undefined) ?? "";
  const lastName    = (user?.user_metadata?.last_name  as string | undefined) ?? "";
  const avatarUrl   = (user?.user_metadata?.avatar_url as string | undefined) ?? "";
  const displayName = firstName || "Account";
  const fullName    = `${firstName} ${lastName}`.trim() || user?.email?.split("@")[0] || "User";

  // Transparent overlay mode: only on the home page before scroll
  const isHome = pathname === "/";
  const transparent = isHome && !scrolled;

  return (
    <>
      {dropdownOpen && (
        <div className="fixed inset-0 z-[49]" onClick={handleBackdropClick} />
      )}

      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: transparent
            ? "transparent"
            : scrolled
              ? "rgba(255,252,248,0.98)"
              : "rgba(255,252,248,0.90)",
          backdropFilter: transparent ? "none" : "blur(24px) saturate(2)",
          WebkitBackdropFilter: transparent ? "none" : "blur(24px) saturate(2)",
          borderBottom: transparent
            ? "none"
            : scrolled
              ? "1px solid rgba(232,223,212,0.95)"
              : "1px solid rgba(232,223,212,0.50)",
          boxShadow: (transparent || !scrolled)
            ? "none"
            : "0 2px 20px rgba(70,30,0,0.09), 0 1px 0 rgba(255,255,255,0.9)",
        }}
      >
        {/* Animated gold top bar — hidden when overlaying the hero */}
        {!transparent && <div className="nav-gold-bar" />}
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10 h-[72px] flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div
              className="w-9 h-9 rounded-full overflow-hidden shrink-0 transition-shadow duration-200 group-hover:shadow-[0_0_0_2px_rgba(196,154,79,0.45)]"
              style={{
                border: transparent
                  ? "1.5px solid rgba(255,255,255,0.22)"
                  : "1.5px solid rgba(232,223,212,0.85)",
              }}
            >
              <Image src="/images/bedouin-logo-symbol.jpeg" alt="Bedouin" width={36} height={36} className="object-cover scale-[1.42] origin-center" priority />
            </div>
            <span
              className="font-display font-extrabold text-[1.15rem] leading-none transition-all duration-500"
              style={{
                color: transparent ? "rgba(255,248,235,0.96)" : "#1a0e02",
                letterSpacing: transparent ? "0.01em" : "-0.01em",
                textShadow: transparent ? "0 1px 20px rgba(0,0,0,0.35)" : "none",
              }}
            >
              Bedouin
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6 flex-1 pl-2">
            {PUBLIC_LINKS.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={label}
                  href={href}
                  className={`relative text-[0.8125rem] font-semibold tracking-[0.01em] transition-all duration-200 after:absolute after:bottom-[-3px] after:left-0 after:h-[1.5px] after:bg-[#c49a4f] after:transition-all after:duration-300 hover:after:w-full ${
                    isActive ? "after:w-full" : "after:w-0"
                  } ${
                    transparent
                      ? "text-white/80 hover:text-white"
                      : isActive
                        ? "text-[#1a0e02]"
                        : "text-[#5a4a3a] hover:text-[#1a0e02]"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
            {user && !isAdmin && (
              <Link
                href="/messages"
                className={`relative text-[0.8125rem] font-semibold tracking-[0.01em] transition-all duration-200 flex items-center gap-1.5 after:absolute after:bottom-[-3px] after:left-0 after:w-0 after:h-[1.5px] after:bg-[#c49a4f] after:transition-all after:duration-300 hover:after:w-full ${
                  transparent
                    ? "text-white/80 hover:text-white"
                    : "text-[#5a4a3a] hover:text-[#1a0e02]"
                }`}
              >
                Messages
                {unreadCount > 0 && (
                  <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#8b5e38] text-white text-[10px] font-bold leading-none">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            )}
            {user && activeMode === "host" && !isAdmin && (
              <Link
                href="/dashboard?tab=listings"
                className={`relative text-[0.8125rem] font-semibold tracking-[0.01em] transition-all duration-200 after:absolute after:bottom-[-3px] after:left-0 after:w-0 after:h-[1.5px] after:bg-[#c49a4f] after:transition-all after:duration-300 hover:after:w-full ${
                  transparent
                    ? "text-white/80 hover:text-white"
                    : "text-[#5a4a3a] hover:text-[#1a0e02]"
                }`}
              >
                My Listings
              </Link>
            )}
            {user && isAdmin && (
              <Link href="/admin" className="text-[0.8125rem] font-bold tracking-[0.01em] text-[#8b5e38] hover:text-[#7a5030] transition-colors duration-200">
                Admin Panel
              </Link>
            )}
          </div>

          {/* Desktop auth area */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            {user ? (
              <>
                {loading ? (
                  <div className={`w-28 h-9 rounded-xl animate-pulse shrink-0 ${transparent ? "bg-white/10" : "bg-[#f4efe6]"}`} />
                ) : (
                  <ModeSwitchButton
                    activeMode={activeMode}
                    hostStatus={hostStatus}
                    isAdmin={isAdmin}
                    onSwitch={handleSwitch}
                    isPending={isPending}
                  />
                )}

                <div ref={handleDropdownRef} className="relative z-50">
                  <button
                    onClick={() => setDropdownOpen((v) => !v)}
                    className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-colors ${transparent ? "hover:bg-white/10" : "hover:bg-[#f4efe6]"}`}
                    aria-label="Account menu"
                  >
                    <UserAvatar
                      src={avatarUrl}
                      name={fullName}
                      size={32}
                      className={`ring-2 ${
                        isAdmin
                          ? "ring-[#461e00]"
                          : activeMode === "host"
                            ? "ring-[#8b5e38]"
                            : transparent
                              ? "ring-white/30"
                              : "ring-[#dddfe3]"
                      }`}
                    />
                    <span className={`text-sm font-semibold transition-colors duration-500 ${transparent ? "text-white/90" : "text-[#1a0e02]"}`}>{displayName}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={`transition-transform ${dropdownOpen ? "rotate-180" : ""} ${transparent ? "text-white/50" : "text-[#8b94a4]"}`}>
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl overflow-hidden z-50"
                    style={{
                      border: "1px solid rgba(232,223,212,0.90)",
                      boxShadow: "0 12px 48px rgba(70,30,0,0.16), 0 4px 16px rgba(70,30,0,0.08), 0 0 0 0.5px rgba(232,223,212,0.60)",
                    }}
                  >
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

                      {!isAdmin && (
                        <Link href="/messages" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-3 text-sm text-[#1a0e02] hover:bg-[#f4efe6] transition-colors">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-[#8b5e38]">
                            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span className="flex-1">Messages</span>
                          {unreadCount > 0 && (
                            <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#8b5e38] text-white text-[10px] font-bold leading-none">
                              {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                          )}
                        </Link>
                      )}

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

                      <button
                        onClick={handleLogout}
                        disabled={isSigningOut}
                        className="flex items-center gap-2.5 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSigningOut ? (
                          <svg className="animate-spin w-[15px] h-[15px] text-red-500 shrink-0" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="15" />
                          </svg>
                        ) : (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-red-500 shrink-0">
                            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                        {isSigningOut ? "Signing out…" : "Log Out"}
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
                <Link
                  href="/host"
                  className="px-4 py-2 text-sm font-semibold text-[#1a0e02] rounded-xl transition-all duration-200 hover:-translate-y-px shadow-sm"
                  style={{
                    background: "linear-gradient(135deg, #c49a4f 0%, #d4aa5f 100%)",
                    boxShadow: "0 2px 10px rgba(196,154,79,0.30)",
                  }}
                >
                  Become A Bedouin
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-semibold text-white rounded-xl transition-all duration-200 hover:-translate-y-px shadow-sm"
                  style={{
                    background: "linear-gradient(135deg, #9b6a42 0%, #7a4e2c 100%)",
                    boxShadow: "0 2px 10px rgba(139,94,56,0.30)",
                  }}
                >
                  Login
                </Link>
                <button aria-label="Support" suppressHydrationWarning className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors ${transparent ? "text-white/70 hover:bg-white/10" : "text-[#5a4a3a] hover:bg-[#f4efe6]"}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
                    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className={`md:hidden p-2 rounded-lg transition-colors ${transparent ? "text-white hover:bg-white/10" : "text-[#2b1a0e] hover:bg-[#f4efe6]"}`} onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
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
                    <UserAvatar src={avatarUrl} name={fullName} size={28} />
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
                  {!isAdmin && (
                    <Link href="/messages" onClick={() => setOpen(false)} className="py-2 text-sm font-medium text-[#5a4a3a] flex items-center gap-2">
                      Messages
                      {unreadCount > 0 && (
                        <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#8b5e38] text-white text-[10px] font-bold leading-none">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </Link>
                  )}

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

                  <button
                    onClick={() => { setOpen(false); handleLogout(); }}
                    disabled={isSigningOut}
                    className="text-left py-2 text-sm font-semibold text-red-600 disabled:opacity-50"
                  >
                    {isSigningOut ? "Signing out…" : "Log Out"}
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
