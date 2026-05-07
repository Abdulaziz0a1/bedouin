import { createClient } from "@/lib/supabase-server";
import type {
  CoHost,
  CoHostService,
  CoHostInvitation,
  CoHostAssignment,
  InviteModalListing,
} from "@/lib/types/cohost";

/**
 * Fetches approved co-host applicants from the DB and maps them to the CoHost
 * interface so the marketplace shows real profiles.
 *
 * Falls back to [] on any error — the page will show mock data instead.
 */
export async function fetchApprovedCohosts(): Promise<CoHost[]> {
  try {
    const supabase = await createClient();

    const { data: apps, error } = await supabase
      .from("cohost_applications")
      .select("*")
      .eq("status", "approved")
      .order("submitted_at", { ascending: false });

    if (error || !apps || apps.length === 0) return [];

    // Batch-fetch profiles for display names
    const userIds = [...new Set(apps.map((a) => a.user_id).filter(Boolean))];
    const profileMap: Record<string, { first_name: string | null; last_name: string | null }> = {};

    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", userIds);
      (profiles ?? []).forEach((p) => { profileMap[p.id] = p; });
    }

    return apps.map((row): CoHost => {
      const profile = profileMap[row.user_id];
      const firstName = profile?.first_name ?? "Co-host";
      const lastName  = profile?.last_name  ?? "";
      const fullName  = `${firstName} ${lastName}`.trim() || "Co-host";

      // Map fee model label
      let feeDisplay: string;
      if (row.fee_model === "percentage" && row.fee_value) {
        feeDisplay = `${row.fee_value}% commission`;
      } else if (row.fee_model === "fixed" && row.fee_value) {
        feeDisplay = `SAR ${row.fee_value}/month`;
      } else {
        feeDisplay = "Negotiable";
      }

      return {
        id:           row.id,          // cohost_application UUID
        userId:       row.user_id,     // auth.users UUID — used to match invitations/assignments
        name:         fullName,
        firstName,
        avatar:       "",
        bio:          row.bio ?? "",
        region:       row.region ?? "",
        city:         row.city ?? "",
        languages:    (row.languages as string[]) ?? [],
        services:     (row.service_types as CoHostService[]) ?? [],
        supportedPropertyTypes: [],
        yearsExperience:  row.experience_years ?? 0,
        listingsManaged:  0,
        rating:           0,
        reviewCount:      0,
        responseRate:     100,
        responseTime:     "within a day",
        status:           "available",
        feeModel:         row.fee_model ?? "negotiable",
        feeValue:         row.fee_value ?? undefined,
        joinedAt:         row.submitted_at ?? new Date().toISOString(),
        reviews:          [],
        // Store fee display as an extra field for use in CoHostListItem
        _feeDisplay:      feeDisplay,
      } as CoHost & { _feeDisplay: string };
    });
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// fetchHostListingsForInvite
// Returns a host's approved live listings for InviteModal listing selector
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchHostListingsForInvite(
  hostId: string
): Promise<InviteModalListing[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("listing_submissions")
      .select("listing_id, title, region, image_urls")
      .eq("host_id", hostId)
      .eq("status", "approved")
      .not("listing_id", "is", null);

    if (error || !data || data.length === 0) return [];

    return data.map((row) => ({
      id:     row.listing_id as string,
      title:  row.title ?? "",
      region: row.region ?? "",
      image:  (row.image_urls as string[])?.[0] ?? "",
      status: "approved" as const,
    }));
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// fetchHostInvitations
// Returns invitations a host has sent (for the host dashboard Co-hosts tab)
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchHostInvitations(
  hostId: string
): Promise<CoHostInvitation[]> {
  try {
    const supabase = await createClient();

    // Exclude 'accepted' — accepted invitations produce a cohost_assignments row
    // shown as "Active co-host". Including them here creates a misleading
    // "Accepted" entry in Invitation History alongside the active assignment card.
    const { data, error } = await supabase
      .from("cohost_invitations")
      .select("*, cohost_applications(user_id)")
      .eq("host_id", hostId)
      .in("status", ["pending", "declined"])
      .order("sent_at", { ascending: false });

    if (error || !data || data.length === 0) return [];

    // Batch-fetch co-host display names from profiles
    const cohostUserIds = [...new Set(data.map((r) => r.cohost_user_id))];
    const profileMap: Record<string, { first_name: string | null; last_name: string | null }> = {};

    if (cohostUserIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", cohostUserIds);
      (profiles ?? []).forEach((p) => { profileMap[p.id] = p; });
    }

    return data.map((row): CoHostInvitation => {
      const p = profileMap[row.cohost_user_id];
      const name = p ? `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() : "Co-host";

      return {
        id:            row.id,
        coHostId:      row.cohost_user_id,
        coHostName:    name || "Co-host",
        coHostAvatar:  "",
        listingId:     row.listing_id,
        listingTitle:  row.listing_title,
        listingImage:  row.listing_image,
        message:       row.message,
        sentAt:        row.sent_at,
        status:        row.status as CoHostInvitation["status"],
      };
    });
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// fetchHostAssignments
// Returns active co-host assignments for a host's listings
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchHostAssignments(
  hostId: string
): Promise<CoHostAssignment[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("cohost_assignments")
      .select("*")
      .eq("host_id", hostId)
      .in("status", ["active", "withdrawal_requested"])
      .order("assigned_at", { ascending: false });

    if (error || !data || data.length === 0) return [];

    // Fetch co-host profiles + application data in one shot
    const cohostAppIds = [...new Set(data.map((r) => r.cohost_application_id))];
    const appMap: Record<string, { user_id: string; service_types: string[]; region: string }> = {};

    if (cohostAppIds.length > 0) {
      const { data: apps } = await supabase
        .from("cohost_applications")
        .select("id, user_id, service_types, region")
        .in("id", cohostAppIds);
      (apps ?? []).forEach((a) => { appMap[a.id] = a; });
    }

    const cohostUserIds = [...new Set(data.map((r) => r.cohost_user_id))];
    const profileMap: Record<string, { first_name: string | null; last_name: string | null }> = {};

    if (cohostUserIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", cohostUserIds);
      (profiles ?? []).forEach((p) => { profileMap[p.id] = p; });
    }

    return data.map((row): CoHostAssignment => {
      const app  = appMap[row.cohost_application_id];
      const prof = profileMap[row.cohost_user_id];
      const name = prof
        ? `${prof.first_name ?? ""} ${prof.last_name ?? ""}`.trim()
        : "Co-host";

      return {
        id:               row.id,
        coHostId:         row.cohost_user_id,
        coHostName:       name || "Co-host",
        coHostAvatar:     "",
        coHostRegion:     app?.region ?? "",
        listingId:        row.listing_id,
        listingTitle:     row.listing_title,
        listingImage:     row.listing_image,
        services:         (app?.service_types as CoHostService[]) ?? [],
        assignedAt:       row.assigned_at,
        status:           (row.status as CoHostAssignment["status"]) ?? "active",
      };
    });
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// fetchCohostInvitations
// Returns invitations received by a co-host user (for /cohost/invitations)
// ─────────────────────────────────────────────────────────────────────────────

export interface CohostInboxItem {
  id:           string;
  hostId:       string;        // auth.users UUID — used to build /messages?with=HOST_ID
  hostName:     string;
  listingId:    string | null; // listings UUID — used to build &listing= param for message context
  listingTitle: string;
  listingImage: string;
  message:      string;
  sentAt:       string;
  status:       "pending" | "accepted" | "declined";
  services:     CoHostService[]; // co-host's service types from their application
}

export interface CohostAssignmentItem {
  id:            string;
  listingId:     string;   // listing SLUG — matches bookings.listing_slug for dedup filtering
  listingDbId:   string | null; // listings UUID — used for &listing= param in message context
  listingTitle:  string;
  status:        "active" | "withdrawal_requested" | "ended";
  listingImage:  string;
  hostId:        string;   // auth.users UUID — used for /messages?with=HOST_ID
  hostName:      string;
  assignedAt:    string;   // ISO
  checkInTime?:  string;   // e.g. "3:00 PM" — from listings table, for arrival reminder
}

export async function fetchCohostInvitations(userId: string): Promise<CohostInboxItem[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("cohost_invitations")
      .select("*, cohost_applications(service_types)")
      .eq("cohost_user_id", userId)
      .in("status", ["pending", "accepted", "declined"])
      .order("sent_at", { ascending: false });

    if (error || !data || data.length === 0) return [];

    // Batch-fetch host names
    const hostIds = [...new Set(data.map((r) => r.host_id))];
    const hostMap: Record<string, { first_name: string | null; last_name: string | null }> = {};

    if (hostIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", hostIds);
      (profiles ?? []).forEach((p) => { hostMap[p.id] = p; });
    }

    return data.map((row): CohostInboxItem => {
      const h = hostMap[row.host_id];
      const hostName = h
        ? `${h.first_name ?? ""} ${h.last_name ?? ""}`.trim()
        : "A host";
      const appData = row.cohost_applications as { service_types: string[] | null } | null;

      return {
        id:           row.id,
        hostId:       row.host_id,
        hostName:     hostName || "A host",
        listingId:    row.listing_id ?? null,
        listingTitle: row.listing_title,
        listingImage: row.listing_image,
        message:      row.message,
        sentAt:       row.sent_at,
        status:       row.status as CohostInboxItem["status"],
        services:     (appData?.service_types as CoHostService[]) ?? [],
      };
    });
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// fetchCohostAssignments
// Returns active listings a co-host is assigned to (for the co-host dashboard)
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchCohostAssignments(userId: string): Promise<CohostAssignmentItem[]> {
  try {
    const supabase = await createClient();

    // Join listings to get slug + check_in_time for:
    //   1. Route links (/listing/[slug]) — cohost_assignments only stores the UUID FK
    //   2. Dedup filtering — bookings table stores listing_slug, not UUID
    //   3. Arrival reminder — listings.check_in_time gives the real check-in time
    const { data, error } = await supabase
      .from("cohost_assignments")
      .select("*, listings(slug, check_in_time)")
      .eq("cohost_user_id", userId)
      .in("status", ["active", "withdrawal_requested"])
      .order("assigned_at", { ascending: false });

    if (error || !data || data.length === 0) return [];

    // Batch-fetch host display names
    const hostIds = [...new Set(data.map((r) => r.host_id))];
    const hostMap: Record<string, { first_name: string | null; last_name: string | null }> = {};

    if (hostIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", hostIds);
      (profiles ?? []).forEach((p) => { hostMap[p.id] = p; });
    }

    return data.map((row): CohostAssignmentItem => {
      const h = hostMap[row.host_id];
      const hostName = h ? `${h.first_name ?? ""} ${h.last_name ?? ""}`.trim() : "Host";

      // listing_slug comes from the joined listings row.
      // Falls back to empty string if the listing was deleted (assignment orphaned).
      const listing = row.listings as { slug: string; check_in_time: string } | null;

      return {
        id:           row.id,
        listingId:    listing?.slug ?? "",   // SLUG — matches bookings.listing_slug
        listingDbId:  row.listing_id ?? null,
        listingTitle: row.listing_title,
        listingImage: row.listing_image,
        hostId:       row.host_id,
        hostName:     hostName || "Host",
        assignedAt:   row.assigned_at,
        checkInTime:  listing?.check_in_time,
        status:       (row.status as CohostAssignmentItem["status"]) ?? "active",
      };
    });
  } catch {
    return [];
  }
}
