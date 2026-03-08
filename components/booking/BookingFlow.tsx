"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ListingDetail } from "@/lib/data/listing-details";
import {
  GuestDetails, CardDetails, PaymentMethod,
  BookingStep, BookingConfirmation,
} from "@/lib/types/booking";
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

function generateRef(): string {
  const seg = () => Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BDN-${seg()}${seg()}`;
}

/* ─── Props ────────────────────────────────────────────────────────────────── */

interface BookingFlowProps {
  listing: ListingDetail;
  checkInStr: string;
  checkOutStr: string;
  initialAdults: number;
  initialChildren: number;
}

/* ─── Component ────────────────────────────────────────────────────────────── */

export default function BookingFlow({
  listing,
  checkInStr,
  checkOutStr,
  initialAdults,
  initialChildren,
}: BookingFlowProps) {
  /* ── Step ── */
  const [step, setStep] = useState<BookingStep>(1);

  /* ── Step 1: Trip details ── */
  const [checkIn,  setCheckIn]  = useState<Date | null>(parseDate(checkInStr)  ?? daysFromNow(1));
  const [checkOut, setCheckOut] = useState<Date | null>(parseDate(checkOutStr) ?? daysFromNow(2));
  const [adults,   setAdults]   = useState(initialAdults  || 1);
  const [children, setChildren] = useState(initialChildren || 0);

  /* ── Step 2: Guest details ── */
  const [guestDetails, setGuestDetails] = useState<GuestDetails>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    nationality: "",
    requests: "",
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  const handleStep1Next = (ci: Date, co: Date, a: number, c: number) => {
    setCheckIn(ci); setCheckOut(co); setAdults(a); setChildren(c);
    setStep(2);
  };

  /* ── Payment submit ── */
  const handleConfirm = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const conf: BookingConfirmation = {
        reference:     generateRef(),
        listingId:     listing.id,
        listingTitle:  listing.title,
        location:      listing.location,
        image:         listing.images[0],
        checkIn:       checkIn  ? fmtDate(checkIn)  : "—",
        checkOut:      checkOut ? fmtDate(checkOut) : "—",
        nights,
        adults,
        children,
        subtotal,
        serviceFee,
        totalPrice:    total,
        guestName:     `${guestDetails.firstName} ${guestDetails.lastName}`.trim(),
        guestEmail:    guestDetails.email,
        paymentMethod,
        createdAt:     new Date().toISOString(),
      };
      setConfirmation(conf);
      setStep("confirmed");
      setIsSubmitting(false);
    }, 1800);
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
          Back to {listing.title}
        </Link>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 items-start">

          {/* ── Left: current step ─────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
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
