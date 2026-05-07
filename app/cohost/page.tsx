import type { Metadata } from "next";
import { createClient } from "@/lib/supabase-server";
import CoHostBrowsePage from "@/components/cohost/CoHostBrowsePage";
import {
  fetchApprovedCohosts,
  fetchHostListingsForInvite,
  fetchHostInvitations,
  fetchHostAssignments,
} from "@/lib/services/cohost";
import type { InviteModalListing, CoHostInvitation, CoHostAssignment } from "@/lib/types/cohost";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Find a Co-host — Bedouin",
  description: "Browse verified co-hosts across Saudi Arabia to help manage your Bedouin listings.",
};

export default async function CoHostPage({
  searchParams,
}: {
  searchParams?: Promise<{ listing?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const params = await searchParams;
  const defaultListingId = params?.listing ?? null;

  const [dbCohosts, hostListings, hostInvitations, hostAssignments] = await Promise.all([
    fetchApprovedCohosts()
      .then((c) => ({ data: c, error: null }))
      .catch((e) => ({ data: [], error: e instanceof Error ? e.message : "Failed to load co-hosts." })),
    user ? fetchHostListingsForInvite(user.id)  : Promise.resolve<InviteModalListing[]>([]),
    user ? fetchHostInvitations(user.id)        : Promise.resolve<CoHostInvitation[]>([]),
    user ? fetchHostAssignments(user.id)        : Promise.resolve<CoHostAssignment[]>([]),
  ]);

  return (
    <CoHostBrowsePage
      initialCohosts={dbCohosts.data}
      hostListings={hostListings}
      hostInvitations={hostInvitations}
      hostAssignments={hostAssignments}
      currentUserId={user?.id ?? null}
      defaultListingId={defaultListingId}
      error={dbCohosts.error ?? undefined}
    />
  );
}
