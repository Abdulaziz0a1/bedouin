/* ─────────────────────────────────────────────────────────────────────────────
   Bedouin – Co-host types
   Firestore integration points:
     - cohosts/{id}                        → CoHost document (or users/{id} where role includes "cohost")
     - collaborations/{id}                 → CoHostInvitation document
     - listings/{listingId}/coHosts/{id}   → CoHostAssignment document
     - hosts/{hostId}/invitations          → invitations sub-collection (host view)
───────────────────────────────────────────────────────────────────────────── */

/** Status of a co-host from the current host's perspective */
export type CoHostStatus =
  | "available"   // open to new collaborations — Firestore: cohost.status === "available"
  | "invited"     // host sent invite, awaiting response — Firestore: invitation.status === "pending"
  | "accepted"    // co-host accepted but not yet assigned — Firestore: invitation.status === "accepted"
  | "assigned"    // actively co-hosting at least one listing
  | "declined";   // declined the last invite from this host

export type CoHostService =
  | "guest_checkin"       // Guest check-in & check-out management
  | "guest_communication" // Guest messaging & support
  | "cleaning"            // Cleaning coordination & scheduling
  | "maintenance"         // Property maintenance & repairs
  | "local_guide"         // Local area guide & cultural host
  | "calendar"            // Calendar & booking management
  | "listing_support"     // Listing creation & optimisation
  | "photography"         // Property photography & media
  | "emergency";          // Emergency on-call response

export type CoHostPropertyType =
  | "desert_camp"
  | "farm"
  | "cabin"
  | "glamping"
  | "cultural_site"
  | "mountain"
  | "coastal";

export type CoHostFeeModel = "percentage" | "fixed" | "negotiable";

export interface CoHostReview {
  hostName: string;
  hostAvatar: string;
  rating: number;        // 1–5
  comment: string;
  date: string;          // ISO
  listingTitle: string;
}

/** A verified co-host profile */
export interface CoHost {
  id: string;                              // cohost_application UUID (used as application ref)
  userId: string;                          // auth.users UUID (used to match invitations/assignments)
  name: string;
  firstName: string;
  avatar: string;
  bio: string;
  region: string;
  city: string;
  languages: string[];
  services: CoHostService[];
  supportedPropertyTypes: CoHostPropertyType[];
  yearsExperience: number;                 // years active as co-host
  listingsManaged: number;                 // total listings managed all-time
  rating: number;                          // 0.0–5.0
  reviewCount: number;
  responseRate: number;                    // 0–100 %
  responseTime: string;                    // "within 1 hour", etc.
  status: CoHostStatus;                    // relative to current host session
  feeModel: CoHostFeeModel;
  feeValue?: number;                       // % commission (e.g. 12) or monthly SAR
  joinedAt: string;                        // ISO — when they joined Bedouin
  reviews: CoHostReview[];                 // Firestore: cohosts/{id}/reviews
}

/** A co-host invitation sent by a host */
export interface CoHostInvitation {
  id: string;                              // Firestore: collaborations/{id}
  coHostId: string;
  coHostName: string;
  coHostAvatar: string;
  listingId: string;
  listingTitle: string;
  listingImage: string;
  message: string;
  sentAt: string;                          // ISO
  status: "pending" | "accepted" | "declined";
  // Firestore: updateDoc(doc(db,"collaborations",id), { status, respondedAt })
}

/** An active co-host assignment on a listing */
export interface CoHostAssignment {
  id: string;                              // Firestore: listings/{listingId}/coHosts/{coHostId}
  coHostId: string;
  coHostName: string;
  coHostAvatar: string;
  coHostRegion: string;
  listingId: string;
  listingTitle: string;
  listingImage: string;
  services: CoHostService[];
  assignedAt: string;                      // ISO
  status: "active" | "withdrawal_requested" | "ended";
}

/** Simplified listing reference for invite modal dropdowns */
export interface InviteModalListing {
  id: string;
  title: string;
  region: string;
  image: string;
  status: "approved" | "pending_review" | "draft";
}
