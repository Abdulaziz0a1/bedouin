"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import CalendarPopup from "@/components/ui/CalendarPopup";
import { checkAvailability } from "@/lib/actions/availability";
import { useAuth } from "@/context/AuthProvider";
import { useLanguage } from "@/context/LanguageProvider";

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
  isOwnListing?: boolean;
}

type ActiveField = "checkin" | "checkout" | "guests" | null;

type AvailabilityState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "available";   remaining: number; unchecked?: boolean }
  | { status: "unavailable"; remaining: number; message: string }
  | { status: "error";       message: string };

export default function BookingCard({
  price,
  originalPrice,
  priceUnit = "per person",
  score,
  reviewCount,
  minNights,
  maxGuests,
  listingId,
  isOwnListing = false,
}: BookingCardProps) {
  const { user } = useAuth();
  const router   = useRouter();
  const { t }    = useLanguage();

  const [checkIn, setCheckIn]   = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [adults, setAdults]     = useState(1);
  const [children, setChildren] = useState(0);
  const [active, setActive]     = useState<ActiveField>(null);
  const [avail,  setAvail]      = useState<AvailabilityState>({ status: "idle" });

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

  const totalGuests = adults + children;

  // Run availability check whenever both dates and guest count are set
  useEffect(() => {
    if (!checkIn || !checkOut || totalGuests < 1) {
      setAvail({ status: "idle" });
      return;
    }

    const checkInStr  = checkIn.toISOString().split("T")[0];
    const checkOutStr = checkOut.toISOString().split("T")[0];

    setAvail({ status: "checking" });

    checkAvailability(listingId, checkInStr, checkOutStr, totalGuests).then((res) => {
      if (!res.success) {
        setAvail({ status: "error", message: res.error });
        return;
      }
      const d = res.data;
      if (d.available) {
        setAvail({ status: "available", remaining: d.remaining, unchecked: d.unchecked });
      } else {
        const message =
          d.remaining <= 0
            ? t("bcard.not_available")
            : (d.remaining === 1
                ? t("bcard.spots_req").replace("{spots}", String(d.remaining)).replace("{total}", String(totalGuests))
                : t("bcard.spots_req_plural").replace("{spots}", String(d.remaining)).replace("{total}", String(totalGuests)));
        setAvail({ status: "unavailable", remaining: d.remaining, message });
      }
    });
  }, [checkIn, checkOut, totalGuests, listingId]);

  const isUnavailable = avail.status === "unavailable";
  const isChecking    = avail.status === "checking";

  const canReserve = !!checkIn && !!checkOut && nights >= minNights && !isUnavailable && !isChecking;

  const handleReserve = useCallback(() => {
    const bookingUrl = `/booking/${listingId}?checkIn=${checkIn?.toISOString().split("T")[0]}&checkOut=${checkOut?.toISOString().split("T")[0]}&adults=${adults}&children=${children}`;
    if (!user) {
      router.push(`/login?returnTo=${encodeURIComponent(bookingUrl)}`);
    } else {
      router.push(bookingUrl);
    }
  }, [user, router, listingId, checkIn, checkOut, adults, children]);

  const fieldCls =
    "flex-1 flex flex-col px-4 py-3 cursor-pointer select-none hover:bg-[#faf7f4] transition-colors";
  const labelCls = "text-[10px] font-bold text-[#64707d] uppercase tracking-widest mb-0.5";
  const valueCls = (filled: boolean) =>
    `text-sm font-semibold ${filled ? "text-[#1a0e02]" : "text-[#a09080]"}`;

  return (
    <div
      ref={cardRef}
      className="bg-white p-6 flex flex-col gap-5 sticky top-[88px]"
      style={{
        borderRadius: "24px",
        border: "1px solid var(--border)",
        borderTop: "2px solid rgba(196,154,79,0.45)",
        boxShadow: "0 8px 40px rgba(26,14,2,0.12), 0 2px 10px rgba(26,14,2,0.06)",
      }}
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

      {/* Owner block — replaces all interaction for the listing owner */}
      {isOwnListing && (
        <div className="flex items-center gap-3 px-4 py-3.5 bg-[#faf7f4] border border-[#e8dfd4] rounded-2xl text-sm text-[#64707d]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[#8b5e38]">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>{t("bcard.own_listing")}</span>
        </div>
      )}

      {/* All interactive content — hidden for the listing owner */}
      {!isOwnListing && (
        <>
          {/* Date & guest selector */}
          <div className="border border-[#e8dfd4] rounded-2xl overflow-visible">
            {/* Dates row */}
            <div className="flex divide-x divide-[#e8dfd4] relative">
              {/* Check In */}
              <div className={`relative ${fieldCls} rounded-tl-2xl`} onClick={() => toggle("checkin")}>
                <span className={labelCls}>{t("bcard.checkin")}</span>
                <span className={valueCls(!!checkIn)}>
                  {checkIn ? formatDate(checkIn) : t("bcard.add_date")}
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
                <span className={labelCls}>{t("bcard.checkout")}</span>
                <span className={valueCls(!!checkOut)}>
                  {checkOut ? formatDate(checkOut) : t("bcard.add_date")}
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
              <span className={labelCls}>{t("bcard.guests")}</span>
              <span className={valueCls(true)}>
                {(adults + children === 1 ? t("bcard.guest_one") : t("bcard.guest_many")).replace("{n}", String(adults + children))}
                {" "}·{" "}
                {(adults === 1 ? t("bcard.adult_one") : t("bcard.adult_many")).replace("{n}", String(adults))}
                {children > 0 && `, ${children === 1 ? t("bcard.child_one") : t("bcard.child_many").replace("{n}", String(children))}`}
              </span>

              {/* Guests popover */}
              {active === "guests" && (
                <div
                  className="absolute top-full mt-2 left-0 right-0 z-[100] bg-white border border-[#e8dfd4] rounded-2xl shadow-2xl p-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  {[
                    { label: t("bcard.adults"), sub: t("bcard.adults_sub"), value: adults, set: setAdults, min: 1, max: maxGuests },
                    { label: t("bcard.children"), sub: t("bcard.children_sub"), value: children, set: setChildren, min: 0, max: maxGuests - adults },
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
                    {t("bcard.done")}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Min nights notice */}
          {minNights > 1 && (
            <p className="text-xs text-[#64707d] -mt-2">
              {minNights === 1
                ? t("bcard.min_stay").replace("{n}", String(minNights))
                : t("bcard.min_stay_plural").replace("{n}", String(minNights))}
            </p>
          )}

          {/* Availability status banner */}
          {checkIn && checkOut && (
            <div className="-mt-2">
              {isChecking && (
                <div className="flex items-center gap-2 text-xs text-[#64707d] bg-[#faf7f4] border border-[#e8dfd4] rounded-xl px-3 py-2">
                  <svg className="animate-spin w-3.5 h-3.5 text-[#8b5e38]" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="15" />
                  </svg>
                  {t("bcard.checking")}
                </div>
              )}
              {avail.status === "available" && !avail.unchecked && (
                <div className="flex items-center gap-2 text-xs text-[#049153] bg-[#f0faf5] border border-[#c3e8d6] rounded-xl px-3 py-2">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  {avail.remaining <= 3
                    ? (avail.remaining === 1
                        ? t("bcard.spots_few").replace("{n}", String(avail.remaining))
                        : t("bcard.spots_few_plural").replace("{n}", String(avail.remaining)))
                    : t("bcard.available")}
                </div>
              )}
              {avail.status === "unavailable" && (
                <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  {avail.message}
                </div>
              )}
              {avail.status === "error" && (
                <p className="text-xs text-[#a09080] px-1">{t("bcard.error")}</p>
              )}
            </div>
          )}

          {/* Min nights validation warning */}
          {checkIn && checkOut && nights > 0 && nights < minNights && (
            <div className="-mt-2 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
                <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              {minNights === 1
                ? t("bcard.min_warn").replace("{n}", String(minNights))
                : t("bcard.min_warn_plural").replace("{n}", String(minNights))}
            </div>
          )}

          {/* Price breakdown */}
          {nights > 0 && (
            <div className="flex flex-col gap-2 text-sm border-t border-[#f0e8de] pt-4">
              <div className="flex justify-between text-[#1a0e02]">
                <span>
                  {nights === 1
                    ? t("bcard.nights_line").replace("{price}", String(price)).replace("{n}", String(nights))
                    : t("bcard.nights_line_plural").replace("{price}", String(price)).replace("{n}", String(nights))}
                </span>
                <span>SAR {subtotal}</span>
              </div>
              <div className="flex justify-between text-[#64707d]">
                <span>{t("bcard.service_fee")}</span>
                <span>SAR {serviceFee}</span>
              </div>
              <div className="flex justify-between font-bold text-[#1a0e02] text-base border-t border-[#f0e8de] pt-3 mt-1">
                <span>{t("bcard.total")}</span>
                <span>SAR {total}</span>
              </div>
            </div>
          )}

          {/* CTA */}
          {canReserve ? (
            <button
              type="button"
              onClick={handleReserve}
              className="w-full py-3.5 font-bold text-base text-white rounded-xl text-center transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, #8b5e38 0%, #6a4428 100%)",
                boxShadow: "0 6px 20px rgba(139,94,56,0.38), inset 0 1px 0 rgba(255,255,255,0.10)",
              }}
            >
              {user ? t("bcard.reserve") : t("bcard.login_reserve")}
            </button>
          ) : (
            <button
              type="button"
              disabled={isUnavailable}
              onClick={() => { if (!checkIn || !checkOut) setActive("checkin"); }}
              className="w-full py-3.5 font-bold text-base rounded-xl text-center transition-all duration-200"
              style={
                isUnavailable
                  ? { background: "var(--bg-sand)", color: "#a09080", cursor: "not-allowed" }
                  : {
                      background: "linear-gradient(135deg, #8b5e38 0%, #6a4428 100%)",
                      color: "white",
                      boxShadow: "0 6px 20px rgba(139,94,56,0.38)",
                      cursor: "pointer",
                    }
              }
            >
              {isUnavailable ? t("bcard.unavailable") : t("bcard.check_avail")}
            </button>
          )}

          <p className="text-xs text-[#64707d] text-center -mt-2">
            {t("bcard.no_charge")}
          </p>
        </>
      )}
    </div>
  );
}
