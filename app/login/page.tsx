import Navbar from "@/components/layout/Navbar";
import Link from "next/link";

export const metadata = {
  title: "Log In – Bedouin",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#f4efe6]">
      <Navbar />
      <main className="pt-[72px] flex items-center justify-center min-h-screen px-6">
        <div className="w-full max-w-[440px] bg-white rounded-2xl border border-[#e8dfd4] p-8 shadow-sm">
          {/* Brand mark */}
          <div className="flex items-center gap-2 mb-7">
            <div className="h-[2px] w-5 bg-[#c49a4f]" />
            <p className="text-[#c49a4f] text-xs font-bold uppercase tracking-[0.14em]">
              Bedouin
            </p>
          </div>

          <div className="mb-6">
            <h1 className="font-display font-extrabold text-[#1a0e02] text-2xl mb-1">
              Welcome back
            </h1>
            <p className="text-[#64707d] text-sm">
              Log in to your Bedouin account
            </p>
          </div>

          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#1a0e02] uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full border border-[#e8dfd4] rounded-xl px-4 py-3 text-sm text-[#1a0e02] placeholder:text-[#64707d] outline-none focus:border-[#c49a4f] transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#1a0e02] uppercase tracking-wide">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full border border-[#e8dfd4] rounded-xl px-4 py-3 text-sm text-[#1a0e02] placeholder:text-[#64707d] outline-none focus:border-[#c49a4f] transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#461e00] text-white font-bold text-sm py-3 rounded-xl hover:bg-[#5a2900] active:bg-[#3a1800] transition-colors mt-2"
            >
              Log In
            </button>
          </form>

          <p className="text-sm text-center text-[#64707d] mt-6">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-[#c49a4f] font-semibold hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
