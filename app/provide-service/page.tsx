import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import Footer from "@/components/layout/Footer";
import ProvideServiceContent from "@/components/ui/ProvideServiceContent";

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
        <ProvideServiceContent
          isRejected={profile?.cohost_status === "rejected"}
          userId={user.id}
        />
      </main>
      <Footer />
    </div>
  );
}
