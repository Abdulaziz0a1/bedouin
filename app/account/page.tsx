import type { Metadata } from "next";
import { createClient } from "@/lib/supabase-server";
import { fetchUserBookings } from "@/lib/services/bookings";
import { MOCK_USER_BOOKINGS, MOCK_USER } from "@/lib/data/user-dashboard";
import UserDashboard from "@/components/user/UserDashboard";

export const metadata: Metadata = {
  title: "My Account · Bedouin",
  description: "Manage your bookings, saved places, and account settings.",
};

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // INTENTIONAL FALLBACK: unauthenticated visitors (or preview mode) see mock data.
    return (
      <UserDashboard
        bookings={MOCK_USER_BOOKINGS}
        userName={MOCK_USER.firstName}
        userAvatar={MOCK_USER.avatar ?? "https://i.pravatar.cc/80"}
      />
    );
  }

  const [bookings, profileResult] = await Promise.all([
    fetchUserBookings(user.id),
    supabase.from("profiles").select("first_name, last_name, avatar_url").eq("id", user.id).single(),
  ]);

  const profile = profileResult.data;
  const userName  = profile
    ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || user.email?.split("@")[0] || "Traveller"
    : (user.email?.split("@")[0] ?? "Traveller");
  const userAvatar = profile?.avatar_url ?? `https://i.pravatar.cc/80?u=${user.id}`;

  return <UserDashboard bookings={bookings} userName={userName} userAvatar={userAvatar} />;
}
