"use client";

import { useState } from "react";
import { ListingDraft, DraftRegion } from "@/lib/types/host";

const REGIONS: { id: DraftRegion; label: string }[] = [
  { id: "AlUla",   label: "AlUla"   },
  { id: "Abha",    label: "Abha"    },
  { id: "Taif",    label: "Taif"    },
  { id: "AlBaha",  label: "Al Baha" },
  { id: "AlAhsa",  label: "Al Ahsa" },
  { id: "Tabuk",   label: "Tabuk"   },
  { id: "Riyadh",  label: "Riyadh"  },
  { id: "Jeddah",  label: "Jeddah"  },
  { id: "Hail",    label: "Hail"    },
  { id: "Madinah", label: "Madinah" },
];

const CHECK_IN_TIMES  = ["12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM","6:00 PM"];
const CHECK_OUT_TIMES = ["9:00 AM","10:00 AM","11:00 AM","12:00 PM","1:00 PM"];

type UpdateFn = <K extends keyof ListingDraft>(key: K, value: ListingDraft[K]) => void;

interface Step3DetailsProps {
  draft:   ListingDraft;
  onChange: UpdateFn;
  onNext:  () => void;
  onBack:  () => void;
}

function Counter({
  label, sub, value, min, max,
  onDec, onInc,
}: {
  label: string; sub: string; value: number; min: number; max: number;
  onDec: () => void; onInc: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0 border-[#f0e8de]">
      <div>
        <p className="text-sm font-semibold text-[#1a0e02]">{label}</p>
        <p className="text-xs text-[#64707d]">{sub}</p>
      </div>
      <div className="flex items-center gap-4">
        <button type="button" onClick={onDec} disabled={value <= min}
          className="w-9 h-9 rounded-full border border-[#e8dfd4] flex items-center justify-center text-[#1a0e02] text-lg font-light disabled:opacity-30 hover:border-[#8b5e38] hover:text-[#8b5e38] transition-colors">
          −
        </button>
        <span className="w-6 text-center font-semibold text-[#1a0e02] text-sm">{value}</span>
        <button type="button" onClick={onInc} disabled={value >= max}
          className="w-9 h-9 rounded-full border border-[#e8dfd4] flex items-center justify-center text-[#1a0e02] text-lg font-light disabled:opacity-30 hover:border-[#8b5e38] hover:text-[#8b5e38] transition-colors">
          +
        </button>
      </div>
    </div>
  );
}

export default function Step3Details({ draft, onChange, onNext, onBack }: Step3DetailsProps) {
  const [errors, setErrors] = useState<{ region?: string; location?: string; mapsUrl?: string }>({});

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!draft.region)          e.region   = "Please select your region.";
    if (!draft.location.trim()) e.location = "Please enter the specific area or address.";
    const mapsUrl = draft.mapsUrl.trim();
    if (!mapsUrl) {
      e.mapsUrl = "Please paste a Google Maps link for your location.";
    } else if (!/^https?:\/\/.+/i.test(mapsUrl)) {
      e.mapsUrl = "Must be a valid URL starting with https://";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const inputCls = (err?: string) =>
    `w-full px-4 py-3 border rounded-xl text-sm text-[#1a0e02] placeholder:text-[#a09080] focus:outline-none bg-white transition-colors ${
      err ? "border-red-400" : "border-[#e8dfd4] focus:border-[#8b5e38]"
    }`;
  const labelCls = "block text-[10px] font-bold text-[#64707d] uppercase tracking-widest mb-1.5";
  const selectCls = `w-full px-4 py-3 border border-[#e8dfd4] rounded-xl text-sm text-[#1a0e02] bg-white focus:outline-none focus:border-[#8b5e38] transition-colors appearance-none`;

  return (
    <div className="flex flex-col gap-7">
      {/* Heading */}
      <div>
        <p className="text-[#c49a4f] text-xs font-bold uppercase tracking-[0.16em] mb-2">Step 3 of 6</p>
        <h1 className="font-display font-extrabold text-[#1a0e02] text-3xl mb-1">
          Where is your place?
        </h1>
        <p className="text-[#64707d] text-sm">
          Help guests understand the location and what to expect from the space.
        </p>
      </div>

      {/* Location */}
      <div className="bg-white border border-[#e8dfd4] rounded-2xl p-6 flex flex-col gap-5">
        <div>
          <label className={labelCls}>Region <span className="text-red-500">*</span></label>
          <select
            value={draft.region}
            onChange={(e) => { onChange("region", e.target.value as DraftRegion); setErrors((v) => ({ ...v, region: "" })); }}
            className={`${selectCls} ${errors.region ? "border-red-400" : ""}`}
          >
            <option value="">Select a region</option>
            {REGIONS.map(({ id, label }) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </select>
          {errors.region && <p className="text-xs text-red-600 mt-1">{errors.region}</p>}
        </div>

        <div>
          <label className={labelCls}>Specific area / neighbourhood <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={draft.location}
            onChange={(e) => { onChange("location", e.target.value); setErrors((v) => ({ ...v, location: "" })); }}
            placeholder="e.g. Al Soudah, Wadi Tayeb Al Ism, Hada Al Sham"
            className={inputCls(errors.location)}
          />
          {errors.location && <p className="text-xs text-red-600 mt-1">{errors.location}</p>}
          <p className="text-[10px] text-[#a09080] mt-1">
            Exact address will only be shared with confirmed guests.
          </p>
        </div>

        <div>
          <label className={labelCls}>
            Google Maps link <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            value={draft.mapsUrl}
            onChange={(e) => {
              onChange("mapsUrl", e.target.value);
              setErrors((v) => ({ ...v, mapsUrl: "" }));
            }}
            placeholder="https://maps.google.com/... or https://maps.app.goo.gl/..."
            className={inputCls(errors.mapsUrl)}
          />
          {errors.mapsUrl && <p className="text-xs text-red-600 mt-1">{errors.mapsUrl}</p>}
          <p className="text-[10px] text-[#a09080] mt-1">
            Open Google Maps, search your location, tap Share → Copy link. Paste it here.
          </p>
        </div>
      </div>

      {/* Guest & room capacity */}
      <div className="bg-white border border-[#e8dfd4] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#f0e8de]">
          <h2 className="font-display font-semibold text-[#1a0e02]">Capacity</h2>
          <p className="text-xs text-[#64707d] mt-0.5">How many guests and rooms does your place have?</p>
        </div>
        <div className="px-5 py-2">
          <Counter label="Guests"   sub="Maximum at one time"    value={draft.maxGuests} min={1} max={30}
            onDec={() => onChange("maxGuests", Math.max(1, draft.maxGuests - 1))}
            onInc={() => onChange("maxGuests", Math.min(30, draft.maxGuests + 1))} />
          <Counter label="Bedrooms" sub="Number of bedrooms"     value={draft.bedrooms}  min={0} max={20}
            onDec={() => onChange("bedrooms",  Math.max(0, draft.bedrooms  - 1))}
            onInc={() => onChange("bedrooms",  Math.min(20, draft.bedrooms + 1))} />
          <Counter label="Beds"     sub="Sleeping spaces (0 for experiences)"  value={draft.beds}  min={0} max={30}
            onDec={() => onChange("beds",  Math.max(0, draft.beds  - 1))}
            onInc={() => onChange("beds",  Math.min(30, draft.beds + 1))} />
          <Counter label="Baths"    sub="Bathrooms (0 for experiences)"        value={draft.baths} min={0} max={20}
            onDec={() => onChange("baths", Math.max(0, draft.baths - 1))}
            onInc={() => onChange("baths", Math.min(20, draft.baths + 1))} />
          <Counter label="Min. nights" sub="Minimum booking length" value={draft.minNights} min={1} max={30}
            onDec={() => onChange("minNights", Math.max(1, draft.minNights - 1))}
            onInc={() => onChange("minNights", Math.min(30, draft.minNights + 1))} />
        </div>
      </div>

      {/* Check-in/out times */}
      <div className="bg-white border border-[#e8dfd4] rounded-2xl p-6 flex flex-col gap-4">
        <h2 className="font-display font-semibold text-[#1a0e02]">Check-in & check-out</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Check-in time</label>
            <select value={draft.checkInTime} onChange={(e) => onChange("checkInTime", e.target.value)} className={selectCls}>
              {CHECK_IN_TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Check-out time</label>
            <select value={draft.checkOutTime} onChange={(e) => onChange("checkOutTime", e.target.value)} className={selectCls}>
              {CHECK_OUT_TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
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
