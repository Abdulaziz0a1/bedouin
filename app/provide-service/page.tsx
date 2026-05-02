import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import Footer from "@/components/layout/Footer";
import CohostApplicationForm from "@/components/cohost/CohostApplicationForm";
import AlertBanner from "@/components/ui/AlertBanner";

export const metadata = {
  title: "Provide a Service — Bedouin",
  description: "Apply to become a Bedouin service provider and help hosts deliver outstanding guest experiences.",
};

export default async function ProvideServicePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?returnTo=/provide-service");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, cohost_status")
    .eq("id", user.id)
    .single();

  if (profile?.role === "admin") redirect("/admin");

  // Already approved → send to co-host browse (their profile is live)
  if (profile?.cohost_status === "approved") {
    redirect("/account?cohost_status=approved");
  }

  // Pending → let them know
  if (profile?.cohost_status === "pending") {
    redirect("/account?cohost_status=pending");
  }

  return (
    <div className="min-h-screen bg-[#f4efe6]">

      <main className="pt-[72px] pb-20">
        <div className="max-w-[1232px] mx-auto px-6 lg:px-0 py-12">

          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="h-px w-8 bg-[#c49a4f]" />
              <span className="text-[#c49a4f] text-xs font-bold uppercase tracking-[0.16em]">Service Provider Application</span>
              <div className="h-px w-8 bg-[#c49a4f]" />
            </div>
            <h1 className="font-display font-extrabold text-[#1a0e02] text-3xl mb-3">
              {profile?.cohost_status === "rejected" ? "Re-apply as a Service Provider" : "Provide a Service"}
            </h1>
            <p className="text-[#64707d] text-base max-w-lg mx-auto leading-relaxed">
              Support Bedouin hosts by offering your skills — check-in management, cleaning, guiding,
              photography, and more. Once approved, your profile becomes visible to hosts across Saudi Arabia.
            </p>

            {profile?.cohost_status === "rejected" && (
              <AlertBanner
                variant="error"
                title="Your previous application was not approved. You may apply again."
                compact
                dismissible
                className="mt-4 mx-auto"
              />
            )}
          </div>

          {/* Services overview */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-10">
            {[
              { icon: "🔑", label: "Check-in Services" },
              { icon: "🧹", label: "Cleaning & Prep" },
              { icon: "🗺️", label: "Local Guide" },
              { icon: "📷", label: "Photography" },
              { icon: "🔧", label: "Maintenance" },
              { icon: "💬", label: "Guest Support" },
            ].map(({ icon, label }) => (
              <div key={label} className="bg-white border border-[#e8dfd4] rounded-2xl p-4 flex items-center gap-3">
                <span className="text-2xl">{icon}</span>
                <span className="text-sm font-semibold text-[#1a0e02]">{label}</span>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="max-w-xl mx-auto bg-white rounded-3xl border border-[#e8dfd4] shadow-sm p-8">
            <CohostApplicationForm />
          </div>

          {/* Trust note */}
          <div className="flex items-center justify-center gap-8 mt-10 flex-wrap">
            {[
              { icon: "✅", text: "Admin-reviewed profile" },
              { icon: "🌍", text: "Work across Saudi Arabia" },
              { icon: "⏱️", text: "1–2 day review" },
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
