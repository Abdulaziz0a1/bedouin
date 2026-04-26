import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";

export interface ListingCancellationRequestRow {
  id: string;
  listingSubmissionId: string;
  listingTitle: string;
  hostId: string;
  hostName: string;
  hostEmail: string | null;
  reason: string;
  status: "pending" | "approved" | "rejected";
  adminNote: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

/**
 * Fetches all listing cancellation requests for the admin panel.
 * Joins with listing_submissions for the listing title and host info.
 */
export async function fetchListingCancellationRequests(): Promise<ListingCancellationRequestRow[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("listing_cancellation_requests")
      .select("id, listing_submission_id, host_id, reason, status, admin_note, created_at, reviewed_at")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) return [];

    // Batch-fetch submission titles
    const submissionIds = [...new Set(data.map((r) => r.listing_submission_id as string))];
    const { data: subs } = await supabase
      .from("listing_submissions")
      .select("id, title")
      .in("id", submissionIds);

    const subTitleMap: Record<string, string> = {};
    (subs ?? []).forEach((s) => { subTitleMap[s.id] = s.title; });

    // Batch-fetch host display names from profiles
    const hostIds = [...new Set(data.map((r) => r.host_id as string))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .in("id", hostIds);

    const hostNameMap: Record<string, string> = {};
    (profiles ?? []).forEach((p) => {
      hostNameMap[p.id] = `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || "Unknown Host";
    });

    // Batch-fetch host emails via admin client
    let hostEmailMap: Record<string, string> = {};
    try {
      const adminClient = createAdminClient();
      const emailResults = await Promise.all(
        hostIds.map((id) => adminClient.auth.admin.getUserById(id))
      );
      emailResults.forEach(({ data: u }) => {
        if (u.user?.email) hostEmailMap[u.user.id] = u.user.email;
      });
    } catch {
      // email is informational — don't fail the whole fetch
    }

    return data.map((row): ListingCancellationRequestRow => ({
      id:                   row.id as string,
      listingSubmissionId:  row.listing_submission_id as string,
      listingTitle:         subTitleMap[row.listing_submission_id as string] ?? "Unknown Listing",
      hostId:               row.host_id as string,
      hostName:             hostNameMap[row.host_id as string] ?? "Unknown Host",
      hostEmail:            hostEmailMap[row.host_id as string] ?? null,
      reason:               row.reason as string,
      status:               row.status as ListingCancellationRequestRow["status"],
      adminNote:            row.admin_note ?? null,
      createdAt:            row.created_at as string,
      reviewedAt:           row.reviewed_at ?? null,
    }));
  } catch {
    return [];
  }
}
