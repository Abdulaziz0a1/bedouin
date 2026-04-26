"use client";

import { useState, useTransition } from "react";
import { requestListingCancellation } from "@/lib/actions/cancellation";

interface RequestListingCancellationModalProps {
  submissionId:  string;
  listingTitle:  string;
  onClose:       () => void;
  onSuccess:     () => void;
}

export default function RequestListingCancellationModal({
  submissionId,
  listingTitle,
  onClose,
  onSuccess,
}: RequestListingCancellationModalProps) {
  const [reason, setReason]           = useState("");
  const [error, setError]             = useState<string | null>(null);
  const [isPending, startTransition]  = useTransition();

  const handleSubmit = () => {
    if (!reason.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await requestListingCancellation(submissionId, reason);
      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="bg-[#fdf8ee] border-b border-[#ead9a6] px-6 py-5 flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-[#fef3ce] flex items-center justify-center shrink-0 mt-0.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[#8b6a1f]">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h2 className="font-display font-bold text-[#1a0e02] text-base leading-snug">
              Request listing cancellation
            </h2>
            <p className="text-xs text-[#64707d] mt-0.5">{listingTitle}</p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="bg-[#faf7f4] border border-[#e8dfd4] rounded-xl px-4 py-3">
            <p className="text-xs text-[#64707d] leading-relaxed">
              Your request will be reviewed by our team. The listing will stay active until
              the admin approves the cancellation. You can message us if you need urgent action.
            </p>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#64707d] uppercase tracking-widest mb-1.5">
              Please explain why you want to cancel this experience.
              <span className="ml-1 text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => { setReason(e.target.value); setError(null); }}
              placeholder="e.g. I am no longer able to host, property is undergoing renovations…"
              className="w-full border border-[#e8dfd4] rounded-xl px-3 py-2.5 text-sm text-[#1a0e02] placeholder:text-[#a09080] focus:outline-none focus:border-[#8b5e38] resize-none transition-colors"
            />
            {!reason.trim() && (
              <p className="text-[10px] text-[#a09080] mt-1">A reason is required to submit this request.</p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="flex-1 py-3 border border-[#e8dfd4] rounded-2xl text-sm font-semibold text-[#64707d] hover:bg-[#f0e8de] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !reason.trim()}
            className="flex-[2] py-3 bg-[#8b5e38] text-white rounded-2xl text-sm font-bold hover:bg-[#7a5030] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
                </svg>
                Submitting…
              </>
            ) : (
              "Submit request"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
