export type IssueType =
  | "booking_issue"
  | "payment_issue"
  | "host_issue"
  | "tourist_issue"
  | "safety_concern"
  | "listing_problem"
  | "other";

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

export const ISSUE_TYPE_LABELS: Record<IssueType, string> = {
  booking_issue:    "Booking Issue",
  payment_issue:    "Payment Issue",
  host_issue:       "Host Issue",
  tourist_issue:    "Tourist Issue",
  safety_concern:   "Safety Concern",
  listing_problem:  "Listing Problem",
  other:            "Other",
};

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  open:        "Open",
  in_progress: "In Progress",
  resolved:    "Resolved",
  closed:      "Closed",
};

export interface SupportTicket {
  id: string;
  issueType: IssueType;
  title: string;
  description: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  // Populated when fetched with context (e.g. admin view)
  userName?: string;
  userEmail?: string;
  replyCount?: number;
}

export interface SupportReply {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  message: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface TicketWithReplies {
  ticket: SupportTicket;
  replies: SupportReply[];
}
