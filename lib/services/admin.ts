import { createClient } from "@/lib/supabase-server";
import { getQueueStats } from "@/lib/data/admin";
import type { AdminListing, AdminHost, QueueStats } from "@/lib/types/admin";

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

function buildAdminHost(
  hostId: string,
  profile: { id: string; first_name: string | null; last_name: string | null } | undefined
): AdminHost {
  const name = profile
    ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || "Unknown Host"
    : "Unknown Host";

  return {
    id:               hostId,
    name,
    // Avatar and contact details are not stored in profiles — use placeholder.
    avatar:           `https://i.pravatar.cc/80?u=${hostId}`,
    email:            "",
    phone:            "",
    joinedAt:         "",
    totalListings:    0,
    approvedListings: 0,
    responseRate:     0,
    superhost:        false,
  };
}

/* ─── Service ──────────────────────────────────────────────────────────────── */

/**
 * Fetches the full listing_submissions queue from Supabase.
 *
 * Falls back to ADMIN_LISTINGS on any error or empty result.
 * INTENTIONAL FALLBACK — keeps the admin panel functional with seed data.
 */
export async function fetchSubmissionQueue(): Promise<AdminListing[]> {
  try {
    const supabase = await createClient();

    const { data: submissions, error } = await supabase
      .from("listing_submissions")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (error || !submissions) return [];
    if (submissions.length === 0) return [];

    // Batch-fetch profiles for all unique host_ids.
    const hostIds = [...new Set(
      submissions.map((s) => s.host_id).filter((id): id is string => Boolean(id))
    )];

    const profileMap: Record<string, { id: string; first_name: string | null; last_name: string | null }> = {};

    if (hostIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", hostIds);

      (profiles ?? []).forEach((p) => { profileMap[p.id] = p; });
    }

    return submissions.map((row): AdminListing => ({
      id:               row.id,
      listingRef:       row.reference,
      title:            row.title,
      category:         row.category,
      region:           row.region,
      location:         row.location ?? "",
      description:      row.description ?? "",
      highlights:       (row.highlights as string[]) ?? [],
      amenities:        (row.amenities  as string[]) ?? [],
      houseRules:       (row.house_rules as string[]) ?? [],
      imageUrls:        (row.image_urls  as string[]) ?? [],
      maxGuests:        row.max_guests   ?? 1,
      bedrooms:         row.bedrooms     ?? 0,
      beds:             row.beds         ?? 1,
      baths:            row.baths        ?? 1,
      minNights:        row.min_nights   ?? 1,
      checkInTime:      row.check_in_time  ?? "3:00 PM",
      checkOutTime:     row.check_out_time ?? "11:00 AM",
      price:            row.price         ?? 0,
      originalPrice:    row.original_price ?? 0,
      priceUnit:        row.price_unit     ?? "per night",
      status:           row.status,
      submittedAt:      row.submitted_at,
      reviewedAt:       row.reviewed_at   ?? undefined,
      reviewedBy:       row.reviewed_by   ?? undefined,
      rejectionReason:  row.rejection_reason ?? undefined,
      adminNotes:       row.admin_notes   ?? undefined,
      host:             buildAdminHost(row.host_id, profileMap[row.host_id]),
    }));
  } catch {
    return [];
  }
}

/* ─── Host application queue ───────────────────────────────────────────────── */

export interface HostApplicationRow {
  id:              string;
  userId:          string;
  userName:        string;
  userEmail:       string;
  bio:             string;
  languages:       string[];
  experienceYears: number;
  propertyTypes:   string[];
  region:          string;
  city:            string;
  phone:           string;
  paymentInfo:     Record<string, string>;
  status:          "pending" | "approved" | "rejected";
  submittedAt:     string;
  reviewedAt?:     string;
  rejectionReason?: string;
}

