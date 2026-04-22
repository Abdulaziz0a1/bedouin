"use client";

import { useState, useEffect } from "react";
import StarPicker from "./StarPicker";
import { submitReview } from "@/lib/actions/reviews";

interface LeaveReviewModalProps {
  bookingId:    string;
  listingTitle: string;
  onClose:      () => void;
  onSuccess:    () => void;
}

export default function LeaveReviewModal({
  bookingId,
  listingTitle,
  onClose,
  onSuccess,
}: LeaveReviewModalProps) {
  const [rating,  setRating]  = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    if (comment.trim().length < 10) {
      setError("Comment must be at least 10 characters.");
      return;
    }

    setLoading(true);
    const result = await submitReview(bookingId, rating, comment);
    setLoading(false);

    if (result.success) {
      onSuccess();
    } else {
      setError(result.error ?? "Something went wrong. Please try again.");
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal card */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0e8de]">
          <div>
            <h2 className="font-display font-bold text-[#1a0e02] text-base">Leave a review</h2>
            <p className="text-xs text-[#64707d] mt-0.5 line-clamp-1">{listingTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#f0e8de] transition-colors text-[#64707d] hover:text-[#1a0e02]"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-6 py-5">

          {/* Star picker */}
          <div className="flex flex-col items-center gap-1">
            <p className="text-xs font-bold text-[#64707d] uppercase tracking-widest mb-1">
              Overall rating
            </p>
            <StarPicker value={rating} onChange={setRating} />
          </div>

          {/* Comment */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#1a0e02] uppercase tracking-wide">
              Your experience
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share what made your stay memorable…"
              rows={4}
              maxLength={1000}
              disabled={loading}
              className="w-full border border-[#e8dfd4] rounded-xl px-4 py-3 text-sm text-[#1a0e02] placeholder:text-[#a09080] outline-none focus:border-[#c49a4f] transition-colors resize-none disabled:opacity-50"
            />
            <p className="text-[11px] text-[#a09080] text-right">
              {comment.length} / 1000
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-red-500 shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
                <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 border border-[#e8dfd4] rounded-xl text-sm font-semibold text-[#64707d] hover:border-[#8b5e38] hover:text-[#8b5e38] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-[#461e00] text-white rounded-xl text-sm font-bold hover:bg-[#5a2900] active:bg-[#3a1800] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="15" />
                  </svg>
                  Submitting…
                </>
              ) : (
                "Submit review"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
