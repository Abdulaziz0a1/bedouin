import type { Metadata } from "next";
import { redirect } from "next/navigation";
import MessagesPage from "@/components/messages/MessagesPage";
import { createClient } from "@/lib/supabase-server";
import { fetchConversations, fetchProfileName, fetchListingTitle } from "@/lib/services/messages";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Messages — Bedouin",
  description: "Your conversations with hosts and co-hosts.",
};

interface Props {
  searchParams?: Promise<{ with?: string; listing?: string; booking?: string }>;
}

export default async function Page({ searchParams }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login?returnTo=/messages");

  const sp            = await searchParams;
  const withUserId    = sp?.with     ?? null;
  const listingId     = sp?.listing  ?? null;
  const bookingId     = sp?.booking  ?? null;

  const [conversations, withName, listingTitle] = await Promise.all([
    fetchConversations(user.id),
    withUserId  ? fetchProfileName(withUserId)     : Promise.resolve(undefined),
    listingId   ? fetchListingTitle(listingId)     : Promise.resolve(undefined),
  ]);

  return (
    <div className="min-h-screen">
      <div className="pt-[72px]">
        <MessagesPage
          myId={user.id}
          conversations={conversations}
          initialWithUserId={withUserId   ?? undefined}
          initialWithName={withName}
          initialListingId={listingId     ?? undefined}
          initialListingTitle={listingTitle ?? undefined}
          initialBookingId={bookingId     ?? undefined}
        />
      </div>
    </div>
  );
}
