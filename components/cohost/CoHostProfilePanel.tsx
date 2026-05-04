"use client";

import type { CoHost } from "@/lib/types/cohost";
import type { CoHostRelation } from "./CoHostBrowsePage";
import { SERVICE_LABELS, SERVICE_ICONS, PROPERTY_TYPE_LABELS } from "@/lib/data/cohost";
import CoHostStatusBadge from "./shared/CoHostStatusBadge";
import UserAvatar from "@/components/ui/UserAvatar";

// ──────────────────────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────────────────────

function StarRating({ rating, large }: { rating: number; large?: boolean }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.4;
  const size = large ? 14 : 11;
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24"
          fill={i < full || (hasHalf && i === full) ? "#c49a4f" : "none"}
          stroke={i < full || (hasHalf && i === full) ? "#c49a4f" : "#d1c5b8"}
          strokeWidth="1.5"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold text-[#64707d] uppercase tracking-widest mb-3">
      {children}
    </p>
  );
}

function ReviewCard({ review }: { review: CoHost["reviews"][0] }) {
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { month: "short", year: "numeric" });

  return (
    <div className="bg-[#faf7f4] border border-[#f0e8de] rounded-xl p-3.5">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <UserAvatar src={review.hostAvatar} name={review.hostName} size={28} className="border border-[#e8dfd4]" />
          <div>
            <p className="text-xs font-semibold text-[#1a0e02]">{review.hostName}</p>
            <p className="text-[10px] text-[#a09080]">{review.listingTitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <StarRating rating={review.rating} />
          <span className="text-[10px] text-[#64707d] ml-0.5">{fmtDate(review.date)}</span>
        </div>
      </div>
      <p className="text-xs text-[#64707d] leading-relaxed">&ldquo;{review.comment}&rdquo;</p>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main panel
// ──────────────────────────────────────────────────────────────────────────────

interface Props {
  cohost: CoHost;
  relation?: CoHostRelation;
  isOwnProfile?: boolean;
  onInvite: () => void;
  onCancelInvite?: () => void;
  onRemoveAssignment?: () => void;
  onClose?: () => void;
}

export default function CoHostProfilePanel({
  cohost,
  relation,
  isOwnProfile = false,
  onInvite,
  onCancelInvite,
  onRemoveAssignment,
  onClose,
}: Props) {
  const effectiveStatus = relation?.status ?? cohost.status;
  const canInvite = !isOwnProfile && (effectiveStatus === "available" || effectiveStatus === "declined");

  const feeLabel = (() => {
    if (cohost.feeModel === "percentage" && cohost.feeValue)
      return `${cohost.feeValue}% of booking revenue`;
    if (cohost.feeModel === "fixed" && cohost.feeValue)
      return `SAR ${cohost.feeValue.toLocaleString("en-US")} / month`;
    return "Negotiable — discuss directly";
  })();

  const joinedYear = new Date(cohost.joinedAt).getFullYear();

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Sticky header ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#e8dfd4] px-5 py-4 shrink-0">
        <div className="flex items-start gap-4">

          {/* Mobile back */}
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden p-2 -ml-1 rounded-xl hover:bg-[#f4f6f8] transition-colors text-[#64707d] shrink-0 mt-0.5"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          <UserAvatar
            src={cohost.avatar}
            name={cohost.name}
            size={56}
            className="rounded-2xl border-2 border-[#e8dfd4] shrink-0"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <h2 className="font-display font-bold text-[#1a0e02] text-base">{cohost.name}</h2>
              <CoHostStatusBadge status={effectiveStatus} size="sm" />
            </div>
            <p className="text-xs text-[#8b5e38] font-medium mb-1">
              📍 {cohost.city}, {cohost.region}
            </p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <StarRating rating={cohost.rating} large />
                <span className="text-xs font-semibold text-[#1a0e02] ml-1">{cohost.rating}</span>
                <span className="text-xs text-[#a09080]">({cohost.reviewCount} reviews)</span>
              </div>
            </div>
          </div>

          {/* Status CTA — top-right of header */}
          <div className="shrink-0 flex flex-col items-end gap-1.5">
            {isOwnProfile ? (
              <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#fdf5ee] text-[#8b5e38] border border-[#e8c89a]">
                Your profile
              </span>
            ) : (
              <>
                {effectiveStatus === "available" && (
                  <button
                    onClick={onInvite}
                    className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#8b5e38] text-white hover:bg-[#7a5030] transition-colors"
                  >
                    Invite
                  </button>
                )}
                {effectiveStatus === "declined" && (
                  <>
                    <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
                      Declined
                    </span>
                    <button
                      onClick={onInvite}
                      className="text-[11px] text-[#8b5e38] underline hover:text-[#7a5030] transition-colors"
                    >
                      Re-invite
                    </button>
                  </>
                )}
                {effectiveStatus === "invited" && (
                  <>
                    <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      Invitation pending
                    </span>
                    {onCancelInvite && (
                      <button
                        onClick={onCancelInvite}
                        className="text-[11px] text-[#64707d] underline hover:text-red-600 transition-colors"
                      >
                        Cancel invite
                      </button>
                    )}
                  </>
                )}
                {(effectiveStatus === "accepted" || effectiveStatus === "assigned") && (
                  <>
                    <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                      {effectiveStatus === "assigned" ? "Co-hosting" : "Accepted"}
                    </span>
                    {effectiveStatus === "assigned" && onRemoveAssignment && (
                      <button
                        onClick={onRemoveAssignment}
                        className="text-[11px] text-[#64707d] underline hover:text-red-600 transition-colors"
                      >
                        Remove co-host
                      </button>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Scrollable body ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto bg-[#f4efe6]">

        {/* Stats strip */}
        <div className="bg-white border-b border-[#e8dfd4] px-5 py-3 flex items-center gap-6 flex-wrap">
          {[
            { label: "Years active",     value: cohost.yearsExperience },
            { label: "Listings managed", value: cohost.listingsManaged },
            { label: "Response rate",    value: `${cohost.responseRate}%` },
            { label: "Response time",    value: cohost.responseTime },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col">
              <span className="font-display font-extrabold text-[#1a0e02] text-base">{value}</span>
              <span className="text-[10px] text-[#a09080] font-medium">{label}</span>
            </div>
          ))}
        </div>

        <div className="px-5 py-5 flex flex-col gap-6">

          {/* Bio */}
          <div>
            <SectionLabel>About</SectionLabel>
            <p className="text-sm text-[#64707d] leading-relaxed">{cohost.bio}</p>
          </div>

          {/* Services */}
          <div>
            <SectionLabel>Services offered</SectionLabel>
            <div className="flex flex-col gap-2">
              {cohost.services.map((s) => (
                <div
                  key={s}
                  className="flex items-center gap-2.5 bg-white border border-[#e8dfd4] px-3.5 py-2.5 rounded-xl"
                >
                  <span className="text-base">{SERVICE_ICONS[s]}</span>
                  <span className="text-sm font-medium text-[#1a0e02]">{SERVICE_LABELS[s]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Property types */}
          <div>
            <SectionLabel>Property types supported</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {cohost.supportedPropertyTypes.map((t) => (
                <span
                  key={t}
                  className="text-xs font-semibold text-[#8b5e38] bg-[#fdf5ee] border border-[#e8c89a] px-3 py-1.5 rounded-full"
                >
                  {PROPERTY_TYPE_LABELS[t] ?? t}
                </span>
              ))}
            </div>
          </div>

          {/* Languages + fee */}
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[140px] bg-white border border-[#e8dfd4] rounded-xl p-4">
              <p className="text-[10px] font-bold text-[#64707d] uppercase tracking-widest mb-2">Languages</p>
              {cohost.languages.map((l) => (
                <p key={l} className="text-sm text-[#1a0e02] font-medium">{l}</p>
              ))}
            </div>
            <div className="flex-1 min-w-[140px] bg-white border border-[#e8dfd4] rounded-xl p-4">
              <p className="text-[10px] font-bold text-[#64707d] uppercase tracking-widest mb-2">Fee model</p>
              <p className="text-sm text-[#1a0e02] font-medium">{feeLabel}</p>
              <p className="text-[10px] text-[#a09080] mt-1">Member since {joinedYear}</p>
            </div>
          </div>

          {/* Reviews */}
          {cohost.reviews.length > 0 && (
            <div>
              <SectionLabel>Host reviews ({cohost.reviewCount})</SectionLabel>
              <div className="flex flex-col gap-3">
                {cohost.reviews.map((r, i) => (
                  <ReviewCard key={i} review={r} />
                ))}
              </div>
            </div>
          )}

          {/* Bottom CTA */}
          {isOwnProfile ? (
            <a
              href="/cohost/apply"
              className="w-full py-3 bg-[#1a0e02] text-white rounded-2xl text-sm font-semibold hover:bg-[#2e1a06] transition-colors flex items-center justify-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Manage your co-host profile
            </a>
          ) : (
            <>
              {canInvite && (
                <button
                  onClick={onInvite}
                  className="w-full py-3 bg-[#1a0e02] text-white rounded-2xl text-sm font-semibold hover:bg-[#2e1a06] transition-colors flex items-center justify-center gap-2"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                  {effectiveStatus === "declined" ? `Re-invite ${cohost.firstName}` : `Invite ${cohost.firstName} to a listing`}
                </button>
              )}
              {effectiveStatus === "invited" && onCancelInvite && (
                <button
                  onClick={onCancelInvite}
                  className="w-full py-3 border border-red-200 text-red-600 rounded-2xl text-sm font-semibold hover:bg-red-50 transition-colors"
                >
                  Cancel invitation
                </button>
              )}
              {effectiveStatus === "assigned" && onRemoveAssignment && (
                <button
                  onClick={onRemoveAssignment}
                  className="w-full py-3 border border-red-200 text-red-600 rounded-2xl text-sm font-semibold hover:bg-red-50 transition-colors"
                >
                  Remove {cohost.firstName} as co-host
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
