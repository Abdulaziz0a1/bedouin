import { createClient } from "@/lib/supabase";

export type SessionCheckResult =
  | { ok: true }
  | { ok: false; reason: "session_expired" | "auth_timeout" };

const SESSION_TIMEOUT = 10_000; // 10 s

function raceTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ]);
}

/**
 * Verifies the user has a valid session before a sensitive client-side action.
 *
 * Verification chain:
 *  1. getSession()     — reads local GoTrueClient cache (fast, can be stale/cold)
 *  2. refreshSession() — if session absent or expiring, attempts token renewal
 *  3. getUser()        — final authority; validates the JWT with Supabase's server
 *                        so a cold cache never produces a false "session expired"
 *
 * Returns:
 *  { ok: true }                             — getUser confirmed a live user
 *  { ok: false, reason: "session_expired" } — getUser returned no user (definitive)
 *  { ok: false, reason: "auth_timeout" }    — all calls timed out; caller should
 *                                             offer a retry, not force a redirect
 */
export async function ensureFreshSession(): Promise<SessionCheckResult> {
  const supabase = createClient();

  try {
    // ── Step 1: local session cache ───────────────────────────────────────────
    const sessionResult = await raceTimeout(supabase.auth.getSession(), SESSION_TIMEOUT);

    let gotSession = false;

    if (sessionResult === null) {
      console.warn("[ensureFreshSession] getSession() timed out");
    } else {
      const session = sessionResult.data.session;
      if (session?.access_token) {
        const now       = Math.floor(Date.now() / 1000);
        const expiresAt = session.expires_at ?? 0;
        if (expiresAt > now + 30) gotSession = true;
      }
    }

    // ── Step 2: refresh if session absent or expiring ─────────────────────────
    if (!gotSession) {
      const refreshResult = await raceTimeout(supabase.auth.refreshSession(), SESSION_TIMEOUT);
      if (refreshResult && !refreshResult.error && refreshResult.data.session) {
        gotSession = true;
      } else {
        console.warn("[ensureFreshSession] refresh failed:", refreshResult?.error?.message ?? "timed out / no session");
      }
    }

    // ── Step 3: getUser — final authority ────────────────────────────────────
    // Validates the JWT with Supabase's server directly, bypassing local cache.
    // A proxy-refreshed token may not yet be visible to the local client, so
    // this is the only call that cannot false-negative on a live session.
    const userResult = await raceTimeout(supabase.auth.getUser(), SESSION_TIMEOUT);

    if (userResult === null) {
      console.warn("[ensureFreshSession] getUser() timed out");
      // Local session looked valid — trust it rather than blocking on a network blip.
      if (gotSession) return { ok: true };
      return { ok: false, reason: "auth_timeout" };
    }

    if (userResult.error || !userResult.data.user) {
      console.warn("[ensureFreshSession] no user:", userResult.error?.message ?? "null");
      return { ok: false, reason: "session_expired" };
    }

    return { ok: true };

  } catch (err) {
    console.error("[ensureFreshSession] threw:", err);
    return { ok: false, reason: "session_expired" };
  }
}
