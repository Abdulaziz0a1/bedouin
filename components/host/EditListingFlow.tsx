"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ListingDraft } from "@/lib/types/host";
import type { ListingPayload, UpdateListingResult } from "@/lib/types/listing";
import { uploadImages, deleteUploadedImages } from "@/lib/client/upload-images";
import HostStepProgress    from "./HostStepProgress";
import HostListingPreview  from "./HostListingPreview";
import Step1Type           from "./steps/Step1Type";
import Step2About          from "./steps/Step2About";
import Step3Details        from "./steps/Step3Details";
import Step4Amenities      from "./steps/Step4Amenities";
import Step5Pricing        from "./steps/Step5Pricing";
import Step6Review         from "./steps/Step6Review";
import AlertBanner         from "@/components/ui/AlertBanner";

type EditStep = 1 | 2 | 3 | 4 | 5 | 6 | "saved";

/** Maps step-key strings to the form step numbers 1–6. */
const STEP_KEY_TO_NUMBER: Record<string, number> = {
  category:       1,
  description:    2,
  location:       3,
  capacity_rules: 3,
  amenities:      4,
  pricing:        5,
  media:          6,
};

const STEP_KEY_TO_LABEL: Record<string, string> = {
  category:       "Property Type",
  description:    "Title & Description",
  location:       "Location & Details",
  capacity_rules: "Capacity & Rules",
  amenities:      "Amenities",
  pricing:        "Pricing",
  media:          "Photos & Media",
};

interface EditListingFlowProps {
  submissionId:    string;
  initialDraft:    ListingDraft;
  currentStatus:   "pending_review" | "rejected" | "draft";
  rejectionReason?: string;
  /** Step keys that admin flagged as needing fixes (e.g. ["location", "media"]). */
  rejectedSteps?:  string[];
  listingTitle:    string;
  userId:          string;
  /** If provided, the form opens directly at this step (1–6). */
  initialStep?:    1 | 2 | 3 | 4 | 5 | 6;
  /** True when this listing was created via "Use as template". */
  fromTemplate?:   boolean;
}

function simpleHash(str: string): string {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h) + str.charCodeAt(i);
  return (h >>> 0).toString(36);
}

/* ─── Template Notice Banner ────────────────────────────────────────────────── */

function TemplateBanner({ storageKey }: { storageKey: string }) {
  return (
    <AlertBanner
      variant="warning"
      title="You are using a previous listing as a template"
      description="The fields below are pre-filled from your original listing. Review and update the title, location, photos, price, and capacity before submitting for admin review."
      icon={
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M8 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      }
      dismissible
      storageKey={storageKey}
      className="mb-8"
    />
  );
}

/* ─── Rejection Banner ──────────────────────────────────────────────────────── */

