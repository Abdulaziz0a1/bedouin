"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import PasswordInput from "@/components/ui/PasswordInput";

export default function LoginForm() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const router       = useRouter();
  const searchParams = useSearchParams();
  const returnTo     = searchParams.get("returnTo");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);   // only reset on error — keep spinner through redirect on success
      return;
    }

    // If we came from a protected page (e.g. booking checkout), go back there.
    if (returnTo) {
      router.push(returnTo);
      return;
    }

    // User is already in the sign-in response — no need for a second getUser() call.
    const user = data.user;
    let destination = "/account";

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, active_mode")
        .eq("id", user.id)
        .single();

      if (profile?.role === "admin") destination = "/admin";
      else if (profile?.active_mode === "host") destination = "/dashboard";
    }

    // Loading stays true — spinner persists during page transition, then unmounts naturally.
    router.push(destination);
  };

  return (
    <>
      {/* Brand mark */}
      <div className="flex items-center gap-3 mb-7">
        <div className="w-11 h-11 rounded-full overflow-hidden shrink-0" style={{ border: "1.5px solid rgba(196,154,79,0.30)" }}>
          <Image src="/images/bedouin-logo-symbol.jpeg" alt="Bedouin" width={44} height={44} className="object-cover scale-[1.42] origin-center" priority />
        </div>
        <div>
          <h1 className="font-display font-extrabold text-[#1a0e02] text-[1.6rem] leading-tight">
            Welcome back
          </h1>
          <p className="text-[#6b7885] text-sm">
            Log in to your Bedouin account
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[0.7rem] font-bold text-[#1a0e02] uppercase tracking-[0.10em]">
            Email
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

        <div className="flex flex-col gap-1.5">
          <label className="text-[0.7rem] font-bold text-[#1a0e02] uppercase tracking-[0.10em]">
            Password
          </label>
          <PasswordInput
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        {/* Error banner */}
        {error && (
          <div
            className="flex items-start gap-2.5 rounded-xl px-4 py-3"
            style={{
              background: "var(--status-error-bg)",
              border: "1px solid var(--status-error-border)",
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
          className="w-full text-white font-bold text-sm py-3.5 rounded-xl transition-all duration-200 mt-1 disabled:opacity-50 flex items-center justify-center gap-2 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #461e00 0%, #2d1208 100%)",
            boxShadow: "0 4px 18px rgba(70,30,0,0.30), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
          onMouseEnter={(e) => {
            if (!loading) (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "0 8px 28px rgba(70,30,0,0.40), inset 0 1px 0 rgba(255,255,255,0.08)";
            if (!loading) (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
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
              Logging in…
            </>
          ) : (
            "Log In"
          )}
        </button>
      </form>

      <p className="text-sm text-center text-[#64707d] mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-[#c49a4f] font-semibold hover:underline">
          Sign up
        </Link>
      </p>
    </>
  );
}
