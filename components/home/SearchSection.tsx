"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SAUDI_REGIONS } from "@/lib/data/listings";

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

function formatDate(d: Date): string {
  return `${SHORT_MONTHS[d.getMonth()]} ${d.getDate()}`;
}

const today = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

/* ─── Category icons ─────────────────────────────────────────────────────────── */

const FarmIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const HouseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <path d="M12 22V12"/>
  </svg>
);

const GuestHouseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="15" rx="1"/>
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
    <line x1="12" y1="12" x2="12" y2="16"/>
    <line x1="10" y1="14" x2="14" y2="14"/>
  </svg>
);

const CabinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12H3l9-9 9 9h-2"/>
    <path d="M5 12v7a1 1 0 0 0 1 1h4v-4h4v4h4a1 1 0 0 0 1-1v-7"/>
  </svg>
);

const GlampingIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3L2 19h20L12 3z"/>
    <path d="M9 19v-7h6v7"/>
  </svg>
);

const DomsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C8.13 2 5 5.13 5 9v1H3v12h18V10h-2V9c0-3.87-3.13-7-7-7z"/>
  </svg>
);

const CATEGORIES = [
  { id: "farms",      label: "Farms",       icon: <FarmIcon /> },
  { id: "house",      label: "House",       icon: <HouseIcon /> },
  { id: "guesthouse", label: "Guest House", icon: <GuestHouseIcon /> },
  { id: "cabins",     label: "Cabins",      icon: <CabinIcon /> },
  { id: "glamping",   label: "Glamping",    icon: <GlampingIcon /> },
  { id: "doms",       label: "Doms",        icon: <DomsIcon /> },
];

/* ─── Location (region) popup ────────────────────────────────────────────────── */

function LocationPopover({
  value,
  onChange,
  onClose,
}: {
  value: string;
  onChange: (v: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute top-full mt-2 left-0 z-[100] bg-white border border-[#e8dfd4] rounded-2xl shadow-2xl py-2 w-[220px] max-h-[360px] overflow-y-auto">
      <button
        type="button"
        onClick={() => { onChange(""); onClose(); }}
        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
          !value
            ? "font-semibold text-[#8b5e38] bg-[#fdf8f0]"
            : "text-[#64707d] hover:bg-[#f8f4f0]"
        }`}
      >
        All regions
      </button>
      <div className="h-px bg-[#f0e8de] mx-3 my-1" />
      {SAUDI_REGIONS.map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => { onChange(r); onClose(); }}
          className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
            value === r
              ? "font-semibold text-[#8b5e38] bg-[#fdf8f0]"
              : "text-[#1a0e02] hover:bg-[#f8f4f0]"
          }`}
        >
          {r}
        </button>
      ))}
    </div>
  );
}

/* ─── Calendar popup ─────────────────────────────────────────────────────────── */

