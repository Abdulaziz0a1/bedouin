import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import CohostApplicationForm from "@/components/cohost/CohostApplicationForm";

export const metadata: Metadata = {
  title: "Apply as Co-host · Bedouin",
  description: "Join the Bedouin co-host marketplace and help Saudi hosts manage their listings.",
};

export default async function CohostApplyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?returnTo=/cohost/apply");
  }

  // If already approved, redirect to marketplace
  const { data: profile } = await supabase
    .from("profiles")
    .select("cohost_status")
    .eq("id", user.id)
    .single();

  if (profile?.cohost_status === "approved") {
    redirect("/cohost");
  }

  return (
    <div className="min-h-screen bg-[#f4efe6]">

      {/* Header */}
      <header className="bg-white border-b border-[#e8dfd4] sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-5 h-16 flex items-center justify-between">
          <a href="/" className="font-display font-extrabold text-[#1a0e02] text-xl tracking-tight">
            Bedouin
          </a>
          <a
            href="/cohost"
            className="text-sm font-semibold text-[#64707d] hover:text-[#8b5e38] transition-colors"
          >
            ← Back to co-host marketplace
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 py-10">

        {/* Hero */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#fdf5ee] border border-[#e8dfd4] rounded-full text-[#8b5e38] text-xs font-bold mb-4">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Service Provider Application
          </div>
          <h1 className="font-display font-extrabold text-[#1a0e02] text-3xl mb-3">
            Become a Bedouin Co-host
          </h1>
          <p className="text-[#64707d] text-sm max-w-md mx-auto leading-relaxed">
            Help hosts across Saudi Arabia manage their properties. Set your own schedule, services, and fees.
          </p>
        </div>

        {/* Pending notice */}
        {profile?.cohost_status === "pending" && (
          <div className="flex items-start gap-3 bg-[#f0f9ff] border border-[#bfdfff] rounded-2xl px-5 py-4 mb-8 max-w-xl mx-auto">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[#0046cc] shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <div>
              <p className="text-sm font-bold text-[#1a0e02]">Application Under Review</p>
              <p className="text-xs text-[#64707d] mt-0.5">
                Your previous application is being reviewed. We&apos;ll notify you within 1–2 business days.
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <CohostApplicationForm />
      </main>
    </div>
  );
}
