"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ListingDraft, INITIAL_DRAFT, SubmittedListing } from "@/lib/types/host";
import { submitListing, type ListingPayload } from "@/lib/actions/listing";
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
  const [step,    setStep]    = useState<HostStep>(1);
  const [draft,   setDraft]   = useState<ListingDraft>(INITIAL_DRAFT);
  const [submitting,   setSubmitting]   = useState(false);
  const [submitted,    setSubmitted]    = useState<SubmittedListing | null>(null);
  const [submitError,  setSubmitError]  = useState<string | null>(null);

  /* Generic field updater — type-safe, works for all ListingDraft keys */
  const update = useCallback(
    <K extends keyof ListingDraft>(key: K, value: ListingDraft[K]) => {
      setDraft((d) => ({ ...d, [key]: value }));
    },
    []
  );

  /* Image management — URL-based (no file upload; avoids blob: persistence issue) */
  const addImages = useCallback((url: string) => {
    setDraft((d) => ({
      ...d,
      imagePreviewUrls: [...d.imagePreviewUrls, url].slice(0, 10),
    }));
  }, []);

  const removeImage = useCallback((index: number) => {
    setDraft((d) => ({
      ...d,
      imagePreviewUrls: d.imagePreviewUrls.filter((_, i) => i !== index),
    }));
  }, []);

  /* Submit — inserts into listing_submissions via Server Action */
  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    setSubmitError(null);

    // Construct a clean, fully-serializable payload.
    // Do NOT pass the full ListingDraft — it contains optional undefined fields
    // (hostId, submittedAt, listingRef) that can break Next.js wire-format encoding.
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
      imagePreviewUrls: draft.imagePreviewUrls,
      houseRules:       draft.houseRules,
    };
    console.log("[submitListing] action: submitListing | flow: create | payload:", payload);

    const result = await submitListing(payload);

    setSubmitting(false);

    if (!result.success) {
      setSubmitError(result.error);
      return;
    }

    setSubmitted(result.listing);
    setStep("confirmed");
  }, [draft]);

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
                  userId={userId}
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