function CalendarPopup({
  value,
  onChange,
  minDate,
  onClose,
}: {
  value: Date | null;
  onChange: (d: Date) => void;
  minDate?: Date;
  onClose: () => void;
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
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(year, month, d));
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const todayDate = today();

  return (
    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-[100] bg-white border border-[#e8dfd4] rounded-2xl shadow-2xl p-4 w-[300px]">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setViewing(new Date(year, month - 1, 1))}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#f4efe6] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#1a0e02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="text-sm font-semibold text-[#1a0e02]">
          {MONTHS[month]} {year}
        </span>
        <button
          type="button"
          onClick={() => setViewing(new Date(year, month + 1, 1))}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#f4efe6] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="#1a0e02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAY_LABELS.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-bold text-[#64707d] py-1 uppercase tracking-wide"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7">
        {cells.map((date, i) => {
          if (!date) return <div key={i} className="w-[38px] h-[38px]" />;

          const isPast = date < effective;
          const isSelected = value
            ? date.toDateString() === value.toDateString()
            : false;
          const isToday = date.toDateString() === todayDate.toDateString();

          return (
            <button
              key={i}
              type="button"
              disabled={isPast}
              onClick={() => {
                onChange(date);
                onClose();
              }}
              className={[
                "w-[38px] h-[38px] flex items-center justify-center rounded-lg text-xs font-medium transition-colors mx-auto",
                isPast
                  ? "text-[#c4b49a] cursor-not-allowed"
                  : "cursor-pointer",
                isSelected
                  ? "bg-[#8b5e38] text-white font-semibold"
                  : isToday && !isPast
                  ? "border border-[#8b5e38] text-[#8b5e38] font-bold hover:bg-[#f4efe6]"
                  : !isPast
                  ? "text-[#1a0e02] hover:bg-[#f4efe6]"
                  : "",
              ].join(" ")}
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
  rooms,
  adults,
  children,
  setRooms,
  setAdults,
  setChildren,
  onClose,
}: {
  rooms: number;
  adults: number;
  children: number;
  setRooms: React.Dispatch<React.SetStateAction<number>>;
  setAdults: React.Dispatch<React.SetStateAction<number>>;
  setChildren: React.Dispatch<React.SetStateAction<number>>;
  onClose: () => void;
}) {
  const rows = [
    { label: "Rooms",    sub: "Bedrooms",  value: rooms,    set: setRooms,    min: 1 },
    { label: "Adults",   sub: "Ages 13+",  value: adults,   set: setAdults,   min: 1 },
    { label: "Children", sub: "Ages 2–12", value: children, set: setChildren, min: 0 },
  ] as const;

  return (
    <div className="absolute top-full mt-2 right-0 z-[100] bg-white border border-[#e8dfd4] rounded-2xl shadow-2xl p-5 w-[268px]">
      {rows.map(({ label, sub, value, set, min }) => (
        <div
          key={label}
          className="flex items-center justify-between py-3 border-b last:border-0 border-[#f0e8de]"
        >
          <div>
            <p className="text-sm font-semibold text-[#1a0e02]">{label}</p>
            <p className="text-xs text-[#64707d]">{sub}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => set((v) => Math.max(min, v - 1))}
              disabled={value <= min}
              className="w-8 h-8 rounded-full border border-[#e8dfd4] flex items-center justify-center text-[#1a0e02] text-base leading-none disabled:opacity-30 hover:border-[#8b5e38] transition-colors"
            >
              −
            </button>
            <span className="w-6 text-center text-sm font-semibold text-[#1a0e02]">
              {value}
            </span>
            <button
              type="button"
              onClick={() => set((v) => v + 1)}
              className="w-8 h-8 rounded-full border border-[#e8dfd4] flex items-center justify-center text-[#1a0e02] text-base leading-none hover:border-[#8b5e38] transition-colors"
            >
              +
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={onClose}
        className="w-full mt-3 py-2.5 bg-[#8b5e38] text-white text-sm font-semibold rounded-xl hover:bg-[#7a5030] transition-colors"
      >
        Done
      </button>
    </div>
  );
}

/* ─── Main SearchSection ─────────────────────────────────────────────────────── */

type Picker = "location" | "checkin" | "checkout" | "guests" | null;

export default function SearchSection() {
  const router = useRouter();

  const [category, setCategory] = useState("farms");
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn]   = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [rooms,    setRooms]    = useState(1);
  const [adults,   setAdults]   = useState(1);
  const [children, setChildren] = useState(0);
  const [open, setOpen]         = useState<Picker>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close popups on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const toggle = useCallback(
    (picker: Picker) => setOpen((v) => (v === picker ? null : picker)),
    []
  );

  const guestsSummary = `${rooms} ${rooms === 1 ? "room" : "rooms"}, ${adults} ${adults === 1 ? "adult" : "adults"}, ${children} ${children === 1 ? "child" : "children"}`;

  const handleSearch = () => {
    const p = new URLSearchParams({ category });
    if (location)  p.set("region",  location);
    if (checkIn)   p.set("checkIn",  checkIn.toISOString().split("T")[0]);
    if (checkOut)  p.set("checkOut", checkOut.toISOString().split("T")[0]);
    p.set("rooms",    String(rooms));
    p.set("adults",   String(adults));
    p.set("children", String(children));
    router.push(`/explore?${p.toString()}`);
  };

  const fieldBase =
    "flex flex-col justify-center px-5 py-4 cursor-pointer border-b md:border-b-0 md:border-r border-[#ede5da] min-w-0";
  const labelCls = "text-xs font-semibold text-[#2b3037] mb-0.5 leading-none";
  const valueCls = (hasValue: boolean) =>
    `text-sm font-medium leading-snug ${hasValue ? "text-[#1a0e02]" : "text-[#a09080]"}`;

  return (
    <div ref={containerRef} className="max-w-[960px] mx-auto w-full">
      <div
        className="rounded-3xl overflow-visible"
        style={{
          background: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(24px) saturate(1.8)",
          WebkitBackdropFilter: "blur(24px) saturate(1.8)",
          boxShadow: "0 20px 80px rgba(26,14,2,0.22), 0 4px 20px rgba(26,14,2,0.10), inset 0 1px 0 rgba(255,255,255,0.9)",
          border: "1px solid rgba(255,255,255,0.85)",
        }}
      >

        {/* ── Category tabs ──────────────────────────────────────────────── */}
        <div className="px-4 pt-4 pb-3">
          <div className="bg-[#f5f1ec] rounded-2xl p-1 flex items-center gap-0.5 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map((cat) => {
              const active = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={[
                    "flex items-center gap-1.5 px-4 py-2 rounded-xl whitespace-nowrap text-sm font-medium transition-all duration-200 shrink-0 relative",
                    active
                      ? "text-white shadow-md"
                      : "text-[#64707d] hover:text-[#1a0e02] hover:bg-white/80",
                  ].join(" ")}
                  style={active ? {
                    background: "linear-gradient(135deg, #2d1a08 0%, #1c1510 100%)",
                    boxShadow: "0 2px 12px rgba(26,14,2,0.30), inset 0 1px 0 rgba(255,255,255,0.08)",
                  } : undefined}
                >
                  <span className={active ? "text-[#c49a4f]" : "text-[#9b7355]"}>
                    {cat.icon}
                  </span>
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Divider ─────────────────────────────────────────────────────── */}
        <div className="h-px bg-[#ede5da] mx-4" />

        {/* ── Search fields ───────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row items-stretch rounded-b-2xl overflow-visible">

          {/* Location — region dropdown */}
          <div
            className={`relative flex-[1.4] ${fieldBase} md:rounded-bl-2xl select-none`}
            onClick={() => toggle("location")}
          >
            <label className={`${labelCls} pointer-events-none`}>Location</label>
            <span className={valueCls(!!location)}>
              {location || "Where are you going?"}
            </span>
            {open === "location" && (
              <LocationPopover
                value={location}
                onChange={setLocation}
                onClose={() => setOpen(null)}
              />
            )}
          </div>

          {/* Check In */}
          <div
            className={`relative flex-1 ${fieldBase} select-none`}
            onClick={() => toggle("checkin")}
          >
            <label className={`${labelCls} pointer-events-none`}>Check In</label>
            <span className={valueCls(!!checkIn)}>
              {checkIn ? formatDate(checkIn) : "Add Dates"}
            </span>
            {open === "checkin" && (
              <CalendarPopup
                value={checkIn}
                onChange={(d) => {
                  setCheckIn(d);
                  if (checkOut && d >= checkOut) setCheckOut(null);
                }}
                minDate={today()}
                onClose={() => setOpen(null)}
              />
            )}
          </div>

          {/* Check Out */}
          <div
            className={`relative flex-1 ${fieldBase} select-none`}
            onClick={() => toggle("checkout")}
          >
            <label className={`${labelCls} pointer-events-none`}>Check Out</label>
            <span className={valueCls(!!checkOut)}>
              {checkOut ? formatDate(checkOut) : "Add Dates"}
            </span>
            {open === "checkout" && (
              <CalendarPopup
                value={checkOut}
                onChange={setCheckOut}
                minDate={checkIn ? new Date(checkIn.getTime() + 86400000) : today()}
                onClose={() => setOpen(null)}
              />
            )}
          </div>

          {/* Rooms and Guests */}
          <div
            className={`relative flex-[1.3] ${fieldBase} select-none`}
            onClick={() => toggle("guests")}
          >
            <label className={`${labelCls} pointer-events-none`}>
              Rooms and Guests
            </label>
            <span className={valueCls(true)} style={{ fontSize: "0.8rem" }}>
              {guestsSummary}
            </span>
            {open === "guests" && (
              <GuestsPopover
                rooms={rooms}
                adults={adults}
                children={children}
                setRooms={setRooms}
                setAdults={setAdults}
                setChildren={setChildren}
                onClose={() => setOpen(null)}
              />
            )}
          </div>

          {/* Search button */}
          <button
            type="button"
            onClick={handleSearch}
            className="flex items-center justify-center gap-2 px-8 py-4 text-white font-bold text-sm shrink-0 md:rounded-br-2xl transition-all duration-200 hover:-translate-y-px active:translate-y-0 group"
            style={{
              background: "linear-gradient(135deg, #9b6a42 0%, #7a4e2c 100%)",
              boxShadow: "0 4px 16px rgba(139,94,56,0.40), inset 0 1px 0 rgba(255,255,255,0.15)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 8px 28px rgba(139,94,56,0.55), inset 0 1px 0 rgba(255,255,255,0.15)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 4px 16px rgba(139,94,56,0.40), inset 0 1px 0 rgba(255,255,255,0.15)";
            }}
          >
            <svg
              width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true"
              className="transition-transform duration-200 group-hover:scale-110"
            >
              <circle cx="11" cy="11" r="8" stroke="white" strokeWidth="2.2" />
              <path d="M21 21l-4.35-4.35" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
            <span>Search</span>
          </button>
        </div>
      </div>
    </div>
  );
}
