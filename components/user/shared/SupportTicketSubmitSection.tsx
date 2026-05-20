"use client";

import { useState, useTransition } from "react";
import type { IssueType } from "@/lib/types/support";
import { ISSUE_TYPE_LABELS } from "@/lib/types/support";
import { createSupportTicket } from "@/lib/actions/support";
import { useLanguage } from "@/context/LanguageProvider";

const ISSUE_TYPES: IssueType[] = [
  "booking_issue", "payment_issue", "host_issue",
  "tourist_issue", "safety_concern", "listing_problem", "other",
];

export default function SupportTicketSubmitSection() {
  const { t } = useLanguage();
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
          <p className="font-display font-bold text-[#1a0e02] text-base">{t("support.form.success.title")}</p>
          <p className="text-sm text-[#64707d] mt-1">{t("support.form.success.desc")}</p>
        </div>
        <a
          href="/account"
          className="mt-1 text-sm font-semibold text-[#8b5e38] hover:underline"
        >
          {t("support.form.success.link")}
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
          <p className="text-[#c49a4f] text-[10px] font-bold uppercase tracking-[0.16em]">{t("support.form.eyebrow")}</p>
        </div>
        <h2 className="font-display font-bold text-[#1a0e02] text-xl">{t("support.form.title")}</h2>
        <p className="text-sm text-[#64707d] leading-relaxed">{t("support.form.desc")}</p>
      </div>

      {/* Form */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[#1a0e02] uppercase tracking-wide">{t("support.form.issue_type")}</label>
          <select
            value={issueType}
            onChange={(e) => setIssueType(e.target.value as IssueType)}
            className="w-full border border-[#e8dfd4] rounded-xl px-3 py-2.5 text-sm text-[#1a0e02] focus:outline-none focus:border-[#8b5e38] bg-white transition-colors"
          >
            {ISSUE_TYPES.map((type) => (
              <option key={type} value={type}>{ISSUE_TYPE_LABELS[type]}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[#1a0e02] uppercase tracking-wide">{t("support.form.field_title")}</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("support.form.title_placeholder")}
            maxLength={120}
            className="w-full border border-[#e8dfd4] rounded-xl px-3 py-2.5 text-sm text-[#1a0e02] placeholder:text-[#a09080] focus:outline-none focus:border-[#8b5e38] transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[#1a0e02] uppercase tracking-wide">{t("support.form.field_description")}</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("support.form.desc_placeholder")}
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
          {isPending ? t("support.form.submitting") : t("support.form.submit")}
        </button>

        <p className="text-xs text-[#8b94a4] text-center leading-relaxed">
          {t("support.form.have_account")}{" "}
          <a href="/account" className="font-semibold text-[#8b5e38] hover:underline">
            {t("support.form.view_tickets")}
          </a>{" "}
          {t("support.form.in_dashboard")}
        </p>
      </div>
    </div>
  );
}
