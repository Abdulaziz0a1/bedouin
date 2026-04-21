"use client";

import { useState, useTransition } from "react";
import { respondToInvitation } from "@/lib/actions/cohost";
import type { CohostInboxItem } from "@/lib/services/cohost";

// ──────────────────────────────────────────────────────────────────────────────
// Status helpers
// ──────────────────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pending:  { label: "Awaiting your response", cls: "bg-[#fdf8ee] text-[#8b6a1f] border-[#ead9a6]" },
  accepted: { label: "Accepted",               cls: "bg-[#eef3ff] text-[#0036a3] border-[#b3c8f5]" },
  declined: { label: "Declined",               cls: "bg-red-50    text-red-600   border-red-200"    },
} as const;

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// InvitationCard
// ──────────────────────────────────────────────────────────────────────────────

function InvitationCard({
  item,
  onRespond,
}: {
  item:      CohostInboxItem;
  onRespond: (id: string, decision: "accepted" | "declined") => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();
  const [localStatus, setLocalStatus] = useState(item.status);
  const [error, setError] = useState<string | null>(null);

  const cfg = STATUS_CONFIG[localStatus];

  const handleRespond = (decision: "accepted" | "declined") => {
    setError(null);
    startTransition(async () => {
      await onRespond(item.id, decision);
      // Optimistically update
      setLocalStatus(decision);
    });
  };

  return (
    <div className="bg-white border border-[#e8dfd4] rounded-2xl overflow-hidden">
      {/* Listing image strip */}
      {item.listingImage && (
        <div className="h-24 w-full overflow-hidden bg-[#f0e8de]">
          <img
            src={item.listingImage}
            alt={item.listingTitle}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <p className="font-display font-semibold text-[#1a0e02] text-base truncate">
              {item.listingTitle}
            </p>
            <p className="text-xs text-[#64707d] mt-0.5">
              From <span className="font-semibold text-[#8b5e38]">{item.hostName}</span>
              {" · "}{fmtDate(item.sentAt)}
            </p>
          </div>
          <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${cfg.cls}`}>
            {cfg.label}
          </span>
        </div>

        {/* Message */}
        <div className="bg-[#faf7f4] border border-[#f0e8de] rounded-xl px-4 py-3 mb-4">
          <p className="text-[10px] font-bold text-[#64707d] uppercase tracking-widest mb-1">Message</p>
          <p className="text-sm text-[#1a0e02] leading-relaxed">&ldquo;{item.message}&rdquo;</p>
        </div>

        {/* Error */}
        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-3">
            {error}
          </p>
        )}

        {/* Actions */}
        {localStatus === "pending" && (
          <div className="flex gap-3">
            <button
              disabled={pending}
              onClick={() => handleRespond("declined")}
              className="flex-1 py-2.5 border border-[#e8dfd4] rounded-xl text-sm font-semibold text-[#64707d] hover:border-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
            >
              {pending ? "…" : "Decline"}
            </button>
            <button
              disabled={pending}
              onClick={() => handleRespond("accepted")}
              className="flex-[2] py-2.5 bg-[#049153] text-white rounded-xl text-sm font-semibold hover:bg-[#037a43] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {pending ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="15" />
                  </svg>
                  Accepting…
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Accept
                </>
              )}
            </button>
          </div>
        )}

        {localStatus === "accepted" && (
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-[#049153]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-sm font-semibold">You accepted this invitation.</p>
            </div>
            <a
              href={`/messages?with=${item.hostId}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8b5e38] hover:text-[#461e00] transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Message host
            </a>
          </div>
        )}

        {localStatus === "declined" && (
          <p className="text-sm text-[#a09080]">You declined this invitation.</p>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main page component
// ──────────────────────────────────────────────────────────────────────────────

export default function CoHostInvitationsPage({
  invitations,
  error,
}: {
  invitations: CohostInboxItem[];
  error?:      string;
}) {
  const handleRespond = async (id: string, decision: "accepted" | "declined") => {
    await respondToInvitation(id, decision);
  };

  return (
    <div className="min-h-screen bg-[#f4efe6]">

      {/* Header */}
      <header className="bg-white border-b border-[#e8dfd4] sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-5 h-16 flex items-center justify-between">
          <a href="/" className="font-display font-extrabold text-[#1a0e02] text-xl tracking-tight">
            Bedouin
          </a>
          <a
            href="/account"
            className="text-sm font-semibold text-[#64707d] hover:text-[#8b5e38] transition-colors"
          >
            ← My Account
          </a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-10">

        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-display font-extrabold text-[#1a0e02] text-2xl">
              Co-host Invitations
            </h1>
            {invitations.filter((i) => i.status === "pending").length > 0 && (
              <span className="text-xs font-bold text-white bg-[#8b5e38] px-2.5 py-1 rounded-full">
                {invitations.filter((i) => i.status === "pending").length} pending
              </span>
            )}
          </div>
          <p className="text-sm text-[#64707d]">
            Hosts who want to work with you will send invitations here. Accept to start co-hosting their listing.
          </p>
        </div>

        {/* Error state */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 mb-6">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-red-500 shrink-0">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
              <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!error && invitations.length === 0 && (
          <div className="flex flex-col items-center text-center py-16 px-6 bg-white rounded-2xl border border-[#e8dfd4]">
            <div className="w-14 h-14 rounded-2xl bg-[#f0e8de] flex items-center justify-center text-[#8b5e38] mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M22 2L15 22 11 13 2 9l20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="font-display font-semibold text-[#1a0e02] text-lg mb-2">No invitations yet</h2>
            <p className="text-sm text-[#64707d] max-w-sm leading-relaxed mb-6">
              Once your profile is approved and hosts find you on the marketplace, their invitations will appear here.
            </p>
            <a
              href="/cohost"
              className="px-5 py-2.5 bg-[#8b5e38] text-white text-sm font-semibold rounded-xl hover:bg-[#7a5030] transition-colors"
            >
              View co-host marketplace →
            </a>
          </div>
        )}

        {/* Tabs: pending first, then history */}
        {!error && invitations.length > 0 && (
          <div className="flex flex-col gap-6">
            {/* Pending */}
            {invitations.filter((i) => i.status === "pending").length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-[#64707d] uppercase tracking-widest mb-3">
                  Pending — awaiting your response
                </p>
                <div className="flex flex-col gap-4">
                  {invitations
                    .filter((i) => i.status === "pending")
                    .map((inv) => (
                      <InvitationCard key={inv.id} item={inv} onRespond={handleRespond} />
                    ))}
                </div>
              </div>
            )}

            {/* History */}
            {invitations.filter((i) => i.status !== "pending").length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-[#64707d] uppercase tracking-widest mb-3">
                  History
                </p>
                <div className="flex flex-col gap-4">
                  {invitations
                    .filter((i) => i.status !== "pending")
                    .map((inv) => (
                      <InvitationCard key={inv.id} item={inv} onRespond={handleRespond} />
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
