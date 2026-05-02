"use client";

import { useState } from "react";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_LABELS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function today() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

interface CalendarPopupProps {
  value: Date | null;
  onChange: (d: Date) => void;
  minDate?: Date;
  onClose: () => void;
  /** Position class for the popup */
  positionClass?: string;
}

export default function CalendarPopup({
  value,
  onChange,
  minDate,
  onClose,
  positionClass = "top-full mt-2 left-1/2 -translate-x-1/2",
}: CalendarPopupProps) {
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
    <div
      className={`absolute ${positionClass} z-[100] bg-white border border-[#e8dfd4] rounded-2xl shadow-2xl p-4 w-[300px]`}
      onClick={(e) => e.stopPropagation()}
    >
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
          const isSelected = value ? date.toDateString() === value.toDateString() : false;
          const isToday = date.toDateString() === todayDate.toDateString();

          return (
            <button
              key={i}
              type="button"
              disabled={isPast}
              onClick={() => { onChange(date); onClose(); }}
              className={[
                "w-[38px] h-[38px] flex items-center justify-center rounded-lg text-xs font-medium transition-colors mx-auto",
                isPast ? "text-[#c4b49a] cursor-not-allowed" : "cursor-pointer",
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
