"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

const navLinks = [
  { href: "/explore", label: "Explore"       },
  { href: "/host",    label: "Become a Host" },
  { href: "/faq",     label: "Help"          },
];

export default function Navbar() {
  const [open,         setOpen]         = useState(false);
  const [user,         setUser]         = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // ── Auth state ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const supabase = createClient();

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Subscribe to future auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ── Close dropdown on outside click ─────────────────────────────────────────
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setDropdownOpen(false);
    setUser(null);
    router.push("/");
    router.refresh(); // Clears Next.js server-component cache so protected pages re-check auth
  };

  // Derive display name from auth metadata written during signup
  const firstName = (user?.user_metadata?.first_name as string | undefined) ?? "";
  const lastName  = (user?.user_metadata?.last_name  as string | undefined) ?? "";
  const initials  = firstName ? firstName.charAt(0).toUpperCase() : "?";
  const displayName = firstName || "Account";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#e8dfd4]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 h-[72px] flex items-center justify-between gap-6">

        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-[#e8dfd4] shrink-0">
            <Image
              src="/logo.png"
              alt="Bedouin"
              width={40}
              height={40}
              className="object-cover w-full h-full"
              priority
            />
          </div>
          <span className="font-display font-bold text-xl text-[#2b1a0e] tracking-tight leading-none group-hover:text-[#8b5e38] transition-colors">
            Bedouin
          </span>
        </Link>

        {/* ── Desktop nav links ── */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              className="text-[#5a4a3a] text-sm font-medium hover:text-[#2b1a0e] transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* ── Auth area ── */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {user ? (
            /* ── Authenticated state ── */
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-[#f4efe6] transition-colors"
                aria-label="Account menu"
              >
                {/* Avatar initials */}
                <div className="w-8 h-8 rounded-full bg-[#8b5e38] flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {initials}
                </div>
                <span className="text-sm font-semibold text-[#1a0e02]">{displayName}</span>
                {/* Chevron */}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  className={`text-[#8b94a4] transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                >
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border border-[#e8dfd4] shadow-[0_8px_32px_rgba(0,0,0,0.10)] overflow-hidden z-50">
                  {/* User info row */}
                  <div className="px-4 py-3 border-b border-[#f0e8de]">
                    <p className="text-xs font-bold text-[#1a0e02] truncate">
                      {firstName} {lastName}
                    </p>
                    <p className="text-[11px] text-[#8b94a4] truncate">{user.email}</p>
                  </div>

                  <Link
                    href="/account"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-3 text-sm text-[#1a0e02] hover:bg-[#f4efe6] transition-colors"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-[#8b5e38]">
                      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
                      <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                    My Bookings
                  </Link>

                  <Link
                    href="/dashboard"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-3 text-sm text-[#1a0e02] hover:bg-[#f4efe6] transition-colors"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-[#8b5e38]">
                      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
                      <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
                      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
                      <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
                    </svg>
                    Host Dashboard
                  </Link>

                  <div className="border-t border-[#f0e8de]" />

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-red-500">
                      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ── Unauthenticated state ── */
            <>
              <Link
                href="/host"
                style={{ color: "#fff" }}
                className="px-4 py-2 text-sm font-semibold bg-[#8b5e38] rounded-xl hover:bg-[#7a5030] transition-colors shadow-sm"
              >
                Become A Bedouin
              </Link>
              <Link
                href="/login"
                style={{ color: "#fff" }}
                className="px-4 py-2 text-sm font-semibold bg-[#8b5e38] rounded-xl hover:bg-[#7a5030] transition-colors shadow-sm"
              >
                Login
              </Link>
              {/* Support icon */}
              <button
                aria-label="Support"
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#f4efe6] transition-colors text-[#5a4a3a]"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
                  <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
                </svg>
              </button>
            </>
          )}
        </div>

        {/* ── Mobile hamburger ── */}
        <button
          className="md:hidden p-2 text-[#2b1a0e] rounded-lg hover:bg-[#f4efe6] transition-colors"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
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

      {/* ── Mobile dropdown ── */}
      {open && (
        <div className="md:hidden bg-white border-t border-[#e8dfd4] px-6 py-4 flex flex-col gap-3">
          {navLinks.map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-[#5a4a3a] py-1"
            >
              {label}
            </Link>
          ))}

          <div className="flex flex-col gap-2 pt-3 border-t border-[#e8dfd4]">
            {user ? (
              /* Authenticated mobile */
              <>
                <div className="flex items-center gap-2.5 py-1">
                  <div className="w-7 h-7 rounded-full bg-[#8b5e38] flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {initials}
                  </div>
                  <span className="text-sm font-semibold text-[#1a0e02]">{displayName}</span>
                </div>
                <Link
                  href="/account"
                  onClick={() => setOpen(false)}
                  className="py-2 text-sm font-medium text-[#5a4a3a]"
                >
                  My Bookings
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="py-2 text-sm font-medium text-[#5a4a3a]"
                >
                  Host Dashboard
                </Link>
                <button
                  onClick={() => { setOpen(false); handleLogout(); }}
                  className="text-left py-2 text-sm font-semibold text-red-600"
                >
                  Log Out
                </button>
              </>
            ) : (
              /* Unauthenticated mobile */
              <div className="flex gap-3">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  style={{ color: "#fff" }}
                  className="flex-1 text-center py-2.5 text-sm font-semibold bg-[#8b5e38] rounded-xl"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  style={{ color: "#fff" }}
                  className="flex-1 text-center py-2.5 text-sm font-semibold bg-[#8b5e38] rounded-xl"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
