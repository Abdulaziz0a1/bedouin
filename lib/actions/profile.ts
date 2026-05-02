"use server";

import { createClient } from "@/lib/supabase-server";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface UpdateProfileInput {
  firstName:   string;
  lastName:    string;
  phone:       string;
  nationality: string;
}

export type UpdateProfileResult =
  | { success: true }
  | { success: false; error: string };

export type ActiveMode = "tourist" | "host";
export type HostStatus = "pending" | "approved" | "rejected" | null;

export type SwitchModeResult =
  | { success: true;  mode: ActiveMode }
  | { success: false; error: string; code?: "NOT_APPROVED" | "PENDING" | "REJECTED" };

// ─────────────────────────────────────────────────────────────────────────────
// updateProfile
// ─────────────────────────────────────────────────────────────────────────────

export async function updateProfile(
  input: UpdateProfileInput
): Promise<UpdateProfileResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "You must be signed in to update your profile." };
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name:  input.firstName.trim()   || null,
        last_name:   input.lastName.trim()    || null,
        phone:       input.phone.trim()       || null,
        nationality: input.nationality.trim() || null,
      })
      .eq("id", user.id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unexpected error." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// switchMode
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Switches the authenticated user's active_mode between 'tourist' and 'host'.
 *
 * Switching TO 'host' requires host_status = 'approved'.
 * Users who are not approved should be directed to /host/onboarding instead.
 * Switching TO 'tourist' is always allowed for non-admins.
 */
export async function switchMode(mode: ActiveMode): Promise<SwitchModeResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "You must be signed in to switch modes." };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, host_status")
      .eq("id", user.id)
      .single();

    if (profile?.role === "admin") {
      return { success: false, error: "Admin accounts do not use mode switching." };
    }

    if (mode === "host") {
      const hs = profile?.host_status as HostStatus;
      if (hs !== "approved") {
        if (hs === "pending") {
          return { success: false, error: "Your host application is under review.", code: "PENDING" };
        }
        if (hs === "rejected") {
          return { success: false, error: "Your host application was rejected.", code: "REJECTED" };
        }
        // null — has not applied
        return { success: false, error: "You must complete host onboarding first.", code: "NOT_APPROVED" };
      }
    }

    const { error } = await supabase
      .from("profiles")
      .update({ active_mode: mode })
      .eq("id", user.id);

    if (error) return { success: false, error: error.message };
    // No revalidatePath — active_mode is client-side state managed by AuthProvider.
    // The dashboard page uses force-dynamic so it always renders fresh anyway.
    return { success: true, mode };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unexpected error." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// applyAsHost
// ─────────────────────────────────────────────────────────────────────────────

export interface ApplyAsHostInput {
  bio:             string;
  languages:       string[];
  experienceYears: number;
  propertyTypes:   string[];
  region:          string;
  city:            string;
  phone:           string;
  bankName:        string;
  iban:            string;
  accountHolder:   string;
}

export type ApplyAsHostResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Submits a host application for the authenticated user.
 *
 * Business rules:
 *   - Only non-admin users may apply.
 *   - If host_status is already 'approved', there's nothing to do (idempotent).
 *   - If host_status is 'pending', reject the duplicate submission.
 *   - If host_status is null or 'rejected', create / replace the application.
 */
export async function applyAsHost(input: ApplyAsHostInput): Promise<ApplyAsHostResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "You must be signed in to apply." };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, host_status")
      .eq("id", user.id)
      .single();

    if (profile?.role === "admin") {
      return { success: false, error: "Admin accounts cannot apply as hosts." };
    }

    if (profile?.host_status === "approved") {
      return { success: false, error: "Your host account is already approved." };
    }
    if (profile?.host_status === "pending") {
      return { success: false, error: "Your application is already under review." };
    }

    // Insert the application row
    const { error: insertErr } = await supabase.from("host_applications").insert({
      user_id:          user.id,
      bio:              input.bio.trim(),
      languages:        input.languages,
      experience_years: input.experienceYears,
      property_types:   input.propertyTypes,
      region:           input.region.trim(),
      city:             input.city.trim(),
      phone:            input.phone.trim(),
      payment_info: {
        bank_name:       input.bankName.trim(),
        iban:            input.iban.trim().toUpperCase(),
        account_holder:  input.accountHolder.trim(),
      },
      status: "pending",
    });

    if (insertErr) return { success: false, error: insertErr.message };

    // Update the profile to reflect pending status
    const { error: updateErr } = await supabase
      .from("profiles")
      .update({ host_status: "pending", host_rejection_reason: null })
      .eq("id", user.id);

    if (updateErr) return { success: false, error: updateErr.message };

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unexpected error." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// applyAsCohost
// ─────────────────────────────────────────────────────────────────────────────

export interface ApplyAsCohostInput {
  bio:             string;
  languages:       string[];
  experienceYears: number;
  serviceTypes:    string[];
  propertyTypes:   string[];
  region:          string;
  city:            string;
  phone:           string;
  feeModel:        "percentage" | "fixed" | "negotiable";
  feeValue?:       number;
}

export type ApplyAsCohostResult =
  | { success: true }
  | { success: false; error: string };

export async function applyAsCohost(input: ApplyAsCohostInput): Promise<ApplyAsCohostResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "You must be signed in to apply." };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, cohost_status")
      .eq("id", user.id)
      .single();

    if (profile?.role === "admin") {
      return { success: false, error: "Admin accounts cannot apply as co-hosts." };
    }
    if (profile?.cohost_status === "approved") {
      return { success: false, error: "Your co-host profile is already approved." };
    }
    if (profile?.cohost_status === "pending") {
      return { success: false, error: "Your application is already under review." };
    }

    const { error: insertErr } = await supabase.from("cohost_applications").insert({
      user_id:          user.id,
      service_types:    input.serviceTypes,
      property_types:   input.propertyTypes,
      bio:              input.bio.trim(),
      experience_years: input.experienceYears,
      languages:        input.languages,
      region:           input.region.trim(),
      city:             input.city.trim(),
      phone:            input.phone.trim(),
      fee_model:        input.feeModel,
      fee_value:        input.feeValue ?? null,
      status:           "pending",
    });

    if (insertErr) return { success: false, error: insertErr.message };

    const { error: updateErr } = await supabase
      .from("profiles")
      .update({ cohost_status: "pending", cohost_rejection_reason: null })
      .eq("id", user.id);

    if (updateErr) return { success: false, error: updateErr.message };

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unexpected error." };
  }
}
