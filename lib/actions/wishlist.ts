"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";

/**
 * Toggles a listing in/out of the current user's wishlist.
 * listingSlug must match listings.slug (the URL identifier).
 *
 * Returns { saved: boolean } on success or { error: string } on failure.
 * The caller is responsible for redirecting to /login when error === "not_authenticated".
 */
export async function toggleWishlist(
  listingSlug: string,
): Promise<{ saved: boolean } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "not_authenticated" };

  // Check if row already exists (UNIQUE constraint guarantees at most one row).
  const { data: existing } = await supabase
    .from("wishlists")
    .select("id")
    .eq("user_id", user.id)
    .eq("listing_id", listingSlug)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("wishlists")
      .delete()
      .eq("id", existing.id);

    if (error) return { error: error.message };
    revalidatePath("/account");
    return { saved: false };
  } else {
    const { error } = await supabase
      .from("wishlists")
      .insert({ user_id: user.id, listing_id: listingSlug });

    if (error) return { error: error.message };
    revalidatePath("/account");
    return { saved: true };
  }
}
