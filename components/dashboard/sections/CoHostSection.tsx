"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { SERVICE_LABELS } from "@/lib/data/cohost";
import { cancelInvitation, removeAssignment, resolveWithdrawal } from "@/lib/actions/cohost";
import type { CoHostAssignment, CoHostInvitation } from "@/lib/types/cohost";
import type { DashboardListing } from "@/lib/data/dashboard";
import UserAvatar from "@/components/ui/UserAvatar";
import { useLanguage } from "@/context/LanguageProvider";

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold text-[#64707d] uppercase tracking-widest mb-2.5">
      {children}
    </p>
  );
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// ──────────────────────────────────────────────────────────────────────────────
// AssignmentCard
// ──────────────────────────────────────────────────────────────────────────────

function AssignmentCard({
  assignment,
  onRemove,
  onWithdrawalResolved,
}: {
  assignment:           CoHostAssignment;
  onRemove:             (id: string) => Promise<void>;
  onWithdrawalResolved: (id: string, decision: "approve" | "reject") => void;
}) {
  const { t } = useLanguage();
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  const isWithdrawalPending = assignment.status === "withdrawal_requested";

  function handleResolve(decision: "approve" | "reject") {
    startTransition(async () => {
      const result = await resolveWithdrawal(assignment.id, decision);
      if (result.success) onWithdrawalResolved(assignment.id, decision);
    });
  }

  return (
    <div className="bg-white border border-[#e8dfd4] rounded-2xl overflow-hidden">
      {/* Status banner */}
      {isWithdrawalPending ? (
        <div className="bg-[#fdf8ee] border-b border-[#ead9a6] px-4 py-1.5 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#c49a4f]" />
          <span className="text-[10px] font-bold text-[#8b6a1f] uppercase tracking-wide">{t("dash.cohost.withdrawal")}</span>
        </div>
      ) : (
        <div className="bg-[#f0faf5] border-b border-[#9edcbb] px-4 py-1.5 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#049153] animate-pulse" />
          <span className="text-[10px] font-bold text-[#049153] uppercase tracking-wide">{t("dash.cohost.active")}</span>
        </div>
      )}

      <div className="p-4 flex items-start gap-3">
        <UserAvatar name={assignment.coHostName} size={44} className="border-2 border-[#e8dfd4] shrink-0 rounded-xl" />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-display font-semibold text-[#1a0e02] text-sm">{assignment.coHostName}</p>
              {assignment.coHostRegion && (
                <p className="text-[11px] text-[#8b5e38] font-medium">📍 {assignment.coHostRegion}</p>
              )}
              <p className="text-[10px] text-[#a09080] mt-0.5">
                {t("dash.cohost.since").replace("{date}", fmtDate(assignment.assignedAt))}
              </p>
            </div>
            {!isWithdrawalPending && !confirming && (
              <button
                onClick={() => setConfirming(true)}
                className="text-[10px] font-bold text-[#a09080] hover:text-red-600 transition-colors px-2 py-1 rounded-lg hover:bg-red-50 shrink-0"
              >
                {t("dash.cohost.remove")}
              </button>
            )}
          </div>

          {/* Services */}
          {assignment.services.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2 mb-2.5">
              {assignment.services.map((s) => (
                <span key={s} className="text-[9px] font-semibold text-[#64707d] bg-[#f0e8de] px-1.5 py-0.5 rounded-md">
                  {SERVICE_LABELS[s]}
                </span>
              ))}
            </div>
          )}

          <Link
            href={`/messages?with=${assignment.coHostId}${assignment.listingId ? `&listing=${assignment.listingId}` : ""}`}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#8b5e38] hover:text-[#461e00] transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t("dash.cohost.message")}
          </Link>
        </div>
      </div>

      {isWithdrawalPending && (
        <div className="flex items-center gap-3 px-4 pb-4">
          <p className="text-xs text-[#8b6a1f] flex-1">{t("dash.cohost.withdrawal_msg")}</p>
          <button
            disabled={pending}
            onClick={() => handleResolve("reject")}
            className="text-xs font-semibold text-[#64707d] px-3 py-1.5 rounded-lg border border-[#e8dfd4] hover:border-[#8b5e38] transition-colors disabled:opacity-60"
          >
            {pending ? "…" : t("dash.cohost.reject")}
          </button>
          <button
            disabled={pending}
            onClick={() => handleResolve("approve")}
            className="text-xs font-semibold text-white bg-[#8b6a1f] px-3 py-1.5 rounded-lg hover:bg-[#7a5a10] transition-colors disabled:opacity-60"
          >
            {pending ? "…" : t("dash.cohost.approve")}
          </button>
        </div>
      )}

      {!isWithdrawalPending && confirming && (
        <div className="flex items-center gap-3 px-4 pb-4">
          <p className="text-xs text-[#64707d] flex-1">{t("dash.cohost.remove_confirm")}</p>
          <button
            onClick={() => setConfirming(false)}
            className="text-xs font-semibold text-[#64707d] px-3 py-1.5 rounded-lg border border-[#e8dfd4] hover:border-[#8b5e38] transition-colors"
          >
            {t("dash.cohost.cancel")}
          </button>
          <button
            disabled={pending}
            onClick={() => {
              setConfirming(false);
              startTransition(() => onRemove(assignment.id));
            }}
            className="text-xs font-semibold text-white bg-red-600 px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
          >
            {pending ? t("dash.cohost.removing") : t("dash.cohost.remove")}
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
  const { t } = useLanguage();
  const [pending, startTransition] = useTransition();

  const statusConfig = {
    pending:  { tKey: "dash.cohost.awaiting", cls: "bg-[#fdf8ee] text-[#8b6a1f] border-[#ead9a6]" },
    accepted: { tKey: "dash.cohost.accepted", cls: "bg-[#eef3ff] text-[#0036a3] border-[#b3c8f5]" },
    declined: { tKey: "dash.cohost.declined", cls: "bg-red-50    text-red-600   border-red-200"    },
  };
  const cfg = statusConfig[invitation.status] ?? statusConfig.declined;

  return (
    <div className="bg-white border border-[#e8dfd4] rounded-2xl p-4 flex items-start gap-3">
      <UserAvatar name={invitation.coHostName} size={40} className="border-2 border-[#e8dfd4] shrink-0 rounded-xl" />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="font-semibold text-[#1a0e02] text-sm">{invitation.coHostName}</p>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${cfg.cls}`}>
            {t(cfg.tKey)}
          </span>
        </div>
        <p className="text-[10px] text-[#a09080] mb-1.5">
          {t("dash.cohost.sent").replace("{date}", new Date(invitation.sentAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" }))}
        </p>
        <p className="text-xs text-[#a09080] italic line-clamp-2">&ldquo;{invitation.message}&rdquo;</p>

        {invitation.status === "pending" && (
          <button
            disabled={pending}
            onClick={() => startTransition(() => onCancel(invitation.id))}
            className="mt-2.5 text-[10px] font-bold text-[#a09080] hover:text-red-600 transition-colors disabled:opacity-60"
          >
            {pending ? t("dash.cohost.cancelling") : t("dash.cohost.cancel_invite")}
          </button>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// ListingCard — one listing with its co-host state + invite CTA
// ──────────────────────────────────────────────────────────────────────────────

function ListingCard({
  listingId,
  listingTitle,
  listingImage,
  assignments,
  pendingInvitations,
  declinedInvitations,
  onRemove,
  onWithdrawalResolved,
  onCancelInvitation,
}: {
  listingId:           string;
  listingTitle:        string;
  listingImage:        string;
  assignments:         CoHostAssignment[];
  pendingInvitations:  CoHostInvitation[];
  declinedInvitations: CoHostInvitation[];
  onRemove:             (id: string) => Promise<void>;
  onWithdrawalResolved: (id: string, decision: "approve" | "reject") => void;
  onCancelInvitation:   (id: string) => Promise<void>;
}) {
  const { t } = useLanguage();
  const [historyOpen, setHistoryOpen] = useState(false);

  const activeCountLabel = assignments.length === 1
    ? t("dash.cohost.active_n").replace("{count}", String(assignments.length))
    : assignments.length === 0
      ? t("dash.cohost.no_cohost_yet")
      : t("dash.cohost.active_n_plural").replace("{count}", String(assignments.length));

  const pendingLabel = pendingInvitations.length > 0
    ? ` · ${t("dash.cohost.pending_n").replace("{count}", String(pendingInvitations.length))}`
    : "";

  return (
    <div className="border border-[#e8dfd4] rounded-2xl overflow-hidden">
      {/* ── Listing header ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 px-5 py-4 bg-[#faf7f4] border-b border-[#e8dfd4]">
        {listingImage ? (
          <img src={listingImage} alt={listingTitle} className="w-14 h-10 rounded-xl object-cover shrink-0" />
        ) : (
          <div className="w-14 h-10 rounded-xl bg-[#e8dfd4] shrink-0 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#a09080]">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            </svg>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-display font-semibold text-[#1a0e02] text-sm truncate">{listingTitle}</p>
          <p className="text-[11px] text-[#64707d] mt-0.5">
            {activeCountLabel}{pendingLabel}
          </p>
        </div>
        <Link
          href={`/cohost?listing=${listingId}`}
          className="shrink-0 flex items-center gap-2 px-4 py-2 bg-[#8b5e38] text-white text-xs font-semibold rounded-xl hover:bg-[#7a5030] transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M19 11v6M16 14h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          {t("dash.cohost.invite")}
        </Link>
      </div>

      <div className="p-5 flex flex-col gap-5">
        {/* ── Active co-hosts ─────────────────────────────────────────── */}
        <div>
          <SectionLabel>{t("dash.cohost.active_label")}</SectionLabel>
          {assignments.length === 0 ? (
            <div className="flex items-center gap-4 p-4 rounded-xl border border-dashed border-[#e8dfd4] bg-[#faf7f4]">
              <div className="w-9 h-9 rounded-xl bg-[#f0e8de] flex items-center justify-center text-[#c49a4f] shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.7" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1a0e02]">{t("dash.cohost.no_active")}</p>
                <p className="text-xs text-[#64707d] mt-0.5">
                  {pendingInvitations.length > 0
                    ? t("dash.cohost.no_active_invite")
                    : t("dash.cohost.no_active_browse")}
                </p>
              </div>
              {pendingInvitations.length === 0 && (
                <Link
                  href={`/cohost?listing=${listingId}`}
                  className="shrink-0 text-xs font-semibold text-[#8b5e38] hover:text-[#461e00] transition-colors whitespace-nowrap"
                >
                  {t("dash.cohost.browse_link")}
                </Link>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {assignments.map((a) => (
                <AssignmentCard
                  key={a.id}
                  assignment={a}
                  onRemove={onRemove}
                  onWithdrawalResolved={onWithdrawalResolved}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Pending invitations ─────────────────────────────────────── */}
        {pendingInvitations.length > 0 && (
          <div>
            <SectionLabel>{t("dash.cohost.pending_label")}</SectionLabel>
            <div className="flex flex-col gap-3">
              {pendingInvitations.map((inv) => (
                <InvitationCard key={inv.id} invitation={inv} onCancel={onCancelInvitation} />
              ))}
            </div>
          </div>
        )}

        {/* ── Invitation history ───────────────────────────────────────── */}
        {declinedInvitations.length > 0 && (
          <div>
            <button
              onClick={() => setHistoryOpen((o) => !o)}
              className="flex items-center gap-1.5 text-[10px] font-bold text-[#a09080] uppercase tracking-widest hover:text-[#64707d] transition-colors"
            >
              <svg
                width="10" height="10" viewBox="0 0 24 24" fill="none"
                className={`transition-transform ${historyOpen ? "rotate-90" : ""}`}
              >
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t("dash.cohost.history").replace("{count}", String(declinedInvitations.length))}
            </button>

            {historyOpen && (
              <div className="flex flex-col gap-3 mt-2.5">
                {declinedInvitations.map((inv) => (
                  <InvitationCard key={inv.id} invitation={inv} onCancel={onCancelInvitation} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main section
// ──────────────────────────────────────────────────────────────────────────────

export default function CoHostSection({
  listings:     rawListings,
  assignments:  initialAssignments,
  invitations:  initialInvitations,
}: {
  listings:    DashboardListing[];
  assignments: CoHostAssignment[];
  invitations: CoHostInvitation[];
}) {
  const { t } = useLanguage();
  const [assignments, setAssignments] = useState<CoHostAssignment[]>(initialAssignments);
  const [invitations, setInvitations] = useState<CoHostInvitation[]>(initialInvitations);

  const handleRemoveAssignment = async (id: string) => {
    const result = await removeAssignment(id);
    if (result.success) setAssignments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleCancelInvitation = async (id: string) => {
    const result = await cancelInvitation(id);
    if (result.success) setInvitations((prev) => prev.filter((i) => i.id !== id));
  };

  const handleWithdrawalResolved = (id: string, decision: "approve" | "reject") => {
    if (decision === "approve") {
      setAssignments((prev) => prev.filter((a) => a.id !== id));
    } else {
      setAssignments((prev) => prev.map((a) => a.id === id ? { ...a, status: "active" } : a));
    }
  };

  const listingGroups = useMemo(() => {
    type Group = {
      listingId:    string;
      listingTitle: string;
      listingImage: string;
      assignments:  CoHostAssignment[];
      pendingInvitations:  CoHostInvitation[];
      declinedInvitations: CoHostInvitation[];
    };

    const map = new Map<string, Group>();

    for (const l of rawListings) {
      if (l.status === "approved" && l.listingId) {
        map.set(l.listingId, {
          listingId:    l.listingId,
          listingTitle: l.title,
          listingImage: l.imageUrl,
          assignments:  [],
          pendingInvitations:  [],
          declinedInvitations: [],
        });
      }
    }

    for (const a of assignments) {
      if (!map.has(a.listingId)) {
        map.set(a.listingId, { listingId: a.listingId, listingTitle: a.listingTitle, listingImage: a.listingImage, assignments: [], pendingInvitations: [], declinedInvitations: [] });
      }
      map.get(a.listingId)!.assignments.push(a);
    }
    for (const inv of invitations) {
      if (!map.has(inv.listingId)) {
        map.set(inv.listingId, { listingId: inv.listingId, listingTitle: inv.listingTitle, listingImage: inv.listingImage, assignments: [], pendingInvitations: [], declinedInvitations: [] });
      }
      const group = map.get(inv.listingId)!;
      if (inv.status === "pending") {
        group.pendingInvitations.push(inv);
      } else {
        group.declinedInvitations.push(inv);
      }
    }

    return Array.from(map.values());
  }, [rawListings, assignments, invitations]);

  const totalActive  = assignments.length;
  const totalPending = invitations.filter((i) => i.status === "pending").length;
  const hasListings  = listingGroups.length > 0;

  return (
    <div className="flex flex-col gap-8">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-display font-bold text-[#1a0e02] text-xl mb-1">{t("dash.cohost.title")}</h2>
          <p className="text-sm text-[#64707d]">{t("dash.cohost.subtitle")}</p>
        </div>
        <Link
          href="/cohost"
          className="flex items-center gap-2 px-5 py-2.5 bg-[#8b5e38] text-white text-sm font-semibold rounded-xl hover:bg-[#7a5030] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M19 11v6M16 14h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          {t("dash.cohost.browse_all")}
        </Link>
      </div>

      {/* ── How co-hosting works ──────────────────────────────────────────── */}
      <div className="flex items-start gap-3 bg-[#faf7f4] border border-[#e8dfd4] rounded-2xl px-4 py-4">
        <div className="w-8 h-8 rounded-xl bg-[#f0e8de] flex items-center justify-center text-[#8b5e38] shrink-0 mt-0.5">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-semibold text-[#1a0e02] mb-1">{t("dash.cohost.how_works")}</p>
          <p className="text-xs text-[#64707d] leading-relaxed">
            {t("dash.cohost.how_works_body")}
          </p>
        </div>
      </div>

      {/* ── Summary strip ────────────────────────────────────────────────── */}
      {hasListings && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { tKey: "dash.cohost.active_count",    value: totalActive,         color: "text-[#049153]", bg: "bg-[#f0faf5]" },
            { tKey: "dash.cohost.pending_count",   value: totalPending,        color: "text-[#8b6a1f]", bg: "bg-[#fdf8ee]" },
            { tKey: "dash.cohost.listings_managed",value: listingGroups.length, color: "text-[#1a0e02]", bg: "bg-[#f4f6f8]" },
          ].map(({ tKey, value, color, bg }) => (
            <div key={tKey} className={`flex items-center gap-3 px-4 py-3 rounded-xl ${bg} border border-[#e8dfd4]`}>
              <span className={`font-display font-extrabold text-2xl ${color}`}>{value}</span>
              <span className="text-[10px] text-[#64707d] font-bold uppercase tracking-wide leading-tight">{t(tKey)}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Listing cards ─────────────────────────────────────────────────── */}
      {hasListings ? (
        <div className="flex flex-col gap-5">
          {listingGroups.map((group) => (
            <ListingCard
              key={group.listingId}
              listingId={group.listingId}
              listingTitle={group.listingTitle}
              listingImage={group.listingImage}
              assignments={group.assignments}
              pendingInvitations={group.pendingInvitations}
              declinedInvitations={group.declinedInvitations}
              onRemove={handleRemoveAssignment}
              onWithdrawalResolved={handleWithdrawalResolved}
              onCancelInvitation={handleCancelInvitation}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center text-center py-14 px-6 bg-white rounded-2xl border border-[#e8dfd4]">
          <div className="w-14 h-14 rounded-2xl bg-[#f0e8de] flex items-center justify-center text-[#8b5e38] mb-4">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="font-display font-semibold text-[#1a0e02] text-base mb-2">{t("dash.cohost.no_listings")}</p>
          <p className="text-sm text-[#64707d] max-w-xs leading-relaxed mb-5">
            {t("dash.cohost.no_listings_desc")}
          </p>
          <Link
            href="/host/new"
            className="flex items-center gap-2 px-6 py-2.5 bg-[#8b5e38] text-white text-sm font-semibold rounded-xl hover:bg-[#7a5030] transition-colors"
          >
            {t("dash.cohost.submit_listing")}
          </Link>
        </div>
      )}
    </div>
  );
}
