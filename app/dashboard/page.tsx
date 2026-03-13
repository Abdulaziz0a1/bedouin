import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { fetchHostListings, fetchHostBookings } from "@/lib/services/host-dashboard";
import { MOCK_LISTINGS, MOCK_BOOKINGS, MOCK_HOST } from "@/lib/data/dashboard";
import HostDashboard from "@/components/dashboard/HostDashboard";

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

  // ── Role guard: only hosts and admins may access the host dashboard ─────────
  // Profile is fetched here (not later) so we can reuse the data for display.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, first_name, last_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "host" && profile?.role !== "admin") {
    redirect("/");
  }

  // ── Data ────────────────────────────────────────────────────────────────────
  let listings   = MOCK_LISTINGS;
  let bookings   = MOCK_BOOKINGS;
  let hostName   = MOCK_HOST.name;
  let hostAvatar = MOCK_HOST.avatar;

  // Profile already fetched above — use it for display name + avatar placeholder.
  if (profile) {
    hostName   = `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || hostName;
    hostAvatar = `https://i.pravatar.cc/80?u=${user.id}`;
  }

  // INTENTIONAL FALLBACK: each fetch falls back to mock if DB is empty.
  [listings, bookings] = await Promise.all([
    fetchHostListings(user.id),
    fetchHostBookings(user.id),
  ]);

  return (
    <HostDashboard
      listings={listings}
      bookings={bookings}
      hostName={hostName}
      hostAvatar={hostAvatar}
    />
  );
}
