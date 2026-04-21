import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { fetchUserBookings } from "@/lib/services/bookings";
import { fetchCohostAssignments } from "@/lib/services/cohost";
import UserDashboard from "@/components/user/UserDashboard";

export const metadata: Metadata = {
  title: "My Account · Bedouin",
  description: "Manage your bookings, saved places, and account settings.",
};

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?returnTo=/account");
  }

  const [bookings, profileResult] = await Promise.all([
    fetchUserBookings(user.id),
    supabase
      .from("profiles")
      .select("first_name, last_name, avatar_url, phone, nationality, created_at, host_status, host_rejection_reason, cohost_status, cohost_rejection_reason")
      .eq("id", user.id)
      .single(),
  ]);

  const cohostStatusValue = (profileResult.data?.cohost_status ?? null) as "pending" | "approved" | "rejected" | null;
  const cohostAssignments = cohostStatusValue === "approved"
    ? await fetchCohostAssignments(user.id)
    : [];

  const profile = profileResult.data;

  const firstName  = profile?.first_name  ?? "";
  const lastName   = profile?.last_name   ?? "";
  const userName   = `${firstName} ${lastName}`.trim() || user.email?.split("@")[0] || "Traveller";
  const userAvatar = profile?.avatar_url  ?? "";

  return (
    <UserDashboard
      bookings={bookings}
      userName={userName}
      userAvatar={userAvatar}
      userEmail={user.email ?? ""}
      userFirstName={firstName}
      userLastName={lastName}
      userPhone={profile?.phone ?? ""}
      userNationality={profile?.nationality ?? ""}
      userJoinedAt={profile?.created_at ?? user.created_at ?? ""}
      hostStatus={(profile?.host_status as "pending" | "approved" | "rejected" | null) ?? null}
      hostRejectionReason={profile?.host_rejection_reason ?? null}
      cohostStatus={cohostStatusValue}
      cohostRejectionReason={profile?.cohost_rejection_reason ?? null}
      cohostAssignments={cohostAssignments}
    />
  );
}
