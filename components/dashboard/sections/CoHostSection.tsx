"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { SERVICE_LABELS } from "@/lib/data/cohost";
import { cancelInvitation, removeAssignment } from "@/lib/actions/cohost";
import type { CoHostAssignment, CoHostInvitation } from "@/lib/types/cohost";
import UserAvatar from "@/components/ui/UserAvatar";

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold text-[#64707d] uppercase tracking-widest mb-3">
      {children}
    </p>
  );
}

function EmptyState({ title, sub, cta }: { title: string; sub: string; cta?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center py-12 px-6 bg-white rounded-2xl border border-[#e8dfd4]">
      <div className="w-12 h-12 rounded-2xl bg-[#f0e8de] flex items-center justify-center text-[#8b5e38] mb-3">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.7" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M21 18c0-3.5-2.24-6-5-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      </div>
      <p className="font-display font-semibold text-[#1a0e02] text-sm mb-1">{title}</p>
      <p className="text-xs text-[#64707d] max-w-xs leading-relaxed mb-4">{sub}</p>
      {cta}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// AssignmentCard
// ──────────────────────────────────────────────────────────────────────────────

function AssignmentCard({
  assignment,
  onRemove,
}: {
  assignment: CoHostAssignment;
  onRemove:   (id: string) => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="bg-white border border-[#e8dfd4] rounded-2xl overflow-hidden">
      {/* Active banner */}
      <div className="bg-[#f0faf5] border-b border-[#9edcbb] px-4 py-1.5 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-[#049153] animate-pulse" />
        <span className="text-[10px] font-bold text-[#049153] uppercase tracking-wide">Active co-host</span>
      </div>

      <div className="p-4 flex items-start gap-4">
        {/* Avatar */}
        <UserAvatar name={assignment.coHostName} size={48} className="border-2 border-[#e8dfd4] shrink-0 rounded-xl" />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-display font-semibold text-[#1a0e02] text-sm">{assignment.coHostName}</p>
              {assignment.coHostRegion && (
                <p className="text-[11px] text-[#8b5e38] font-medium mb-2">📍 {assignment.coHostRegion}</p>
              )}
            </div>
            {!confirming && (
              <button
                onClick={() => setConfirming(true)}
                className="text-[10px] font-bold text-[#a09080] hover:text-red-600 transition-colors px-2 py-1 rounded-lg hover:bg-red-50 shrink-0"
              >
                Remove
              </button>
            )}
          </div>

          {/* Listing */}
          <div className="flex items-center gap-2 bg-[#faf7f4] border border-[#f0e8de] rounded-xl p-2.5 mb-2.5">
            {assignment.listingImage ? (
              <img
                src={assignment.listingImage}
                alt={assignment.listingTitle}
                className="w-9 h-7 rounded-lg object-cover shrink-0"
              />
            ) : (
              <div className="w-9 h-7 rounded-lg bg-[#e8dfd4] shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#1a0e02] truncate">{assignment.listingTitle}</p>
              <p className="text-[10px] text-[#a09080]">Since {fmtDate(assignment.assignedAt)}</p>
            </div>
          </div>

          {/* Services */}
          {assignment.services.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2.5">
              {assignment.services.map((s) => (
                <span key={s} className="text-[9px] font-semibold text-[#64707d] bg-[#f0e8de] px-1.5 py-0.5 rounded-md">
                  {SERVICE_LABELS[s]}
                </span>
              ))}
            </div>
          )}

          {/* Message link */}
          <Link
            href={`/messages?with=${assignment.coHostId}`}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#8b5e38] hover:text-[#461e00] transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Message co-host
          </Link>
        </div>
      </div>

      {/* Remove confirm row */}
      {confirming && (
        <div className="flex items-center gap-3 px-4 pb-4">
          <p className="text-xs text-[#64707d] flex-1">Remove this co-host from the listing?</p>
          <button
            onClick={() => setConfirming(false)}
            className="text-xs font-semibold text-[#64707d] px-3 py-1.5 rounded-lg border border-[#e8dfd4] hover:border-[#8b5e38] transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={pending}
            onClick={() => {
              setConfirming(false);
              startTransition(() => onRemove(assignment.id));
            }}
            className="text-xs font-semibold text-white bg-red-600 px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
          >
            {pending ? "Removing…" : "Remove"}
          </button>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// InvitationCard
// ──────────────────────────────────────────────────────────────────────────────

function InvitationCard({
  invitation,
  onCancel,
}: {
  invitation: CoHostInvitation;
  onCancel:   (id: string) => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  const statusConfig = {
    pending:  { label: "Awaiting response", cls: "bg-[#fdf8ee] text-[#8b6a1f] border-[#ead9a6]" },
    accepted: { label: "Accepted",          cls: "bg-[#eef3ff] text-[#0036a3] border-[#b3c8f5]" },
    declined: { label: "Declined",          cls: "bg-red-50    text-red-600   border-red-200"    },
  };
  const cfg = statusConfig[invitation.status];

  return (
    <div className="bg-white border border-[#e8dfd4] rounded-2xl p-4 flex items-start gap-4">
      <UserAvatar name={invitation.coHostName} size={44} className="border-2 border-[#e8dfd4] shrink-0 rounded-xl" />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-0.5">
          <p className="font-semibold text-[#1a0e02] text-sm">{invitation.coHostName}</p>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${cfg.cls}`}>
            {cfg.label}
          </span>
        </div>
        <p className="text-[11px] text-[#64707d] mb-2">
          For <span className="font-semibold text-[#8b5e38]">{invitation.listingTitle}</span>
          {" · "}Sent {fmtDate(invitation.sentAt)}
        </p>
        <p className="text-xs text-[#a09080] italic line-clamp-2">&ldquo;{invitation.message}&rdquo;</p>

        {invitation.status === "pending" && (
          <button
            disabled={pending}
            onClick={() => startTransition(() => onCancel(invitation.id))}
            className="mt-2.5 text-[10px] font-bold text-[#a09080] hover:text-red-600 transition-colors disabled:opacity-60"
          >
            {pending ? "Cancelling…" : "Cancel invitation"}
          </button>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main section
// ──────────────────────────────────────────────────────────────────────────────

export default function CoHostSection({
  assignments:  initialAssignments,
  invitations:  initialInvitations,
}: {
  assignments: CoHostAssignment[];
  invitations: CoHostInvitation[];
}) {
  const [assignments, setAssignments] = useState<CoHostAssignment[]>(initialAssignments);
  const [invitations, setInvitations] = useState<CoHostInvitation[]>(initialInvitations);

  const handleRemoveAssignment = async (id: string) => {
    const result = await removeAssignment(id);
    if (result.success) {
      setAssignments((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const handleCancelInvitation = async (id: string) => {
    const result = await cancelInvitation(id);
    if (result.success) {
      setInvitations((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const hasAny = assignments.length > 0 || invitations.length > 0;

  return (
    <div className="flex flex-col gap-8">

      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-display font-bold text-[#1a0e02] text-xl mb-1">My Co-hosts</h2>
          <p className="text-sm text-[#64707d]">
            Manage the co-hosts working on your listings and track pending invitations.
          </p>
        </div>
        <a
          href="/cohost"
          className="flex items-center gap-2 px-5 py-2.5 bg-[#8b5e38] text-white text-sm font-semibold rounded-xl hover:bg-[#7a5030] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M19 11v6M16 14h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Browse co-hosts
        </a>
      </div>

      {/* Summary strip */}
      {hasAny && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: "Active co-hosts",     value: assignments.length,                                color: "text-[#049153]", bg: "bg-[#f0faf5]" },
            { label: "Pending invitations",  value: invitations.filter((i) => i.status === "pending").length, color: "text-[#8b6a1f]", bg: "bg-[#fdf8ee]" },
            { label: "Listings supported",  value: [...new Set(assignments.map((a) => a.listingId))].length, color: "text-[#1a0e02]", bg: "bg-[#f4f6f8]" },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`flex items-center gap-3 px-4 py-3 rounded-xl ${bg} border border-[#e8dfd4]`}>
              <span className={`font-display font-extrabold text-2xl ${color}`}>{value}</span>
              <span className="text-[10px] text-[#64707d] font-bold uppercase tracking-wide leading-tight">{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Active assignments */}
      <div>
        <SectionLabel>Active co-hosts</SectionLabel>
        {assignments.length === 0 ? (
          <EmptyState
            title="No active co-hosts yet"
            sub="Once a co-host accepts your invitation, they'll appear here."
            cta={
              <a
                href="/cohost"
                className="flex items-center gap-2 px-5 py-2.5 bg-[#8b5e38] text-white text-sm font-semibold rounded-xl hover:bg-[#7a5030] transition-colors"
              >
                Browse co-hosts
              </a>
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {assignments.map((a) => (
              <AssignmentCard key={a.id} assignment={a} onRemove={handleRemoveAssignment} />
            ))}
          </div>
        )}
      </div>

      {/* Pending invitations */}
      <div>
        <SectionLabel>Invitations sent</SectionLabel>
        {invitations.length === 0 ? (
          <div className="text-sm text-[#a09080] bg-white border border-[#e8dfd4] rounded-2xl px-5 py-6 text-center">
            No invitations sent yet.{" "}
            <a href="/cohost" className="text-[#8b5e38] font-semibold underline">
              Browse available co-hosts →
            </a>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {invitations.map((inv) => (
              <InvitationCard key={inv.id} invitation={inv} onCancel={handleCancelInvitation} />
            ))}
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="bg-[#1a0e02] rounded-2xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#2e1a06] flex items-center justify-center text-[#c49a4f] shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.7" />
            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <p className="font-display font-semibold text-white text-sm mb-1">How co-hosting works</p>
          <p className="text-xs text-[#a09080] leading-relaxed">
            Browse verified co-hosts, send an invitation with a note, and once accepted they are assigned to manage your listing.
            You can remove a co-host at any time from this page.
          </p>
        </div>
      </div>
    </div>
  );
}
