import type { Metadata } from "next";
import CoHostBrowsePage from "@/components/cohost/CoHostBrowsePage";

export const metadata: Metadata = {
  title: "Find a Co-host — Bedouin",
  description: "Browse verified co-hosts across Saudi Arabia to help manage your Bedouin listings.",
};

export default function CoHostPage() {
  return <CoHostBrowsePage />;
}
