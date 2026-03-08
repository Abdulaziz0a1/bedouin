"use client";

import { useState } from "react";
import { GuestDetails } from "@/lib/types/booking";

const NATIONALITIES = [
  "Saudi Arabian","Emirati","Kuwaiti","Bahraini","Omani","Qatari",
  "Egyptian","Jordanian","Lebanese","Syrian","Yemeni","Moroccan","Tunisian",
  "American","British","French","German","Australian","Canadian",
  "Indian","Pakistani","Filipino","Other",
];

interface GuestDetailsStepProps {
  details:  GuestDetails;
  onChange: (d: GuestDetails) => void;
  onNext:   () => void;
  onBack:   () => void;
}

type Field = keyof GuestDetails;

export default function GuestDetailsStep({
  details, onChange, onNext, onBack,
}: GuestDetailsStepProps) {
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});

  const update = (field: Field, value: string | boolean) => {
    onChange({ ...details, [field]: value });
    if (errors[field]) setErrors((e) => ({ ...e, [field]: "" }));
  };

  const validate = (): boolean => {
    const e: Partial<Record<Field, string>> = {};
    if (!details.firstName.trim()) e.firstName = "First name is required.";
    if (!details.lastName.trim())  e.lastName  = "Last name is required.";
    if (!details.email.trim())     e.email     = "Email address is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email))
      e.email = "Please enter a valid email address.";
    if (!details.phone.trim())     e.phone     = "Phone number is required.";
    if (!details.agreedToRules)    e.agreedToRules = "You must accept the house rules to continue.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => { if (validate()) onNext(); };

  /* ── Style helpers ── */
  const inputBase =
    "w-full px-4 py-3 border rounded-xl text-sm text-[#1a0e02] placeholder:text-[#a09080] focus:outline-none transition-colors";
  const inputCls = (field: Field) =>
    `${inputBase} ${
      errors[field]
        ? "border-red-400 bg-red-50 focus:border-red-500"
        : "border-[#e8dfd4] bg-white focus:border-[#8b5e38]"
    }`;
  const labelCls =
    "block text-[10px] font-bold text-[#64707d] uppercase tracking-widest mb-1.5";

  return (
    <div className="flex flex-col gap-7">
      {/* Heading */}
      <div>
        <h1 className="font-display font-extrabold text-[#1a0e02] text-3xl mb-1">
          Your details
        </h1>
        <p className="text-[#64707d] text-sm">
          We'll use this to send your booking confirmation and connect you with your host.
        </p>
      </div>

      {/* Form card */}
      <div className="bg-white border border-[#e8dfd4] rounded-2xl p-6 flex flex-col gap-5">

        {/* Name row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>First Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={details.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              placeholder="e.g. Mohammed"
              autoComplete="given-name"
              className={inputCls("firstName")}
            />
            {errors.firstName && (
              <p className="text-xs text-red-600 mt-1">{errors.firstName}</p>
            )}
          </div>
          <div>
            <label className={labelCls}>Last Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={details.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              placeholder="e.g. Al-Harbi"
              autoComplete="family-name"
              className={inputCls("lastName")}
            />
            {errors.lastName && (
              <p className="text-xs text-red-600 mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className={labelCls}>Email Address <span className="text-red-500">*</span></label>
          <input
            type="email"
            value={details.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="your@email.com"
            autoComplete="email"
            className={inputCls("email")}
          />
          {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className={labelCls}>Phone Number <span className="text-red-500">*</span></label>
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5 px-3 py-3 border border-[#e8dfd4] bg-[#faf7f4] rounded-xl text-sm text-[#64707d] font-semibold shrink-0">
              <span>🇸🇦</span>
              <span>+966</span>
            </div>
            <input
              type="tel"
              value={details.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="5X XXX XXXX"
              autoComplete="tel"
              className={`flex-1 ${inputCls("phone")}`}
            />
          </div>
          {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
        </div>

        {/* Nationality */}
        <div>
          <label className={labelCls}>
            Nationality{" "}
            <span className="text-[#a09080] normal-case tracking-normal font-normal">(optional)</span>
          </label>
          <select
            value={details.nationality}
            onChange={(e) => update("nationality", e.target.value)}
            className={`${inputBase} border-[#e8dfd4] bg-white focus:border-[#8b5e38] appearance-none`}
          >
            <option value="">Select your nationality</option>
            {NATIONALITIES.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        {/* Special requests */}
        <div>
          <label className={labelCls}>
            Special Requests{" "}
            <span className="text-[#a09080] normal-case tracking-normal font-normal">(optional)</span>
          </label>
          <textarea
            value={details.requests}
            onChange={(e) => update("requests", e.target.value)}
            placeholder="Dietary requirements, accessibility needs, arrival time, room preferences…"
            rows={3}
            className={`${inputBase} border-[#e8dfd4] bg-white focus:border-[#8b5e38] resize-none`}
          />
          <p className="text-[10px] text-[#a09080] mt-1">
            We'll pass your request to the host. Fulfilment is not guaranteed.
          </p>
        </div>
      </div>

      {/* House rules agreement */}
      <div
        className={`flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition-colors ${
          errors.agreedToRules
            ? "border-red-300 bg-red-50"
            : "border-[#e8dfd4] bg-white hover:border-[#c49a4f]"
        }`}
        onClick={() => update("agreedToRules", !details.agreedToRules)}
      >
        {/* Custom checkbox */}
        <div
          className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
            details.agreedToRules
              ? "bg-[#8b5e38] border-[#8b5e38]"
              : "border-[#c4b49a] bg-white"
          }`}
        >
          {details.agreedToRules && (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
              <path d="M5 12l5 5 9-9"
                stroke="white" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-[#1a0e02] leading-tight">
            I agree to the host's house rules
          </p>
          <p className="text-xs text-[#64707d] mt-1 leading-relaxed">
            By continuing you agree to the house rules listed on the listing page, as well
            as Bedouin's{" "}
            <span className="text-[#8b5e38] font-medium">Terms of Service</span>
            {" "}and{" "}
            <span className="text-[#8b5e38] font-medium">Privacy Policy</span>.
          </p>
        </div>
      </div>
      {errors.agreedToRules && (
        <p className="text-xs text-red-600 -mt-4">{errors.agreedToRules}</p>
      )}

      {/* Navigation buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3.5 border border-[#1a0e02] text-[#1a0e02] font-semibold text-sm rounded-2xl hover:bg-[#1a0e02] hover:text-white transition-colors"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="flex-[2] py-4 bg-[#8b5e38] font-bold text-base rounded-2xl hover:bg-[#7a5030] transition-colors shadow-sm"
          style={{ color: "#fff" }}
        >
          Continue to Payment →
        </button>
      </div>
    </div>
  );
}
