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
  isDeleted: boolean;
}

export async function fetchThread(otherId: string): Promise<ThreadMessage[]> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const myId = user.id;

    const { data, error } = await supabase
      .from("messages")
      .select("id, sender_id, content, created_at, is_deleted")
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
      isDeleted: row.is_deleted ?? false,
    }));
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// deleteMessage  — soft-deletes a message the current user sent
// ─────────────────────────────────────────────────────────────────────────────

export async function deleteMessage(messageId: string): Promise<MessageActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not signed in." };

  // 1. Fetch message — verify ownership and get conversation context
  const { data: msg, error: fetchErr } = await supabase
    .from("messages")
    .select("id, sender_id, receiver_id, created_at, is_deleted")
    .eq("id", messageId)
    .single();

  if (fetchErr || !msg)        return { success: false, error: "Message not found." };
  if (msg.sender_id !== user.id) return { success: false, error: "You can only delete your own messages." };
  if (msg.is_deleted)           return { success: false, error: "This message is already deleted." };

  // 2. Enforce "no reply after" rule — check for any message from the other
  //    participant sent AFTER this message in the same thread.
  const { count } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("sender_id",   msg.receiver_id)
    .eq("receiver_id", user.id)
    .gt("created_at",  msg.created_at);

  if (count && count > 0) {
    return {
      success: false,
      error: "This message can no longer be deleted because the other user has already replied.",
    };
  }

  // 3. Soft-delete
  const { error } = await supabase
    .from("messages")
    .update({ is_deleted: true })
    .eq("id", messageId)
    .eq("sender_id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/messages");
  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// hideConversation  — soft-hides a conversation for the current user only
// ─────────────────────────────────────────────────────────────────────────────

export async function hideConversation(otherUserId: string): Promise<MessageActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not signed in." };

  // Verify the caller is actually a participant in this conversation
  const { count } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .or(
      `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),` +
      `and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
    );

  if (!count || count === 0) return { success: false, error: "Conversation not found." };

  const { error } = await supabase
    .from("conversation_hides")
    .upsert(
      { user_id: user.id, other_user_id: otherUserId, hidden_at: new Date().toISOString() },
      { onConflict: "user_id,other_user_id" }
    );

  if (error) return { success: false, error: error.message };

  revalidatePath("/messages");
  return { success: true };
}
