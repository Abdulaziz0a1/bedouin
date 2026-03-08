import type { Metadata } from "next";
import MessagesClient from "@/components/messages/MessagesClient";

export const metadata: Metadata = {
  title: "Messages — Bedouin",
  description: "Chat with your hosts and guests about your Bedouin experiences.",
};

export default function MessagesPage() {
  return <MessagesClient />;
}
