"use client";

import type { CohostAssignmentItem } from "@/lib/services/cohost";

type CohostStatus = "pending" | "approved" | "rejected" | null;

// ──────────────────────────────────────────────────────────────────────────────
// Step indicator — shows progress through the co-host flow
// ──────────────────────────────────────────────────────────────────────────────

function FlowStep({
  n,
  label,
  sub,
  state,
}: {
  n:     number;
  label: string;
  sub:   string;
  state: "done" | "active" | "idle";
}) {
  return (
    <div className="flex items-start gap-3">
      <div className={[
        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 transition-colors",
        state === "done"   ? "bg-[#049153] text-white"   :
        state === "active" ? "bg-[#461e00] text-white"   :
                             "bg-[#e8dfd4] text-[#8b94a4]",
      ].join(" ")}>
        {state === "done" ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : n}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold leading-tight ${
          state === "idle" ? "text-[#8b94a4]" : "text-[#1a0e02]"
        }`}>{label}</p>
        <p className="text-xs text-[#a09080] mt-0.5 leading-relaxed">{sub}</p>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main section
// ──────────────────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function AssignmentCard({ assignment }: { assignment: CohostAssignmentItem }) {
  return (
    <div className="bg-white border border-[#e8dfd4] rounded-2xl overflow-hidden">
      {/* Active banner */}
      <div className="bg-[#f0faf5] border-b border-[#9edcbb] px-4 py-1.5 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-[#049153] animate-pulse" />
        <span className="text-[10px] font-bold text-[#049153] uppercase tracking-wide">Active assignment</span>
      </div>

      <div className="p-4 flex items-start gap-4">
        {/* Listing thumbnail */}
        {assignment.listingImage ? (
          <img
            src={assignment.listingImage}
            alt={assignment.listingTitle}
            className="w-16 h-14 rounded-xl object-cover shrink-0 border border-[#e8dfd4]"
          />
        ) : (
          <div className="w-16 h-14 rounded-xl bg-[#e8dfd4] shrink-0" />
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-display font-semibold text-[#1a0e02] text-sm truncate mb-0.5">
            {assignment.listingTitle}
          </p>
          <p className="text-[11px] text-[#64707d] mb-3">
            Host: <span className="font-semibold text-[#8b5e38]">{assignment.hostName}</span>
            {" · "}Since {fmtDate(assignment.assignedAt)}
          </p>
          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={`/messages?with=${assignment.hostId}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8b5e38] hover:text-[#461e00] transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Message host
            </a>
            <span className="text-[#e8dfd4]">·</span>
            <a
              href={`/listing/${assignment.listingId}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64707d] hover:text-[#1a0e02] transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15 3h6v6M10 14L21 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              View listing
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UserCohostSection({
  cohostStatus,
  cohostRejectionReason,
  assignments = [],
}: {
  cohostStatus:          CohostStatus;
  cohostRejectionReason: string | null;
  assignments?:          CohostAssignmentItem[];
}) {

  // ── Not applied yet ────────────────────────────────────────────────────────

  if (!cohostStatus) {
    return (
      <div className="flex flex-col gap-6">

        {/* Hero card */}
        <div className="bg-[#1a0e02] rounded-2xl p-8 flex flex-col sm:flex-row items-start gap-6">
          <div className="w-14 h-14 rounded-2xl bg-[#2e1a06] flex items-center justify-center text-[#c49a4f] shrink-0">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8" />
              <path d="M3 20c0-4 2.7-7 6-7s6 3 6 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M21 18c0-3.5-2.24-6-5-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display font-bold text-white text-xl mb-2">
              Become a Bedouin Co-host
            </h2>
            <p className="text-sm text-[#a09080] leading-relaxed mb-5 max-w-lg">
              Help hosts across Saudi Arabia manage their listings — guest check-in, cleaning coordination,
              local guiding, photography, and more. Set your own services, region, and fees.
            </p>
            <a
              href="/cohost/apply"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#c49a4f] text-[#1a0e02] text-sm font-bold rounded-xl hover:bg-[#d4aa5f] transition-colors"
            >
              Apply to become a co-host
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white border border-[#e8dfd4] rounded-2xl p-6">
          <p className="text-[10px] font-bold text-[#64707d] uppercase tracking-widest mb-5">How it works</p>
          <div className="flex flex-col gap-5">
            <FlowStep n={1} label="Submit your application" sub="Tell us your services, region, languages, and fee preference. Takes about 3 minutes." state="idle" />
            <FlowStep n={2} label="Admin review"            sub="Our team reviews your profile within 1–2 business days." state="idle" />
            <FlowStep n={3} label="Go live on the marketplace" sub="Approved co-hosts are visible to hosts browsing for help across Saudi Arabia." state="idle" />
            <FlowStep n={4} label="Accept invitations & start co-hosting" sub="Hosts send you invitations. You accept or decline each one." state="idle" />
          </div>
        </div>

        {/* Browse link */}
        <div className="flex items-center justify-between gap-4 bg-[#faf7f4] border border-[#e8dfd4] rounded-2xl px-5 py-4">
          <p className="text-sm text-[#64707d]">Curious what co-hosts look like on Bedouin?</p>
          <a href="/cohost" className="text-sm font-semibold text-[#8b5e38] underline hover:no-underline shrink-0">
            Browse the marketplace →
          </a>
        </div>
      </div>
    );
  }

  // ── Pending ────────────────────────────────────────────────────────────────

  if (cohostStatus === "pending") {
    return (
      <div className="flex flex-col gap-6">

        {/* Status card */}
        <div className="bg-[#f0f9ff] border border-[#bfdfff] rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#dbeeff] flex items-center justify-center text-[#0046cc] shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="font-display font-bold text-[#1a0e02] text-lg mb-1">
                Application Under Review
              </p>
              <p className="text-sm text-[#64707d] leading-relaxed">
                Our team is reviewing your co-host application. We typically respond within 1–2 business days.
                You&apos;ll see your status updated here once a decision is made.
              </p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white border border-[#e8dfd4] rounded-2xl p-6">
          <p className="text-[10px] font-bold text-[#64707d] uppercase tracking-widest mb-5">Your progress</p>
          <div className="flex flex-col gap-5">
            <FlowStep n={1} label="Application submitted"  sub="Your profile and services have been received." state="done" />
            <FlowStep n={2} label="Under review"           sub="Our team is checking your application — usually 1–2 business days." state="active" />
            <FlowStep n={3} label="Go live on the marketplace" sub="Once approved, hosts can find and invite you." state="idle" />
            <FlowStep n={4} label="Accept invitations & start co-hosting" sub="You'll receive host invitations here on your dashboard." state="idle" />
          </div>
        </div>

        <div className="text-center text-xs text-[#a09080]">
          Questions? Contact us at{" "}
          <a href="mailto:support@bedouin.sa" className="text-[#8b5e38] underline">support@bedouin.sa</a>
        </div>
      </div>
    );
  }

  // ── Approved ───────────────────────────────────────────────────────────────

  if (cohostStatus === "approved") {
    const hasAssignments = assignments.length > 0;

    return (
      <div className="flex flex-col gap-6">

        {/* Status card */}
        <div className="bg-[#f0faf5] border border-[#9edcbb] rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#d0f0e0] flex items-center justify-center text-[#049153] shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-display font-bold text-[#1a0e02] text-lg">Approved Co-host</p>
                <span className="text-[10px] font-bold text-[#049153] bg-[#d0f0e0] px-2 py-0.5 rounded-full uppercase tracking-wide">
                  Active
                </span>
              </div>
              <p className="text-sm text-[#64707d] leading-relaxed">
                {hasAssignments
                  ? `You are actively co-hosting ${assignments.length} listing${assignments.length > 1 ? "s" : ""}. Hosts can still invite you for more.`
                  : "Your profile is live on the Bedouin co-host marketplace. Hosts across Saudi Arabia can find and invite you to manage their listings."}
              </p>
            </div>
          </div>
        </div>

        {/* Active assignments */}
        {hasAssignments && (
          <div>
            <p className="text-[10px] font-bold text-[#64707d] uppercase tracking-widest mb-3">
              Active listings
            </p>
            <div className="flex flex-col gap-3">
              {assignments.map((a) => (
                <AssignmentCard key={a.id} assignment={a} />
              ))}
            </div>
          </div>
        )}

        {/* Navigation actions */}
        <div className="grid sm:grid-cols-2 gap-4">
          <a
            href="/cohost/invitations"
            className="flex items-center gap-4 bg-white border border-[#e8dfd4] rounded-2xl p-5 hover:border-[#8b5e38] transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#fdf5ee] flex items-center justify-center text-[#8b5e38] shrink-0 group-hover:bg-[#f0e8de] transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M22 2L15 22 11 13 2 9l20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-[#1a0e02] text-sm">My Invitations</p>
              <p className="text-xs text-[#64707d] mt-0.5">View and respond to host invitations</p>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="ml-auto text-[#a09080] group-hover:text-[#8b5e38] transition-colors shrink-0">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>

          <a
            href="/cohost"
            className="flex items-center gap-4 bg-white border border-[#e8dfd4] rounded-2xl p-5 hover:border-[#8b5e38] transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#fdf5ee] flex items-center justify-center text-[#8b5e38] shrink-0 group-hover:bg-[#f0e8de] transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8" />
                <path d="M3 20c0-4 2.7-7 6-7s6 3 6 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M21 18c0-3.5-2.24-6-5-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-[#1a0e02] text-sm">Co-host Marketplace</p>
              <p className="text-xs text-[#64707d] mt-0.5">See your profile as hosts see it</p>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="ml-auto text-[#a09080] group-hover:text-[#8b5e38] transition-colors shrink-0">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>

        {/* Progress — all done */}
        <div className="bg-white border border-[#e8dfd4] rounded-2xl p-6">
          <p className="text-[10px] font-bold text-[#64707d] uppercase tracking-widest mb-5">Your journey</p>
          <div className="flex flex-col gap-5">
            <FlowStep n={1} label="Application submitted"       sub="Your profile and services were received." state="done" />
            <FlowStep n={2} label="Application approved"        sub="Our team verified your profile." state="done" />
            <FlowStep n={3} label="Live on the marketplace"     sub="Hosts can now find and invite you." state="done" />
            <FlowStep n={4} label="Accept invitations & earn"   sub={hasAssignments ? "You are actively co-hosting — keep it up!" : "Check your invitations inbox to get started."} state={hasAssignments ? "done" : "active"} />
          </div>
        </div>
      </div>
    );
  }

  // ── Rejected ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">

      {/* Status card */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-500 shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
              <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-[#1a0e02] text-lg mb-1">
              Application Not Approved
            </p>
            {cohostRejectionReason ? (
              <div className="bg-red-100 border border-red-200 rounded-xl px-4 py-3 mb-3">
                <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-1">Reason</p>
                <p className="text-sm text-red-700 leading-relaxed">{cohostRejectionReason}</p>
              </div>
            ) : (
              <p className="text-sm text-[#64707d] leading-relaxed mb-3">
                Your application did not meet our current requirements. You are welcome to revise and re-apply.
              </p>
            )}
            <a
              href="/cohost/apply"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#461e00] text-white text-sm font-bold rounded-xl hover:bg-[#5a2900] transition-colors"
            >
              Re-apply as a co-host
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-white border border-[#e8dfd4] rounded-2xl p-6">
        <p className="text-[10px] font-bold text-[#64707d] uppercase tracking-widest mb-4">Tips for re-applying</p>
        <ul className="flex flex-col gap-3">
          {[
            "Write a detailed bio (at least 50 characters) describing your hospitality experience.",
            "Select only services you can genuinely provide in your region.",
            "Make sure your phone number is accurate — we may contact you to verify.",
            "Set a realistic and competitive fee model to attract more hosts.",
          ].map((tip, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-[#64707d]">
              <span className="w-5 h-5 rounded-full bg-[#f0e8de] text-[#8b5e38] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                {i + 1}
              </span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
