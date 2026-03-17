"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase";
import { switchMode as switchModeAction } from "@/lib/actions/profile";
import type { ActiveMode } from "@/lib/actions/profile";

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────

/** Status of the user's host application with the platform */
export type HostStatus = "pending" | "approved" | "rejected" | null;

/** Status of the user's co-host / service provider application */
export type CohostStatus = "pending" | "approved" | "rejected" | null;

interface AuthContextValue {
  user:       User | null;
  session:    Session | null;
  loading:    boolean;
  /**
   * The user's currently active mode.
   * 'tourist' — browse and book (default)
   * 'host'    — manage listings and bookings (only settable if host_status = 'approved')
   */
  activeMode: ActiveMode;
  /**
   * True if role = 'admin'. Admins bypass mode checks and have full access.
   */
  isAdmin: boolean;
  /**
   * The user's host application status.
   *   null      — has not applied yet
   *   'pending' — awaiting admin review
   *   'approved'— approved; can freely switch between tourist ↔ host modes
   *   'rejected'— rejected; should re-apply via /host/onboarding
   */
  hostStatus: HostStatus;
  /**
   * The user's co-host / service provider application status.
   */
  cohostStatus: CohostStatus;
  /** Sign the current user out and clear the session */
  signOut: () => Promise<void>;
  /**
   * Switches the active mode in the database and updates local state.
   * The server action enforces that host_status = 'approved' before allowing
   * a switch to 'host' mode.
   * Returns { success, error? } — the CALLER is responsible for navigation.
   */
  switchMode: (mode: ActiveMode) => Promise<{ success: boolean; error?: string }>;
  /**
   * Force-reloads the profile from the DB (e.g. after submitting a host application).
   */
  reloadProfile: () => Promise<void>;
}

// ──────────────────────────────────────────────────────────────────────────────
// Context
// ──────────────────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue>({
  user:         null,
  session:      null,
  loading:      true,
  activeMode:   "tourist",
  isAdmin:      false,
  hostStatus:   null,
  cohostStatus: null,
  signOut:       async () => {},
  switchMode:    async () => ({ success: false, error: "Not mounted" }),
  reloadProfile: async () => {},
});

// ──────────────────────────────────────────────────────────────────────────────
// Provider
// ──────────────────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,         setUser]         = useState<User | null>(null);
  const [session,      setSession]      = useState<Session | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [activeMode,   setActiveMode]   = useState<ActiveMode>("tourist");
  const [isAdmin,      setIsAdmin]      = useState(false);
  const [hostStatus,   setHostStatus]   = useState<HostStatus>(null);
  const [cohostStatus, setCohostStatus] = useState<CohostStatus>(null);

  const supabase = createClient();

  const loadProfile = useCallback(async (uid: string) => {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role, active_mode, host_status, cohost_status")
      .eq("id", uid)
      .single();

    if (error) {
      // Columns may not exist yet (pending DB migration) — fall back to basic fields
      const { data: basic } = await supabase
        .from("profiles")
        .select("role, active_mode")
        .eq("id", uid)
        .single();
      setActiveMode((basic?.active_mode as ActiveMode) ?? "tourist");
      setIsAdmin(basic?.role === "admin");
      return;
    }

    setActiveMode((profile?.active_mode as ActiveMode) ?? "tourist");
    setIsAdmin(profile?.role === "admin");
    setHostStatus((profile?.host_status as HostStatus) ?? null);
    setCohostStatus((profile?.cohost_status as CohostStatus) ?? null);
  }, [supabase]);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await loadProfile(session.user.id);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await loadProfile(session.user.id);
      } else {
        setActiveMode("tourist");
        setIsAdmin(false);
        setHostStatus(null);
        setCohostStatus(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setActiveMode("tourist");
    setIsAdmin(false);
    setHostStatus(null);
    setCohostStatus(null);
  }, [supabase]);

  const switchMode = useCallback(
    async (mode: ActiveMode): Promise<{ success: boolean; error?: string }> => {
      const result = await switchModeAction(mode);
      if (result.success) {
        setActiveMode(mode);
        return { success: true };
      }
      return { success: false, error: result.error };
    },
    []
  );

  /**
   * Exposed so components can force a profile refresh after an application
   * is submitted or after an external event (e.g. admin approval webhook).
   */
  const reloadProfile = useCallback(async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (currentUser) {
      await loadProfile(currentUser.id);
    }
  }, [supabase, loadProfile]);

  return (
    <AuthContext.Provider
      value={{
        user, session, loading,
        activeMode, isAdmin,
        hostStatus, cohostStatus,
        signOut, switchMode, reloadProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
