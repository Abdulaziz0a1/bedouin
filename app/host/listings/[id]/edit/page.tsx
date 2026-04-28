import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import EditListingFlow from "@/components/host/EditListingFlow";
import type { ListingDraft, DraftCategory, DraftRegion } from "@/lib/types/host";

export const metadata = {
  title: "Edit Listing – Bedouin",
};

interface Props {
  params:      Promise<{ id: string }>;
  searchParams: Promise<{ step?: string; fromTemplate?: string }>;
}

export default async function EditListingPage({ params, searchParams }: Props) {
  const { id }           = await params;
  const { step, fromTemplate } = await searchParams;

  // Parse the step query param — must be 1–6, otherwise start at 1
  const stepNum = step ? parseInt(step, 10) : NaN;
  const initialStep = (stepNum >= 1 && stepNum <= 6)
    ? (stepNum as 1 | 2 | 3 | 4 | 5 | 6)
    : undefined;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?returnTo=/host/listings/${id}/edit`);
  }

  // Mode guard: only host-mode users (or admins) may edit listings.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, active_mode")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin" && profile?.active_mode !== "host") {
    redirect("/account");
  }

  // Fetch the submission and verify ownership.
  const { data: row, error } = await supabase
    .from("listing_submissions")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !row) {
    notFound();
  }

  // Only the owning host (or an admin) may edit.
  if (profile?.role !== "admin" && row.host_id !== user.id) {
    redirect("/dashboard");
  }

  // Approved listings are live — editing them is not supported here.
  // Draft listings (template copies) and pending/rejected submissions are all editable.
  if (row.status === "approved") {
    redirect("/dashboard");
  }

  // Map the DB row back to a ListingDraft so the form steps are pre-filled.
  const initialDraft: ListingDraft = {
    category:         (row.category        ?? "")   as DraftCategory,
    title:            row.title            ?? "",
    description:      row.description      ?? "",
    highlights:       (row.highlights      ?? [])   as string[],
    region:           (row.region          ?? "")   as DraftRegion,
    location:         row.location         ?? "",
    mapsUrl:          row.maps_url         ?? "",
    maxGuests:        row.max_guests       ?? 2,
    bedrooms:         row.bedrooms         ?? 1,
    beds:             row.beds             ?? 1,
    baths:            row.baths            ?? 1,
    minNights:        row.min_nights       ?? 1,
    checkInTime:      row.check_in_time    ?? "3:00 PM",
    checkOutTime:     row.check_out_time   ?? "11:00 AM",
    amenities:        (row.amenities       ?? [])   as string[],
    price:            Number(row.price)    ?? 0,
    originalPrice:    Number(row.original_price) || 0,
    priceUnit:        row.price_unit       ?? "per night",
    imagePreviewUrls: (row.image_urls      ?? [])   as string[],
    houseRules:       (row.house_rules     ?? [])   as string[],
    status:           row.status           ?? "draft",
  };

  return (
    <div className="min-h-screen bg-[#f4efe6]">
      <main className="pt-[72px]">
        <EditListingFlow
          submissionId={id}
          initialDraft={initialDraft}
          currentStatus={row.status as "pending_review" | "rejected" | "draft"}
          rejectionReason={row.rejection_reason ?? undefined}
          listingTitle={row.title ?? "Untitled Listing"}
          userId={user.id}
          initialStep={initialStep}
          fromTemplate={fromTemplate === "true"}
        />
      </main>
    </div>
  );
}
