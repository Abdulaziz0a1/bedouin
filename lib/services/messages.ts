import { createClient } from "@/lib/supabase-server";

export interface Conversation {
  userId:      string;
  name:        string;
  lastMessage: string;
  lastAt:      string;
}

/**
 * Returns the distinct conversations for `myId`, sorted by most recent message.
 * Each entry represents one unique other party and their last message.
 */
export async function fetchConversations(myId: string): Promise<Conversation[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("messages")
      .select("sender_id, receiver_id, content, created_at")
      .or(`sender_id.eq.${myId},receiver_id.eq.${myId}`)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) return [];

    // Group by the other party — keep only the first (most recent) per partner
    const map = new Map<string, { lastMessage: string; lastAt: string }>();
    for (const row of data) {
      const otherId = row.sender_id === myId ? row.receiver_id : row.sender_id;
      if (!map.has(otherId)) {
        map.set(otherId, { lastMessage: row.content, lastAt: row.created_at });
      }
    }

    if (map.size === 0) return [];

    // Batch-fetch display names
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .in("id", Array.from(map.keys()));

    const pm: Record<string, { first_name: string | null; last_name: string | null }> = {};
    (profiles ?? []).forEach((p) => { pm[p.id] = p; });

    return Array.from(map.entries()).map(([userId, { lastMessage, lastAt }]) => {
      const p    = pm[userId];
      const name = p ? `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() : "User";
      return { userId, name: name || "User", lastMessage, lastAt };
    });
  } catch {
    return [];
  }
}

/**
 * Fetches the display name for a single user id.
 * Used when starting a new conversation from a context link (e.g. booking → host).
 */
export async function fetchProfileName(userId: string): Promise<string> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", userId)
      .single();
    if (!data) return "User";
    return `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim() || "User";
  } catch {
    return "User";
  }
}
