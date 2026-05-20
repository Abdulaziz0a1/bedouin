import { createClient } from "@/lib/supabase-server";

export interface Conversation {
  userId:          string;
  name:            string;
  lastMessage:     string;
  lastAt:          string;
  unreadCount:     number;          // messages sent TO myId that are unread in this thread
  // Context fields — null when not linked to a listing or booking
  listingId:        string | null;
  listingTitle:     string | null;
  listingTitle_ar?: string | null;
  bookingId:        string | null;
  bookingCheckIn:  string | null;   // "YYYY-MM-DD"
  bookingCheckOut: string | null;   // "YYYY-MM-DD"
  /**
   * Role of the OTHER participant from myId's perspective.
   *   "Host"           — they host the linked listing (I am the guest or inquirer)
   *   "Guest (Booked)" — they booked my listing (I am the host)
   *   "Guest (Inquiry)"— they messaged about my listing with no booking (I am the host)
   *   null             — cannot be determined (no listing/booking link)
   */
  otherParticipantRole: "Host" | "Guest (Booked)" | "Guest (Inquiry)" | "Co-host" | null;
}

/**
 * Returns the distinct conversations for `myId`, sorted by most recent message.
 * Each entry represents one unique other party enriched with listing/booking context.
 */
export async function fetchConversations(myId: string): Promise<Conversation[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("messages")
      .select("sender_id, receiver_id, content, created_at, related_listing_id, related_booking_id, is_read, is_deleted")
      .or(`sender_id.eq.${myId},receiver_id.eq.${myId}`)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) return [];

    // Group by the other party — newest non-deleted message wins for lastMessage/lastAt.
    // Continue scanning to fill in the first non-null listing/booking context.
    // Also count unread messages (received by myId, not yet read).
    const map = new Map<string, {
      lastMessage:  string;
      lastAt:       string;
      listingId:    string | null;
      bookingId:    string | null;
      unreadCount:  number;
    }>();

    for (const row of data) {
      const otherId    = row.sender_id === myId ? row.receiver_id : row.sender_id;
      const isIncoming = row.receiver_id === myId;
      const isUnread   = isIncoming && !row.is_read && !row.is_deleted;
      const isVisible  = !row.is_deleted;

      if (!map.has(otherId)) {
        map.set(otherId, {
          lastMessage:  isVisible ? row.content : "[Message deleted]",
          lastAt:       row.created_at,
          listingId:    row.related_listing_id  ?? null,
          bookingId:    row.related_booking_id  ?? null,
          unreadCount:  isUnread ? 1 : 0,
        });
      } else {
        const entry = map.get(otherId)!;
        // Fill in context from later (older) messages if still missing
        if (!entry.listingId && row.related_listing_id) entry.listingId = row.related_listing_id;
        if (!entry.bookingId && row.related_booking_id) entry.bookingId = row.related_booking_id;
        // Accumulate unread count
        if (isUnread) entry.unreadCount += 1;
      }
    }

    if (map.size === 0) return [];

    // ── Filter hidden conversations ───────────────────────────────────────────
    // A conversation is hidden when its other_user_id appears in conversation_hides
    // AND the latest message (lastAt) was sent before hidden_at.
    // If a new message arrives after hidden_at the conversation reappears.
    const { data: hides } = await supabase
      .from("conversation_hides")
      .select("other_user_id, hidden_at")
      .eq("user_id", myId);

    const hiddenMap = new Map<string, string>(); // otherId → hidden_at ISO
    (hides ?? []).forEach((h: { other_user_id: string; hidden_at: string }) => {
      hiddenMap.set(h.other_user_id, h.hidden_at);
    });

    for (const [otherId, conv] of map) {
      const hiddenAt = hiddenMap.get(otherId);
      // Hide only when lastAt is at or before hidden_at (i.e., no new messages)
      if (hiddenAt && conv.lastAt <= hiddenAt) {
        map.delete(otherId);
      }
    }

    if (map.size === 0) return [];

    // ── Batch-fetch profiles ──────────────────────────────────────────────────
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .in("id", Array.from(map.keys()));

    const pm: Record<string, { first_name: string | null; last_name: string | null }> = {};
    (profiles ?? []).forEach((p) => { pm[p.id] = p; });

    // ── Batch-fetch listings ──────────────────────────────────────────────────
    const listingIds = [...new Set(
      Array.from(map.values()).map((v) => v.listingId).filter((id): id is string => !!id),
    )];
    const listingMap: Record<string, { title: string; title_ar?: string | null; host_id: string | null }> = {};
    if (listingIds.length > 0) {
      const { data: listings } = await supabase
        .from("listings")
        .select("id, title, title_ar, host_id")
        .in("id", listingIds);
      (listings ?? []).forEach((l) => { listingMap[l.id] = l; });
    }

    // ── Batch-fetch bookings ──────────────────────────────────────────────────
    const bookingIds = [...new Set(
      Array.from(map.values()).map((v) => v.bookingId).filter((id): id is string => !!id),
    )];
    const bookingMap: Record<string, {
      user_id:       string;
      host_id:       string | null;
      listing_title: string;
      check_in:      string;
      check_out:     string;
    }> = {};
    if (bookingIds.length > 0) {
      const { data: bookings } = await supabase
        .from("bookings")
        .select("id, user_id, host_id, listing_title, check_in, check_out")
        .in("id", bookingIds);
      (bookings ?? []).forEach((b) => { bookingMap[b.id] = b; });
    }

    // ── Batch-fetch co-host assignments for listing-linked conversations ──────
    // RLS allows reading rows where auth.uid() = host_id OR cohost_user_id,
    // so this correctly covers both host and co-host perspectives.
    // Key: "listingId:cohostUserId" — used to detect co-host relationships.
    const coHostPairs = new Set<string>();
    if (listingIds.length > 0) {
      const { data: assignments } = await supabase
        .from("cohost_assignments")
        .select("listing_id, cohost_user_id")
        .in("listing_id", listingIds);
      (assignments ?? []).forEach((a) => {
        coHostPairs.add(`${a.listing_id}:${a.cohost_user_id}`);
      });
    }

    // ── Assemble final conversations ──────────────────────────────────────────
    return Array.from(map.entries()).map(([userId, conv]) => {
      const { lastMessage, lastAt, listingId, bookingId, unreadCount } = conv;

      const p    = pm[userId];
      const name = p ? `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() : "User";

      // Listing title — prefer booking snapshot (denormalized), fall back to listing row
      let listingTitle: string | null = null;
      let listingTitle_ar: string | null = null;
      if (bookingId && bookingMap[bookingId]) {
        listingTitle = bookingMap[bookingId].listing_title || null;
      } else if (listingId && listingMap[listingId]) {
        listingTitle    = listingMap[listingId].title    || null;
        listingTitle_ar = listingMap[listingId].title_ar || null;
      }

      // Booking dates
      const bookingCheckIn  = bookingId && bookingMap[bookingId] ? bookingMap[bookingId].check_in  : null;
      const bookingCheckOut = bookingId && bookingMap[bookingId] ? bookingMap[bookingId].check_out : null;

      // Derive the OTHER participant's role from myId's perspective
      let otherParticipantRole: Conversation["otherParticipantRole"] = null;
      if (bookingId && bookingMap[bookingId]) {
        const b = bookingMap[bookingId];
        if (b.user_id === myId)      otherParticipantRole = "Host";            // I'm the guest   → they're the host
        else if (b.host_id === myId) otherParticipantRole = "Guest (Booked)";  // I'm the host    → they're the booked guest
      } else if (listingId && listingMap[listingId]) {
        const l = listingMap[listingId];
        // Check co-host relationship before falling back to guest-inquiry logic
        if (coHostPairs.has(`${listingId}:${userId}`)) {
          // Other participant is a co-host of this listing → I am the host
          otherParticipantRole = "Co-host";
        } else if (coHostPairs.has(`${listingId}:${myId}`)) {
          // I am the co-host of this listing → other participant is the host
          otherParticipantRole = "Host";
        } else if (l.host_id === myId) {
          otherParticipantRole = "Guest (Inquiry)"; // I own the listing → guest inquiry
        } else {
          otherParticipantRole = "Host";             // They own the listing → I'm the guest
        }
      }

      return {
        userId,
        name:                 name || "User",
        lastMessage,
        lastAt,
        unreadCount,
        listingId:            listingId  ?? null,
        listingTitle,
        listingTitle_ar,
        bookingId:            bookingId  ?? null,
        bookingCheckIn,
        bookingCheckOut,
        otherParticipantRole,
      };
    });
  } catch {
    return [];
  }
}

/**
 * Returns the total number of unread messages sent to `myId`.
 * Used for the Navbar badge.
 */
export async function fetchTotalUnreadCount(myId: string): Promise<number> {
  try {
    const supabase = await createClient();
    const { count } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("receiver_id", myId)
      .eq("is_read", false)
      .eq("is_deleted", false);
    return count ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Fetches the title of a single listing by its UUID.
 * Used when opening messages from a listing detail page.
 */
export async function fetchListingTitle(listingId: string): Promise<string | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("listings")
      .select("title")
      .eq("id", listingId)
      .single();
    return data?.title ?? null;
  } catch {
    return null;
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
