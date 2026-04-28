"use client";

import { useState } from "react";
import type { AdminListing } from "@/lib/types/admin";
import AdminStatusBadge from "./shared/AdminStatusBadge";
import RejectModal, { type RejectPayload } from "./RejectModal";
import UserAvatar from "@/components/ui/UserAvatar";

interface ListingReviewPanelProps {
  listing: AdminListing;
  onApprove:  (id: string) => Promise<void>;
  onReject:   (id: string, reason: string, step: string | null) => Promise<void>;
  onClose?:   () => void;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[10px] font-bold text-[#64707d] uppercase tracking-widest mb-3">
      {children}
    </h3>
  );
}

function CapacityPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center gap-1 bg-[#faf7f4] border border-[#f0e8de] rounded-xl px-4 py-3 flex-1 text-center min-w-[72px]">
      <div className="text-[#8b5e38]">{icon}</div>
      <p className="font-bold text-[#1a0e02] text-sm">{value}</p>
      <p className="text-[10px] text-[#64707d] uppercase tracking-wide font-bold">{label}</p>
    </div>
  );
}

function GalleryStrip({ urls }: { urls: string[] }) {
  const [main, setMain] = useState(0);
  return (
    <div className="flex flex-col gap-2">
      {/* Main image */}
      <div className="w-full h-[240px] rounded-2xl overflow-hidden bg-[#f4efe6]">
        <img
          src={urls[main]}
          alt="Listing photo"
          className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
      </div>
      {/* Thumbnail strip */}
      {urls.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {urls.map((url, i) => (
            <button
              key={i}
              onClick={() => setMain(i)}
              className={[
                "shrink-0 w-16 h-12 rounded-xl overflow-hidden border-2 transition-all",
                i === main ? "border-[#8b5e38]" : "border-[#e8dfd4] hover:border-[#c49a4f]",
              ].join(" ")}
            >
              <img src={url} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
            </button>
          ))}
          <div className="shrink-0 w-16 h-12 rounded-xl bg-[#f0e8de] flex items-center justify-center text-[11px] font-bold text-[#64707d]">
            {urls.length} / 10
          </div>
        </div>
      )}
      {urls.length < 4 && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Only {urls.length} photo{urls.length === 1 ? "" : "s"} submitted — minimum 4 recommended
        </p>
      )}
    </div>
  );
}

