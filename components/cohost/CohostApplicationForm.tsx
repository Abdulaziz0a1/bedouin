"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { applyAsCohost } from "@/lib/actions/profile";
import { useAuth } from "@/context/AuthProvider";
import { SAUDI_REGIONS } from "@/lib/constants/regions";

// ──────────────────────────────────────────────────────────────────────────────
// Data
// ──────────────────────────────────────────────────────────────────────────────

const SERVICE_OPTIONS = [
  { id: "guest_checkin",       label: "Guest Check-in & Check-out",  icon: "🔑" },
  { id: "guest_communication", label: "Guest Messaging & Support",   icon: "💬" },
  { id: "cleaning",            label: "Cleaning & Housekeeping",     icon: "🧹" },
  { id: "maintenance",         label: "Property Maintenance",        icon: "🔧" },
  { id: "local_guide",         label: "Local Area Guide",            icon: "🗺️" },
  { id: "calendar",            label: "Calendar & Booking Mgmt",     icon: "📅" },
  { id: "listing_support",     label: "Listing Creation & Optimisation", icon: "✍️" },
  { id: "photography",         label: "Property Photography",        icon: "📷" },
  { id: "emergency",           label: "Emergency On-Call",           icon: "🚨" },
];

const PROPERTY_TYPES = [
  { id: "desert_camp",   label: "Desert Camp",     icon: "⛺" },
  { id: "farm",          label: "Farm Stay",       icon: "🌾" },
  { id: "cabin",         label: "Mountain Cabin",  icon: "🌲" },
  { id: "glamping",      label: "Glamping",        icon: "🏕️" },
  { id: "cultural_site", label: "Cultural Site",   icon: "🏛️" },
  { id: "coastal",       label: "Coastal",         icon: "🌊" },
];

const LANGUAGE_OPTIONS = ["Arabic", "English", "Urdu", "Tagalog", "French", "Other"];


type Step = 1 | 2 | 3;

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────

