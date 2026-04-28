"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { DashboardListing } from "@/lib/data/dashboard";
import StatusBadge from "../shared/StatusBadge";
import DashboardEmptyState from "../shared/DashboardEmptyState";
import RequestListingCancellationModal from "@/components/host/shared/RequestListingCancellationModal";
import { duplicateListing, removeSubmission } from "@/lib/actions/listing";

type Filter = "all" | "approved" | "pending_review" | "rejected" | "draft" | "cancelled";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all",            label: "All"       },
  { id: "approved",       label: "Live"      },
  { id: "pending_review", label: "In Review" },
  { id: "rejected",       label: "Rejected"  },
  { id: "cancelled",      label: "Cancelled" },
  { id: "draft",          label: "Drafts"    },
];

const STEP_NUMBER: Record<string, number> = {
  category:       1,
  description:    2,
  location:       3,
  capacity_rules: 3,
  amenities:      4,
  pricing:        5,
  media:          6,
};

const STEP_LABEL: Record<string, string> = {
  category:       "Property Type",
  description:    "Title & Description",
  location:       "Location & Details",
  capacity_rules: "Capacity & Rules",
  amenities:      "Amenities",
  pricing:        "Pricing",
  media:          "Photos & Rules",
};

/* ─── Confirm-removal modal ─────────────────────────────────────────────────── */

type RemoveVariant = "rejected" | "pending" | "draft";

const REMOVE_COPY: Record<RemoveVariant, {
  title: string;
  body: string;
  confirm: string;
  cancel: string;
}> = {
  rejected: {
    title:   "Remove rejected submission?",
    body:    "This submission was not approved. Removing it will delete it from your listings. This action cannot be undone.",
    confirm: "Remove submission",
    cancel:  "Keep it",
  },
  pending: {
    title:   "Withdraw submission?",
    body:    "This listing has not been approved yet. Withdrawing it will remove it from the admin review queue.",
    confirm: "Withdraw",
    cancel:  "Keep submission",
  },
  draft: {
    title:   "Delete draft?",
    body:    "This draft has not been submitted yet. Deleting it will remove it permanently.",
    confirm: "Delete draft",
    cancel:  "Keep draft",
  },
};

