"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function ForgotPasswordForm() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [sent,    setSent]    = useState(false);

  const [supabase] = useState(() => createClient());

  const searchParams = useSearchParams();
  const linkExpired  = searchParams.get("error") === "link_expired";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Build the redirect URL from NEXT_PUBLIC_SITE_URL so the link in the
    // password reset email always points to the correct environment.
    //
    // NEXT_PUBLIC_SITE_URL must be set per-environment:
    //   • .env.local  → http://localhost:3000
    //   • Render      → https://bedouin-ao6n.onrender.com
    //
    // window.location.origin is the fallback for local runs where the env
    // var has not yet been added to .env.local.  It must never be relied
    // upon in production because it reflects whichever origin the user's
    // browser tab is on when they submit the form, which may be wrong.
    //
    // The full URL must also appear in Supabase Dashboard →
    // Authentication → URL Configuration → Redirect URLs, otherwise
    // Supabase will reject it and fall back to the Site URL.
    const siteUrl   = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    const redirectTo = `${siteUrl}/auth/callback?next=/reset-password`;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo }
    );

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setSent(true);
  };

  // ── Success state ─────────────────────────────────────────────────────────────
  if (sent) {
    return (
      <div className="flex flex-col items-center text-center gap-3 py-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-2"
          style={{ background: "rgba(196,154,79,0.12)", color: "#c49a4f" }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="font-display font-extrabold text-[#1a0e02] text-xl">
          Check your inbox
        </h2>
        <p className="text-[#64707d] text-sm leading-relaxed max-w-[280px]">
          We sent a password reset link to{" "}
          <span className="font-semibold text-[#1a0e02]">{email}</span>.
          Open it within 1 hour to reset your password.
        </p>
        <p className="text-xs text-[#8b94a4] mt-1">
          No email? Check your spam folder or{" "}
          <button
            onClick={() => { setSent(false); setError(null); }}
            className="text-[#c49a4f] font-semibold hover:underline"
          >
            try again
          </button>
          .
        </p>
        <Link
          href="/login"
          className="mt-3 text-sm font-semibold text-[#c49a4f] hover:underline"
        >
          Back to log in
        </Link>
      </div>
    );
  }

  // ── Form state ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Brand mark */}
      <div className="flex items-center gap-3 mb-7">
        <div
          className="w-11 h-11 rounded-full overflow-hidden shrink-0"
          style={{ border: "1.5px solid rgba(196,154,79,0.30)" }}
        >
          <Image
            src="/images/bedouin-logo-symbol.jpeg"
            alt="Bedouin"
            width={44}
            height={44}
            className="object-cover scale-[1.42] origin-center"
            priority
          />
        </div>
        <div>
          <h1 className="font-display font-extrabold text-[#1a0e02] text-[1.6rem] leading-tight">
            Reset password
          </h1>
          <p className="text-[#6b7885] text-sm">
            We&apos;ll email you a reset link
          </p>
        </div>
      </div>

      {/* Expired link banner */}
      {linkExpired && (
        <div
          className="flex items-start gap-2.5 rounded-xl px-4 py-3 mb-4"
          style={{
            background: "var(--status-warning-bg, #fffbeb)",
            border:     "1px solid var(--status-warning-border, #fcd34d)",
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-0.5 text-amber-500">
            <path d="M12 9v4M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          </svg>
          <p className="text-sm text-amber-700">
            Your reset link has expired or already been used. Enter your email to receive a new one.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[0.7rem] font-bold text-[#1a0e02] uppercase tracking-[0.10em]">
            Email address
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="input-field disabled:opacity-50"
          />
        </div>

        {/* Error banner */}
        {error && (
          <div
            className="flex items-start gap-2.5 rounded-xl px-4 py-3"
            style={{
              background: "var(--status-error-bg)",
              border:     "1px solid var(--status-error-border)",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-0.5" style={{ color: "var(--status-error-text)" }}>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
              <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <p className="text-sm" style={{ color: "var(--status-error-text)" }}>{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full text-white font-bold text-sm py-3.5 rounded-xl transition-all duration-200 mt-1 disabled:opacity-50 flex items-center justify-center gap-2"
          style={{
            background:  "linear-gradient(135deg, #461e00 0%, #2d1208 100%)",
            boxShadow:   "0 4px 18px rgba(70,30,0,0.30), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 8px 28px rgba(70,30,0,0.40), inset 0 1px 0 rgba(255,255,255,0.08)";
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "0 4px 18px rgba(70,30,0,0.30), inset 0 1px 0 rgba(255,255,255,0.08)";
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
          }}
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="15" />
              </svg>
              Sending…
            </>
          ) : (
            "Send reset link"
          )}
        </button>
      </form>

      <p className="text-sm text-center text-[#64707d] mt-6">
        Remember your password?{" "}
        <Link href="/login" className="text-[#c49a4f] font-semibold hover:underline">
          Back to log in
        </Link>
      </p>
    </>
  );
}