export default function ListingReviewPanel({
  listing, onApprove, onReject, onClose,
}: ListingReviewPanelProps) {
  const [isApproving,  setIsApproving]  = useState(false);
  const [showReject,   setShowReject]   = useState(false);
  const [isRejecting,  setIsRejecting]  = useState(false);
  const [decision,     setDecision]     = useState<"approved" | "rejected" | null>(null);

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleString("en-GB", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  const handleApprove = async () => {
    setIsApproving(true);
    await onApprove(listing.id);
    setIsApproving(false);
    setDecision("approved");
  };

  const handleReject = async (payload: RejectPayload) => {
    setIsRejecting(true);
    await onReject(listing.id, payload.reason, payload.step);
    setIsRejecting(false);
    setShowReject(false);
    setDecision("rejected");
  };

  const isPending = listing.status === "pending_review" && !decision;

  return (
    <>
      <div className="flex flex-col h-full overflow-hidden bg-[#f4efe6]">

        {/* ── Action bar (sticky top) ───────────────────────────────────────── */}
        <div className="bg-white border-b border-[#e8dfd4] px-6 py-4 flex items-center gap-3 shrink-0">

          {/* Close on mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden p-2 rounded-xl hover:bg-[#f4f6f8] transition-colors text-[#64707d]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          {/* Ref + submitted */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-[#64707d] bg-[#f0e8de] px-2 py-0.5 rounded-lg">
                {listing.listingRef}
              </span>
              <AdminStatusBadge status={listing.status} size="sm" />
            </div>
            <p className="text-xs text-[#a09080] mt-0.5">
              Submitted {fmtDate(listing.submittedAt)}
            </p>
          </div>

          {/* Action buttons — only for pending */}
          {isPending ? (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowReject(true)}
                className="px-3 py-2 border border-red-200 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-50 transition-colors"
              >
                Reject
              </button>
              <button
                onClick={handleApprove}
                disabled={isApproving}
                className="px-4 py-2 bg-[#049153] text-white text-sm font-semibold rounded-xl hover:bg-[#037a44] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isApproving ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="15" />
                    </svg>
                    Approving…
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.8" />
                    </svg>
                    Approve
                  </>
                )}
              </button>
            </div>
          ) : decision === "approved" || listing.status === "approved" ? (
            <div className="flex items-center gap-2 text-[#049153] bg-[#f0faf5] border border-[#c3e8d6] px-3 py-1.5 rounded-xl text-sm font-semibold">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
              </svg>
              Approved
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl text-sm font-semibold">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
              Rejected
            </div>
          )}
        </div>

        {/* ── Decision outcome banner ───────────────────────────────────────── */}
        {decision === "approved" && (
          <div className="bg-[#f0faf5] border-b border-[#c3e8d6] px-6 py-3 flex items-center gap-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#049153] shrink-0">
              <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-[#049153]">Listing approved successfully</p>
              <p className="text-xs text-[#64707d]">
                The host has been notified. This listing will be visible in Explore once admin confirmation is saved to Firestore.
              </p>
            </div>
          </div>
        )}
        {decision === "rejected" && (
          <div className="bg-red-50 border-b border-red-200 px-6 py-3 flex items-center gap-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-red-500 shrink-0">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-red-700">Listing rejected</p>
              <p className="text-xs text-red-500">The host has been notified with your rejection reason.</p>
            </div>
          </div>
        )}

        {/* ── Scrollable detail body ────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-6 flex flex-col gap-7">

            {/* Gallery */}
            <GalleryStrip urls={listing.imageUrls} />

            {/* Title + meta */}
            <div>
              <div className="flex items-start gap-3 mb-2">
                <div className="flex-1">
                  <h2 className="font-display font-extrabold text-[#1a0e02] text-2xl leading-tight">
                    {listing.title}
                  </h2>
                  <p className="text-[#64707d] text-sm mt-1 flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-[#8b5e38]">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
                    </svg>
                    {listing.location} · {listing.region}
                  </p>
                </div>
                <span className="text-[11px] font-bold text-[#8b5e38] bg-[#fdf5ee] border border-[#e8c89a] px-2.5 py-1 rounded-full shrink-0">
                  {listing.category}
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2">
                {listing.originalPrice > 0 && (
                  <span className="text-[#a09080] text-sm line-through">SAR {listing.originalPrice}</span>
                )}
                <span className="font-display font-extrabold text-[#1a0e02] text-2xl">
                  SAR {listing.price}
                </span>
                <span className="text-[#64707d] text-sm">{listing.priceUnit}</span>
                {listing.originalPrice > 0 && (
                  <span className="text-[10px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-full">
                    {Math.round(((listing.originalPrice - listing.price) / listing.originalPrice) * 100)}% off
                  </span>
                )}
              </div>
            </div>

            {/* Capacity */}
            <div className="bg-white border border-[#e8dfd4] rounded-2xl p-5">
              <SectionHeading>Capacity & times</SectionHeading>
              <div className="flex flex-wrap gap-2 mb-4">
                <CapacityPill icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.7" /><path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>} label="Guests"   value={listing.maxGuests} />
                <CapacityPill icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg>}              label="Bedrooms" value={listing.bedrooms} />
                <CapacityPill icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M2 4v16M22 4v16M2 8h20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>}                                            label="Beds"     value={listing.beds} />
                <CapacityPill icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 6a3 3 0 106 0" stroke="currentColor" strokeWidth="1.7" /><path d="M3 20h18v-2a6 6 0 00-6-6H9a6 6 0 00-6 6v2z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg>} label="Baths"    value={listing.baths} />
                <CapacityPill icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.7" /><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>}               label="Min. nights" value={listing.minNights} />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-[#faf7f4] rounded-xl px-3 py-2">
                  <p className="text-[10px] text-[#a09080] uppercase tracking-wide font-bold">Check-in</p>
                  <p className="font-semibold text-[#1a0e02]">{listing.checkInTime}</p>
                </div>
                <div className="bg-[#faf7f4] rounded-xl px-3 py-2">
                  <p className="text-[10px] text-[#a09080] uppercase tracking-wide font-bold">Check-out</p>
                  <p className="font-semibold text-[#1a0e02]">{listing.checkOutTime}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white border border-[#e8dfd4] rounded-2xl p-5">
              <SectionHeading>Description</SectionHeading>
              <p className="text-sm text-[#64707d] leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
              {listing.description.length < 100 && (
                <p className="text-xs text-amber-600 flex items-center gap-1.5 mt-3 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Description seems short — consider requesting more detail.
                </p>
              )}

              {/* Highlights */}
              {listing.highlights.length > 0 && (
                <div className="mt-4">
                  <p className="text-[10px] font-bold text-[#64707d] uppercase tracking-widest mb-2">Highlights</p>
                  <ul className="flex flex-col gap-1.5">
                    {listing.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[#1a0e02]">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-[#c49a4f] mt-1 shrink-0">
                          <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Amenities */}
            {listing.amenities.length > 0 && (
              <div className="bg-white border border-[#e8dfd4] rounded-2xl p-5">
                <SectionHeading>Amenities ({listing.amenities.length})</SectionHeading>
                <div className="flex flex-wrap gap-2">
                  {listing.amenities.map((a) => (
                    <span
                      key={a}
                      className="text-xs font-medium text-[#64707d] bg-[#faf7f4] border border-[#e8dfd4] px-3 py-1.5 rounded-xl"
                    >
                      {a}
                    </span>
                  ))}
                </div>
                {listing.amenities.length < 3 && (
                  <p className="text-xs text-amber-600 mt-3 flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
                      <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Fewer than 3 amenities listed — listings perform better with more.
                  </p>
                )}
              </div>
            )}

            {/* House rules */}
            {listing.houseRules.length > 0 && (
              <div className="bg-white border border-[#e8dfd4] rounded-2xl p-5">
                <SectionHeading>House rules</SectionHeading>
                <ul className="flex flex-col gap-2">
                  {listing.houseRules.map((rule, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-[#64707d]">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-[#8b5e38] mt-1 shrink-0">
                        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Host card */}
            <div className="bg-white border border-[#e8dfd4] rounded-2xl p-5">
              <SectionHeading>Host profile</SectionHeading>
              <div className="flex items-start gap-4">
                <UserAvatar
                  src={listing.host.avatar}
                  name={listing.host.name}
                  size={56}
                  className="border-2 border-[#e8dfd4]"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-display font-semibold text-[#1a0e02]">{listing.host.name}</p>
                    {listing.host.superhost && (
                      <span className="text-[10px] font-bold text-[#8b5e38] bg-[#fdf5ee] border border-[#e8c89a] px-2 py-0.5 rounded-full flex items-center gap-1">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="#c49a4f">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        Superhost
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                    {[
                      { label: "Email",             value: listing.host.email    || "—" },
                      { label: "Phone",             value: listing.host.phone    || "—" },
                      { label: "Joined",            value: listing.host.joinedAt
                                                      ? new Date(listing.host.joinedAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" })
                                                      : "—" },
                      { label: "Response rate",     value: `${listing.host.responseRate}%` },
                      { label: "Total listings",    value: String(listing.host.totalListings) },
                      { label: "Approved listings", value: String(listing.host.approvedListings) },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-[10px] text-[#a09080] uppercase tracking-wide font-bold">{label}</p>
                        <p className="text-xs font-medium text-[#1a0e02] truncate">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Previous rejection reason (if re-submitted) */}
            {listing.rejectionReason && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                <SectionHeading>Previous rejection reason</SectionHeading>
                <p className="text-sm text-red-700 leading-relaxed">{listing.rejectionReason}</p>
                {listing.reviewedBy && (
                  <p className="text-[10px] text-red-400 mt-2">
                    Reviewed by {listing.reviewedBy} · {listing.reviewedAt ? fmtDate(listing.reviewedAt) : ""}
                  </p>
                )}
              </div>
            )}

            {/* Admin notes (if any) */}
            {listing.adminNotes && (
              <div className="bg-[#fdf8ee] border border-[#ead9a6] rounded-2xl p-5">
                <SectionHeading>Internal admin notes</SectionHeading>
                <p className="text-sm text-[#8b6a1f] leading-relaxed">{listing.adminNotes}</p>
              </div>
            )}

            {/* Reviewed by */}
            {listing.reviewedAt && listing.reviewedBy && listing.status !== "pending_review" && (
              <div className="bg-white border border-[#e8dfd4] rounded-2xl px-5 py-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#faf7f4] flex items-center justify-center text-[#8b5e38]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.7" />
                    <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#1a0e02]">{listing.reviewedBy}</p>
                  <p className="text-[10px] text-[#64707d]">{fmtDate(listing.reviewedAt)}</p>
                </div>
                <AdminStatusBadge status={listing.status} size="sm" />
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Reject modal */}
      {showReject && (
        <RejectModal
          listingTitle={listing.title}
          onConfirm={handleReject}
          onCancel={() => setShowReject(false)}
          isSubmitting={isRejecting}
        />
      )}
    </>
  );
}
