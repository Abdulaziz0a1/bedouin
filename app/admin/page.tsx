import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { fetchSubmissionQueue } from "@/lib/services/admin";
import { ADMIN_LISTINGS } from "@/lib/data/admin";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const metadata: Metadata = {
  title: "Admin · Listing Approval — Bedouin",
  description: "Internal moderation queue for Bedouin listing submissions.",
};

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Server-side admin role guard.
  // If unauthenticated or non-admin, redirect to home.
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

  // INTENTIONAL FALLBACK: falls back to ADMIN_LISTINGS if table is empty / unavailable.
  const listings = await fetchSubmissionQueue().catch(() => ADMIN_LISTINGS);

  return <AdminDashboard initialListings={listings} />;
}
