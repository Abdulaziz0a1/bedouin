"use client";

import { useState } from "react";
import { PaymentMethod, CardDetails } from "@/lib/types/booking";

interface PaymentStepProps {
  method:       PaymentMethod;
  cardDetails:  CardDetails;
  total:        number;
  nights:       number;
  listingPrice: number;
  serviceFee:   number;
  isSubmitting: boolean;
  onMethodChange: (m: PaymentMethod) => void;
  onCardChange:   (c: CardDetails)   => void;
  onConfirm:      () => void;
  onBack:         () => void;
}

/* ─── Formatting helpers ─────────────────────────────────────────────────── */

function fmtCardNumber(v: string): string {
  return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

function fmtExpiry(v: string): string {
  const n = v.replace(/\D/g, "").slice(0, 4);
  return n.length >= 3 ? `${n.slice(0, 2)}/${n.slice(2)}` : n;
}

/* ─── Payment methods ────────────────────────────────────────────────────── */

const METHODS: { id: PaymentMethod; label: string; desc: string; icon: React.ReactNode }[] = [
  {
    id: "card",
    label: "Credit / Debit Card",
    desc: "Visa, Mastercard, American Express",
    icon: (
      <svg width="22" height="16" viewBox="0 0 36 24" fill="none">
        <rect width="36" height="24" rx="4" fill="#1a0e02" />
        <rect y="7" width="36" height="5" fill="#c49a4f" />
        <rect x="4" y="15" width="10" height="2" rx="1" fill="#c49a4f" opacity="0.6" />
      </svg>
    ),
  },
  {
    id: "mada",
    label: "Mada",
    desc: "Saudi domestic debit network",
    icon: (
      <span className="text-lg font-extrabold" style={{ color: "#00a651", letterSpacing: "-0.03em" }}>
        mada
      </span>
    ),
  },
  {
    id: "apple_pay",
    label: "Apple Pay",
    desc: "Pay with Face ID or Touch ID",
    icon: (
      <svg width="20" height="24" viewBox="0 0 20 24" fill="none">
        <path
          d="M14.5 0C13 0 11.2 1 10.2 2.3 9.3 3.4 8.5 5 8.7 6.6c1.6.1 3.3-.9 4.3-2.2C14 3.2 14.7 1.6 14.5 0zM18.7 8.1c-1.7-1-3.3-1-3.8-1-1.2 0-2.2.5-3.1.5-.9 0-2-.5-3.1-.5-2.4 0-4.7 1.4-6 3.6-2.6 4.5-1 11.1 1.8 14.8.9 1.3 2 2.7 3.5 2.7 1.3 0 1.9-.8 3.5-.8s2.1.8 3.5.8c1.5 0 2.5-1.3 3.4-2.6.7-1 1.3-2 1.7-3.1-4.1-1.6-4.8-7.4-.4-9.4z"
          fill="#1a0e02"
        />
      </svg>
    ),
  },
];

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function PaymentStep({
  method, cardDetails, total, nights, listingPrice, serviceFee,
  isSubmitting, onMethodChange, onCardChange, onConfirm, onBack,
}: PaymentStepProps) {
  const [errors, setErrors] = useState<Partial<Record<keyof CardDetails, string>>>({});

  const updateCard = (field: keyof CardDetails, raw: string) => {
    let v = raw;
    if (field === "number") v = fmtCardNumber(raw);
    if (field === "expiry") v = fmtExpiry(raw);
    if (field === "cvv")    v = raw.replace(/\D/g, "").slice(0, 4);
    onCardChange({ ...cardDetails, [field]: v });
    if (errors[field]) setErrors((e) => ({ ...e, [field]: "" }));
  };

  const validateCard = (): boolean => {
    if (method !== "card") return true;
    const e: Partial<Record<keyof CardDetails, string>> = {};
    if (cardDetails.number.replace(/\s/g, "").length < 16)
      e.number = "Enter a valid 16-digit card number.";
    if (!cardDetails.name.trim())
      e.name = "Cardholder name is required.";
    if (cardDetails.expiry.length < 5)
      e.expiry = "Enter expiry as MM/YY.";
    if (cardDetails.cvv.length < 3)
      e.cvv = "CVV must be 3 or 4 digits.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleConfirm = () => { if (validateCard()) onConfirm(); };

  const inputBase =
    "w-full px-4 py-3 border rounded-xl text-sm text-[#1a0e02] placeholder:text-[#a09080] focus:outline-none transition-colors";
  const inputCls = (field: keyof CardDetails) =>
    `${inputBase} ${
      errors[field]
        ? "border-red-400 bg-red-50"
        : "border-[#e8dfd4] bg-white focus:border-[#8b5e38]"
    }`;
  const labelCls =
    "block text-[10px] font-bold text-[#64707d] uppercase tracking-widest mb-1.5";

  return (
    <div className="flex flex-col gap-7">
      {/* Heading */}
      <div>
        <h1 className="font-display font-extrabold text-[#1a0e02] text-3xl mb-1">Payment</h1>
        <p className="text-[#64707d] text-sm">
          Choose your preferred payment method to confirm your booking.
        </p>
      </div>

      {/* ── Payment method selection ─────────────────────────────────── */}
      <div className="bg-white border border-[#e8dfd4] rounded-2xl p-5 flex flex-col gap-3">
        <h2 className="font-display font-semibold text-[#1a0e02] text-sm mb-1">
          Payment method
        </h2>

        {METHODS.map((m) => (
          <label
            key={m.id}
            className={`flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all ${
              method === m.id
                ? "border-[#8b5e38] bg-[#fdf5ee]"
                : "border-[#e8dfd4] hover:border-[#c49a4f] bg-white"
            }`}
          >
            <input
              type="radio"
              name="payment-method"
              value={m.id}
              checked={method === m.id}
              onChange={() => onMethodChange(m.id)}
              className="sr-only"
            />
            {/* Radio indicator */}
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                method === m.id ? "border-[#8b5e38]" : "border-[#c4b49a]"
              }`}
            >
              {method === m.id && (
                <div className="w-2.5 h-2.5 rounded-full bg-[#8b5e38]" />
              )}
            </div>
            {/* Icon */}
            <span className="shrink-0 flex items-center">{m.icon}</span>
            {/* Label */}
            <div>
              <p className="font-semibold text-[#1a0e02] text-sm">{m.label}</p>
              <p className="text-xs text-[#64707d]">{m.desc}</p>
            </div>
          </label>
        ))}
      </div>

      {/* ── Card form ────────────────────────────────────────────────── */}
      {method === "card" && (
        <div className="bg-white border border-[#e8dfd4] rounded-2xl p-5 flex flex-col gap-4">
          <h2 className="font-display font-semibold text-[#1a0e02] text-sm">Card details</h2>

          <div>
            <label className={labelCls}>Card Number <span className="text-red-500">*</span></label>
            <input
              type="text"
              inputMode="numeric"
              value={cardDetails.number}
              onChange={(e) => updateCard("number", e.target.value)}
              placeholder="1234 5678 9012 3456"
              autoComplete="cc-number"
              className={inputCls("number")}
            />
            {errors.number && <p className="text-xs text-red-600 mt-1">{errors.number}</p>}
          </div>

          <div>
            <label className={labelCls}>
              Cardholder Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={cardDetails.name}
              onChange={(e) => updateCard("name", e.target.value)}
              placeholder="Name as it appears on card"
              autoComplete="cc-name"
              className={inputCls("name")}
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                Expiry Date <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={cardDetails.expiry}
                onChange={(e) => updateCard("expiry", e.target.value)}
                placeholder="MM / YY"
                autoComplete="cc-exp"
                className={inputCls("expiry")}
              />
              {errors.expiry && <p className="text-xs text-red-600 mt-1">{errors.expiry}</p>}
            </div>
            <div>
              <label className={labelCls}>CVV <span className="text-red-500">*</span></label>
              <input
                type="text"
                inputMode="numeric"
                value={cardDetails.cvv}
                onChange={(e) => updateCard("cvv", e.target.value)}
                placeholder="123"
                autoComplete="cc-csc"
                className={inputCls("cvv")}
              />
              {errors.cvv && <p className="text-xs text-red-600 mt-1">{errors.cvv}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Mada redirect notice */}
      {method === "mada" && (
        <div className="flex items-start gap-3 bg-[#f0f7ff] border border-[#c8dff0] rounded-2xl p-4">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10" stroke="#0046cc" strokeWidth="1.8" />
            <path d="M12 8v4M12 16h.01"
              stroke="#0046cc" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <p className="text-sm text-[#2b3037] leading-relaxed">
            You'll be securely redirected to your bank's payment page to authorise
            the transaction. No card details are stored on Bedouin.
          </p>
        </div>
      )}

      {/* Apple Pay notice */}
      {method === "apple_pay" && (
        <div className="flex items-start gap-3 bg-[#f5f5f7] border border-[#e0e0e5] rounded-2xl p-4">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10" stroke="#1a0e02" strokeWidth="1.8" />
            <path d="M12 8v4M12 16h.01"
              stroke="#1a0e02" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <p className="text-sm text-[#2b3037] leading-relaxed">
            Confirm with Face ID or Touch ID when prompted. Payment completes
            instantly via Apple Pay — no card details required.
          </p>
        </div>
      )}

      {/* ── Final price summary ───────────────────────────────────────── */}
      <div className="bg-white border border-[#e8dfd4] rounded-2xl px-5 py-4 flex flex-col gap-2.5">
        <h2 className="font-display font-semibold text-[#1a0e02] text-sm mb-1">
          Payment summary
        </h2>
        <div className="flex justify-between text-sm">
          <span className="text-[#64707d]">
            SAR {listingPrice.toLocaleString("en-US")} × {nights} night{nights !== 1 ? "s" : ""}
          </span>
          <span className="text-[#1a0e02] font-medium">
            SAR {(listingPrice * nights).toLocaleString("en-US")}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#64707d]">Service fee (12%)</span>
          <span className="text-[#1a0e02] font-medium">SAR {serviceFee.toLocaleString("en-US")}</span>
        </div>
        <div className="h-px bg-[#f0e8de] mt-1" />
        <div className="flex justify-between font-bold text-[#1a0e02] text-base">
          <span>Total due today</span>
          <span>SAR {total.toLocaleString("en-US")}</span>
        </div>
      </div>

      {/* Security note */}
      <div className="flex items-center gap-2 text-xs text-[#64707d]">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <rect x="5" y="11" width="14" height="10" rx="2"
            stroke="#64707d" strokeWidth="1.8" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4"
            stroke="#64707d" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        Your payment is protected by 256-bit SSL encryption
      </div>

      {/* ── Navigation ───────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="flex-1 py-3.5 border border-[#1a0e02] text-[#1a0e02] font-semibold text-sm rounded-2xl hover:bg-[#1a0e02] hover:text-white disabled:opacity-50 transition-colors"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isSubmitting}
          className="flex-[2] py-4 bg-[#8b5e38] font-bold text-base rounded-2xl hover:bg-[#7a5030] disabled:opacity-70 transition-colors shadow-sm flex items-center justify-center gap-2"
          style={{ color: "#fff" }}
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin"
                width="17" height="17"
                viewBox="0 0 24 24" fill="none"
              >
                <circle
                  cx="12" cy="12" r="10"
                  stroke="rgba(255,255,255,0.3)" strokeWidth="2.5"
                />
                <path
                  d="M12 2a10 10 0 0 1 10 10"
                  stroke="white" strokeWidth="2.5" strokeLinecap="round"
                />
              </svg>
              Processing payment…
            </>
          ) : (
            `Confirm & Pay SAR ${total.toLocaleString("en-US")}`
          )}
        </button>
      </div>
    </div>
  );
}
