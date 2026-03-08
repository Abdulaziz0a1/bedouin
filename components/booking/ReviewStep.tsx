"use client";

import { useState, useRef, useEffect } from "react";
import CalendarPopup from "@/components/ui/CalendarPopup";

const SHORT_MONTHS = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];

function fmtDate(d: Date): string {
  return `${SHORT_MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function today(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

type Active = "checkin" | "checkout" | null;

interface ReviewStepProps {
  checkIn:    Date | null;
  checkOut:   Date | null;
  adults:     number;
  children:   number;
  maxGuests:  number;
  minNights:  number;
  houseRules: string[];
  onNext: (checkIn: Date, checkOut: Date, adults: number, children: number) => void;
}

export default function ReviewStep({
  checkIn, checkOut, adults, children,
  maxGuests, minNights, houseRules, onNext,
}: ReviewStepProps) {
  const [localCI, setLocalCI]         = useState<Date | null>(checkIn);
  const [localCO, setLocalCO]         = useState<Date | null>(checkOut);
  const [localAdults, setLocalAdults] = useState(adults);
  const [localKids,   setLocalKids]   = useState(children);
  const [active, setActive]           = useState<Active>(null);
  const [error,  setError]            = useState("");

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;
    const h = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setActive(null);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [active]);

  const nights =
    localCI && localCO
      ? Math.round((localCO.getTime() - localCI.getTime()) / 86400000)
      : 0;

  const handleNext = () => {
    if (!localCI || !localCO) {
      setError("Please select your check-in and check-out dates.");
      return;
    }
    if (nights < minNights) {
      setError(
        `Minimum stay is ${minNights} night${minNights > 1 ? "s" : ""}. Please adjust your dates.`
      );
      return;
    }
    setError("");
    onNext(localCI, localCO, localAdults, localKids);
  };

  const guestRows = [
    {
      label: "Adults",
      sub: "Ages 13+",
      value: localAdults,
      set: setLocalAdults,
      min: 1,
      max: maxGuests - localKids,
    },
    {
      label: "Children",
      sub: "Ages 2–12",
      value: localKids,
      set: setLocalKids,
      min: 0,
      max: maxGuests - localAdults,
    },
  ] as const;

  return (
    <div className="flex flex-col gap-7">
      {/* Heading */}
      <div>
        <h1 className="font-display font-extrabold text-[#1a0e02] text-3xl mb-1">
          Review your trip
        </h1>
        <p className="text-[#64707d] text-sm">
          Make sure everything looks correct before continuing.
        </p>
      </div>

      {/* ── Dates ─────────────────────────────────────────────────────── */}
      <div
        ref={ref}
        className="bg-white border border-[#e8dfd4] rounded-2xl overflow-visible"
      >
        <div className="px-5 py-4 border-b border-[#f0e8de] flex items-center justify-between">
          <h2 className="font-display font-semibold text-[#1a0e02]">Dates</h2>
          {nights > 0 && (
            <span className="text-sm text-[#64707d] font-medium">
              {nights} night{nights !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="flex divide-x divide-[#f0e8de]">
          {/* Check In */}
          <div
            className="relative flex-1 px-5 py-4 cursor-pointer hover:bg-[#faf7f4] transition-colors select-none rounded-bl-2xl"
            onClick={() => setActive((v) => (v === "checkin" ? null : "checkin"))}
          >
            <p className="text-[10px] font-bold text-[#64707d] uppercase tracking-widest mb-1">
              Check In
            </p>
            <p className={`text-sm font-semibold ${localCI ? "text-[#1a0e02]" : "text-[#a09080]"}`}>
              {localCI ? fmtDate(localCI) : "Add date"}
            </p>
            <p className="text-[10px] text-[#8b5e38] mt-0.5 font-medium">Tap to change</p>
            {active === "checkin" && (
              <CalendarPopup
                value={localCI}
                onChange={(d) => {
                  setLocalCI(d);
                  if (localCO && d >= localCO) setLocalCO(null);
                  setActive("checkout");
                }}
                minDate={today()}
                onClose={() => setActive(null)}
                positionClass="top-full mt-2 left-0"
              />
            )}
          </div>

          {/* Check Out */}
          <div
            className="relative flex-1 px-5 py-4 cursor-pointer hover:bg-[#faf7f4] transition-colors select-none rounded-br-2xl"
            onClick={() => setActive((v) => (v === "checkout" ? null : "checkout"))}
          >
            <p className="text-[10px] font-bold text-[#64707d] uppercase tracking-widest mb-1">
              Check Out
            </p>
            <p className={`text-sm font-semibold ${localCO ? "text-[#1a0e02]" : "text-[#a09080]"}`}>
              {localCO ? fmtDate(localCO) : "Add date"}
            </p>
            <p className="text-[10px] text-[#8b5e38] mt-0.5 font-medium">Tap to change</p>
            {active === "checkout" && (
              <CalendarPopup
                value={localCO}
                onChange={(d) => { setLocalCO(d); setActive(null); }}
                minDate={
                  localCI
                    ? new Date(localCI.getTime() + 86400000)
                    : today()
                }
                onClose={() => setActive(null)}
                positionClass="top-full mt-2 right-0"
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Guests ────────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#e8dfd4] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#f0e8de] flex items-center justify-between">
          <div>
            <h2 className="font-display font-semibold text-[#1a0e02]">Guests</h2>
            <p className="text-xs text-[#64707d] mt-0.5">Up to {maxGuests} guests per booking</p>
          </div>
          <span className="text-sm font-semibold text-[#1a0e02]">
            {localAdults + localKids} total
          </span>
        </div>

        <div className="px-5 py-4 flex flex-col gap-5">
          {guestRows.map(({ label, sub, value, set, min, max }) => (
            <div key={label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#1a0e02]">{label}</p>
                <p className="text-xs text-[#64707d]">{sub}</p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => set((v) => Math.max(min, v - 1))}
                  disabled={value <= min}
                  className="w-9 h-9 rounded-full border border-[#e8dfd4] flex items-center justify-center text-[#1a0e02] text-lg font-light disabled:opacity-30 hover:border-[#8b5e38] hover:text-[#8b5e38] transition-colors"
                >
                  −
                </button>
                <span className="w-6 text-center font-semibold text-[#1a0e02] text-sm">
                  {value}
                </span>
                <button
                  type="button"
                  onClick={() => set((v) => Math.min(max, v + 1))}
                  disabled={value >= max}
                  className="w-9 h-9 rounded-full border border-[#e8dfd4] flex items-center justify-center text-[#1a0e02] text-lg font-light disabled:opacity-30 hover:border-[#8b5e38] hover:text-[#8b5e38] transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Cancellation policy ───────────────────────────────────────── */}
      <div className="flex gap-3 bg-white border border-[#e8dfd4] rounded-2xl px-5 py-4">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-0.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
            fill="rgba(139,94,56,0.08)" stroke="#8b5e38" strokeWidth="1.8" />
          <path d="M9 12l2 2 4-4"
            stroke="#8b5e38" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div>
          <p className="text-sm font-semibold text-[#1a0e02]">Flexible cancellation</p>
          <p className="text-xs text-[#64707d] mt-1 leading-relaxed">
            Cancel free of charge up to 48 hours before check-in.
            After that, the first night is non-refundable.
          </p>
        </div>
      </div>

      {/* ── House rules preview ───────────────────────────────────────── */}
      {houseRules.length > 0 && (
        <div className="bg-white border border-[#e8dfd4] rounded-2xl px-5 py-4">
          <h2 className="font-display font-semibold text-[#1a0e02] mb-3">House rules</h2>
          <ul className="flex flex-col gap-2">
            {houseRules.map((rule) => (
              <li key={rule} className="flex items-start gap-2 text-sm text-[#2b3037]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  className="shrink-0 mt-0.5 text-[#64707d]">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M15 9l-6 6M9 9l6 6"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                {rule}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2.5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
            <path d="M12 8v4M12 16h.01"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          {error}
        </div>
      )}

      {/* CTA */}
      <button
        type="button"
        onClick={handleNext}
        className="w-full py-4 bg-[#8b5e38] font-bold text-base rounded-2xl hover:bg-[#7a5030] active:bg-[#6a4228] transition-colors shadow-sm"
        style={{ color: "#fff" }}
      >
        Continue to Your Details →
      </button>
    </div>
  );
}
