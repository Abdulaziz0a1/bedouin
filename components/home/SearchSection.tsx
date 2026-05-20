"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SAUDI_REGIONS } from "@/lib/data/listings";
import { REGION_KEY_MAP } from "@/lib/constants/regions";
import { useLanguage } from "@/context/LanguageProvider";
import type { Lang } from "@/lib/i18n/translations";

/* ─── Constants ─────────────────────────────────────────────────────────────── */

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const SHORT_MONTHS = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];
const DAY_LABELS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

const AR_MONTHS = [
  "يناير","فبراير","مارس","أبريل","مايو","يونيو",
  "يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر",
];
const AR_SHORT_MONTHS = [
  "يناير","فبراير","مارس","أبريل","مايو","يونيو",
  "يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر",
];
const AR_DAY_LABELS = ["أح","اث","ث","أر","خ","ج","س"];

function formatDate(d: Date, lang: Lang): string {
  if (lang === "ar") {
    return `${d.getDate()} ${AR_SHORT_MONTHS[d.getMonth()]}`;
  }
  return `${SHORT_MONTHS[d.getMonth()]} ${d.getDate()}`;
}

const today = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

function buildArabicGuestSummary(rooms: number, adults: number, children: number): string {
  const r = rooms === 1 ? "غرفة واحدة" : `${rooms} غرف`;
  const a = adults === 1 ? "بالغ واحد" : `${adults} بالغون`;
  const c = children === 0 ? "بدون أطفال" : children === 1 ? "طفل واحد" : `${children} أطفال`;
  return `${r}، ${a}، ${c}`;
}

/* ─── Category icons ─────────────────────────────────────────────────────────── */

const FarmIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const HouseIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <path d="M12 22V12"/>
  </svg>
);

const GuestHouseIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="15" rx="1"/>
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
    <line x1="12" y1="12" x2="12" y2="16"/>
    <line x1="10" y1="14" x2="14" y2="14"/>
  </svg>
);

const CabinIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12H3l9-9 9 9h-2"/>
    <path d="M5 12v7a1 1 0 0 0 1 1h4v-4h4v4h4a1 1 0 0 0 1-1v-7"/>
  </svg>
);

const GlampingIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3L2 19h20L12 3z"/>
    <path d="M9 19v-7h6v7"/>
  </svg>
);

const DomsIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C8.13 2 5 5.13 5 9v1H3v12h18V10h-2V9c0-3.87-3.13-7-7-7z"/>
  </svg>
);

const CATEGORY_DEFS = [
  { id: "farms",      key: "search.cat.farms",      icon: <FarmIcon /> },
  { id: "house",      key: "search.cat.house",      icon: <HouseIcon /> },
  { id: "guesthouse", key: "search.cat.guesthouse", icon: <GuestHouseIcon /> },
  { id: "cabins",     key: "search.cat.cabins",     icon: <CabinIcon /> },
  { id: "glamping",   key: "search.cat.glamping",   icon: <GlampingIcon /> },
  { id: "doms",       key: "search.cat.doms",       icon: <DomsIcon /> },
] as const;

/* ─── Popup style ────────────────────────────────────────────────────────────── */

const popupStyle: React.CSSProperties = {
  background: "rgba(250,243,228,0.97)",
  backdropFilter: "blur(28px) saturate(1.8)",
  WebkitBackdropFilter: "blur(28px) saturate(1.8)",
  border: "1px solid rgba(196,154,79,0.18)",
  borderRadius: "18px",
  boxShadow: [
    "0 24px 60px rgba(10,5,0,0.30)",
    "0 8px 20px rgba(10,5,0,0.14)",
    "inset 0 1px 0 rgba(255,255,255,0.70)",
  ].join(", "),
};

/* ─── Location popup ─────────────────────────────────────────────────────────── */