function RejectionBanner({
  reason,
  rejectedSteps,
  onDismiss,
}: {
  reason: string;
  rejectedSteps: string[];
  onDismiss: () => void;
}) {
  const stepLabels = [...new Set(
    rejectedSteps.map((k) => STEP_KEY_TO_LABEL[k]).filter(Boolean)
  )];

  return (
    <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 mb-8">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-red-500 shrink-0 mt-0.5">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-red-700 mb-1">This listing was rejected</p>
        {stepLabels.length > 0 && (
          <p className="text-xs text-red-600 font-medium mb-1.5">
            Admin requested changes in:{" "}
            <span className="font-bold">{stepLabels.join(", ")}</span>
            . These steps are highlighted in the progress bar above.
          </p>
        )}
        <p className="text-sm text-red-600 leading-relaxed">{reason}</p>
        <p className="text-xs text-red-500 mt-2">
          Fix the highlighted steps, then save and resubmit. The listing will be re-queued for admin review.
        </p>
      </div>
      <button
        onClick={onDismiss}
        className="text-red-400 hover:text-red-600 transition-colors shrink-0"
        aria-label="Dismiss"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

/* ─── Save Confirmation ─────────────────────────────────────────────────────── */

function SaveConfirmation({ title, isTemplate }: { title: string; isTemplate?: boolean }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="bg-white border border-[#e8dfd4] rounded-3xl p-10 max-w-md w-full text-center shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-[#f0faf5] flex items-center justify-center mx-auto mb-5">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" className="text-[#049153]">
            <path d="M5 12l5 5 9-9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>
        <h2 className="font-display font-extrabold text-[#1a0e02] text-2xl mb-2">
          {isTemplate ? "Submitted for review" : "Changes saved"}
        </h2>
        <p className="text-[#64707d] text-sm mb-1">
          <span className="font-semibold text-[#1a0e02]">{title}</span>{" "}
          {isTemplate ? "has been submitted for admin review." : "has been resubmitted for review."}
        </p>
        <p className="text-xs text-[#a09080] mb-8">
          Our team will review your listing and notify you within 48 hours.
        </p>
        <a
          href="/dashboard"
          className="block w-full py-3 bg-[#461e00] text-white text-sm font-semibold rounded-xl hover:bg-[#5a2800] transition-colors"
        >
          Back to Dashboard
        </a>
      </div>
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────────────────────── */

export default function EditListingFlow({
  submissionId,
  initialDraft,
  currentStatus,
  rejectionReason,
  rejectedSteps = [],
  listingTitle,
  userId,
  initialStep,
  fromTemplate,
}: EditListingFlowProps) {
  const router = useRouter();

  // Derive the unique step numbers flagged by admin (dedup location+capacity_rules both = 3)
  const rejectedStepNumbers = [...new Set(
    rejectedSteps.map((k) => STEP_KEY_TO_NUMBER[k]).filter(Boolean)
  )] as number[];

  // Open at: explicit initialStep → first rejected step → step 1
  const computedInitialStep: 1 | 2 | 3 | 4 | 5 | 6 =
    initialStep ??
    (rejectedStepNumbers.length > 0
      ? (Math.min(...rejectedStepNumbers) as 1 | 2 | 3 | 4 | 5 | 6)
      : 1);

  const [step,          setStep]          = useState<EditStep>(computedInitialStep);
  const [draft,         setDraft]         = useState<ListingDraft>(initialDraft);
  // Parallel array: File for new blob URLs, null for existing http URLs
  const [imageFiles,    setImageFiles]    = useState<(File | null)[]>(
    () => initialDraft.imagePreviewUrls.map(() => null)
  );
  const [saving,        setSaving]        = useState(false);
  const [saveError,     setSaveError]     = useState<string | null>(null);
  const rejectionStorageKey = `bdw:alert:rejection:${submissionId}:${simpleHash(
    [...rejectedSteps].sort().join(",") + "|" + (rejectionReason ?? "")
  )}`;
  const templateStorageKey = `bdw:alert:template:${submissionId}`;

  const [showRejection, setShowRejection] = useState(
    currentStatus === "rejected" && (!!rejectionReason || rejectedSteps.length > 0)
  );

  useEffect(() => {
    if (localStorage.getItem(rejectionStorageKey) === "1") {
      setShowRejection(false);
    }
  }, [rejectionStorageKey]);

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

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaveError(null);

    let uploadedPaths: string[] = [];

    try {
      console.log("[save] step 1/2 — uploading images…", {
        total: draft.imagePreviewUrls.length,
        toUpload: imageFiles.filter(Boolean).length,
      });
      const { urls: finalImageUrls, uploadedPaths: newPaths } =
        await uploadImages(draft.imagePreviewUrls, imageFiles, userId);
      uploadedPaths = newPaths;

      console.log("[save] step 2/2 — PATCH /api/host/listings/…");
      const payload: ListingPayload = {
        category:         draft.category,
        title:            draft.title,
        ...(draft.title_ar?.trim()       && { title_ar:       draft.title_ar }),
        description:      draft.description,
        ...(draft.description_ar?.trim() && { description_ar: draft.description_ar }),
        highlights:       draft.highlights,
        region:           draft.region,
        location:         draft.location,
        ...(draft.location_ar?.trim()    && { location_ar:    draft.location_ar }),
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

      const response = await fetch(`/api/host/listings/${submissionId}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({})) as { error?: string };
        throw new Error(body.error ?? `Server error (${response.status})`);
      }

      const result = await response.json() as UpdateListingResult;
      console.log("[save] API result:", result);

      if (!result.success) {
        await deleteUploadedImages(uploadedPaths);
        setSaveError(result.error);
        return;
      }

      setStep("saved");
      router.refresh();
    } catch (err) {
      console.error("[save] caught:", err);
      await deleteUploadedImages(uploadedPaths);

      const raw = err instanceof Error ? err.message : "Save failed — please try again.";
      const msg = raw.includes("Invalid Server Actions request")
        ? "The page needs to be refreshed. Please refresh and try again."
        : raw;
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  }, [submissionId, draft, imageFiles, userId, router]);

  /* ─── Confirmation ── */
  if (step === "saved") {
    return <SaveConfirmation title={draft.title || listingTitle} isTemplate={fromTemplate} />;
  }

  const currentStep = step as 1 | 2 | 3 | 4 | 5 | 6;

  return (
    <div className="bg-[#f4efe6] min-h-[calc(100vh-72px)]">

      {/* Step progress bar */}
      <div className="bg-white border-b border-[#e8dfd4] py-5 sticky top-[72px] z-30">
        <div className="max-w-[1232px] mx-auto px-6 lg:px-0">
          <HostStepProgress
            currentStep={currentStep}
            rejectedSteps={rejectedStepNumbers}
          />
        </div>
      </div>

      <div className="max-w-[1232px] mx-auto px-6 lg:px-0 py-8 lg:py-12">

        {/* Back link */}
        <a
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-[#64707d] hover:text-[#1a0e02] transition-colors mb-6 group"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            className="group-hover:-translate-x-0.5 transition-transform">
            <path d="M19 12H5M12 5l-7 7 7 7"
              stroke="currentColor" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Dashboard
        </a>

        {/* Mode label */}
        <div className="flex items-center gap-3 mb-6">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#8b5e38] bg-[#fdf5ee] border border-[#e8dfd4] px-3 py-1 rounded-full">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {fromTemplate ? "New listing from template" : "Editing listing"}
          </span>
          <h1 className="font-display font-bold text-[#1a0e02] text-lg truncate">{listingTitle}</h1>
        </div>

        {/* Template notice */}
        {fromTemplate && <TemplateBanner storageKey={templateStorageKey} />}

        {/* Rejection banner */}
        {showRejection && (rejectionReason || rejectedSteps.length > 0) && (
          <RejectionBanner
            reason={rejectionReason ?? ""}
            rejectedSteps={rejectedSteps}
            onDismiss={() => {
              localStorage.setItem(rejectionStorageKey, "1");
              setShowRejection(false);
            }}
          />
        )}

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 items-start">

          {/* ── Left: current step ── */}
          <div className="flex-1 min-w-0">

            {currentStep === 1 && (
              <Step1Type
                category={draft.category}
                onChange={(v) => update("category", v)}
                onNext={() => setStep(2)}
                isRejected={rejectedSteps.includes("category")}
              />
            )}
            {currentStep === 2 && (
              <Step2About
                title={draft.title}
                title_ar={draft.title_ar}
                description={draft.description}
                description_ar={draft.description_ar}
                highlights={draft.highlights}
                onChangeTitle={(v)      => update("title",          v)}
                onChangeTitleAr={(v)    => update("title_ar",       v)}
                onChangeDesc={(v)       => update("description",    v)}
                onChangeDescAr={(v)     => update("description_ar", v)}
                onChangeHighlights={(v) => update("highlights",     v)}
                onNext={() => setStep(3)}
                onBack={() => setStep(1)}
                isRejected={rejectedSteps.includes("description")}
              />
            )}
            {currentStep === 3 && (
              <Step3Details
                draft={draft}
                onChange={update}
                onNext={() => setStep(4)}
                onBack={() => setStep(2)}
                locationRejected={rejectedSteps.includes("location")}
                capacityRejected={rejectedSteps.includes("capacity_rules")}
              />
            )}
            {currentStep === 4 && (
              <Step4Amenities
                selected={draft.amenities}
                onChange={(v) => update("amenities", v)}
                onNext={() => setStep(5)}
                onBack={() => setStep(3)}
                isRejected={rejectedSteps.includes("amenities")}
              />
            )}
            {currentStep === 5 && (
              <Step5Pricing
                price={draft.price}
                originalPrice={draft.originalPrice}
                priceUnit={draft.priceUnit}
                onChangePrice={(v)     => update("price",         v)}
                onChangeOriginal={(v)  => update("originalPrice", v)}
                onChangePriceUnit={(v) => update("priceUnit",     v)}
                onNext={() => setStep(6)}
                onBack={() => setStep(4)}
                isRejected={rejectedSteps.includes("pricing")}
              />
            )}
            {currentStep === 6 && (
              <>
                {saveError && (
                  <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-red-500 shrink-0 mt-0.5">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
                      <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <p className="text-sm text-red-600">{saveError}</p>
                  </div>
                )}
                <Step6Review
                  draft={draft}
                  onChangeImages={{ add: addImages, remove: removeImage }}
                  onChangeRules={(v) => update("houseRules", v)}
                  onSubmit={handleSave}
                  onBack={() => setStep(5)}
                  isSubmitting={saving}
                  submitLabel={fromTemplate ? "Submit for review" : "Save & resubmit"}
                  isRejected={rejectedSteps.includes("media")}
                />
              </>
            )}
          </div>

          {/* ── Right: live preview ── */}
          <div className="w-full lg:w-[360px] shrink-0 sticky top-[148px]">
            <HostListingPreview draft={draft} currentStep={currentStep} />
          </div>
        </div>
      </div>
    </div>
  );
}
