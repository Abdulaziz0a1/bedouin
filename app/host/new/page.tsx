import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import HostListingFlow from "@/components/host/HostListingFlow";

// Always render fresh — same pattern as /dashboard.
// Prevents Next.js from serving a cached RSC payload that contains the
// pre-login auth redirect, which would kick authenticated users back to /login.
export const dynamic = "force-dynamic";

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
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, active_mode, host_status")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin" && profile?.active_mode !== "host") {
    // Approved host but currently in tourist mode — redirect to account which
    // shows the "Host Application Approved" banner with switch instructions.
    if (profile?.host_status === "approved") {
      redirect("/account");
    }
    // Not yet approved (null, pending, or rejected) — send to onboarding.
    // The onboarding page handles each state with the correct UI.
    redirect("/host/onboarding");
  }

  return (
    <div className="min-h-screen bg-[#f4efe6]">
      <main className="pt-[72px]">
        <HostListingFlow userId={user.id} />
      </main>
    </div>
  );
}