function RemoveModal({
  variant,
  removing,
  error,
  onConfirm,
  onCancel,
}: {
  variant:   RemoveVariant;
  removing:  boolean;
  error:     string | null;
  onConfirm: () => void;
  onCancel:  () => void;
}) {
  const copy = REMOVE_COPY[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h3 className="font-display font-bold text-[#1a0e02] text-lg mb-2">{copy.title}</h3>
        <p className="text-sm text-[#64707d] leading-relaxed mb-5">{copy.body}</p>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 mb-4">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={removing}
            className="flex-1 py-2.5 border border-[#e8dfd4] rounded-xl text-sm font-semibold text-[#64707d] hover:border-[#8b5e38] hover:text-[#1a0e02] transition-colors disabled:opacity-50"
          >
            {copy.cancel}
          </button>
          <button
            onClick={onConfirm}
            disabled={removing}
            className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {removing ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="15" />
                </svg>
                Removing…
              </>
            ) : copy.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Rejection notice ──────────────────────────────────────────────────────── */

function RejectionNotice({ reason, submissionId, rejectedStep }: {
  reason: string;
  submissionId: string;
  rejectedStep?: string;
}) {
  const [open, setOpen] = useState(false);

  const stepNum   = rejectedStep ? STEP_NUMBER[rejectedStep] : undefined;
  const stepLabel = rejectedStep ? STEP_LABEL[rejectedStep]  : undefined;
  const editHref  = stepNum
    ? `/host/listings/${submissionId}/edit?step=${stepNum}`
    : `/host/listings/${submissionId}/edit`;

  return (
    <div className="mt-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="text-xs font-semibold text-red-700 flex items-center gap-1.5">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Why was this rejected?
        </span>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          className={`text-red-500 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="mt-2">
          <p className="text-xs text-red-600 leading-relaxed">{reason}</p>
          {stepLabel && (
            <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-red-500 uppercase tracking-widest">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Fix needed: Step {STEP_NUMBER[rejectedStep!]} — {stepLabel}
            </div>
          )}
        </div>
      )}

      <a
        href={editHref}
        className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 bg-red-600 text-white text-xs font-semibold rounded-xl hover:bg-red-700 transition-colors"
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {stepLabel ? `Fix ${stepLabel} & resubmit` : "Fix & resubmit"}
      </a>
    </div>
  );
}

/* ─── Cancellation request banner ───────────────────────────────────────────── */

function CancellationRequestBanner({
  status,
  adminNote,
}: {
  status: "pending" | "approved" | "rejected";
  adminNote?: string;
}) {
  if (status === "pending") {
    return (
      <div className="mt-3 bg-[#fdf8ee] border border-[#ead9a6] rounded-xl px-4 py-3 flex items-start gap-2">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="text-[#8b6a1f] shrink-0 mt-0.5">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <p className="text-xs text-[#8b6a1f] leading-relaxed">
          <span className="font-semibold">Cancellation requested</span> — our team is reviewing your request.
          The listing remains active until a decision is made.
        </p>
      </div>
    );
  }
  if (status === "rejected") {
    return (
      <div className="mt-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
        <p className="text-xs font-semibold text-red-700 mb-1">Cancellation request rejected</p>
        {adminNote ? (
          <p className="text-xs text-red-600 leading-relaxed">{adminNote}</p>
        ) : (
          <p className="text-xs text-red-500 italic">No reason provided by admin.</p>
        )}
        <p className="text-[10px] text-red-400 mt-1.5">
          Your listing is still active. Contact support if you have questions.
        </p>
      </div>
    );
  }
  return null;
}

/* ─── Listing card ──────────────────────────────────────────────────────────── */

function ListingCard({
  listing,
  onCancellationRequested,
  onRemoved,
}: {
  listing:                 DashboardListing;
  onCancellationRequested: (id: string) => void;
  onRemoved:               (id: string) => void;
}) {
  const router = useRouter();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [removeModal,     setRemoveModal]     = useState(false);
  const [removing,        setRemoving]        = useState(false);
  const [removeError,     setRemoveError]     = useState<string | null>(null);
  const [templating,      setTemplating]      = useState(false);
  const [templateError,   setTemplateError]   = useState<string | null>(null);

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  const isLive      = listing.status === "approved";
  const isRejected  = listing.status === "rejected";
  const isPending   = listing.status === "pending_review";
  const isCancelled = listing.status === "cancelled";
  const isDraft     = listing.status === "draft";

  const hasPendingCancelReq  = listing.cancellationRequestStatus === "pending";
  const hasRejectedCancelReq = listing.cancellationRequestStatus === "rejected";

  const removeVariant: RemoveVariant =
    isRejected ? "rejected" : isPending ? "pending" : "draft";

  const handleUseAsTemplate = async () => {
    setTemplating(true);
    setTemplateError(null);
    const result = await duplicateListing(listing.id);
    setTemplating(false);
    if (!result.success) {
      setTemplateError(result.error);
      return;
    }
    router.push(`/host/listings/${result.newId}/edit?fromTemplate=true`);
  };

  const handleRemoveConfirm = async () => {
    setRemoving(true);
    setRemoveError(null);
    const result = await removeSubmission(listing.id);
    setRemoving(false);
    if (!result.success) {
      setRemoveError(result.error);
      return;
    }
    setRemoveModal(false);
    onRemoved(listing.id);
  };

  /* ── Draft / template card ────────────────────────────────────────────────── */
  if (isDraft) {
    return (
      <>
        <div className="bg-white border-2 border-dashed border-[#dddfe3] rounded-2xl overflow-hidden">
          <div className="relative bg-[#f4f6f8] h-44 flex items-center justify-center">
            {listing.imageUrl ? (
              <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover" />
            ) : (
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="text-[#c4ccd8]">
                <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.4" />
                <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M21 15l-5-5-4 4-2-2-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold bg-[#f4f6f8] text-[#64707d] border-[#dddfe3]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#a0aab8]" />
                Draft from template
              </span>
            </div>
          </div>

          <div className="p-5">
            <h3 className="font-display font-semibold text-[#1a0e02] text-sm leading-snug mb-1">
              {listing.title || "Untitled listing"}
            </h3>
            <p className="text-xs text-[#64707d] mb-4">
              {listing.category} · {listing.region}
              {listing.location ? ` · ${listing.location}` : " · Location not set"}
            </p>

            <div className="bg-[#fdf8ee] border border-[#ead9a6] rounded-xl px-4 py-3 mb-4">
              <p className="text-xs text-[#8b6a1f] leading-relaxed">
                Pre-filled from your original listing. Review and update the title, location, photos, and other key details before submitting.
              </p>
            </div>

            <div className="flex gap-2">
              <a
                href={`/host/listings/${listing.id}/edit?fromTemplate=true`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#461e00] text-white text-xs font-semibold rounded-xl hover:bg-[#5a2800] transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Continue editing
              </a>
              <button
                onClick={() => { setRemoveError(null); setRemoveModal(true); }}
                className="px-3 py-2.5 border border-red-200 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
                title="Delete this draft"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        {removeModal && (
          <RemoveModal
            variant="draft"
            removing={removing}
            error={removeError}
            onConfirm={handleRemoveConfirm}
            onCancel={() => setRemoveModal(false)}
          />
        )}
      </>
    );
  }

  /* ── Normal listing card ──────────────────────────────────────────────────── */
  return (
    <>
      <div className="bg-white border border-[#e8dfd4] rounded-2xl overflow-hidden">
        {/* Image */}
        <div className="relative">
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="w-full h-44 object-cover"
          />
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <StatusBadge status={listing.status} />
            {hasPendingCancelReq && (
              <span className="text-[10px] font-bold bg-[#fdf8ee] text-[#8b6a1f] border border-[#ead9a6] px-2 py-0.5 rounded-full">
                Cancellation pending
              </span>
            )}
          </div>
          {listing.originalPrice && listing.originalPrice > listing.price && (
            <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {Math.round(((listing.originalPrice - listing.price) / listing.originalPrice) * 100)}% off
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-5">
          <h3 className="font-display font-semibold text-[#1a0e02] text-sm leading-snug mb-1">{listing.title}</h3>
          <p className="text-xs text-[#64707d] mb-3">
            {listing.category} · {listing.region} · {listing.location}
          </p>

          {/* Price */}
          <div className="flex items-center gap-2 mb-4">
            {listing.originalPrice && listing.originalPrice > listing.price && (
              <span className="text-[#a09080] text-xs line-through">SAR {listing.originalPrice}</span>
            )}
            <span className="font-display font-extrabold text-[#1a0e02] text-lg">SAR {listing.price}</span>
            <span className="text-xs text-[#64707d]">{listing.priceUnit}</span>
          </div>

          {/* Live stats */}
          {isLive && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-[#faf7f4] rounded-xl px-3 py-2 text-center">
                <p className="font-bold text-[#1a0e02] text-sm">{listing.totalBookings}</p>
                <p className="text-[9px] text-[#64707d] uppercase tracking-wide font-bold mt-0.5">Bookings</p>
              </div>
              <div className="bg-[#faf7f4] rounded-xl px-3 py-2 text-center">
                <p className="font-bold text-[#1a0e02] text-sm">SAR {(listing.totalEarned / 1000).toFixed(1)}k</p>
                <p className="text-[9px] text-[#64707d] uppercase tracking-wide font-bold mt-0.5">Earned</p>
              </div>
              <div className="bg-[#faf7f4] rounded-xl px-3 py-2 text-center">
                <div className="flex items-center justify-center gap-0.5">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="#c49a4f">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <p className="font-bold text-[#1a0e02] text-sm">{listing.avgRating.toFixed(1)}</p>
                </div>
                <p className="text-[9px] text-[#64707d] uppercase tracking-wide font-bold mt-0.5">{listing.reviewCount} reviews</p>
              </div>
            </div>
          )}

          {/* Pending info */}
          {isPending && (
            <div className="bg-[#fdf8ee] border border-[#ead9a6] rounded-xl px-4 py-3 mb-4">
              <p className="text-xs text-[#8b6a1f] font-medium">
                Submitted {fmtDate(listing.submittedAt)} · Usually approved within 48h
              </p>
            </div>
          )}

          {/* Cancelled info */}
          {isCancelled && (
            <div className="bg-[#f4f6f8] border border-[#dddfe3] rounded-xl px-4 py-3 mb-4">
              <p className="text-xs text-[#64707d] font-medium">
                This listing has been deactivated following your cancellation request.
              </p>
            </div>
          )}

          {/* Rejection notice */}
          {isRejected && listing.rejectionReason && (
            <RejectionNotice
              reason={listing.rejectionReason}
              submissionId={listing.id}
              rejectedStep={listing.rejectedStep}
            />
          )}

          {/* Cancellation request banners */}
          {(hasPendingCancelReq || hasRejectedCancelReq) && listing.cancellationRequestStatus && (
            <CancellationRequestBanner
              status={listing.cancellationRequestStatus}
              adminNote={listing.cancellationRequestAdminNote}
            />
          )}

          {/* Remove error */}
          {removeError && (
            <p className="mt-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {removeError}
            </p>
          )}

          {/* Template error */}
          {templateError && (
            <p className="mt-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {templateError}
            </p>
          )}

          {/* Action buttons */}
          <div className={`flex gap-2 flex-wrap ${isRejected || isPending || isLive || isCancelled ? "mt-4" : "mt-0"}`}>
            {/* Live: view listing */}
            {isLive && listing.listingSlug && (
              <a
                href={`/listing/${listing.listingSlug}`}
                className="flex-1 py-2 border border-[#e8dfd4] rounded-xl text-xs font-semibold text-[#1a0e02] text-center hover:border-[#8b5e38] hover:text-[#8b5e38] transition-colors"
              >
                View listing
              </a>
            )}

            {/* Pending: awaiting state + withdraw */}
            {isPending && (
              <span className="flex-1 py-2 border border-[#e8dfd4] rounded-xl text-xs font-semibold text-[#a09080] text-center cursor-default">
                Awaiting review…
              </span>
            )}

            {/* Rejected: edit button (alongside fix-notice above) */}
            {isRejected && (
              <a
                href={`/host/listings/${listing.id}/edit`}
                className="flex-1 py-2 border border-[#e8dfd4] rounded-xl text-xs font-semibold text-[#64707d] text-center hover:border-[#8b5e38] hover:text-[#8b5e38] transition-colors"
              >
                Edit
              </a>
            )}

            {/* Live: request cancellation */}
            {isLive && !hasPendingCancelReq && listing.cancellationRequestStatus !== "pending" && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="px-3 py-2 border border-red-200 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
              >
                Request cancellation
              </button>
            )}

            {/* Live / Pending: use as template */}
            {(isLive || isPending) && (
              <button
                onClick={handleUseAsTemplate}
                disabled={templating}
                title="Start a new listing using this one as a template"
                className="px-3 py-2 border border-[#e8dfd4] rounded-xl text-xs font-semibold text-[#64707d] hover:border-[#8b5e38] hover:text-[#8b5e38] transition-colors disabled:opacity-40 flex items-center gap-1"
              >
                {templating ? (
                  <>
                    <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="15" />
                    </svg>
                    Preparing…
                  </>
                ) : (
                  <>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                      <path d="M8 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M14 2v6h6M12 11v6M9 14h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Use as template
                  </>
                )}
              </button>
            )}

            {/* Rejected: remove submission */}
            {isRejected && (
              <button
                onClick={() => { setRemoveError(null); setRemoveModal(true); }}
                className="px-3 py-2 border border-red-200 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
                title="Remove this rejected submission from your listings"
              >
                Remove
              </button>
            )}

            {/* Pending: withdraw submission */}
            {isPending && (
              <button
                onClick={() => { setRemoveError(null); setRemoveModal(true); }}
                className="px-3 py-2 border border-red-200 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
                title="Withdraw this submission from the review queue"
              >
                Withdraw
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCancelModal && (
        <RequestListingCancellationModal
          submissionId={listing.id}
          listingTitle={listing.title}
          onClose={() => setShowCancelModal(false)}
          onSuccess={() => onCancellationRequested(listing.id)}
        />
      )}

      {removeModal && (
        <RemoveModal
          variant={removeVariant}
          removing={removing}
          error={removeError}
          onConfirm={handleRemoveConfirm}
          onCancel={() => setRemoveModal(false)}
        />
      )}
    </>
  );
}

/* ─── Section ───────────────────────────────────────────────────────────────── */

export default function ListingsSection({ listings: initialListings }: { listings: DashboardListing[] }) {
  const [filter,   setFilter]   = useState<Filter>("all");
  const [listings, setListings] = useState<DashboardListing[]>(initialListings);

  const handleCancellationRequested = (submissionId: string) => {
    setListings((prev) =>
      prev.map((l) =>
        l.id === submissionId ? { ...l, cancellationRequestStatus: "pending" as const } : l
      )
    );
  };

  const handleRemoved = (submissionId: string) => {
    setListings((prev) => prev.filter((l) => l.id !== submissionId));
  };

  // "All" excludes draft listings — they live only in the "Drafts" tab
  const filtered =
    filter === "all"
      ? listings.filter((l) => l.status !== "draft")
      : listings.filter((l) => l.status === filter);

  const counts: Record<Filter, number> = {
    all:            listings.filter((l) => l.status !== "draft").length,
    approved:       listings.filter((l) => l.status === "approved").length,
    pending_review: listings.filter((l) => l.status === "pending_review").length,
    rejected:       listings.filter((l) => l.status === "rejected").length,
    cancelled:      listings.filter((l) => l.status === "cancelled").length,
    draft:          listings.filter((l) => l.status === "draft").length,
  };

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-display font-semibold text-[#1a0e02] text-lg">My Listings</h2>
          <p className="text-xs text-[#64707d] mt-0.5">{counts.all} properties managed</p>
        </div>
        <a
          href="/host/new"
          className="flex items-center gap-1.5 px-4 py-2 bg-[#461e00] text-white text-xs font-semibold rounded-xl hover:bg-[#5a2800] transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
          Add listing
        </a>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {FILTERS.filter((f) => f.id === "all" || counts[f.id] > 0).map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={[
              "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all",
              filter === f.id
                ? "bg-[#1a0e02] text-white"
                : "bg-white border border-[#e8dfd4] text-[#64707d] hover:border-[#8b5e38]",
            ].join(" ")}
          >
            {f.label}
            {counts[f.id] > 0 && (
              <span className={`ml-1.5 ${filter === f.id ? "opacity-70" : "text-[#a09080]"}`}>
                {counts[f.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <DashboardEmptyState
          icon={
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
          title="No listings here"
          description="You don't have any listings in this category yet."
          action={{ label: "Add your first listing", href: "/host/new" }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onCancellationRequested={handleCancellationRequested}
              onRemoved={handleRemoved}
            />
          ))}
        </div>
      )}
    </div>
  );
}
