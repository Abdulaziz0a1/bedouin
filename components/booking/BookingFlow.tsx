"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ListingDetail } from "@/lib/data/listing-details";
import {
  GuestDetails, CardDetails, PaymentMethod,
  BookingStep, BookingConfirmation,
} from "@/lib/types/booking";
import { createBooking } from "@/lib/actions/booking";
import { checkAvailability } from "@/lib/actions/availability";
import { ensureFreshSession } from "@/lib/client/ensureFreshSession";
import SessionExpiredBanner from "@/components/auth/SessionExpiredBanner";
import { useLanguage } from "@/context/LanguageProvider";
import { getListingText } from "@/lib/utils/listing-locale";
import StepIndicator from "./StepIndicator";
import BookingSummaryCard from "./BookingSummaryCard";
import ReviewStep from "./ReviewStep";
import GuestDetailsStep from "./GuestDetailsStep";
import PaymentStep from "./PaymentStep";
import ConfirmationScreen from "./ConfirmationScreen";

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

const SHORT_MONTHS = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];

function parseDate(s: string): Date | null {
  if (!s) return null;
  // Parse YYYY-MM-DD at noon local time to avoid timezone edge cases
  const d = new Date(s + "T12:00:00");
  return isNaN(d.getTime()) ? null : d;
}

function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(0, 0, 0, 0);
  return d;
}