function LocationPopover({
  value, onChange, onClose, t, lang,
}: {
  value: string;
  onChange: (v: string) => void;
  onClose: () => void;
  t: (key: string) => string;
  lang: Lang;
}) {
  return (
    <div
      className={`absolute top-full mt-3 ${lang === "ar" ? "right-0" : "left-0"} z-[100] py-2 w-[230px] max-h-[360px] overflow-y-auto`}
      style={popupStyle}
    >
      <button
        type="button"
        onClick={() => { onChange(""); onClose(); }}
        className={`w-full text-left px-4 py-2.5 text-[0.82rem] transition-colors ${
          !value ? "font-semibold text-[#8b5e38] bg-[#fdf0df]/60" : "text-[#5a3d1e] hover:bg-[#faf0e0]/50"
        }`}
        style={{ textAlign: lang === "ar" ? "right" : "left" }}
      >
        {t("search.all_regions")}
      </button>
      <div className="mx-3 my-1.5" style={{ height: "1px", background: "rgba(196,154,79,0.14)" }} />
      {SAUDI_REGIONS.map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => { onChange(r); onClose(); }}
          className={`w-full px-4 py-2.5 text-[0.82rem] transition-colors ${
            value === r ? "font-semibold text-[#8b5e38] bg-[#fdf0df]/60" : "text-[#1a0e02] hover:bg-[#faf0e0]/50"
          }`}
          style={{ textAlign: lang === "ar" ? "right" : "left" }}
        >
          {t(REGION_KEY_MAP[r] ?? r)}
</button>
      ))}
    </div>
  );
}

/* ─── Calendar popup ─────────────────────────────────────────────────────────── */

