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
  activeMode: ActiveMode;
  isAdmin:    boolean;
  hostStatus: HostStatus;
  cohostStatus: CohostStatus;
  signOut:       () => Promise<void>;
  switchMode:    (mode: ActiveMode) => Promise<{ success: boolean; error?: string }>;
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

  // Stable client — created exactly once via the lazy initializer.
  // Never recreated on re-renders, so loadProfile / switchMode never go stale.
  const [supabase] = useState(() => createClient());

  // Used by reloadProfile and switchMode (user-initiated — no flash risk).
  const loadProfile = useCallback(async (uid: string) => {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role, active_mode, host_status, cohost_status")
      .eq("id", uid)
      .single();

    if (error) {
      console.warn("[AuthProvider] loadProfile failed:", error.message);
    }

    setActiveMode((profile?.active_mode as ActiveMode) ?? "tourist");
    setIsAdmin(profile?.role === "admin");
    setHostStatus((profile?.host_status as HostStatus) ?? null);
    setCohostStatus((profile?.cohost_status as CohostStatus) ?? null);
  }, [supabase]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // Fetch the profile BEFORE updating any UI-visible state.
        // This prevents the flash where user != null but hostStatus is still null
        // (which caused approved hosts to see "Become a Host" on every page load).
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role, active_mode, host_status, cohost_status")
          .eq("id", session.user.id)
          .single();

        if (error) {
          console.warn("[AuthProvider] session profile fetch failed:", error.message);
        }

        // React 18 automatic batching: all setState calls after an await boundary
        // inside the same async callback are batched into a single re-render.
        // The UI jumps directly from "loading" to the correct final state.
        setSession(session);
        setUser(session.user);
        setActiveMode((profile?.active_mode as ActiveMode) ?? "tourist");
        setIsAdmin(profile?.role === "admin");
        setHostStatus((profile?.host_status as HostStatus) ?? null);
        setCohostStatus((profile?.cohost_status as CohostStatus) ?? null);
      } else {
        setSession(null);
        setUser(null);
        setActiveMode("tourist");
        setIsAdmin(false);
        setHostStatus(null);
        setCohostStatus(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  // supabase is stable (useState lazy initializer) — safe to omit from deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut({ scope: "local" });
    setUser(null);
    setSession(null);
    setActiveMode("tourist");
    setIsAdmin(false);
    setHostStatus(null);
    setCohostStatus(null);
  }, [supabase]);

  const switchMode = useCallback(
    async (mode: ActiveMode): Promise<{ success: boolean; error?: string }> => {
      const result = await switchModeAction(mode);
      if (result.success) {
        // Only active_mode changes — update it locally, no profile re-fetch needed.
        setActiveMode(mode);
        return { success: true };
      }
      return { success: false, error: result.error };
    },
    [] // no deps — only calls a server action and a stable setter
  );

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
