"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { href: "/explore", label: "Explore"       },
  { href: "/host",    label: "Become a Host" },
  { href: "/faq",     label: "Help"          },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

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

        {/* ── Auth + Support ── */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <Link
            href="/host"
            style={{ color: '#fff' }}
            className="px-4 py-2 text-sm font-semibold bg-[#8b5e38] rounded-xl hover:bg-[#7a5030] transition-colors shadow-sm"
          >
            Become A Bedouin
          </Link>
          <Link
            href="/login"
            style={{ color: '#fff' }}
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
          <div className="flex gap-3 pt-3 border-t border-[#e8dfd4]">
            <Link
              href="/login"
              style={{ color: '#fff' }}
              className="flex-1 text-center py-2.5 text-sm font-semibold bg-[#8b5e38] rounded-xl"
            >
              Login
            </Link>
            <Link
              href="/signup"
              style={{ color: '#fff' }}
              className="flex-1 text-center py-2.5 text-sm font-semibold bg-[#8b5e38] rounded-xl"
            >
              Sign up
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
