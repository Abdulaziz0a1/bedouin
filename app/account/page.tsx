import type { Metadata } from "next";
import UserDashboard from "@/components/user/UserDashboard";

export const metadata: Metadata = {
  title: "My Account · Bedouin",
  description: "Manage your bookings, saved places, and account settings.",
};

export default function AccountPage() {
  return <UserDashboard />;
}
