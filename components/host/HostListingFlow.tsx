"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ListingDraft, INITIAL_DRAFT, SubmittedListing } from "@/lib/types/host";
import type { ListingPayload, SubmitListingResult } from "@/lib/types/listing";
import { uploadImages, deleteUploadedImages } from "@/lib/client/upload-images";
import HostStepProgress from "./HostStepProgress";
import HostListingPreview from "./HostListingPreview";
import HostConfirmation from "./HostConfirmation";
import Step1Type        from "./steps/Step1Type";
import Step2About       from "./steps/Step2About";
import Step3Details     from "./steps/Step3Details";
import Step4Amenities   from "./steps/Step4Amenities";
import Step5Pricing     from "./steps/Step5Pricing";
import Step6Review      from "./steps/Step6Review";

type HostStep = 1 | 2 | 3 | 4 | 5 | 6 | "confirmed";

/* ─── Component ────────────────────────────────────────────────────────────── */

export default function HostListingFlow({ userId }: { userId: string }) {
  const [step,         setStep]        = useState<HostStep>(1);
  const [draft,        setDraft]       = useState<ListingDraft>(INITIAL_DRAFT);
  // Parallel array: File object for each blob URL, null for http URLs (URL fallback)
  const [imageFiles,   setImageFiles]  = useState<(File | null)[]>([]);
  const [submitting,   setSubmitting]  = useState(false);
  const [submitted,    setSubmitted]   = useState<SubmittedListing | null>(null);
  const [submitError,  setSubmitError] = useState<string | null>(null);

  const update = useCallback(
    <K extends keyof ListingDraft>(key: K, value: ListingDraft[K]) => {
      setDraft((d) => ({ ...d, [key]: value }));
    },
    []
  );

  const addImages = useCallback((url: string, file?: File) => {
    setDraft((d) => ({
      ...d,
      imagePreviewUrls: [...d.imagePreviewUrls, url].slice(0, 10),
    }));
    setImageFiles((prev) => [...prev, file ?? null].slice(0, 10));
  }, []);

  const removeImage = useCallback((index: number) => {
    setDraft((d) => {
      const url = d.imagePreviewUrls[index];
      if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
      return {
        ...d,
        imagePreviewUrls: d.imagePreviewUrls.filter((_, i) => i !== index),
      };
    });
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    setSubmitError(null);

    // Tracks Storage paths uploaded this attempt so we can roll them back if
    // the DB write fails — preventing orphaned files in Supabase Storage.
    let uploadedPaths: string[] = [];

    try {
      // Step 1 — upload any new File objects (blob URLs) to Storage.
      // Existing https URLs pass through unchanged.
      console.log("[submit] step 1/2 — uploading images…", {
        total: draft.imagePreviewUrls.length,
        toUpload: imageFiles.filter(Boolean).length,
      });
      const { urls: finalImageUrls, uploadedPaths: newPaths } =
        await uploadImages(draft.imagePreviewUrls, imageFiles, userId);
      uploadedPaths = newPaths;

      // Step 2 — write to DB via stable Route Handler (not a Server Action).
      // fetch() to a path is never affected by Fast Refresh stale action IDs.
      console.log("[submit] step 2/2 — POST /api/host/listings/submit…");
      const payload: ListingPayload = {
        category:         draft.category,
        title:            draft.title,
        description:      draft.description,
        highlights:       draft.highlights,
        region:           draft.region,
        location:         draft.location,
        mapsUrl:          draft.mapsUrl,
        maxGuests:        draft.maxGuests,
        bedrooms:         draft.bedrooms,
        beds:             draft.beds,
        baths:            draft.baths,
        minNights:        draft.minNights,
        checkInTime:      draft.checkInTime,
        checkOutTime:     draft.checkOutTime,
        amenities:        draft.amenities,
        price:            draft.price,
        originalPrice:    draft.originalPrice,
        priceUnit:        draft.priceUnit,
        imagePreviewUrls: finalImageUrls,
        houseRules:       draft.houseRules,
      };

      const response = await fetch("/api/host/listings/submit", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });

      // HTTP-level failures (401, 500) mean something threw on the server
      if (!response.ok) {
        const body = await response.json().catch(() => ({})) as { error?: string };
        throw new Error(body.error ?? `Server error (${response.status})`);
      }

      const result = await response.json() as SubmitListingResult;
      console.log("[submit] API result:", result);

      if (!result.success) {
        await deleteUploadedImages(uploadedPaths);
        setSubmitError(result.error);
        return;
      }

      setSubmitted(result.listing);
      setStep("confirmed");
    } catch (err) {
      console.error("[submit] caught:", err);
      // Roll back any files that were uploaded before the failure
      await deleteUploadedImages(uploadedPaths);

      const raw = err instanceof Error ? err.message : "Submission failed — please try again.";
      // "Invalid Server Actions request" = dev Fast Refresh stale module — page needs a hard reload
      const msg = raw.includes("Invalid Server Actions request")
        ? "The page needs to be refreshed. Please refresh and try again."
        : raw;
      setSubmitError(msg);
    } finally {
      // Always release the button — success, structured error, or thrown exception
      setSubmitting(false);
    }
  }, [draft, imageFiles, userId]);

  /* ─── Confirmation ─────────────────────────────────────────────────── */
  if (step === "confirmed" && submitted) {
    return <HostConfirmation listing={submitted} />;
  }

  const currentStep = step as 1 | 2 | 3 | 4 | 5 | 6;

  /* ─── Main layout ──────────────────────────────────────────────────── */
  return (
    <div className="bg-[#f4efe6] min-h-[calc(100vh-72px)]">

      {/* Step progress bar */}
      <div className="bg-white border-b border-[#e8dfd4] py-5 sticky top-[72px] z-30">
        <div className="max-w-[1232px] mx-auto px-6 lg:px-0">
          <HostStepProgress currentStep={currentStep} />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1232px] mx-auto px-6 lg:px-0 py-8 lg:py-12">

        {/* Back link */}
        <Link
          href="/host"
          className="inline-flex items-center gap-2 text-sm text-[#64707d] hover:text-[#1a0e02] transition-colors mb-8 group"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            className="group-hover:-translate-x-0.5 transition-transform">
            <path d="M19 12H5M12 5l-7 7 7 7"
              stroke="currentColor" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Host Overview
        </Link>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 items-start">

          {/* ── Left: current step ─────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {currentStep === 1 && (
              <Step1Type
                category={draft.category}
                onChange={(v) => update("category", v)}
                onNext={() => setStep(2)}
              />
            )}
            {currentStep === 2 && (
              <Step2About
                title={draft.title}
                description={draft.description}
                highlights={draft.highlights}
                onChangeTitle={(v)       => update("title",       v)}
                onChangeDesc={(v)        => update("description",  v)}
                onChangeHighlights={(v)  => update("highlights",   v)}
                onNext={() => setStep(3)}
                onBack={() => setStep(1)}
              />
            )}
            {currentStep === 3 && (
              <Step3Details
                draft={draft}
                onChange={update}
                onNext={() => setStep(4)}
                onBack={() => setStep(2)}
              />
            )}
            {currentStep === 4 && (
              <Step4Amenities
                selected={draft.amenities}
                onChange={(v) => update("amenities", v)}
                onNext={() => setStep(5)}
                onBack={() => setStep(3)}
              />
            )}
            {currentStep === 5 && (
              <Step5Pricing
                price={draft.price}
                originalPrice={draft.originalPrice}
                priceUnit={draft.priceUnit}
                onChangePrice={(v)         => update("price",         v)}
                onChangeOriginal={(v)      => update("originalPrice", v)}
                onChangePriceUnit={(v)     => update("priceUnit",     v)}
                onNext={() => setStep(6)}
                onBack={() => setStep(4)}
              />
            )}
            {currentStep === 6 && (
              <>
                {submitError && (
                  <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-red-500 shrink-0 mt-0.5">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
                      <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <p className="text-sm text-red-600">{submitError}</p>
                  </div>
                )}
                <Step6Review
                  draft={draft}
                  onChangeImages={{ add: addImages, remove: removeImage }}
                  onChangeRules={(v) => update("houseRules", v)}
                  onSubmit={handleSubmit}
                  onBack={() => setStep(5)}
                  isSubmitting={submitting}
                />
              </>
            )}
          </div>

          {/* ── Right: live preview ───────────────────────────────── */}
          <div className="w-full lg:w-[360px] shrink-0 sticky top-[148px]">
            <HostListingPreview draft={draft} currentStep={currentStep} />
          </div>
        </div>
      </div>
    </div>
  );
}
