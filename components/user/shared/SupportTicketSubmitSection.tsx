"use client";

import { useState, useTransition } from "react";
import type { IssueType } from "@/lib/types/support";
import { ISSUE_TYPE_LABELS } from "@/lib/types/support";
import { createSupportTicket } from "@/lib/actions/support";

const ISSUE_TYPES: IssueType[] = [
  "booking_issue", "payment_issue", "host_issue",
  "tourist_issue", "safety_concern", "listing_problem", "other",
];

export default function SupportTicketSubmitSection() {
  const [isPending,   startTransition] = useTransition();
  const [issueType,   setIssueType]    = useState<IssueType>("booking_issue");
  const [title,       setTitle]        = useState("");
  const [description, setDescription]  = useState("");
  const [error,       setError]        = useState<string | null>(null);
  const [submitted,   setSubmitted]    = useState(false);

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await createSupportTicket({ issueType, title, description });
      if (!result.success) { setError(result.error); return; }
      setSubmitted(true);
    });
  }

  if (submitted) {
    return (
      <div className="bg-[#f0faf5] border border-[#c8ead8] rounded-2xl p-8 flex flex-col items-center text-center gap-3">
        <div className="w-12 h-12 rounded-full bg-[#049153] flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <p className="font-display font-bold text-[#1a0e02] text-base">Ticket submitted</p>
          <p className="text-sm text-[#64707d] mt-1">
            Your request will be reviewed by the Bedouin support team. We typically respond within 1–2 business days.
          </p>
        </div>
        <a
          href="/account"
          className="mt-1 text-sm font-semibold text-[#8b5e38] hover:underline"
        >
          View your tickets in your account →
        </a>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#e8dfd4] p-6 shadow-sm flex flex-col gap-5">

      {/* Section header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="h-[1px] w-5 bg-[#c49a4f]" />
          <p className="text-[#c49a4f] text-[10px] font-bold uppercase tracking-[0.16em]">Contact Us</p>
        </div>
        <h2 className="font-display font-bold text-[#1a0e02] text-xl">Submit a Support Ticket</h2>
        <p className="text-sm text-[#64707d] leading-relaxed">
          Your request will be reviewed by the Bedouin support team. We are here to help keep your experience safe and reliable.
        </p>
      </div>

      {/* Form */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[#1a0e02] uppercase tracking-wide">Issue Type</label>
          <select
            value={issueType}
            onChange={(e) => setIssueType(e.target.value as IssueType)}
            className="w-full border border-[#e8dfd4] rounded-xl px-3 py-2.5 text-sm text-[#1a0e02] focus:outline-none focus:border-[#8b5e38] bg-white transition-colors"
          >
            {ISSUE_TYPES.map((t) => (
              <option key={t} value={t}>{ISSUE_TYPE_LABELS[t]}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[#1a0e02] uppercase tracking-wide">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Briefly describe your issue…"
            maxLength={120}
            className="w-full border border-[#e8dfd4] rounded-xl px-3 py-2.5 text-sm text-[#1a0e02] placeholder:text-[#a09080] focus:outline-none focus:border-[#8b5e38] transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[#1a0e02] uppercase tracking-wide">Description</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide as much detail as possible — booking ID, dates, what happened…"
            className="w-full border border-[#e8dfd4] rounded-xl px-3 py-2.5 text-sm text-[#1a0e02] placeholder:text-[#a09080] focus:outline-none focus:border-[#8b5e38] resize-none transition-colors"
          />
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={isPending || !title.trim() || !description.trim()}
          className="w-full py-3 rounded-2xl bg-[#461e00] text-white text-sm font-bold hover:bg-[#5c2800] disabled:opacity-50 transition-colors"
        >
          {isPending ? "Submitting…" : "Submit Ticket"}
        </button>

        <p className="text-xs text-[#8b94a4] text-center leading-relaxed">
          Already have an account?{" "}
          <a href="/account" className="font-semibold text-[#8b5e38] hover:underline">
            View your tickets
          </a>{" "}
          in your account dashboard.
        </p>
      </div>
    </div>
  );
}
