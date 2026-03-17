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

  // ── Auth guard ──────────────────────────────────────────────────────────────
  if (!user) {
    redirect("/login?returnTo=/host/new");
  }

  // ── Mode guard ──────────────────────────────────────────────────────────────
  // Only users in Host mode (or admins) may create listings.
  // Tourist-mode users are redirected to their account page with a prompt.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, active_mode")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin" && profile?.active_mode !== "host") {
    // Redirect back to account with a query param so the UI can surface a
    // "Switch to Host mode to add a listing" prompt if desired.
    redirect("/account?switch_hint=host");
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
