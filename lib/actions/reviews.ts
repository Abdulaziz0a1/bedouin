"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";

export async function submitReview(
  bookingId: string,
  rating: number,
  comment: string,
): Promise<{ success: boolean; error?: string }> {
  // Input validation
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { success: false, error: "Please select a rating between 1 and 5." };
  }
  const trimmed = comment.trim();
  if (trimmed.length < 10) {
    return { success: false, error: "Comment must be at least 10 characters." };
  }
  if (trimmed.length > 1000) {
    return { success: false, error: "Comment must be 1000 characters or fewer." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "You must be logged in to leave a review." };

  // Fetch booking — validates ownership and derives completed status
  const { data: booking, error: bErr } = await supabase
    .from("bookings")
    .select("id, listing_slug, host_id, user_id, status, check_out")
    .eq("id", bookingId)
    .single();

  if (bErr || !booking) return { success: false, error: "Booking not found." };
  if (booking.user_id !== user.id) return { success: false, error: "Unauthorized." };

  // "completed" is derived: not cancelled and check_out is in the past
  if (booking.status === "cancelled") {
    return { success: false, error: "Cannot review a cancelled booking." };
  }
  if (new Date(booking.check_out) >= new Date()) {
    return { success: false, error: "Your stay hasn't finished yet." };
  }

  // Resolve listing slug → UUID for the FK
  const { data: listing } = await supabase
    .from("listings")
    .select("id")
    .eq("slug", booking.listing_slug)
    .single();

  if (!listing) return { success: false, error: "Listing not found." };

  const { error: insertError } = await supabase.from("reviews").insert({
    booking_id: bookingId,
    listing_id: listing.id,
    host_id:    booking.host_id ?? null,
    user_id:    user.id,
    rating,
    comment:    trimmed,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return { success: false, error: "You have already reviewed this booking." };
    }
    return { success: false, error: insertError.message };
  }

  // Invalidate the listing page so the new review appears on next load
  revalidatePath(`/listing/${booking.listing_slug}`);

  return { success: true };
}
