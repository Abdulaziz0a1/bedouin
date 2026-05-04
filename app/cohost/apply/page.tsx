import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import CohostApplicationForm from "@/components/cohost/CohostApplicationForm";
import type { CohostApplicationPrefill } from "@/lib/actions/profile";

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("cohost_status")
    .eq("id", user.id)
    .single();

  // Fetch existing application for prefill (present for any non-null status)
  let initialData: CohostApplicationPrefill | undefined;
  if (profile?.cohost_status) {
    const { data: app } = await supabase
      .from("cohost_applications")
      .select("service_types, property_types, bio, languages, experience_years, region, city, phone, fee_model, fee_value")
      .eq("user_id", user.id)
      .maybeSingle();

    if (app) {
      initialData = {
        serviceTypes:    (app.service_types  as string[]) ?? [],
        propertyTypes:   (app.property_types as string[]) ?? [],
        bio:             (app.bio            as string)   ?? "",
        languages:       (app.languages      as string[]) ?? [],
        experienceYears: (app.experience_years as number) ?? 0,
        region:          (app.region         as string)   ?? "",
        city:            (app.city           as string)   ?? "",
        phone:           (app.phone          as string)   ?? "",
        feeModel:        (app.fee_model      as "percentage" | "fixed" | "negotiable") ?? "negotiable",
        feeValue:        (app.fee_value      as number | null) ?? null,
      };
    }
  }

  const isUpdate = !!initialData;
  const cohostStatus = profile?.cohost_status as "pending" | "approved" | "rejected" | null;

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
            {isUpdate ? "Edit Co-host Profile" : "Service Provider Application"}
          </div>
          <h1 className="font-display font-extrabold text-[#1a0e02] text-3xl mb-3">
            {isUpdate ? "Update your co-host profile" : "Become a Bedouin Co-host"}
          </h1>
          <p className="text-[#64707d] text-sm max-w-md mx-auto leading-relaxed">
            {isUpdate
              ? "Edit your services, background, and fee preference. Changes will go back under review."
              : "Help hosts across Saudi Arabia manage their properties. Set your own schedule, services, and fees."}
          </p>
        </div>

        {/* Status notices */}
        {cohostStatus === "approved" && (
          <div className="flex items-start gap-3 bg-[#f0faf5] border border-[#9edcbb] rounded-2xl px-5 py-4 mb-8 max-w-xl mx-auto">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[#049153] shrink-0 mt-0.5">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div>
              <p className="text-sm font-bold text-[#1a0e02]">Editing Approved Profile</p>
              <p className="text-xs text-[#64707d] mt-0.5">
                You are updating your approved co-host profile. After saving, your profile will be put under review again until the changes are approved.
              </p>
            </div>
          </div>
        )}

        {cohostStatus === "pending" && (
          <div className="flex items-start gap-3 bg-[#f0f9ff] border border-[#bfdfff] rounded-2xl px-5 py-4 mb-8 max-w-xl mx-auto">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[#0046cc] shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <div>
              <p className="text-sm font-bold text-[#1a0e02]">Application Under Review</p>
              <p className="text-xs text-[#64707d] mt-0.5">
                Your application is currently being reviewed. Submitting now will replace your current application and restart the review process.
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <CohostApplicationForm initialData={initialData} isUpdate={isUpdate} />
      </main>
    </div>
  );
}
