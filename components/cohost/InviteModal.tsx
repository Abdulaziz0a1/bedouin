"use client";

import { useState } from "react";
import type { CoHost, InviteModalListing } from "@/lib/types/cohost";

interface Props {
  cohost:           CoHost;
  listings:         InviteModalListing[];
  defaultListingId?: string | null;
  onConfirm:        (listingId: string, listingTitle: string, listingImage: string, message: string) => void;
  onCancel:         () => void;
  isSubmitting:     boolean;
}

export default function InviteModal({
  cohost,
  listings,
  defaultListingId = null,
  onConfirm,
  onCancel,
  isSubmitting,
}: Props) {
  // Pre-select the listing if a specific one was linked from the dashboard
  const [selectedListingId, setSelectedListingId] = useState<string | null>(
    () => defaultListingId && listings.some((l) => l.id === defaultListingId) ? defaultListingId : null
  );
  const [message, setMessage] = useState(
    `Salaam ${cohost.firstName}! I'm interested in working with you to co-host one of my listings. I'd love to discuss how we can collaborate.`
  );

  const selectedListing = listings.find((l) => l.id === selectedListingId);
  const canSubmit = !!selectedListingId && message.trim().length > 0 && !isSubmitting;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#1a0e02]/40 backdrop-blur-sm" onClick={onCancel} />

      {/* Modal */}
      <div
        className="relative bg-white w-full max-w-lg overflow-hidden"
        style={{
          borderRadius: "22px",
          boxShadow: "0 24px 80px rgba(26,14,2,0.22), 0 8px 28px rgba(26,14,2,0.12)",
          border: "1px solid rgba(232,223,212,0.70)",
        }}
      >
        {/* Gold accent top bar */}
        <div
          className="h-[2px]"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(196,154,79,0.70) 30%, rgba(240,200,74,0.90) 50%, rgba(196,154,79,0.70) 70%, transparent)",
          }}
        />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-5" style={{ borderBottom: "1px solid var(--border-light)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f0e8de] flex items-center justify-center shrink-0 text-[#8b5e38] font-bold text-sm border-2 border-[#e8dfd4]">
              {cohost.firstName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-display font-semibold text-[#1a0e02] text-sm">
                Invite {cohost.firstName} as co-host
              </h2>
              <p className="text-[11px] text-[#64707d]">
                📍 {cohost.city}
                {cohost.rating > 0 && ` · ${cohost.rating}★ (${cohost.reviewCount} reviews)`}
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
        <div className="px-6 py-5 flex flex-col gap-5 max-h-[60vh] overflow-y-auto">

          {/* Listing selector */}
          <div>
            <label className="block text-[10px] font-bold text-[#64707d] uppercase tracking-widest mb-2">
              Select listing <span className="text-[#8b5e38]">*</span>
            </label>

            {listings.length === 0 ? (
              <div className="flex flex-col items-center text-center py-6 px-4 border border-dashed border-[#e8dfd4] rounded-xl">
                <p className="text-sm font-semibold text-[#1a0e02] mb-1">No live listings yet</p>
                <p className="text-xs text-[#64707d]">
                  You need at least one approved listing to invite a co-host.{" "}
                  <a href="/host/new" className="text-[#8b5e38] font-semibold underline">
                    Add a listing →
                  </a>
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {listings.map((listing) => (
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
                    {listing.image ? (
                      <img
                        src={listing.image}
                        alt={listing.title}
                        className="w-12 h-9 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-9 rounded-lg bg-[#f0e8de] shrink-0 flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#a09080]">
                          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
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
            )}
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
              className="input-field resize-none"
              style={{ borderRadius: "12px" }}
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
            disabled={!canSubmit || listings.length === 0}
            onClick={() => {
              if (selectedListing && canSubmit) {
                onConfirm(
                  selectedListing.id,
                  selectedListing.title,
                  selectedListing.image,
                  message.trim()
                );
              }
            }}
            className="flex-[2] py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40 flex items-center justify-center gap-2 transition-all duration-150"
            style={{
              background: "linear-gradient(135deg, #8b5e38 0%, #6a4428 100%)",
              color: "white",
              boxShadow: "0 4px 14px rgba(139,94,56,0.28)",
            }}
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
