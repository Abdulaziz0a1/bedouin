import type { Metadata } from "next";
import HostDashboard from "@/components/dashboard/HostDashboard";

export const metadata: Metadata = {
  title: "Host Dashboard · Bedouin",
  description: "Manage your listings, bookings, and earnings on Bedouin.",
};

export default function DashboardPage() {
  return <HostDashboard />;
}
