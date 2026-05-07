"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import PasswordInput from "@/components/ui/PasswordInput";

export default function SignupForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [success,   setSuccess]   = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!firstName.trim() || !lastName.trim()) {
      setError("Please enter your first and last name.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName.trim(),
          last_name:  lastName.trim(),
        },
      },
    });

    if (signUpError) {
      setLoading(false);
      setError(signUpError.message);
      return;
    }

    // Insert profiles row so server-side role checks and host resolution work.
    // Tolerated silently if it fails (e.g. email-confirmation flow where user
    // row is not yet confirmed) — auth still succeeded.
    // Upsert so we handle the case where the DB trigger already created the row
    // before this client-side call lands (race between trigger and client insert).
    if (signUpData.user) {
      await supabase.from("profiles").upsert(
        {
          id:         signUpData.user.id,
          first_name: firstName.trim(),
          last_name:  lastName.trim(),
          role:       "user",
        },
        { onConflict: "id" }
      );
    }

    setLoading(false);
    setSuccess(true);
  };

  // ── Success state ────────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="flex flex-col items-center text-center gap-3 py-4">
        <div className="w-14 h-14 rounded-2xl bg-[#f0faf5] flex items-center justify-center text-[#049153] mb-2">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="font-display font-extrabold text-[#1a0e02] text-xl">
          Check your email
        </h2>
        <p className="text-[#64707d] text-sm leading-relaxed">
          We sent a confirmation link to{" "}
          <span className="font-semibold text-[#1a0e02]">{email}</span>.
          Open it to activate your account.
        </p>
        <Link
          href="/login"
          className="mt-2 text-sm font-semibold text-[#c49a4f] hover:underline"
        >
          Back to log in
        </Link>
      </div>
    );
  }

  // ── Form state ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* Brand mark */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-full overflow-hidden shrink-0" style={{ border: "1.5px solid rgba(196,154,79,0.30)" }}>
          <Image src="/images/bedouin-logo-symbol.jpeg" alt="Bedouin" width={44} height={44} className="object-cover scale-[1.42] origin-center" />
        </div>
        <div>
          <h1 className="font-display font-extrabold text-[#1a0e02] text-2xl mb-0.5">
            Create your account
          </h1>
          <p className="text-[#64707d] text-sm">
            Join Bedouin and start exploring
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#1a0e02] uppercase tracking-wide">
              First name
            </label>
            <input
              type="text"
              placeholder="Ahmed"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              disabled={loading}
              className="w-full border border-[#e8dfd4] rounded-xl px-4 py-3 text-sm text-[#1a0e02] placeholder:text-[#64707d] outline-none focus:border-[#c49a4f] transition-colors disabled:opacity-50"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#1a0e02] uppercase tracking-wide">
              Last name
            </label>
            <input
              type="text"
              placeholder="Al-Rashid"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              disabled={loading}
              className="w-full border border-[#e8dfd4] rounded-xl px-4 py-3 text-sm text-[#1a0e02] placeholder:text-[#64707d] outline-none focus:border-[#c49a4f] transition-colors disabled:opacity-50"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[#1a0e02] uppercase tracking-wide">
            Email
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="w-full border border-[#e8dfd4] rounded-xl px-4 py-3 text-sm text-[#1a0e02] placeholder:text-[#64707d] outline-none focus:border-[#c49a4f] transition-colors disabled:opacity-50"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[#1a0e02] uppercase tracking-wide">
            Password
          </label>
          <PasswordInput
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-red-500 shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
              <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#461e00] text-white font-bold text-sm py-3 rounded-xl hover:bg-[#5a2900] active:bg-[#3a1800] transition-colors mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="15" />
              </svg>
              Creating account…
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      <p className="text-sm text-center text-[#64707d] mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-[#c49a4f] font-semibold hover:underline">
          Log in
        </Link>
      </p>
    </>
  );
}
