"use client";

import { useState, useTransition } from "react";
import { cancelBooking } from "@/lib/actions/booking";
import { useLanguage } from "@/context/LanguageProvider";

interface CancelBookingModalProps {
  bookingId:    string;
  listingTitle: string;
  checkIn:      string;
  checkOut:     string;
  onClose:      () => void;
  onCancelled:  (bookingId: string) => void;
}

export default function CancelBookingModal({
  bookingId,
  listingTitle,
  checkIn,
  checkOut,
  onClose,
  onCancelled,
}: CancelBookingModalProps) {
  const [reason, setReason]   = useState("");
  const [error, setError]     = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { t } = useLanguage();

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      const result = await cancelBooking(bookingId, reason.trim() || undefined);
      if (result.success) {
        onCancelled(bookingId);
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
        <div className="bg-red-50 border-b border-red-100 px-6 py-5 flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-red-500">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
              <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h2 className="font-display font-bold text-[#1a0e02] text-base leading-snug">
              {t("cancel.title")}
            </h2>
            <p className="text-xs text-[#64707d] mt-0.5">
              {listingTitle} · {fmtDate(checkIn)} – {fmtDate(checkOut)}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          <p className="text-sm text-[#64707d] leading-relaxed">
            {t("cancel.body")}
          </p>

          {/* Optional reason */}
          <div>
            <label className="block text-[10px] font-bold text-[#64707d] uppercase tracking-widest mb-1.5">
              {t("cancel.reason_label")}
              <span className="ml-1 text-[#a09080] font-normal normal-case tracking-normal">{t("cancel.optional")}</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t("cancel.placeholder")}
              className="w-full border border-[#e8dfd4] rounded-xl px-3 py-2.5 text-sm text-[#1a0e02] placeholder:text-[#a09080] focus:outline-none focus:border-[#8b5e38] resize-none transition-colors"
            />
            <p className="text-[10px] text-[#a09080] mt-1">
              {t("cancel.feedback")}
            </p>
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
            {t("cancel.keep")}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className="flex-1 py-3 bg-red-600 text-white rounded-2xl text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
                </svg>
                {t("cancel.confirming")}
              </>
            ) : (
              t("cancel.confirm")
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
