"use client";

import { useState } from "react";
import type { CoHost } from "@/lib/types/cohost";
import { INVITE_MODAL_LISTINGS } from "@/lib/data/cohost";

interface Props {
  cohost: CoHost;
  onConfirm: (listingId: string, listingTitle: string, message: string) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function InviteModal({ cohost, onConfirm, onCancel, isSubmitting }: Props) {
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [message, setMessage] = useState(
    `Salaam ${cohost.firstName}! I'm interested in working with you to co-host one of my listings. I'd love to discuss how we can collaborate.`
  );

  const selectedListing = INVITE_MODAL_LISTINGS.find((l) => l.id === selectedListingId);
  const canSubmit = !!selectedListingId && message.trim().length > 0 && !isSubmitting;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#1a0e02]/40 backdrop-blur-sm" onClick={onCancel} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-[#f0e8de]">
          <div className="flex items-center gap-3">
            <img
              src={cohost.avatar}
              alt={cohost.name}
              className="w-10 h-10 rounded-xl object-cover border-2 border-[#e8dfd4] shrink-0"
            />
            <div>
              <h2 className="font-display font-semibold text-[#1a0e02] text-sm">
                Invite {cohost.firstName} as co-host
              </h2>
              <p className="text-[11px] text-[#64707d]">
                📍 {cohost.city} · {cohost.rating}★ ({cohost.reviewCount} reviews)
              </p>
            </div>
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

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-5">

          {/* Listing selector */}
          <div>
            <label className="block text-[10px] font-bold text-[#64707d] uppercase tracking-widest mb-2">
              Select listing <span className="text-[#8b5e38]">*</span>
            </label>
            <div className="flex flex-col gap-2">
              {INVITE_MODAL_LISTINGS.map((listing) => (
                <button
                  key={listing.id}
                  type="button"
                  onClick={() => setSelectedListingId(listing.id)}
                  className={[
                    "flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                    selectedListingId === listing.id
                      ? "border-[#8b5e38] bg-[#fdf5ee]"
                      : "border-[#e8dfd4] hover:border-[#c49a4f] bg-white",
                  ].join(" ")}
                >
                  <img
                    src={listing.image}
                    alt={listing.title}
                    className="w-12 h-9 rounded-lg object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1a0e02] truncate">{listing.title}</p>
                    <p className="text-[11px] text-[#64707d]">📍 {listing.region}</p>
                  </div>
                  {selectedListingId === listing.id && (
                    <div className="w-5 h-5 rounded-full bg-[#8b5e38] flex items-center justify-center shrink-0">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                        <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-[10px] font-bold text-[#64707d] uppercase tracking-widest mb-1.5">
              Message to {cohost.firstName} <span className="text-[#8b5e38]">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-[#e8dfd4] rounded-xl text-sm text-[#1a0e02] placeholder:text-[#a09080] focus:outline-none focus:border-[#8b5e38] resize-none transition-colors bg-white"
            />
            <p className="text-[10px] text-[#a09080] mt-1">{message.length} characters</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 pb-5">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 border border-[#e8dfd4] rounded-xl text-sm font-semibold text-[#64707d] hover:border-[#8b5e38] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() =>
              selectedListing && canSubmit &&
              onConfirm(selectedListing.id, selectedListing.title, message.trim())
            }
            disabled={!canSubmit}
            className="flex-[2] py-2.5 bg-[#8b5e38] text-white rounded-xl text-sm font-semibold hover:bg-[#7a5030] transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="15" />
                </svg>
                Sending invite…
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M22 2L15 22 11 13 2 9l20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Send invitation
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
