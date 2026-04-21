"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export type MessageActionResult = { success: true } | { success: false; error: string };

// ─────────────────────────────────────────────────────────────────────────────
// sendMessage
// ─────────────────────────────────────────────────────────────────────────────

export async function sendMessage(
  receiverId:        string,
  content:           string,
  relatedListingId?: string,
  relatedBookingId?: string
): Promise<MessageActionResult> {
  const trimmed = content.trim();
  if (!trimmed) return { success: false, error: "Message cannot be empty." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not signed in." };

  const { error } = await supabase.from("messages").insert({
    sender_id:          user.id,
    receiver_id:        receiverId,
    content:            trimmed,
    related_listing_id: relatedListingId ?? null,
    related_booking_id: relatedBookingId ?? null,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/messages");
  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// fetchThread  — returns messages between me and one other user
// Called from the client component when switching conversations.
// ─────────────────────────────────────────────────────────────────────────────

export interface ThreadMessage {
  id:        string;
  senderId:  string;
  content:   string;
  createdAt: string;
}

export async function fetchThread(otherId: string): Promise<ThreadMessage[]> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const myId = user.id;

    const { data, error } = await supabase
      .from("messages")
      .select("id, sender_id, content, created_at")
      .or(
        `and(sender_id.eq.${myId},receiver_id.eq.${otherId}),` +
        `and(sender_id.eq.${otherId},receiver_id.eq.${myId})`
      )
      .order("created_at", { ascending: true });

    if (error || !data) return [];

    return data.map((row) => ({
      id:        row.id,
      senderId:  row.sender_id,
      content:   row.content,
      createdAt: row.created_at,
    }));
  } catch {
    return [];
  }
}
