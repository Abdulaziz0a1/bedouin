"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { applyAsHost } from "@/lib/actions/profile";
import { useAuth } from "@/context/AuthProvider";
import { SAUDI_REGIONS } from "@/lib/constants/regions";

// ──────────────────────────────────────────────────────────────────────────────
// Data
// ──────────────────────────────────────────────────────────────────────────────

const PROPERTY_TYPE_OPTIONS = [
  { id: "farm",        label: "Farm Stay",       icon: "🌾" },
  { id: "heritage",    label: "Heritage House",  icon: "🏛️" },
  { id: "guesthouse",  label: "Guest House",     icon: "🏡" },
  { id: "cabin",       label: "Highland Cabin",  icon: "🌲" },
  { id: "glamping",    label: "Desert Glamping", icon: "⛺" },
  { id: "dome",        label: "Dome Suite",      icon: "🔭" },
];

const LANGUAGE_OPTIONS = ["Arabic", "English", "Urdu", "Tagalog", "French", "Other"];


type Step = 1 | 2 | 3;

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────

export default function HostOnboardingForm() {
  const router = useRouter();
  const { reloadProfile } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<Step>(1);
  const [error, setError] = useState<string | null>(null);

  // Step 1 — About you
  const [bio,             setBio]             = useState("");
  const [languages,       setLanguages]       = useState<string[]>([]);
  const [experienceYears, setExperienceYears] = useState(0);

  // Step 2 — Property & location
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [region,        setRegion]        = useState("");
  const [city,          setCity]          = useState("");
  const [phone,         setPhone]         = useState("");

  // Step 3 — Payout info
  const [bankName,       setBankName]       = useState("");
  const [iban,           setIban]           = useState("");
  const [accountHolder,  setAccountHolder]  = useState("");

  const [submitted, setSubmitted] = useState(false);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const toggleItem = (
    list: string[],
    setList: (v: string[]) => void,
    item: string
  ) => {
    setList(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  };

  // ── Step validation ────────────────────────────────────────────────────────

  const validateStep1 = () => {
    if (bio.trim().length < 30) {
      setError("Please write at least 30 characters about yourself.");
      return false;
    }
    if (languages.length === 0) {
      setError("Select at least one language you speak.");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (propertyTypes.length === 0) {
      setError("Select at least one property type you can host.");
      return false;
    }
    if (!region) {
      setError("Select your region.");
      return false;
    }
    if (!city.trim()) {
      setError("Enter your city.");
      return false;
    }
    if (!phone.trim()) {
      setError("Enter your phone number.");
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!bankName.trim()) {
      setError("Enter your bank name.");
      return false;
    }
    const ibanClean = iban.trim().replace(/\s/g, "").toUpperCase();
    if (!/^SA\d{22}$/.test(ibanClean)) {
      setError("Enter a valid Saudi IBAN (SA + 22 digits).");
      return false;
    }
    if (!accountHolder.trim()) {
      setError("Enter the account holder name.");
      return false;
    }
    return true;
  };

  const goNext = () => {
    setError(null);
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleSubmit = () => {
    setError(null);
    if (!validateStep3()) return;

    startTransition(async () => {
      const result = await applyAsHost({
        bio,
        languages,
        experienceYears,
        propertyTypes,
        region,
        city,
        phone,
        bankName,
        iban: iban.trim().replace(/\s/g, "").toUpperCase(),
        accountHolder,
      });

      if (result.success) {
        setSubmitted(true);
        reloadProfile(); // fire-and-forget — do NOT await
      } else {
        setError(result.error);
      }
    });
  };

  // ── Success screen ─────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-12">
        <div className="w-16 h-16 rounded-2xl bg-[#fdf5ee] border border-[#e8dfd4] flex items-center justify-center text-[#8b5e38] mb-2">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="font-display font-extrabold text-[#1a0e02] text-2xl">
          Application Submitted!
        </h2>
        <p className="text-[#64707d] text-sm leading-relaxed max-w-md">
          Your host application is now under review. We typically respond within
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

  // ── Progress indicator ─────────────────────────────────────────────────────

  const stepLabels = ["About You", "Your Property", "Payout Info"];

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
                isCompleted
                  ? "bg-[#049153] text-white"
                  : isActive
                    ? "bg-[#461e00] text-white"
                    : "bg-[#e8dfd4] text-[#8b94a4]"
              }`}>
                {isCompleted ? "✓" : n}
              </div>
              <span className={`text-xs font-semibold hidden sm:block ${isActive ? "text-[#1a0e02]" : "text-[#8b94a4]"}`}>
                {label}
              </span>
              {i < 2 && <div className="h-px flex-1 bg-[#e8dfd4]" />}
            </div>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-red-500 shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* ── Step 1 ──────────────────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="flex flex-col gap-5">
          <div>
            <h2 className="font-display font-extrabold text-[#1a0e02] text-xl mb-1">Tell us about yourself</h2>
            <p className="text-[#64707d] text-sm">Help guests understand who they&apos;ll be hosted by.</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#1a0e02] uppercase tracking-wide">
              Short bio <span className="text-[#8b94a4] normal-case font-normal">(min. 30 characters)</span>
            </label>
            <textarea
              rows={4}
              placeholder="I'm a passionate hospitality host from AlUla who loves sharing authentic Saudi desert culture..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full border border-[#e8dfd4] rounded-xl px-4 py-3 text-sm text-[#1a0e02] placeholder:text-[#64707d] outline-none focus:border-[#c49a4f] transition-colors resize-none"
            />
            <span className="text-[11px] text-[#8b94a4] text-right">{bio.length} chars</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#1a0e02] uppercase tracking-wide">Languages you speak</label>
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
            <label className="text-xs font-bold text-[#1a0e02] uppercase tracking-wide">
              Years of hosting experience
            </label>
            <select
              value={experienceYears}
              onChange={(e) => setExperienceYears(Number(e.target.value))}
              className="w-full border border-[#e8dfd4] rounded-xl px-4 py-3 text-sm text-[#1a0e02] outline-none focus:border-[#c49a4f] transition-colors bg-white"
            >
              <option value={0}>First time hosting</option>
              <option value={1}>1 year</option>
              <option value={2}>2 years</option>
              <option value={3}>3 years</option>
              <option value={5}>4–5 years</option>
              <option value={7}>6–10 years</option>
              <option value={10}>10+ years</option>
            </select>
          </div>

          <button
            onClick={goNext}
            className="w-full bg-[#461e00] text-white font-bold py-3 rounded-2xl hover:bg-[#5a2900] transition-colors mt-2"
          >
            Continue →
          </button>
        </div>
      )}

      {/* ── Step 2 ──────────────────────────────────────────────────────────── */}
      {step === 2 && (
        <div className="flex flex-col gap-5">
          <div>
            <h2 className="font-display font-extrabold text-[#1a0e02] text-xl mb-1">Your property details</h2>
            <p className="text-[#64707d] text-sm">What kind of stays will you offer, and where?</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#1a0e02] uppercase tracking-wide">Property types you can host</label>
            <div className="grid grid-cols-2 gap-2">
              {PROPERTY_TYPE_OPTIONS.map(({ id, label, icon }) => (
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

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#1a0e02] uppercase tracking-wide">Region</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full border border-[#e8dfd4] rounded-xl px-4 py-3 text-sm text-[#1a0e02] outline-none focus:border-[#c49a4f] transition-colors bg-white"
            >
              <option value="">Select a region</option>
              {SAUDI_REGIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#1a0e02] uppercase tracking-wide">City</label>
              <input
                type="text"
                placeholder="e.g. AlUla"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border border-[#e8dfd4] rounded-xl px-4 py-3 text-sm text-[#1a0e02] placeholder:text-[#64707d] outline-none focus:border-[#c49a4f] transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#1a0e02] uppercase tracking-wide">Phone number</label>
              <input
                type="tel"
                placeholder="+966 5x xxx xxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-[#e8dfd4] rounded-xl px-4 py-3 text-sm text-[#1a0e02] placeholder:text-[#64707d] outline-none focus:border-[#c49a4f] transition-colors"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 bg-[#f0e8de] text-[#1a0e02] font-bold py-3 rounded-2xl hover:bg-[#e8dfd4] transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={goNext}
              className="flex-1 bg-[#461e00] text-white font-bold py-3 rounded-2xl hover:bg-[#5a2900] transition-colors"
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3 ──────────────────────────────────────────────────────────── */}
      {step === 3 && (
        <div className="flex flex-col gap-5">
          <div>
            <h2 className="font-display font-extrabold text-[#1a0e02] text-xl mb-1">Payout information</h2>
            <p className="text-[#64707d] text-sm">
              Where should we send your earnings? You keep 92% of every booking.
            </p>
          </div>

          {/* Security note */}
          <div className="flex items-start gap-3 bg-[#f0faf5] border border-[#c8ead8] rounded-xl px-4 py-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#049153] shrink-0 mt-0.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-xs text-[#049153] leading-relaxed">
              Your banking information is encrypted and stored securely. It is only used for payout transfers and is never shared with guests.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#1a0e02] uppercase tracking-wide">Bank name</label>
            <input
              type="text"
              placeholder="e.g. Al Rajhi Bank"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full border border-[#e8dfd4] rounded-xl px-4 py-3 text-sm text-[#1a0e02] placeholder:text-[#64707d] outline-none focus:border-[#c49a4f] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#1a0e02] uppercase tracking-wide">IBAN</label>
            <input
              type="text"
              placeholder="SA00 0000 0000 0000 0000 0000"
              value={iban}
              onChange={(e) => setIban(e.target.value)}
              className="w-full border border-[#e8dfd4] rounded-xl px-4 py-3 text-sm font-mono text-[#1a0e02] placeholder:text-[#64707d] outline-none focus:border-[#c49a4f] transition-colors"
            />
            <span className="text-[11px] text-[#8b94a4]">Saudi IBAN format: SA followed by 22 digits</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#1a0e02] uppercase tracking-wide">Account holder name</label>
            <input
              type="text"
              placeholder="Exactly as shown on your bank card"
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
              className="w-full border border-[#e8dfd4] rounded-xl px-4 py-3 text-sm text-[#1a0e02] placeholder:text-[#64707d] outline-none focus:border-[#c49a4f] transition-colors"
            />
          </div>

          <div className="flex gap-3 mt-2">
            <button
              onClick={() => setStep(2)}
              disabled={isPending}
              className="flex-1 bg-[#f0e8de] text-[#1a0e02] font-bold py-3 rounded-2xl hover:bg-[#e8dfd4] transition-colors disabled:opacity-60"
            >
              ← Back
            </button>
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
            By submitting, you agree to Bedouin&apos;s host terms of service.
            Your application will be reviewed within 1–2 business days.
          </p>
        </div>
      )}
    </div>
  );
}