export default function CohostApplicationForm() {
  const router = useRouter();
  const { reloadProfile } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<Step>(1);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Step 1 — Services
  const [serviceTypes,    setServiceTypes]    = useState<string[]>([]);
  const [propertyTypes,   setPropertyTypes]   = useState<string[]>([]);

  // Step 2 — Background
  const [bio,             setBio]             = useState("");
  const [languages,       setLanguages]       = useState<string[]>([]);
  const [experienceYears, setExperienceYears] = useState(0);
  const [region,          setRegion]          = useState("");
  const [city,            setCity]            = useState("");
  const [phone,           setPhone]           = useState("");

  // Step 3 — Fee
  const [feeModel, setFeeModel] = useState<"percentage" | "fixed" | "negotiable">("negotiable");
  const [feeValue, setFeeValue] = useState<string>("");

  const toggleItem = (list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  };

  // ── Validation ─────────────────────────────────────────────────────────────

  const validateStep1 = () => {
    if (serviceTypes.length === 0) { setError("Select at least one service you can provide."); return false; }
    if (propertyTypes.length === 0) { setError("Select at least one property type you can support."); return false; }
    return true;
  };

  const validateStep2 = () => {
    if (bio.trim().length < 30) { setError("Please write at least 30 characters about yourself."); return false; }
    if (languages.length === 0) { setError("Select at least one language."); return false; }
    if (!region) { setError("Select your region."); return false; }
    if (!city.trim()) { setError("Enter your city."); return false; }
    if (!phone.trim()) { setError("Enter your phone number."); return false; }
    return true;
  };

  const goNext = () => {
    setError(null);
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleSubmit = () => {
    setError(null);
    const numericFee = feeValue ? parseFloat(feeValue) : undefined;
    if (feeModel !== "negotiable" && (!numericFee || numericFee <= 0)) {
      setError("Enter a valid fee amount.");
      return;
    }

    startTransition(async () => {
      const result = await applyAsCohost({
        bio,
        languages,
        experienceYears,
        serviceTypes,
        propertyTypes,
        region,
        city,
        phone,
        feeModel,
        feeValue: numericFee,
      });

      if (result.success) {
        setSubmitted(true);
        reloadProfile(); // fire-and-forget — do NOT await
      } else {
        setError(result.error);
      }
    });
  };

  // ── Success ────────────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-12">
        <div className="w-16 h-16 rounded-2xl bg-[#fdf5ee] border border-[#e8dfd4] flex items-center justify-center text-[#8b5e38] mb-2">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="font-display font-extrabold text-[#1a0e02] text-2xl">Application Submitted!</h2>
        <p className="text-[#64707d] text-sm leading-relaxed max-w-md">
          Your service provider application is now under review. We typically respond within
          1–2 business days. You&apos;ll see your status on your account dashboard.
        </p>
        <button
          onClick={() => router.push("/account")}
          className="mt-4 bg-[#461e00] text-white font-bold px-8 py-3 rounded-2xl hover:bg-[#5a2900] transition-colors"
        >
          Go to My Account
        </button>
      </div>
    );
  }

  const stepLabels = ["Your Services", "Your Background", "Fee Preference"];

  return (
    <div className="max-w-xl mx-auto">

      {/* Progress */}
      <div className="flex items-center gap-3 mb-8">
        {stepLabels.map((label, i) => {
          const n = (i + 1) as Step;
          const isActive    = step === n;
          const isCompleted = step > n;
          return (
            <div key={n} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                isCompleted ? "bg-[#049153] text-white" : isActive ? "bg-[#461e00] text-white" : "bg-[#e8dfd4] text-[#8b94a4]"
              }`}>
                {isCompleted ? "✓" : n}
              </div>
              <span className={`text-xs font-semibold hidden sm:block ${isActive ? "text-[#1a0e02]" : "text-[#8b94a4]"}`}>{label}</span>
              {i < 2 && <div className="h-px flex-1 bg-[#e8dfd4]" />}
            </div>
          );
        })}
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-red-500 shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* ── Step 1: Services ─────────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="flex flex-col gap-5">
          <div>
            <h2 className="font-display font-extrabold text-[#1a0e02] text-xl mb-1">What services do you offer?</h2>
            <p className="text-[#64707d] text-sm">Select all the services you can provide to Bedouin hosts.</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#1a0e02] uppercase tracking-wide">Service types</label>
            <div className="grid grid-cols-1 gap-2">
              {SERVICE_OPTIONS.map(({ id, label, icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleItem(serviceTypes, setServiceTypes, id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold border transition-colors text-left ${
                    serviceTypes.includes(id)
                      ? "bg-[#461e00] text-white border-[#461e00]"
                      : "bg-white text-[#1a0e02] border-[#e8dfd4] hover:border-[#8b5e38]"
                  }`}
                >
                  <span className="text-base">{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#1a0e02] uppercase tracking-wide">Property types you can support</label>
            <div className="grid grid-cols-2 gap-2">
              {PROPERTY_TYPES.map(({ id, label, icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleItem(propertyTypes, setPropertyTypes, id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold border transition-colors text-left ${
                    propertyTypes.includes(id)
                      ? "bg-[#461e00] text-white border-[#461e00]"
                      : "bg-white text-[#1a0e02] border-[#e8dfd4] hover:border-[#8b5e38]"
                  }`}
                >
                  <span>{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button onClick={goNext} className="w-full bg-[#461e00] text-white font-bold py-3 rounded-2xl hover:bg-[#5a2900] transition-colors mt-2">
            Continue →
          </button>
        </div>
      )}

      {/* ── Step 2: Background ───────────────────────────────────────────────── */}
      {step === 2 && (
        <div className="flex flex-col gap-5">
          <div>
            <h2 className="font-display font-extrabold text-[#1a0e02] text-xl mb-1">Your background</h2>
            <p className="text-[#64707d] text-sm">Tell hosts a bit about who you are and your experience.</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#1a0e02] uppercase tracking-wide">
              Professional bio <span className="text-[#8b94a4] normal-case font-normal">(min. 30 characters)</span>
            </label>
            <textarea
              rows={4}
              placeholder="I'm an experienced hospitality professional with 5 years in Riyadh's short-stay sector..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full border border-[#e8dfd4] rounded-xl px-4 py-3 text-sm text-[#1a0e02] placeholder:text-[#64707d] outline-none focus:border-[#c49a4f] transition-colors resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#1a0e02] uppercase tracking-wide">Languages</label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGE_OPTIONS.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleItem(languages, setLanguages, lang)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                    languages.includes(lang)
                      ? "bg-[#461e00] text-white border-[#461e00]"
                      : "bg-white text-[#1a0e02] border-[#e8dfd4] hover:border-[#8b5e38]"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#1a0e02] uppercase tracking-wide">Years of relevant experience</label>
            <select
              value={experienceYears}
              onChange={(e) => setExperienceYears(Number(e.target.value))}
              className="w-full border border-[#e8dfd4] rounded-xl px-4 py-3 text-sm text-[#1a0e02] outline-none focus:border-[#c49a4f] bg-white"
            >
              <option value={0}>Less than 1 year</option>
              <option value={1}>1 year</option>
              <option value={2}>2 years</option>
              <option value={3}>3 years</option>
              <option value={5}>4–5 years</option>
              <option value={7}>6–10 years</option>
              <option value={10}>10+ years</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#1a0e02] uppercase tracking-wide">Region</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full border border-[#e8dfd4] rounded-xl px-4 py-3 text-sm text-[#1a0e02] outline-none focus:border-[#c49a4f] bg-white"
            >
              <option value="">Select a region</option>
              {SAUDI_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#1a0e02] uppercase tracking-wide">City</label>
              <input type="text" placeholder="e.g. Riyadh" value={city} onChange={(e) => setCity(e.target.value)}
                className="w-full border border-[#e8dfd4] rounded-xl px-4 py-3 text-sm text-[#1a0e02] placeholder:text-[#64707d] outline-none focus:border-[#c49a4f]" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#1a0e02] uppercase tracking-wide">Phone</label>
              <input type="tel" placeholder="+966 5x xxx xxxx" value={phone} onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-[#e8dfd4] rounded-xl px-4 py-3 text-sm text-[#1a0e02] placeholder:text-[#64707d] outline-none focus:border-[#c49a4f]" />
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 bg-[#f0e8de] text-[#1a0e02] font-bold py-3 rounded-2xl hover:bg-[#e8dfd4]">← Back</button>
            <button onClick={goNext} className="flex-1 bg-[#461e00] text-white font-bold py-3 rounded-2xl hover:bg-[#5a2900]">Continue →</button>
          </div>
        </div>
      )}

      {/* ── Step 3: Fee ──────────────────────────────────────────────────────── */}
      {step === 3 && (
        <div className="flex flex-col gap-5">
          <div>
            <h2 className="font-display font-extrabold text-[#1a0e02] text-xl mb-1">Fee preference</h2>
            <p className="text-[#64707d] text-sm">How do you prefer to charge hosts for your services?</p>
          </div>

          <div className="flex flex-col gap-2">
            {[
              { value: "percentage" as const, label: "Commission %", desc: "A percentage of the booking value" },
              { value: "fixed"      as const, label: "Fixed monthly fee (SAR)", desc: "A flat monthly retainer" },
              { value: "negotiable" as const, label: "Open to negotiation", desc: "You'll discuss directly with each host" },
            ].map(({ value, label, desc }) => (
              <button
                key={value}
                type="button"
                onClick={() => setFeeModel(value)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-colors ${
                  feeModel === value
                    ? "bg-[#461e00] text-white border-[#461e00]"
                    : "bg-white text-[#1a0e02] border-[#e8dfd4] hover:border-[#8b5e38]"
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  feeModel === value ? "border-white" : "border-[#8b94a4]"
                }`}>
                  {feeModel === value && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div>
                  <p className="font-semibold text-sm">{label}</p>
                  <p className={`text-xs mt-0.5 ${feeModel === value ? "text-white/70" : "text-[#8b94a4]"}`}>{desc}</p>
                </div>
              </button>
            ))}
          </div>

          {feeModel !== "negotiable" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#1a0e02] uppercase tracking-wide">
                {feeModel === "percentage" ? "Percentage (%)" : "Monthly fee (SAR)"}
              </label>
              <input
                type="number"
                min="0"
                step={feeModel === "percentage" ? "0.5" : "10"}
                placeholder={feeModel === "percentage" ? "e.g. 12" : "e.g. 800"}
                value={feeValue}
                onChange={(e) => setFeeValue(e.target.value)}
                className="w-full border border-[#e8dfd4] rounded-xl px-4 py-3 text-sm text-[#1a0e02] placeholder:text-[#64707d] outline-none focus:border-[#c49a4f]"
              />
            </div>
          )}

          <div className="flex gap-3 mt-2">
            <button onClick={() => setStep(2)} disabled={isPending} className="flex-1 bg-[#f0e8de] text-[#1a0e02] font-bold py-3 rounded-2xl hover:bg-[#e8dfd4] disabled:opacity-60">← Back</button>
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="flex-1 bg-[#461e00] text-white font-bold py-3 rounded-2xl hover:bg-[#5a2900] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="15" />
                  </svg>
                  Submitting…
                </>
              ) : "Submit Application"}
            </button>
          </div>

          <p className="text-[11px] text-center text-[#8b94a4]">
            By submitting, you agree to Bedouin&apos;s service provider terms of service.
          </p>
        </div>
      )}
    </div>
  );
}
