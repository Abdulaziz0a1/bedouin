"use client";

import { useState } from "react";
import type { RejectionStep } from "@/lib/actions/admin";

/* ─── Step catalogue ─────────────────────────────────────────────────────── */

const REJECTION_CATEGORIES: {
  id:    RejectionStep;
  label: string;
  step:  number;
  hint:  string;
}[] = [
  { id: "media",          label: "Photos / Media",          step: 6, hint: "Images are missing, low quality, or inappropriate." },
  { id: "description",    label: "Title / Description",      step: 2, hint: "Title or description is unclear, too short, or misleading." },
  { id: "location",       label: "Location",                 step: 3, hint: "Location or Google Maps link is missing or inaccurate." },
  { id: "pricing",        label: "Pricing",                  step: 5, hint: "Price is missing, inconsistent, or not aligned with quality." },
  { id: "capacity_rules", label: "Capacity / House Rules",   step: 3, hint: "Capacity, min nights, or house rules are incomplete." },
  { id: "amenities",      label: "Amenities",                step: 4, hint: "Too few amenities or inaccurate amenity selections." },
  { id: "category",       label: "Property Type",            step: 1, hint: "Property type doesn't match Bedouin's platform focus." },
];

const QUICK_REASONS = [
  "Photos do not meet quality standards (min. 4 high-resolution images required).",
  "Listing does not align with Bedouin's platform focus (farm, desert, nature, or cultural experiences only).",
  "Description is too brief — please add at least 150 words describing the experience.",
  "Pricing appears inconsistent with the listing quality or region.",
  "Location information is incomplete or inaccurate.",
  "House rules are missing or insufficient.",
];

export interface RejectPayload {
  reason: string;
  steps:  RejectionStep[];
}

interface RejectModalProps {
  listingTitle: string;
  onConfirm:    (payload: RejectPayload) => void;
  onCancel:     () => void;
  isSubmitting: boolean;
}

export default function RejectModal({
  listingTitle, onConfirm, onCancel, isSubmitting,
}: RejectModalProps) {
  const [reason,        setReason]        = useState("");
  const [selectedSteps, setSelectedSteps] = useState<RejectionStep[]>([]);

  const toggleStep = (id: RejectionStep) => {
    setSelectedSteps((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleQuickReason = (r: string) => {
    setReason((prev) => prev ? `${prev.trimEnd()} ${r}` : r);
  };

  const canSubmit = selectedSteps.length > 0 && reason.trim().length > 0;

  const handleConfirm = () => {
    if (!canSubmit) return;
    onConfirm({ reason: reason.trim(), steps: selectedSteps });
  };

  const selectedHints = REJECTION_CATEGORIES
    .filter((c) => selectedSteps.includes(c.id))
    .map((c) => c.hint);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#1a0e02]/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-[#f0e8de] shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </div>
              <h2 className="font-display font-semibold text-[#1a0e02]">Reject listing</h2>
            </div>
            <p className="text-xs text-[#64707d] line-clamp-1">
              &ldquo;{listingTitle}&rdquo; — this decision will notify the host.
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg hover:bg-[#f4f6f8] transition-colors shrink-0 text-[#64707d]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="px-6 py-5 flex flex-col gap-5 overflow-y-auto">

          {/* Step multi-select */}
          <div>
            <p className="text-[10px] font-bold text-[#64707d] uppercase tracking-widest mb-2">
              Which steps need fixing?{" "}
              <span className="text-[#a09080] normal-case font-normal">
                (select all that apply — host is taken to the first one)
              </span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              {REJECTION_CATEGORIES.map((cat) => {
                const active = selectedSteps.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleStep(cat.id)}
                    className={[
                      "text-left px-3 py-2.5 rounded-xl border text-xs transition-all",
                      active
                        ? "border-red-400 bg-red-50 text-red-700 font-semibold"
                        : "border-[#e8dfd4] bg-[#faf7f4] text-[#64707d] hover:border-[#8b5e38]",
                    ].join(" ")}
                  >
                    <span className="font-semibold text-[10px] block mb-0.5 flex items-center gap-1">
                      <span className={active ? "text-red-400" : "text-[#a09080]"}>Step {cat.step}</span>
                      {active && (
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" className="inline text-red-500">
                          <path d="M5 12l5 5 9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Hint list for selected steps */}
            {selectedHints.length > 0 && (
              <div className="mt-2 px-1 flex flex-col gap-1">
                {selectedHints.map((hint, i) => (
                  <p key={i} className="text-[10px] text-[#64707d] flex items-start gap-1">
                    <span className="text-red-400 mt-0.5 shrink-0">•</span>
                    {hint}
                  </p>
                ))}
              </div>
            )}

            {selectedSteps.length === 0 && (
              <p className="text-[10px] text-red-400 mt-1.5 px-1">
                Select at least one step that needs fixing.
              </p>
            )}
          </div>

          {/* Quick reason chips */}
          <div>
            <p className="text-[10px] font-bold text-[#64707d] uppercase tracking-widest mb-2">
              Quick reasons (click to add)
            </p>
            <div className="flex flex-col gap-1.5">
              {QUICK_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleQuickReason(r)}
                  className="text-left text-xs text-[#64707d] bg-[#faf7f4] border border-[#e8dfd4] px-3 py-2 rounded-xl hover:border-[#8b5e38] hover:text-[#1a0e02] transition-all line-clamp-2"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Reason textarea */}
          <div>
            <label className="block text-[10px] font-bold text-[#64707d] uppercase tracking-widest mb-1.5">
              Rejection message to host <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain clearly why the listing was not approved and what the host can do to resubmit successfully…"
              rows={4}
              className="w-full px-4 py-3 border border-[#e8dfd4] rounded-xl text-sm text-[#1a0e02] placeholder:text-[#a09080] focus:outline-none focus:border-[#8b5e38] resize-none transition-colors bg-white"
            />
            <p className="text-[10px] text-[#a09080] mt-1">
              {reason.length} characters — aim for at least 50 for a useful rejection message.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 pb-5 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 border border-[#e8dfd4] rounded-xl text-sm font-semibold text-[#64707d] hover:border-[#8b5e38] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canSubmit || isSubmitting}
            className="flex-[2] py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="15" />
                </svg>
                Rejecting…
              </>
            ) : (
              "Reject listing"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