function CalendarPopup({
  value, onChange, minDate, onClose, lang,
}: {
  value: Date | null;
  onChange: (d: Date) => void;
  minDate?: Date;
  onClose: () => void;
  lang: Lang;
}) {
  const effective = minDate ?? today();
  const [viewing, setViewing] = useState(() => {
    const base = value && value >= effective ? value : effective;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const year = viewing.getFullYear();
  const month = viewing.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const todayDate = today();
  const months = lang === "ar" ? AR_MONTHS : MONTHS;
  const dayLabels = lang === "ar" ? AR_DAY_LABELS : DAY_LABELS;

  const goPrev = () => setViewing(new Date(year, month - 1, 1));
  const goNext = () => setViewing(new Date(year, month + 1, 1));

  return (
    <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 z-[100] p-4 w-[306px]" style={popupStyle}>
      <div className="flex items-center justify-between mb-4">
        <button type="button" onClick={lang === "ar" ? goNext : goPrev}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-[#7a5030] transition-colors"
          style={{ background: "rgba(196,154,79,0.08)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(196,154,79,0.16)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(196,154,79,0.08)"; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="text-[0.82rem] font-bold text-[#1a0e02] tracking-wide">{months[month]} {year}</span>
        <button type="button" onClick={lang === "ar" ? goPrev : goNext}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-[#7a5030] transition-colors"
          style={{ background: "rgba(196,154,79,0.08)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(196,154,79,0.16)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(196,154,79,0.08)"; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-7 mb-2">
        {dayLabels.map((d) => (
          <div key={d} className="text-center text-[9px] font-bold text-[#b09070] py-1 uppercase tracking-[0.14em]">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((date, i) => {
          if (!date) return <div key={i} className="w-[38px] h-[38px]" />;
          const isPast = date < effective;
          const isSelected = value ? date.toDateString() === value.toDateString() : false;
          const isToday = date.toDateString() === todayDate.toDateString();
          return (
            <button key={i} type="button" disabled={isPast}
              onClick={() => { onChange(date); onClose(); }}
              className="w-[38px] h-[38px] flex items-center justify-center rounded-lg text-xs font-medium transition-all duration-150 mx-auto"
              style={
                isSelected
                  ? { background: "linear-gradient(135deg, #8b5e38 0%, #6e4820 100%)", color: "white", fontWeight: 700, boxShadow: "0 2px 10px rgba(139,94,56,0.35)" }
                  : isToday && !isPast
                  ? { border: "1.5px solid rgba(196,154,79,0.70)", color: "#8b5e38", fontWeight: 700 }
                  : isPast
                  ? { color: "#d4bfa0", cursor: "not-allowed" }
                  : { color: "#1a0e02" }
              }
              onMouseEnter={(e) => { if (!isPast && !isSelected) (e.currentTarget as HTMLButtonElement).style.background = "rgba(196,154,79,0.14)"; }}
              onMouseLeave={(e) => { if (!isPast && !isSelected) (e.currentTarget as HTMLButtonElement).style.background = ""; }}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Guests popup ───────────────────────────────────────────────────────────── */

function GuestsPopover({
  rooms, adults, children, setRooms, setAdults, setChildren, onClose, t, lang,
}: {
  rooms: number; adults: number; children: number;
  setRooms: React.Dispatch<React.SetStateAction<number>>;
  setAdults: React.Dispatch<React.SetStateAction<number>>;
  setChildren: React.Dispatch<React.SetStateAction<number>>;
  onClose: () => void;
  t: (key: string) => string;
  lang: Lang;
}) {
  const rows = [
    { label: t("search.guest_rooms"),    sub: t("search.guest_rooms_sub"),  value: rooms,    set: setRooms,    min: 1 },
    { label: t("search.guest_adult"),    sub: t("search.guest_adult_sub"),  value: adults,   set: setAdults,   min: 1 },
    { label: t("search.guest_children"), sub: t("search.guest_child_sub"),  value: children, set: setChildren, min: 0 },
  ] as const;

  return (
    <div
      className={`absolute top-full mt-3 ${lang === "ar" ? "left-0" : "right-0"} z-[100] p-5 w-[272px]`}
      style={popupStyle}
      onClick={(e) => e.stopPropagation()}
    >
      {rows.map(({ label, sub, value, set, min }) => (
        <div key={label} className="flex items-center justify-between py-3.5"
          style={{ borderBottom: "1px solid rgba(196,154,79,0.12)" }}>
          <div>
            <p className="text-[0.84rem] font-semibold text-[#1a0e02]">{label}</p>
            <p className="text-[0.72rem] text-[#9b7a5a] mt-0.5">{sub}</p>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => set((v) => Math.max(min, v - 1))} disabled={value <= min}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#6e5840] text-base leading-none disabled:opacity-30 transition-all duration-150"
              style={{ border: "1.5px solid rgba(196,154,79,0.32)" }}
              onMouseEnter={(e) => { if (value > min) (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(196,154,79,0.65)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(196,154,79,0.32)"; }}
            >−</button>
            <span className="w-6 text-center text-[0.85rem] font-bold text-[#1a0e02]">{value}</span>
            <button type="button" onClick={() => set((v) => v + 1)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#6e5840] text-base leading-none transition-all duration-150"
              style={{ border: "1.5px solid rgba(196,154,79,0.32)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(196,154,79,0.65)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(196,154,79,0.32)"; }}
            >+</button>
          </div>
        </div>
      ))}
      <button type="button" onClick={onClose}
        className="w-full mt-4 py-2.5 text-[rgba(255,250,235,0.96)] text-[0.82rem] font-bold rounded-xl transition-all duration-150 hover:-translate-y-[1px] active:translate-y-0"
        style={{
          background: "linear-gradient(135deg, rgba(196,154,79,0.90) 0%, rgba(150,108,36,0.94) 100%)",
          boxShadow: "0 4px 14px rgba(150,105,30,0.32), inset 0 1px 0 rgba(255,255,255,0.18)",
        }}
      >{t("search.done")}</button>
    </div>
  );
}

/* ─── Main SearchSection ─────────────────────────────────────────────────────── */

type Picker = "location" | "checkin" | "checkout" | "guests" | null;

export default function SearchSection() {
  const router = useRouter();
  const { t, lang } = useLanguage();

  const [category, setCategory] = useState("farms");
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn]   = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [rooms,    setRooms]    = useState(1);
  const [adults,   setAdults]   = useState(1);
  const [children, setChildren] = useState(0);
  const [open, setOpen]         = useState<Picker>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const toggle = useCallback(
    (picker: Picker) => setOpen((v) => (v === picker ? null : picker)),
    []
  );

  const guestsSummary = lang === "ar"
    ? buildArabicGuestSummary(rooms, adults, children)
    : `${rooms} ${rooms === 1 ? "room" : "rooms"}, ${adults} ${adults === 1 ? "adult" : "adults"}, ${children} ${children === 1 ? "child" : "children"}`;

  const handleSearch = () => {
    const p = new URLSearchParams({ category });
    if (location)  p.set("region",   location);
    if (checkIn)   p.set("checkIn",  checkIn.toISOString().split("T")[0]);
    if (checkOut)  p.set("checkOut", checkOut.toISOString().split("T")[0]);
    p.set("rooms",    String(rooms));
    p.set("adults",   String(adults));
    p.set("children", String(children));
    router.push(`/explore?${p.toString()}`);
  };

  /* ── Field typography ──────────────────────────────────────────────────── */
  const labelCls = "text-[9px] font-bold uppercase tracking-[0.24em] leading-none mb-[5px] pointer-events-none";
  const labelStyle: React.CSSProperties = { color: "rgba(118,75,28,0.72)" };
  const valueCls  = (hasValue: boolean) =>
    `text-[0.87rem] font-semibold leading-tight ${hasValue ? "" : ""}`;
  const valueStyle = (hasValue: boolean): React.CSSProperties => ({
    color: hasValue ? "#1a0e02" : "rgba(170,120,55,0.58)",
  });

  /* ── Open-field accent ─────────────────────────────────────────────────── */
  const fieldActiveBg = "rgba(245,232,200,0.65)";

  /* ── Shared vertical separator ─────────────────────────────────────────── */
  const Separator = () => (
    <div className="hidden md:block absolute right-0 top-[14px] bottom-[14px]"
      style={{ width: "1px", background: "rgba(185,145,72,0.20)" }} />
  );

  return (
    <div ref={containerRef} className="max-w-[980px] mx-auto w-full">

      {/*
        Outer card:
          - provides the unified border, shadow, and backdrop blur
          - overflow: visible so calendar/location/guest popups aren't clipped
          - NO background — the two inner zones supply their own surfaces
      */}
      <div
        className="rounded-[22px] overflow-visible"
        style={{
          backdropFilter: "blur(28px) saturate(1.55)",
          WebkitBackdropFilter: "blur(28px) saturate(1.55)",
          border: "1px solid rgba(205,168,95,0.26)",
          boxShadow: [
            "0 40px 90px rgba(6,3,0,0.58)",
            "0 20px 44px rgba(6,3,0,0.32)",
            "0 8px 18px rgba(6,3,0,0.20)",
            "0 0 0 1px rgba(196,154,79,0.14)",
            "inset 0 1px 0 rgba(255,245,210,0.22)",
          ].join(", "),
        }}
      >

        {/* ── Zone A: Category tabs — dark cinematic glass ───────────────── */}
        <div
          className="px-4 pt-[14px] pb-[12px] rounded-t-[21px]"
          style={{ background: "rgba(14,7,2,0.60)" }}
        >
          <div
            className="rounded-[10px] p-[4px] flex items-center gap-[3px] overflow-x-auto scrollbar-hide"
            style={{
              background: "rgba(255,240,195,0.055)",
              border: "1px solid rgba(196,154,79,0.09)",
            }}
          >
            {CATEGORY_DEFS.map((cat) => {
              const active = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className="flex items-center gap-[7px] px-[13px] py-[7px] rounded-[8px] whitespace-nowrap text-[0.775rem] font-semibold transition-all duration-200 shrink-0"
                  style={
                    active
                      ? {
                          color: "rgba(255,250,230,0.96)",
                          background: "linear-gradient(148deg, rgba(196,154,79,0.86) 0%, rgba(158,116,38,0.90) 55%, rgba(122,86,18,0.94) 100%)",
                          boxShadow: [
                            "0 2px 14px rgba(180,135,40,0.38)",
                            "0 1px 4px rgba(10,5,0,0.20)",
                            "inset 0 1px 0 rgba(255,255,255,0.20)",
                          ].join(", "),
                          border: "1px solid rgba(220,180,90,0.36)",
                        }
                      : {
                          color: "rgba(215,185,135,0.68)",
                        }
                  }
                  onMouseEnter={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLButtonElement).style.color = "rgba(240,215,165,0.92)";
                      (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,240,195,0.10)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLButtonElement).style.color = "rgba(215,185,135,0.68)";
                      (e.currentTarget as HTMLButtonElement).style.background = "";
                    }
                  }}
                >
                  <span style={{ opacity: active ? 0.92 : 0.55 }}>{cat.icon}</span>
                  {t(cat.key)}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Divider between zones ──────────────────────────────────────── */}
        <div style={{
          height: "1px",
          background: "linear-gradient(to right, rgba(196,154,79,0.08), rgba(196,154,79,0.20) 30%, rgba(196,154,79,0.20) 70%, rgba(196,154,79,0.08))",
        }} />

        {/* ── Zone B: Search fields — warm ivory desert glass ────────────── */}
        <div
          className="flex flex-col md:flex-row items-stretch overflow-visible rounded-b-[21px]"
          style={{ background: "rgba(250,240,215,0.82)" }}
        >

          {/* Location */}
          <div
            className="relative flex-[1.4] flex flex-col justify-center px-5 py-[17px] cursor-pointer min-w-0 select-none transition-all duration-150 md:rounded-bl-[21px]"
            style={{
              borderBottom: "1px solid rgba(185,145,72,0.14)",
              background: open === "location" ? fieldActiveBg : "transparent",
            }}
            onClick={() => toggle("location")}
          >
            <Separator />
            <label className={labelCls} style={labelStyle}>{t("search.where_to")}</label>
            <span className={valueCls(!!location)} style={valueStyle(!!location)}>
              {location || t("search.any_region")}
            </span>
            {open === "location" && (
              <LocationPopover value={location} onChange={setLocation} onClose={() => setOpen(null)} t={t} lang={lang} />
            )}
          </div>

          {/* Check In */}
          <div
            className="relative flex-1 flex flex-col justify-center px-5 py-[17px] cursor-pointer min-w-0 select-none transition-all duration-150"
            style={{
              borderBottom: "1px solid rgba(185,145,72,0.14)",
              background: open === "checkin" ? fieldActiveBg : "transparent",
            }}
            onClick={() => toggle("checkin")}
          >
            <Separator />
            <label className={labelCls} style={labelStyle}>{t("search.checkin_label")}</label>
            <span className={valueCls(!!checkIn)} style={valueStyle(!!checkIn)}>
              {checkIn ? formatDate(checkIn, lang) : t("search.add_dates")}
            </span>
            {open === "checkin" && (
              <CalendarPopup
                value={checkIn}
                onChange={(d) => { setCheckIn(d); if (checkOut && d >= checkOut) setCheckOut(null); }}
                minDate={today()}
                onClose={() => setOpen(null)}
                lang={lang}
              />
            )}
          </div>

          {/* Check Out */}
          <div
            className="relative flex-1 flex flex-col justify-center px-5 py-[17px] cursor-pointer min-w-0 select-none transition-all duration-150"
            style={{
              borderBottom: "1px solid rgba(185,145,72,0.14)",
              background: open === "checkout" ? fieldActiveBg : "transparent",
            }}
            onClick={() => toggle("checkout")}
          >
            <Separator />
            <label className={labelCls} style={labelStyle}>{t("search.checkout_label")}</label>
            <span className={valueCls(!!checkOut)} style={valueStyle(!!checkOut)}>
              {checkOut ? formatDate(checkOut, lang) : t("search.add_dates")}
            </span>
            {open === "checkout" && (
              <CalendarPopup
                value={checkOut}
                onChange={setCheckOut}
                minDate={checkIn ? new Date(checkIn.getTime() + 86400000) : today()}
                onClose={() => setOpen(null)}
                lang={lang}
              />
            )}
          </div>

          {/* Rooms & Guests */}
          <div
            className="relative flex-[1.3] flex flex-col justify-center px-5 py-[17px] cursor-pointer min-w-0 select-none transition-all duration-150"
            style={{
              borderBottom: "1px solid rgba(185,145,72,0.14)",
              background: open === "guests" ? fieldActiveBg : "transparent",
            }}
            onClick={() => toggle("guests")}
          >
            <Separator />
            <label className={labelCls} style={labelStyle}>{t("search.rooms_guests")}</label>
            <span className={valueCls(true)} style={{ ...valueStyle(true), fontSize: "0.82rem" }}>
              {guestsSummary}
            </span>
            {open === "guests" && (
              <GuestsPopover
                rooms={rooms} adults={adults} children={children}
                setRooms={setRooms} setAdults={setAdults} setChildren={setChildren}
                onClose={() => setOpen(null)}
                t={t}
                lang={lang}
              />
            )}
          </div>

          {/* Search button */}
          <button
            type="button"
            onClick={handleSearch}
            className="flex items-center justify-center gap-2.5 px-9 py-[17px] shrink-0 md:rounded-br-[21px] transition-all duration-200 hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.99] group relative overflow-hidden"
            style={{
              color: "rgba(255,250,232,0.96)",
              fontWeight: 700,
              fontSize: "0.83rem",
              letterSpacing: "0.04em",
              background: "linear-gradient(148deg, rgba(196,154,79,0.90) 0%, rgba(158,114,36,0.94) 50%, rgba(120,82,18,0.97) 100%)",
              boxShadow: [
                "0 4px 20px rgba(150,105,28,0.40)",
                "0 2px 8px rgba(10,5,0,0.20)",
                "inset 0 1px 0 rgba(255,255,255,0.18)",
                "inset 0 -1px 0 rgba(0,0,0,0.08)",
              ].join(", "),
              borderLeft: "1px solid rgba(205,168,90,0.22)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = [
                "0 6px 26px rgba(150,105,28,0.54)",
                "0 3px 12px rgba(10,5,0,0.24)",
                "inset 0 1px 0 rgba(255,255,255,0.20)",
                "inset 0 -1px 0 rgba(0,0,0,0.08)",
              ].join(", ");
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = [
                "0 4px 20px rgba(150,105,28,0.40)",
                "0 2px 8px rgba(10,5,0,0.20)",
                "inset 0 1px 0 rgba(255,255,255,0.18)",
                "inset 0 -1px 0 rgba(0,0,0,0.08)",
              ].join(", ");
            }}
          >
            {/* Shimmer on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-350 pointer-events-none"
              style={{ background: "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.07) 50%, transparent 70%)" }} />
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"
              className="transition-transform duration-200 group-hover:scale-110 relative z-10">
              <circle cx="11" cy="11" r="7.5" stroke="rgba(255,250,225,0.85)" strokeWidth="2.2" />
              <path d="M20 20l-3.8-3.8" stroke="rgba(255,250,225,0.85)" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
            <span className="relative z-10">{t("search.button")}</span>
          </button>

        </div>
      </div>
    </div>
  );
}
