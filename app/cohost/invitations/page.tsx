import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { fetchCohostInvitations } from "@/lib/services/cohost";
import CoHostInvitationsPage from "@/components/cohost/CoHostInvitationsPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Invitations · Bedouin",
  description: "Co-host invitations from hosts on Bedouin.",
};

export default async function CohostInvitationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?returnTo=/cohost/invitations");
  }

  let invitations: Awaited<ReturnType<typeof fetchCohostInvitations>> = [];
  let error: string | undefined;

  try {
    invitations = await fetchCohostInvitations(user.id);
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load invitations.";
  }

  return <CoHostInvitationsPage invitations={invitations} error={error} />;
}
