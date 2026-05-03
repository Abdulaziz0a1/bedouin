"use client";

import { useState } from "react";

const PRICE_UNITS = ["per person", "per night", "per group"];

interface Step5PricingProps {
  price:             number;
  originalPrice:     number;
  priceUnit:         string;
  onChangePrice:     (v: number) => void;
  onChangeOriginal:  (v: number) => void;
  onChangePriceUnit: (v: string) => void;
  onNext:            () => void;
  onBack:            () => void;
  isRejected?:       boolean;
}

export default function Step5Pricing({
  price, originalPrice, priceUnit,
  onChangePrice, onChangeOriginal, onChangePriceUnit,
  onNext, onBack, isRejected,
}: Step5PricingProps) {
  const [errors, setErrors] = useState<{ price?: string; originalPrice?: string }>({});

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!price || price < 10)
      e.price = "Please set a price of at least SAR 10.";
    if (originalPrice > 0 && originalPrice <= price)
      e.originalPrice = "Original price must be higher than the current price.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const discountPct =
    originalPrice > 0 && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  const inputBase =
    "px-4 py-3 border rounded-xl text-sm text-[#1a0e02] placeholder:text-[#a09080] focus:outline-none transition-colors bg-white";
  const labelCls = "block text-[10px] font-bold text-[#64707d] uppercase tracking-widest mb-1.5";

  return (
    <div className="flex flex-col gap-7">
      {/* Heading */}
      <div>
        <p className="text-[#c49a4f] text-xs font-bold uppercase tracking-[0.16em] mb-2">Step 5 of 6</p>
        <h1 className="font-display font-extrabold text-[#1a0e02] text-3xl mb-1">
          Set your price
        </h1>
        <p className="text-[#64707d] text-sm">
          You can always change your pricing later. We'll never charge guests without your approval.
        </p>
      </div>

      {/* Pricing card */}
      <div className={`bg-white border rounded-2xl p-6 flex flex-col gap-6 ${isRejected ? "border-red-300 bg-red-50/20" : "border-[#e8dfd4]"}`}>
        {isRejected && (
          <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="shrink-0">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
              <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Please update this section based on admin feedback.
          </div>
        )}

        {/* Price unit */}
        <div>
          <label className={labelCls}>Price applies</label>
          <div className="flex gap-2">
            {PRICE_UNITS.map((unit) => (
              <button
                key={unit}
                type="button"
                onClick={() => onChangePriceUnit(unit)}
                className={[
                  "flex-1 py-2.5 border-2 rounded-xl text-xs font-semibold text-center transition-all",
                  priceUnit === unit
                    ? "border-[#8b5e38] bg-[#fdf5ee] text-[#1a0e02]"
                    : "border-[#e8dfd4] text-[#64707d] hover:border-[#c49a4f]",
                ].join(" ")}
              >
                {unit}
              </button>
            ))}
          </div>
        </div>

        {/* Current price */}
        <div>
          <label className={labelCls}>
            Your price (SAR) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#64707d]">
              SAR
            </div>
            <input
              type="number"
              min={10}
              value={price || ""}
              onChange={(e) => { onChangePrice(parseFloat(e.target.value) || 0); setErrors((v) => ({ ...v, price: "" })); }}
              placeholder="0"
              className={`${inputBase} w-full pl-14 text-xl font-bold ${
                errors.price ? "border-red-400" : "border-[#e8dfd4] focus:border-[#8b5e38]"
              }`}
            />
          </div>
          {errors.price && <p className="text-xs text-red-600 mt-1">{errors.price}</p>}
          <p className="text-[10px] text-[#a09080] mt-1.5">
            You keep 92% · Bedouin earns 8% · Guests pay a 12% service fee on top
          </p>
        </div>

        {/* Original price (optional discount) */}
        <div>
          <label className={labelCls}>
            Original / crossed-out price{" "}
            <span className="text-[#a09080] normal-case tracking-normal font-normal">(optional)</span>
          </label>
          <p className="text-[10px] text-[#a09080] mb-1.5">
            If set higher than your price, guests will see a discount badge on your listing.
          </p>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#64707d]">
              SAR
            </div>
            <input
              type="number"
              min={0}
              value={originalPrice || ""}
              onChange={(e) => { onChangeOriginal(parseFloat(e.target.value) || 0); setErrors((v) => ({ ...v, originalPrice: "" })); }}
              placeholder="0"
              className={`${inputBase} w-full pl-14 ${
                errors.originalPrice ? "border-red-400" : "border-[#e8dfd4] focus:border-[#8b5e38]"
              }`}
            />
          </div>
          {errors.originalPrice && (
            <p className="text-xs text-red-600 mt-1">{errors.originalPrice}</p>
          )}
        </div>

        {/* Preview */}
        {price > 0 && (
          <div className="bg-[#faf7f4] border border-[#f0e8de] rounded-xl p-4">
            <p className="text-xs font-bold text-[#64707d] uppercase tracking-widest mb-3">
              How guests will see your price
            </p>
            <div className="flex items-center gap-3">
              {discountPct > 0 && (
                <span className="text-sm text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-lg font-bold">
                  {discountPct}% off
                </span>
              )}
              {originalPrice > price && (
                <span className="text-[#a09080] text-base line-through">SAR {originalPrice}</span>
              )}
              <span className="font-display font-extrabold text-[#1a0e02] text-2xl">SAR {price}</span>
              <span className="text-[#64707d] text-sm">{priceUnit}</span>
            </div>
            {price > 0 && (
              <p className="text-xs text-[#64707d] mt-2">
                Your payout: <span className="font-semibold text-[#1a0e02]">SAR {Math.round(price * 0.92)}</span> per booking
              </p>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button type="button" onClick={onBack}
          className="flex-1 py-3.5 border border-[#1a0e02] text-[#1a0e02] font-semibold text-sm rounded-2xl hover:bg-[#1a0e02] hover:text-white transition-colors">
          ← Back
        </button>
        <button type="button" onClick={() => { if (validate()) onNext(); }}
          className="flex-[2] py-4 bg-[#8b5e38] font-bold text-base rounded-2xl hover:bg-[#7a5030] transition-colors shadow-sm"
          style={{ color: "#fff" }}>
          Continue →
        </button>
      </div>
    </div>
  );
}