export async function fetchHostApplicationQueue(): Promise<HostApplicationRow[]> {
  try {
    const supabase = await createClient();

    const { data: apps, error } = await supabase
      .from("host_applications")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (error || !apps || apps.length === 0) return [];

    const userIds = [...new Set(apps.map((a) => a.user_id).filter(Boolean))];
    const profileMap: Record<string, { first_name: string | null; last_name: string | null }> = {};

    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", userIds);
      (profiles ?? []).forEach((p) => { profileMap[p.id] = p; });
    }

    return apps.map((row): HostApplicationRow => {
      const profile = profileMap[row.user_id];
      const userName = profile
        ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || "Unknown"
        : "Unknown";
      return {
        id:              row.id,
        userId:          row.user_id,
        userName,
        userEmail:       "",
        bio:             row.bio ?? "",
        languages:       (row.languages as string[]) ?? [],
        experienceYears: row.experience_years ?? 0,
        propertyTypes:   (row.property_types as string[]) ?? [],
        region:          row.region ?? "",
        city:            row.city ?? "",
        phone:           row.phone ?? "",
        paymentInfo:     (row.payment_info as Record<string, string>) ?? {},
        status:          row.status,
        submittedAt:     row.submitted_at,
        reviewedAt:      row.reviewed_at ?? undefined,
        rejectionReason: row.rejection_reason ?? undefined,
      };
    });
  } catch {
    return [];
  }
}

/* ─── Co-host application queue ────────────────────────────────────────────── */

export interface CohostApplicationRow {
  id:              string;
  userId:          string;
  userName:        string;
  bio:             string;
  serviceTypes:    string[];
  propertyTypes:   string[];
  languages:       string[];
  experienceYears: number;
  region:          string;
  city:            string;
  phone:           string;
  feeModel:        string;
  feeValue?:       number;
  status:          "pending" | "approved" | "rejected";
  submittedAt:     string;
  reviewedAt?:     string;
  rejectionReason?: string;
}

export async function fetchCohostApplicationQueue(): Promise<CohostApplicationRow[]> {
  try {
    const supabase = await createClient();

    const { data: apps, error } = await supabase
      .from("cohost_applications")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (error || !apps || apps.length === 0) return [];

    const userIds = [...new Set(apps.map((a) => a.user_id).filter(Boolean))];
    const profileMap: Record<string, { first_name: string | null; last_name: string | null }> = {};

    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", userIds);
      (profiles ?? []).forEach((p) => { profileMap[p.id] = p; });
    }

    return apps.map((row): CohostApplicationRow => {
      const profile = profileMap[row.user_id];
      const userName = profile
        ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || "Unknown"
        : "Unknown";
      return {
        id:              row.id,
        userId:          row.user_id,
        userName,
        bio:             row.bio ?? "",
        serviceTypes:    (row.service_types as string[]) ?? [],
        propertyTypes:   (row.property_types as string[]) ?? [],
        languages:       (row.languages as string[]) ?? [],
        experienceYears: row.experience_years ?? 0,
        region:          row.region ?? "",
        city:            row.city ?? "",
        phone:           row.phone ?? "",
        feeModel:        row.fee_model ?? "negotiable",
        feeValue:        row.fee_value ?? undefined,
        status:          row.status,
        submittedAt:     row.submitted_at,
        reviewedAt:      row.reviewed_at ?? undefined,
        rejectionReason: row.rejection_reason ?? undefined,
      };
    });
  } catch {
    return [];
  }
}

/**
 * Computes queue statistics from real data.
 * Falls back to mock stats if the service fails.
 */
export async function fetchQueueStats(): Promise<QueueStats> {
  try {
    const listings = await fetchSubmissionQueue();
    const today = new Date().toISOString().slice(0, 10);

    return {
      pendingCount:   listings.filter((l) => l.status === "pending_review").length,
      approvedToday:  listings.filter((l) => l.status === "approved" && l.reviewedAt?.startsWith(today)).length,
      rejectedToday:  listings.filter((l) => l.status === "rejected"  && l.reviewedAt?.startsWith(today)).length,
      avgReviewHours: 52,   // TODO: compute from real timestamps
    };
  } catch {
    return getQueueStats();
  }
}
