"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/lib/actions/profile";

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center py-3.5 border-b last:border-0 border-[#f0e8de] gap-4">
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-[#64707d] uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-sm font-medium text-[#1a0e02] truncate">{value || "—"}</p>
      </div>
    </div>
  );
}

export default function UserAccountSection({
  firstName    = "",
  lastName     = "",
  email        = "",
  phone        = "",
  nationality  = "",
  avatarUrl    = "",
  joinedAt     = "",
}: {
  firstName?:   string;
  lastName?:    string;
  email?:       string;
  phone?:       string;
  nationality?: string;
  avatarUrl?:   string;
  joinedAt?:    string;
}) {
  const [notifBooking, setNotifBooking] = useState(true);
  const [notifPromo,   setNotifPromo]   = useState(false);
  const [notifRemind,  setNotifRemind]  = useState(true);

  // Edit-mode state
  const [editing,       setEditing]     = useState(false);
  const [editFirst,     setEditFirst]   = useState(firstName);
  const [editLast,      setEditLast]    = useState(lastName);
  const [editPhone,     setEditPhone]   = useState(phone);
  const [editNat,       setEditNat]     = useState(nationality);
  const [saveError,     setSaveError]   = useState<string | null>(null);
  const [saveSuccess,   setSaveSuccess] = useState(false);
  const [isPending, startTransition]    = useTransition();

  // Derived display values (update optimistically after save)
  const [displayFirst, setDisplayFirst] = useState(firstName);
  const [displayLast,  setDisplayLast]  = useState(lastName);
  const [displayPhone, setDisplayPhone] = useState(phone);
  const [displayNat,   setDisplayNat]   = useState(nationality);

  const fullName = `${displayFirst} ${displayLast}`.trim() || "—";

  const handleEdit = () => {
    setEditFirst(displayFirst);
    setEditLast(displayLast);
    setEditPhone(displayPhone);
    setEditNat(displayNat);
    setSaveError(null);
    setSaveSuccess(false);
    setEditing(true);
  };

  const handleSave = () => {
    setSaveError(null);
    setSaveSuccess(false);
    startTransition(async () => {
      const result = await updateProfile({
        firstName:   editFirst,
        lastName:    editLast,
        phone:       editPhone,
        nationality: editNat,
      });
      if (result.success) {
        setDisplayFirst(editFirst);
        setDisplayLast(editLast);
        setDisplayPhone(editPhone);
        setDisplayNat(editNat);
        setSaveSuccess(true);
        setEditing(false);
      } else {
        setSaveError(result.error);
      }
    });
  };

  const joinedDate = joinedAt
    ? new Date(joinedAt).toLocaleDateString("en-GB", {
        day: "numeric", month: "long", year: "numeric",
      })
    : "—";

  const initials = firstName
    ? firstName.charAt(0).toUpperCase()
    : email.charAt(0).toUpperCase() || "?";

  function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
    return (
      <button
        type="button"
        onClick={() => onChange(!value)}
        aria-checked={value}
        role="switch"
        className={[
          "relative w-10 h-6 rounded-full transition-colors shrink-0",
          value ? "bg-[#8b5e38]" : "bg-[#dddfe3]",
        ].join(" ")}
      >
        <span className={[
          "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform",
          value ? "translate-x-4" : "translate-x-0",
        ].join(" ")} />
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div>
        <h2 className="font-display font-semibold text-[#1a0e02] text-lg">Account</h2>
        <p className="text-xs text-[#64707d] mt-0.5">Manage your profile and preferences</p>
      </div>

      {/* Profile card */}
      <div className="bg-white border border-[#e8dfd4] rounded-2xl overflow-hidden">

        {/* Header row */}
        <div className="flex items-center gap-4 px-6 py-5 border-b border-[#f0e8de]">
          <div className="relative shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName}
                className="w-16 h-16 rounded-full object-cover border-2 border-[#e8dfd4]"
              />
            ) : (
              /* Initials fallback when no avatar is set */
              <div className="w-16 h-16 rounded-full bg-[#8b5e38] flex items-center justify-center text-white text-xl font-bold border-2 border-[#e8dfd4]">
                {initials}
              </div>
            )}
            <button
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#8b5e38] rounded-full flex items-center justify-center hover:bg-[#7a5030] transition-colors"
              aria-label="Change photo"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <div>
            <h3 className="font-display font-semibold text-[#1a0e02] text-lg">{fullName}</h3>
            <p className="text-xs text-[#64707d]">Member since {joinedDate}</p>
          </div>
          {!editing && (
            <button
              onClick={handleEdit}
              className="ml-auto px-4 py-2 border border-[#e8dfd4] rounded-xl text-sm font-semibold text-[#64707d] hover:border-[#8b5e38] hover:text-[#8b5e38] transition-colors shrink-0"
            >
              Edit profile
            </button>
          )}
        </div>

        {/* Fields — view mode */}
        {!editing && (
          <div className="px-6 py-2">
            <FieldRow label="Full name"   value={fullName}      />
            <FieldRow label="Email"       value={email}         />
            <FieldRow label="Phone"       value={displayPhone}  />
            <FieldRow label="Nationality" value={displayNat}    />
          </div>
        )}

        {/* Fields — edit mode */}
        {editing && (
          <div className="px-6 py-4 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "First name",  value: editFirst, onChange: setEditFirst },
                { label: "Last name",   value: editLast,  onChange: setEditLast  },
              ].map(({ label, value, onChange }) => (
                <div key={label}>
                  <label className="text-[10px] font-bold text-[#64707d] uppercase tracking-widest block mb-1">
                    {label}
                  </label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full px-3 py-2.5 border border-[#e8dfd4] rounded-xl text-sm text-[#1a0e02] placeholder:text-[#a09080] focus:outline-none focus:border-[#8b5e38] bg-white transition-colors"
                  />
                </div>
              ))}
              <div>
                <label className="text-[10px] font-bold text-[#64707d] uppercase tracking-widest block mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[#e8dfd4] rounded-xl text-sm text-[#1a0e02] placeholder:text-[#a09080] focus:outline-none focus:border-[#8b5e38] bg-white transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#64707d] uppercase tracking-widest block mb-1">
                  Nationality
                </label>
                <input
                  type="text"
                  value={editNat}
                  onChange={(e) => setEditNat(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[#e8dfd4] rounded-xl text-sm text-[#1a0e02] placeholder:text-[#a09080] focus:outline-none focus:border-[#8b5e38] bg-white transition-colors"
                />
              </div>
            </div>

            {saveError && (
              <p className="text-xs text-red-500">{saveError}</p>
            )}

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={handleSave}
                disabled={isPending}
                className="px-5 py-2.5 bg-[#8b5e38] text-white text-sm font-semibold rounded-xl hover:bg-[#7a5030] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? "Saving…" : "Save changes"}
              </button>
              <button
                onClick={() => setEditing(false)}
                disabled={isPending}
                className="px-5 py-2.5 border border-[#e8dfd4] text-sm font-semibold text-[#64707d] rounded-xl hover:border-[#8b5e38] hover:text-[#8b5e38] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Success banner */}
      {saveSuccess && (
        <div className="flex items-center gap-3 px-5 py-3 bg-[#f0faf5] border border-[#c3e6d8] rounded-xl text-sm font-semibold text-[#049153]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
          </svg>
          Profile updated successfully.
        </div>
      )}

      {/* Notifications */}
      <div className="bg-white border border-[#e8dfd4] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#f0e8de]">
          <h3 className="font-display font-semibold text-[#1a0e02]">Notifications</h3>
          <p className="text-xs text-[#64707d] mt-0.5">Choose what you hear about</p>
        </div>
        <div className="px-6 py-2">
          {[
            { label: "Booking confirmations & updates", sub: "Get notified about your reservation status", value: notifBooking, onChange: setNotifBooking },
            { label: "Trip reminders",                  sub: "Reminders 48h before check-in",             value: notifRemind,  onChange: setNotifRemind  },
            { label: "Deals & promotions",              sub: "Occasional offers and new experiences",      value: notifPromo,   onChange: setNotifPromo   },
          ].map(({ label, sub, value, onChange }) => (
            <div
              key={label}
              className="flex items-center justify-between gap-4 py-4 border-b last:border-0 border-[#f0e8de]"
            >
              <div>
                <p className="text-sm font-semibold text-[#1a0e02]">{label}</p>
                <p className="text-xs text-[#64707d] mt-0.5">{sub}</p>
              </div>
              <Toggle value={value} onChange={onChange} />
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="bg-white border border-[#e8dfd4] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#f0e8de]">
          <h3 className="font-display font-semibold text-[#1a0e02]">Security</h3>
        </div>
        <div className="px-6 py-2">
          {[
            { label: "Password",        sub: "Update your account password",    action: "Change" },
            { label: "Linked accounts", sub: "Manage connected sign-in methods", action: "Manage" },
          ].map(({ label, sub, action }) => (
            <div
              key={label}
              className="flex items-center justify-between py-3.5 border-b last:border-0 border-[#f0e8de] gap-4"
            >
              <div>
                <p className="text-sm font-semibold text-[#1a0e02]">{label}</p>
                <p className="text-xs text-[#64707d] mt-0.5">{sub}</p>
              </div>
              <button className="text-xs font-semibold text-[#8b5e38] hover:underline shrink-0">
                {action}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-red-50 border border-red-100 rounded-2xl px-6 py-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-red-700">Delete account</p>
          <p className="text-xs text-red-500 mt-0.5">
            This will permanently remove your account and all data.
          </p>
        </div>
        <button className="px-4 py-2 border border-red-300 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors shrink-0">
          Delete
        </button>
      </div>
    </div>
  );
}
