import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { fetchHostListings, fetchHostBookings } from "@/lib/services/host-dashboard";
import { fetchHostInvitations, fetchHostAssignments } from "@/lib/services/cohost";
import HostDashboard from "@/components/dashboard/HostDashboard";

// Always render fresh — never serve a cached RSC payload for the dashboard.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Host Dashboard · Bedouin",
  description: "Manage your listings, bookings, and earnings on Bedouin.",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── Auth guard ──────────────────────────────────────────────────────────────
  if (!user) {
    redirect("/login?returnTo=/dashboard");
  }

  // ── Mode guard: only users in Host mode (or admins) may see the host dashboard ─
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, active_mode, first_name, last_name, avatar_url")
    .eq("id", user.id)
    .single();

  // Redirect tourist-mode users to their own dashboard (/account).
  // Admins bypass the mode check — they always have access.
  if (profile?.role !== "admin" && profile?.active_mode !== "host") {
    redirect("/account");
  }

  // ── Identity ─────────────────────────────────────────────────────────────────
  // Use real profile data only. No mock identity fallback in a restricted area.
  const hostName   = profile
    ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || user.email?.split("@")[0] || "Host"
    : (user.email?.split("@")[0] ?? "Host");
  const hostAvatar = profile?.avatar_url ?? "";

  // ── Data ─────────────────────────────────────────────────────────────────────
  const [listings, bookings, cohostAssignments, cohostInvitations] = await Promise.all([
    fetchHostListings(user.id),
    fetchHostBookings(user.id),
    fetchHostAssignments(user.id),
    fetchHostInvitations(user.id),
  ]);

  return (
    <HostDashboard
      listings={listings}
      bookings={bookings}
      hostName={hostName}
      hostAvatar={hostAvatar}
      cohostAssignments={cohostAssignments}
      cohostInvitations={cohostInvitations}
    />
  );
}
