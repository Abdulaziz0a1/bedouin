"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import CalendarPopup from "@/components/ui/CalendarPopup";

const SHORT_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function formatDate(d: Date) {
  return `${SHORT_MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function today() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function nightsBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

interface BookingCardProps {
  price: number;
  originalPrice?: number;
  priceUnit?: string;
  score: number;
  reviewCount: number;
  minNights: number;
  maxGuests: number;
  listingId: string;
}

type ActiveField = "checkin" | "checkout" | "guests" | null;

export default function BookingCard({
  price,
  originalPrice,
  priceUnit = "per person",
  score,
  reviewCount,
  minNights,
  maxGuests,
  listingId,
}: BookingCardProps) {
  const [checkIn, setCheckIn]   = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [adults, setAdults]     = useState(1);
  const [children, setChildren] = useState(0);
  const [active, setActive]     = useState<ActiveField>(null);

  const cardRef = useRef<HTMLDivElement>(null);

  // Close popups on outside click
  useEffect(() => {
    if (!active) return;
    const handler = (e: MouseEvent) => {
      if (!cardRef.current?.contains(e.target as Node)) setActive(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [active]);

  const toggle = useCallback((f: ActiveField) => setActive((v) => (v === f ? null : f)), []);

  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;
  const subtotal = nights * price;
  const serviceFee = Math.round(subtotal * 0.12);
  const total = subtotal + serviceFee;

  const fieldCls =
    "flex-1 flex flex-col px-4 py-3 cursor-pointer select-none hover:bg-[#faf7f4] transition-colors";
  const labelCls = "text-[10px] font-bold text-[#64707d] uppercase tracking-widest mb-0.5";
  const valueCls = (filled: boolean) =>
    `text-sm font-semibold ${filled ? "text-[#1a0e02]" : "text-[#a09080]"}`;

  return (
    <div
      ref={cardRef}
      className="bg-white border border-[#e8dfd4] rounded-3xl shadow-[0_8px_40px_rgba(26,14,2,0.14)] p-6 flex flex-col gap-5 sticky top-[88px]"
    >
      {/* Price header */}
      <div className="flex items-end justify-between">
        <div className="flex items-baseline gap-1.5">
          {originalPrice && (
            <span className="text-[#a09080] text-sm line-through">SAR {originalPrice}</span>
          )}
          <span className="font-display font-extrabold text-[#1a0e02] text-3xl leading-none">
            SAR {price}
          </span>
          <span className="text-[#64707d] text-sm">{priceUnit}</span>
        </div>
        {/* Rating inline */}
        <div className="flex items-center gap-1 text-sm">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="#c49a4f">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span className="font-semibold text-[#1a0e02]">{score.toFixed(1)}</span>
          <span className="text-[#64707d]">({reviewCount})</span>
        </div>
      </div>

      {/* Date & guest selector */}
      <div className="border border-[#e8dfd4] rounded-2xl overflow-visible">
        {/* Dates row */}
        <div className="flex divide-x divide-[#e8dfd4] relative">
          {/* Check In */}
          <div className={`relative ${fieldCls} rounded-tl-2xl`} onClick={() => toggle("checkin")}>
            <span className={labelCls}>Check In</span>
            <span className={valueCls(!!checkIn)}>
              {checkIn ? formatDate(checkIn) : "Add date"}
            </span>
            {active === "checkin" && (
              <CalendarPopup
                value={checkIn}
                onChange={(d) => {
                  setCheckIn(d);
                  if (checkOut && d >= checkOut) setCheckOut(null);
                  setActive("checkout");
                }}
                minDate={today()}
                onClose={() => setActive(null)}
                positionClass="top-full mt-2 left-0"
              />
            )}
          </div>

          {/* Check Out */}
          <div className={`relative ${fieldCls} rounded-tr-2xl`} onClick={() => toggle("checkout")}>
            <span className={labelCls}>Check Out</span>
            <span className={valueCls(!!checkOut)}>
              {checkOut ? formatDate(checkOut) : "Add date"}
            </span>
            {active === "checkout" && (
              <CalendarPopup
                value={checkOut}
                onChange={(d) => { setCheckOut(d); setActive(null); }}
                minDate={checkIn ? new Date(checkIn.getTime() + 86400000) : today()}
                onClose={() => setActive(null)}
                positionClass="top-full mt-2 right-0"
              />
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#e8dfd4]" />

        {/* Guests */}
        <div
          className={`relative ${fieldCls} rounded-b-2xl`}
          onClick={() => toggle("guests")}
        >
          <span className={labelCls}>Guests</span>
          <span className={valueCls(true)}>
            {adults + children} guest{adults + children !== 1 ? "s" : ""}
            {" "}·{" "}
            {adults} adult{adults !== 1 ? "s" : ""}
            {children > 0 && `, ${children} child${children !== 1 ? "ren" : ""}`}
          </span>

          {/* Guests popover */}
          {active === "guests" && (
            <div
              className="absolute top-full mt-2 left-0 right-0 z-[100] bg-white border border-[#e8dfd4] rounded-2xl shadow-2xl p-4"
              onClick={(e) => e.stopPropagation()}
            >
              {[
                { label: "Adults", sub: "Ages 13+", value: adults, set: setAdults, min: 1, max: maxGuests },
                { label: "Children", sub: "Ages 2–12", value: children, set: setChildren, min: 0, max: maxGuests - adults },
              ].map(({ label, sub, value, set, min, max }) => (
                <div key={label} className="flex items-center justify-between py-3 border-b last:border-0 border-[#f0e8de]">
                  <div>
                    <p className="text-sm font-semibold text-[#1a0e02]">{label}</p>
                    <p className="text-xs text-[#64707d]">{sub}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => set((v) => Math.max(min, v - 1))}
                      disabled={value <= min}
                      className="w-8 h-8 rounded-full border border-[#e8dfd4] flex items-center justify-center text-[#1a0e02] text-base disabled:opacity-30 hover:border-[#8b5e38] transition-colors"
                    >
                      −
                    </button>
                    <span className="w-5 text-center text-sm font-semibold text-[#1a0e02]">{value}</span>
                    <button
                      type="button"
                      onClick={() => set((v) => Math.min(max, v + 1))}
                      disabled={value >= max}
                      className="w-8 h-8 rounded-full border border-[#e8dfd4] flex items-center justify-center text-[#1a0e02] text-base disabled:opacity-30 hover:border-[#8b5e38] transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setActive(null)}
                className="w-full mt-3 py-2.5 bg-[#8b5e38] text-white text-sm font-semibold rounded-xl hover:bg-[#7a5030] transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Min nights notice */}
      {minNights > 1 && (
        <p className="text-xs text-[#64707d] -mt-2">
          Minimum stay: {minNights} nights
        </p>
      )}

      {/* Price breakdown */}
      {nights > 0 && (
        <div className="flex flex-col gap-2 text-sm border-t border-[#f0e8de] pt-4">
          <div className="flex justify-between text-[#1a0e02]">
            <span>SAR {price} × {nights} night{nights !== 1 ? "s" : ""}</span>
            <span>SAR {subtotal}</span>
          </div>
          <div className="flex justify-between text-[#64707d]">
            <span>Service fee</span>
            <span>SAR {serviceFee}</span>
          </div>
          <div className="flex justify-between font-bold text-[#1a0e02] text-base border-t border-[#f0e8de] pt-3 mt-1">
            <span>Total</span>
            <span>SAR {total}</span>
          </div>
        </div>
      )}

      {/* CTA */}
      <a
        href={nights > 0 ? `/booking/${listingId}?checkIn=${checkIn?.toISOString().split("T")[0]}&checkOut=${checkOut?.toISOString().split("T")[0]}&adults=${adults}&children=${children}` : "#"}
        onClick={(e) => { if (!checkIn || !checkOut) { e.preventDefault(); setActive("checkin"); } }}
        className="w-full py-4 bg-[#8b5e38] text-white font-bold text-base rounded-2xl text-center hover:bg-[#7a5030] active:bg-[#6a4228] transition-colors shadow-sm"
        style={{ color: "#fff" }}
      >
        {checkIn && checkOut ? "Reserve Now" : "Check Availability"}
      </a>

      <p className="text-xs text-[#64707d] text-center -mt-2">
        No charge until you confirm your booking
      </p>
    </div>
  );
}
