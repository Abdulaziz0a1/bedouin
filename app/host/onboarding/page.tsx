import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import Footer from "@/components/layout/Footer";
import HostOnboardingForm from "@/components/host/HostOnboardingForm";

export const metadata = {
  title: "Become a Bedouin Host — Apply",
  description: "Complete your host profile and submit your application to join the Bedouin host community.",
};

export default async function HostOnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?returnTo=/host/onboarding");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, host_status")
    .eq("id", user.id)
    .single();

  // Admins do not apply
  if (profile?.role === "admin") {
    redirect("/admin");
  }

  // Already approved → send to dashboard
  if (profile?.host_status === "approved") {
    redirect("/dashboard");
  }

  // Already pending → send to account to see status
  if (profile?.host_status === "pending") {
    redirect("/account?host_status=pending");
  }

  return (
    <div className="min-h-screen bg-[#f4efe6]">

      <main className="pt-[72px] pb-20">
        <div className="max-w-[1232px] mx-auto px-6 lg:px-0 py-12">

          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="h-px w-8 bg-[#c49a4f]" />
              <span className="text-[#c49a4f] text-xs font-bold uppercase tracking-[0.16em]">Host Application</span>
              <div className="h-px w-8 bg-[#c49a4f]" />
            </div>
            <h1 className="font-display font-extrabold text-[#1a0e02] text-3xl mb-3">
              {profile?.host_status === "rejected" ? "Re-apply as a Bedouin Host" : "Become a Bedouin Host"}
            </h1>
            <p className="text-[#64707d] text-base max-w-md mx-auto leading-relaxed">
              {profile?.host_status === "rejected"
                ? "Your previous application was not approved. Update your details and re-apply below."
                : "Complete the 3-step application. Our team reviews every application within 1–2 business days."}
            </p>

            {/* Rejection notice */}
            {profile?.host_status === "rejected" && (
              <div className="mt-4 inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2 text-sm text-red-700">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Your previous application was not approved. You may apply again.
              </div>
            )}
          </div>

          {/* Form card */}
          <div className="max-w-xl mx-auto bg-white rounded-3xl border border-[#e8dfd4] shadow-sm p-8">
            <HostOnboardingForm />
          </div>

          {/* Trust note */}
          <div className="flex items-center justify-center gap-8 mt-10 flex-wrap">
            {[
              { icon: "🔒", text: "Secure & encrypted" },
              { icon: "⏱️", text: "1–2 day review" },
              { icon: "💰", text: "Keep 92% of earnings" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-[#8b94a4] text-sm">
                <span>{icon}</span>
                {text}
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
