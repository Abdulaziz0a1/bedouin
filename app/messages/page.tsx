import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import MessagesClient from "@/components/messages/MessagesClient";

export const metadata: Metadata = {
  title: "Messages — Bedouin",
  description: "Chat with your hosts and guests about your Bedouin experiences.",
};

export default async function MessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?returnTo=/messages");
  }

  return <MessagesClient userId={user.id} />;
}
