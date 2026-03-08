/* ─────────────────────────────────────────────────────────────────────────────
   Bedouin – Messages mock data
   Production integration:
     - CONVERSATIONS → getDocs(query(collection(db,"conversations"),
         where("participantIds","array-contains", uid),
         orderBy("lastMessageAt","desc")))
     - Messages      → onSnapshot(collection(db,"conversations",id,"messages"),
         orderBy("sentAt","asc"))
     - Send          → addDoc(collection(db,"conversations",id,"messages"), msg)
                       + updateDoc conversation lastMessage fields
     - Mark read     → updateDoc(doc(db,"conversations",id), { unreadCount:0 })
───────────────────────────────────────────────────────────────────────────── */

import type { Conversation, ChatParticipant } from "@/lib/types/messages";

// ──────────────────────────────────────────────────────────────────────────────
// Current signed-in user (guest / tourist perspective)
// ──────────────────────────────────────────────────────────────────────────────
export const CURRENT_USER: ChatParticipant = {
  id: "user-001",
  name: "Layla Al-Harbi",
  firstName: "Layla",
  avatar: "https://i.pravatar.cc/80?img=47",
  role: "guest",
};

// ──────────────────────────────────────────────────────────────────────────────
// Conversations
// ──────────────────────────────────────────────────────────────────────────────
export const CONVERSATIONS: Conversation[] = [

  // ── 1. Upcoming booking — AlUla Dome ───────────────────────────────────────
  {
    id: "conv-001",
    participants: [
      CURRENT_USER,
      {
        id: "host-001",
        name: "Mohammed Al-Rashidi",
        firstName: "Mohammed",
        avatar: "https://i.pravatar.cc/80?img=52",
        role: "host",
      },
    ],
    context: {
      listingId:     "alula-stargazing-dome",
      listingTitle:  "AlUla Stargazing Dome",
      listingImage:  "https://picsum.photos/seed/alula-dome/400/280",
      location:      "Wadi Rum, AlUla",
      region:        "AlUla",
      checkIn:       "2026-03-22",
      checkOut:      "2026-03-25",
      bookingRef:    "BDN-48291734",
      bookingStatus: "upcoming",
      pricePerNight: 620,
    },
    lastMessage: "The team will meet you at the main gate at 5 PM. Looking forward to hosting you! 🌟",
    lastMessageAt: "2026-03-10T18:42:00Z",
    lastMessageSenderId: "host-001",
    unreadCount: 1,
    messages: [
      {
        id: "m-001-1",
        conversationId: "conv-001",
        senderId: "user-001",
        text: "Hello Mohammed! I'm really excited about our stay at the dome next week. Just wanted to confirm the check-in process — do we drive directly to the dome or meet somewhere first?",
        sentAt: "2026-03-09T14:10:00Z",
        read: true,
      },
      {
        id: "m-001-2",
        conversationId: "conv-001",
        senderId: "host-001",
        text: "Ahlan Layla! Wonderful to hear from you. You'll drive to the main Wadi Rum entry point and our team will escort you from there. The track to the dome requires 4WD, so we'll handle that part.",
        sentAt: "2026-03-09T15:30:00Z",
        read: true,
      },
      {
        id: "m-001-3",
        conversationId: "conv-001",
        senderId: "user-001",
        text: "Perfect, thank you! We'll have a regular car. What time should we arrive at the entry point? Our booking says 5 PM check-in.",
        sentAt: "2026-03-10T09:15:00Z",
        read: true,
      },
      {
        id: "m-001-4",
        conversationId: "conv-001",
        senderId: "host-001",
        text: "Yes, 5 PM is perfect! Please arrive at the entry gate by 4:45 PM so we have time to load your luggage and make the 20-minute drive in daylight. Sunset from the dome at this time of year is extraordinary.",
        sentAt: "2026-03-10T11:00:00Z",
        read: true,
      },
      {
        id: "m-001-5",
        conversationId: "conv-001",
        senderId: "user-001",
        text: "Amazing! One more question — can we bring food or is the Bedouin breakfast the only meal provided?",
        sentAt: "2026-03-10T16:20:00Z",
        read: true,
      },
      {
        id: "m-001-6",
        conversationId: "conv-001",
        senderId: "host-001",
        text: "The team will meet you at the main gate at 5 PM. Looking forward to hosting you! 🌟",
        sentAt: "2026-03-10T18:42:00Z",
        read: false,
      },
    ],
  },

  // ── 2. Pre-booking inquiry — Asir Cabin ────────────────────────────────────
  {
    id: "conv-002",
    participants: [
      CURRENT_USER,
      {
        id: "host-002",
        name: "Saad Al-Qahtani",
        firstName: "Saad",
        avatar: "https://i.pravatar.cc/80?img=33",
        role: "host",
      },
    ],
    context: {
      listingId:     "asir-highland-cabin",
      listingTitle:  "Asir Highland Cabin",
      listingImage:  "https://picsum.photos/seed/asir-cabin/400/280",
      location:      "Al Soudah, Abha",
      region:        "Abha",
      bookingStatus: "inquiry",
      pricePerNight: 450,
    },
    lastMessage: "We have availability on those dates. Would you like me to hold it for 24 hours?",
    lastMessageAt: "2026-03-08T20:05:00Z",
    lastMessageSenderId: "host-002",
    unreadCount: 2,
    messages: [
      {
        id: "m-002-1",
        conversationId: "conv-002",
        senderId: "user-001",
        text: "Marhaba! I'm interested in booking the cabin for April 10–13. Is it available? We are 2 adults and 1 child (5 years old).",
        sentAt: "2026-03-08T17:30:00Z",
        read: true,
      },
      {
        id: "m-002-2",
        conversationId: "conv-002",
        senderId: "host-002",
        text: "Ahlan! Yes, those dates are available. The cabin is perfectly suited for families and children love the outdoor space. There's a safe play area and the fog in the mornings is magical for kids!",
        sentAt: "2026-03-08T18:45:00Z",
        read: true,
      },
      {
        id: "m-002-3",
        conversationId: "conv-002",
        senderId: "user-001",
        text: "That sounds wonderful. Does the price include the breakfast mentioned in the listing description?",
        sentAt: "2026-03-08T19:20:00Z",
        read: true,
      },
      {
        id: "m-002-4",
        conversationId: "conv-002",
        senderId: "host-002",
        text: "We have availability on those dates. Would you like me to hold it for 24 hours?",
        sentAt: "2026-03-08T20:05:00Z",
        read: false,
      },
    ],
  },

  // ── 3. Post-stay follow-up — Taif Glamping ─────────────────────────────────
  {
    id: "conv-003",
    participants: [
      CURRENT_USER,
      {
        id: "host-003",
        name: "Hessa Al-Dossari",
        firstName: "Hessa",
        avatar: "https://i.pravatar.cc/80?img=44",
        role: "host",
      },
    ],
    context: {
      listingId:     "taif-rose-glamping",
      listingTitle:  "Taif Rose Garden Glamping",
      listingImage:  "https://picsum.photos/seed/taif-glamp/400/280",
      location:      "Rose Valley, Taif",
      region:        "Taif",
      checkIn:       "2026-02-10",
      checkOut:      "2026-02-12",
      bookingRef:    "BDN-29034851",
      bookingStatus: "completed",
      pricePerNight: 350,
    },
    lastMessage: "Shukran Layla! Your kind words mean so much. Hope to welcome you back during the rose season 🌹",
    lastMessageAt: "2026-02-14T10:00:00Z",
    lastMessageSenderId: "host-003",
    unreadCount: 0,
    messages: [
      {
        id: "m-003-1",
        conversationId: "conv-003",
        senderId: "host-003",
        text: "Ahlan Layla! I hope you had a wonderful stay at the Rose Garden. Your comfort is our priority — please do let me know if there was anything we could have done better.",
        sentAt: "2026-02-12T13:00:00Z",
        read: true,
      },
      {
        id: "m-003-2",
        conversationId: "conv-003",
        senderId: "user-001",
        text: "Hessa, the stay was absolutely beautiful! Waking up surrounded by roses was a dream. The breakfast was delicious and the team was so welcoming. We'll definitely be back!",
        sentAt: "2026-02-13T09:30:00Z",
        read: true,
      },
      {
        id: "m-003-3",
        conversationId: "conv-003",
        senderId: "host-003",
        text: "Shukran Layla! Your kind words mean so much. Hope to welcome you back during the rose season 🌹",
        sentAt: "2026-02-14T10:00:00Z",
        read: true,
      },
    ],
  },

  // ── 4. Group inquiry — Hail Desert Camp ────────────────────────────────────
  {
    id: "conv-004",
    participants: [
      CURRENT_USER,
      {
        id: "host-004",
        name: "Turki Al-Shammari",
        firstName: "Turki",
        avatar: "https://i.pravatar.cc/80?img=67",
        role: "host",
      },
    ],
    context: {
      listingId:     "hail-desert-camp",
      listingTitle:  "Hail Desert Bedouin Camp",
      listingImage:  "https://picsum.photos/seed/hail-camp/400/280",
      location:      "Nafud Desert, Hail",
      region:        "Hail",
      bookingStatus: "inquiry",
      pricePerNight: 280,
    },
    lastMessage: "We can host up to 12 guests in private tents. Would you prefer a private camp or a shared experience?",
    lastMessageAt: "2026-03-01T14:00:00Z",
    lastMessageSenderId: "host-004",
    unreadCount: 0,
    messages: [
      {
        id: "m-004-1",
        conversationId: "conv-004",
        senderId: "user-001",
        text: "Hello Turki! We are a family group of 9 people planning a desert experience this spring. Can your camp accommodate us? We'd love a private experience if possible.",
        sentAt: "2026-03-01T11:30:00Z",
        read: true,
      },
      {
        id: "m-004-2",
        conversationId: "conv-004",
        senderId: "host-004",
        text: "We can host up to 12 guests in private tents. Would you prefer a private camp or a shared experience?",
        sentAt: "2026-03-01T14:00:00Z",
        read: true,
      },
    ],
  },

  // ── 5. Quiet inquiry — Madinah Palm Farm ───────────────────────────────────
  {
    id: "conv-005",
    participants: [
      CURRENT_USER,
      {
        id: "host-005",
        name: "Waleed Al-Anazi",
        firstName: "Waleed",
        avatar: "https://i.pravatar.cc/80?img=15",
        role: "host",
      },
    ],
    context: {
      listingId:     "madinah-palm-farm",
      listingTitle:  "Madinah Palm Farm Retreat",
      listingImage:  "https://picsum.photos/seed/madinah-farm/400/280",
      location:      "Al Aqoul, Madinah",
      region:        "Madinah",
      bookingStatus: "inquiry",
      pricePerNight: 300,
    },
    lastMessage: "I was wondering if the property is close to the city. How far is it from Al-Masjid An-Nabawi?",
    lastMessageAt: "2025-11-20T08:10:00Z",
    lastMessageSenderId: "user-001",
    unreadCount: 0,
    messages: [
      {
        id: "m-005-1",
        conversationId: "conv-005",
        senderId: "user-001",
        text: "I was wondering if the property is close to the city. How far is it from Al-Masjid An-Nabawi?",
        sentAt: "2025-11-20T08:10:00Z",
        read: true,
      },
    ],
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

export function getOtherParticipant(conv: Conversation, myId: string) {
  return conv.participants.find((p) => p.id !== myId)!;
}

export function getTotalUnread(conversations: Conversation[]): number {
  return conversations.reduce((s, c) => s + c.unreadCount, 0);
}
