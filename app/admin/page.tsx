import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import {
  fetchSubmissionQueue,
  fetchHostApplicationQueue,
  fetchCohostApplicationQueue,
} from "@/lib/services/admin";
import { fetchListingCancellationRequests } from "@/lib/services/cancellation";
import { fetchAllSupportTickets } from "@/lib/services/support";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const metadata: Metadata = {
  title: "Admin · Bedouin",
  description: "Internal moderation queue for Bedouin listings, hosts, and service providers.",
};

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role !== "admin") redirect("/");
  } else {
    redirect("/");
  }

  const [listings, hostApplications, cohostApplications, cancellationRequests, supportTickets, profileResult] = await Promise.all([
    fetchSubmissionQueue().catch(() => []),
    fetchHostApplicationQueue().catch(() => []),
    fetchCohostApplicationQueue().catch(() => []),
    fetchListingCancellationRequests().catch(() => []),
    fetchAllSupportTickets().catch(() => []),
    supabase.from("profiles").select("first_name, last_name").eq("id", user!.id).single(),
  ]);

  const adminProfile = profileResult.data;
  const adminName = adminProfile
    ? `${adminProfile.first_name ?? ""} ${adminProfile.last_name ?? ""}`.trim()
    : user!.email?.split("@")[0] ?? "Admin";

  return (
    <AdminDashboard
      initialListings={listings}
      initialHostApplications={hostApplications}
      initialCohostApplications={cohostApplications}
      initialCancellationRequests={cancellationRequests}
      initialSupportTickets={supportTickets}
      adminName={adminName}
    />
  );
}
