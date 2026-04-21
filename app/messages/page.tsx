import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import MessagesPage from "@/components/messages/MessagesPage";
import { createClient } from "@/lib/supabase-server";
import { fetchConversations, fetchProfileName } from "@/lib/services/messages";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Messages — Bedouin",
  description: "Your conversations with hosts and co-hosts.",
};

interface Props {
  searchParams?: Promise<{ with?: string }>;
}

export default async function Page({ searchParams }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login?returnTo=/messages");

  const sp            = await searchParams;
  const withUserId    = sp?.with ?? null;

  const [conversations, withName] = await Promise.all([
    fetchConversations(user.id),
    withUserId ? fetchProfileName(withUserId) : Promise.resolve(undefined),
  ]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-[72px]">
        <MessagesPage
          myId={user.id}
          conversations={conversations}
          initialWithUserId={withUserId ?? undefined}
          initialWithName={withName}
        />
      </div>
    </div>
  );
}