function fmtDate(d: Date): string {
  return `${SHORT_MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/** Formats a local Date as YYYY-MM-DD without UTC conversion. */
function toDateStr(d: Date): string {
  const y   = d.getFullYear();
  const m   = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/* ─── Props ────────────────────────────────────────────────────────────────── */

interface BookingFlowProps {
  listing: ListingDetail;
  checkInStr: string;
  checkOutStr: string;
  initialAdults: number;
  initialChildren: number;
  prefill?: { firstName: string; lastName: string; email: string };
}

/* ─── Component ────────────────────────────────────────────────────────────── */

export default function BookingFlow({
  listing,
  checkInStr,
  checkOutStr,
  initialAdults,
  initialChildren,
  prefill,
}: BookingFlowProps) {
  const { lang } = useLanguage();

  /* ── Step ── */
  const [step, setStep] = useState<BookingStep>(1);

  /* ── Step 1: Trip details ── */
  const [checkIn,  setCheckIn]  = useState<Date | null>(parseDate(checkInStr)  ?? daysFromNow(1));
  const [checkOut, setCheckOut] = useState<Date | null>(parseDate(checkOutStr) ?? daysFromNow(2));
  const [adults,   setAdults]   = useState(initialAdults  || 1);
  const [children, setChildren] = useState(initialChildren || 0);

  /* ── Step 2: Guest details ── */
  const [guestDetails, setGuestDetails] = useState<GuestDetails>({
    firstName:     prefill?.firstName ?? "",
    lastName:      prefill?.lastName  ?? "",
    email:         prefill?.email     ?? "",
    phone:         "",
    nationality:   "",
    requests:      "",
    agreedToRules: false,
  });

  /* ── Step 3: Payment ── */
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });
  const [isSubmitting,   setIsSubmitting]   = useState(false);
  const [bookingError,   setBookingError]   = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);

  /* ── Confirmation ── */
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);

  /* ── Derived pricing ── */
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    return Math.round((checkOut.getTime() - checkIn.getTime()) / 86400000);
  }, [checkIn, checkOut]);

  const subtotal   = nights * listing.price;
  const serviceFee = Math.round(subtotal * 0.12);
  const total      = subtotal + serviceFee;

  /* ── Step 1 save ── */
  const [step1Checking, setStep1Checking] = useState(false);
  const handleStep1Next = async (ci: Date, co: Date, a: number, c: number) => {
    setStep1Checking(true);
    setBookingError(null);
    const res = await checkAvailability(listing.id, toDateStr(ci), toDateStr(co), a + c);
    setStep1Checking(false);
    if (res.success && !res.data.available && !res.data.unchecked) {
      const remaining = res.data.remaining ?? 0;
      setBookingError(
        remaining > 0
          ? `Only ${remaining} spot${remaining === 1 ? "" : "s"} remaining for these dates. Reduce your guest count to ${remaining} or fewer.`
          : "These dates are fully booked. Please choose different dates."
      );
      return;
    }
    setCheckIn(ci); setCheckOut(co); setAdults(a); setChildren(c);
    setStep(2);
  };

  /* ── Payment submit ── */
  const handleConfirm = async () => {
    setIsSubmitting(true);
    setBookingError(null);
    setSessionExpired(false);

    // Verify session freshness before the server action — avoids confusing
    // "not signed in" errors after long idle periods on the booking page.
    const sessionCheck = await ensureFreshSession();
    if (!sessionCheck.ok) {
      setSessionExpired(true);
      setIsSubmitting(false);
      return;
    }

    const result = await createBooking({
      listingSlug:      listing.id,
      listingCategory:  listing.category,
      listingTitle:     listing.title,
      location:         listing.location,
      image:            listing.images[0],
      checkIn:          checkIn  ? toDateStr(checkIn)  : "",
      checkOut:         checkOut ? toDateStr(checkOut) : "",
      nights,
      adults,
      children,
      subtotal,
      serviceFee,
      totalPrice:       total,
      guestName:        `${guestDetails.firstName} ${guestDetails.lastName}`.trim(),
      guestEmail:       guestDetails.email,
      guestPhone:       guestDetails.phone,
      guestNationality: guestDetails.nationality,
      specialRequests:  guestDetails.requests,
      paymentMethod,
    });

    if (!result.success) {
      setBookingError(result.error);
      setIsSubmitting(false);
      return;
    }

    const conf: BookingConfirmation = {
      reference:    result.reference,
      listingId:    listing.id,
      listingTitle: listing.title,
      location:     listing.location,
      image:        listing.images[0],
      checkIn:      checkIn  ? fmtDate(checkIn)  : "—",
      checkOut:     checkOut ? fmtDate(checkOut) : "—",
      nights,
      adults,
      children,
      subtotal,
      serviceFee,
      totalPrice:   total,
      guestName:    `${guestDetails.firstName} ${guestDetails.lastName}`.trim(),
      guestEmail:   guestDetails.email,
      paymentMethod,
      createdAt:    new Date().toISOString(),
    };
    setConfirmation(conf);
    setStep("confirmed");
    setIsSubmitting(false);
  };

  /* ─── Confirmation screen (full-page, no step bar) ─── */
  if (step === "confirmed" && confirmation) {
    return <ConfirmationScreen booking={confirmation} />;
  }

  /* ─── Main booking layout ──────────────────────────────────────────── */
  return (
    <div className="bg-[#f4efe6] min-h-[calc(100vh-72px)]">

      {/* Step indicator bar */}
      <div className="bg-white border-b border-[#e8dfd4] py-5 sticky top-[72px] z-30">
        <div className="max-w-[1232px] mx-auto px-6 lg:px-0">
          <StepIndicator currentStep={step as 1 | 2 | 3} />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1232px] mx-auto px-6 lg:px-0 py-8 lg:py-12">

        {/* Back link */}
        <Link
          href={`/listing/${listing.id}`}
          className="inline-flex items-center gap-2 text-sm text-[#64707d] hover:text-[#1a0e02] transition-colors mb-8 group"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            className="group-hover:-translate-x-0.5 transition-transform">
            <path d="M19 12H5M12 5l-7 7 7 7"
              stroke="currentColor" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to {getListingText(listing.title, listing.title_ar, lang)}
        </Link>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 items-start">

          {/* ── Left: current step ─────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {step === 1 && bookingError && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-red-500 shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <p className="text-sm text-red-600">{bookingError}</p>
              </div>
            )}
            {step === 1 && (
              <ReviewStep
                checkIn={checkIn}
                checkOut={checkOut}
                adults={adults}
                children={children}
                maxGuests={listing.maxGuests}
                minNights={listing.minNights}
                houseRules={listing.houseRules}
                onNext={handleStep1Next}
                isChecking={step1Checking}
              />
            )}
            {step === 2 && (
              <GuestDetailsStep
                details={guestDetails}
                onChange={setGuestDetails}
                onNext={() => setStep(3)}
                onBack={() => setStep(1)}
              />
            )}
            {step === 3 && sessionExpired && <SessionExpiredBanner />}
            {step === 3 && !sessionExpired && bookingError && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-red-500 shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <p className="text-sm text-red-600">{bookingError}</p>
              </div>
            )}
            {step === 3 && (
              <PaymentStep
                method={paymentMethod}
                cardDetails={cardDetails}
                total={total}
                nights={nights}
                listingPrice={listing.price}
                serviceFee={serviceFee}
                onMethodChange={setPaymentMethod}
                onCardChange={setCardDetails}
                onConfirm={handleConfirm}
                onBack={() => setStep(2)}
                isSubmitting={isSubmitting}
              />
            )}
          </div>

          {/* ── Right: sticky summary card ─────────────────────────────── */}
          <div className="w-full lg:w-[380px] shrink-0 sticky top-[148px]">
            <BookingSummaryCard
              listing={listing}
              checkIn={checkIn}
              checkOut={checkOut}
              adults={adults}
              children={children}
              nights={nights}
              subtotal={subtotal}
              serviceFee={serviceFee}
              total={total}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
