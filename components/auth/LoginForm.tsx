"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function LoginForm() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    // Determine where to send the user based on their role and active mode.
    // Admins → /admin. Host-mode users → /dashboard. Everyone else → /account.
    const { data: { user } } = await supabase.auth.getUser();
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

    router.push(destination);
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="font-display font-extrabold text-[#1a0e02] text-2xl mb-1">
          Welcome back
        </h1>
        <p className="text-[#64707d] text-sm">
          Log in to your Bedouin account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className="w-full border border-[#e8dfd4] rounded-xl px-4 py-3 text-sm text-[#1a0e02] placeholder:text-[#64707d] outline-none focus:border-[#c49a4f] transition-colors disabled:opacity-50"
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
