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

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  /** The authenticated Supabase user, or null if not signed in */
  user: User | null;
  /** The full session object (includes access_token, expires_at, etc.) */
  session: Session | null;
  /** True while the initial session is being resolved on mount */
  loading: boolean;
  /** Sign the current user out and clear the session */
  signOut: () => Promise<void>;
}

// ──────────────────────────────────────────────────────────────────────────────
// Context
// ──────────────────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue>({
  user:    null,
  session: null,
  loading: true,
  signOut: async () => {},
});

// ──────────────────────────────────────────────────────────────────────────────
// Provider
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Wrap app/layout.tsx with <AuthProvider> to make useAuth() available
 * throughout the entire component tree.
 *
 * Supabase integration:
 *   - getSession()         → initial hydration from the session cookie
 *   - onAuthStateChange()  → keeps user/session in sync after
 *                            signIn / signUp / signOut / token refresh
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Stable client reference — createBrowserClient is internally memoised
  const supabase = createClient();

  useEffect(() => {
    // 1. Resolve the session that was set by the server (cookie-based)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 2. Keep in sync with auth state changes (sign-in, sign-out, refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    // onAuthStateChange will handle clearing user/session state
  }, [supabase]);

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Access auth state in any Client Component.
 *
 * @example
 * const { user, loading, signOut } = useAuth();
 * if (loading) return <Spinner />;
 * if (!user)   return <Redirect to="/login" />;
 */
export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
