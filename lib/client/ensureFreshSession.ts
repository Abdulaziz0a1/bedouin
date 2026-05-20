import { createClient } from "@/lib/supabase";

export type SessionCheckResult =
  | { ok: true }
  | { ok: false; reason: "session_expired" };

/**
 * Verifies the user has a valid, non-expired Supabase session before a
 * sensitive client-side action (upload, booking submit, message send, etc.).
 *
 * Attempts a silent refresh if the token has expired but a refresh token is
 * still available.  Returns { ok: false } only when both checks fail — at
 * that point the caller should show SessionExpiredBanner and stop the action.
 */
export async function ensureFreshSession(): Promise<SessionCheckResult> {
  const supabase = createClient();

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      const now       = Math.floor(Date.now() / 1000);
      const expiresAt = session.expires_at ?? 0;
      // 30-second buffer so a token expiring imminently is treated as expired
      if (expiresAt > now + 30) {
        return { ok: true };
      }
    }

    // No session or token is about to expire — try a silent refresh
    const { data, error } = await supabase.auth.refreshSession();
    if (!error && data.session) {
      return { ok: true };
    }

    return { ok: false, reason: "session_expired" };
  } catch {
    return { ok: false, reason: "session_expired" };
  }
}
