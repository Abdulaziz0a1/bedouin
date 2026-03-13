import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import Navbar from "@/components/layout/Navbar";
import HostListingFlow from "@/components/host/HostListingFlow";

export const metadata = {
  title: "Add Your Listing – Bedouin",
  description: "List your Saudi property or experience on Bedouin. Guided step-by-step.",
};

export default async function HostNewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Unauthenticated visitors must log in first.
  // returnTo ensures they land back here after login.
  if (!user) {
    redirect("/login?returnTo=/host/new");
  }

  return (
    <div className="min-h-screen bg-[#f4efe6]">
      <Navbar />
      <main className="pt-[72px]">
        <HostListingFlow />
      </main>
    </div>
  );
}
