/* ─────────────────────────────────────────────────────────────────────────────
   Bedouin – Messages / Chat types
   Prepared for Firebase/Firestore real-time integration:
     - conversations/{id}              → Conversation document
     - conversations/{id}/messages     → Message sub-collection
     - users/{uid}/conversationIds     → list of conversation IDs for fast loading
   Real-time: onSnapshot(query(messages, orderBy("sentAt"))) per active conversation
───────────────────────────────────────────────────────────────────────────── */

export type ParticipantRole = "guest" | "host";

export interface ChatParticipant {
  id: string;               // Firestore uid
  name: string;
  firstName: string;
  avatar: string;
  role: ParticipantRole;
}

export interface ChatMessage {
  id: string;               // Firestore document id
  conversationId: string;
  senderId: string;         // maps to ChatParticipant.id
  text: string;
  sentAt: string;           // ISO — Firestore: serverTimestamp()
  read: boolean;            // Firestore: updated when recipient opens conversation
}

/** Listing/booking context attached to a conversation */
export interface ConversationContext {
  listingId: string;
  listingTitle: string;
  listingImage: string;
  location: string;
  region: string;
  checkIn?: string;         // ISO date — present when tied to a booking
  checkOut?: string;
  bookingRef?: string;      // "BDN-XXXXXXXX"
  bookingStatus?: "upcoming" | "confirmed" | "completed" | "inquiry";
  pricePerNight?: number;
}

export interface Conversation {
  id: string;               // Firestore document id
  participants: [ChatParticipant, ChatParticipant]; // always 2
  context?: ConversationContext;

  /* Denormalised fields (updated by Cloud Function on each new message) */
  lastMessage: string;      // preview text
  lastMessageAt: string;    // ISO
  lastMessageSenderId: string;
  unreadCount: number;      // from the current user's perspective

  messages: ChatMessage[];  // loaded on open — Firestore: sub-collection
}
