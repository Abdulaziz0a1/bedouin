import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase Auth callback handler — used by:
 *   • Password reset   (email link → /auth/callback?code=...&next=/reset-password)
 *   • Email confirm    (if Supabase is configured to use PKCE confirm links)
 *
 * The PKCE flow (used by @supabase/ssr) sends a one-time `code` in the URL
 * instead of a token fragment.  This route exchanges that code for a real
 * session (sets the auth cookie) then forwards the user to `next`.
 *
 * Supabase Dashboard → Authentication → URL Configuration → Redirect URLs
 * must include this route's full URL or the redirect will be blocked.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Default to home; for password reset the caller passes next=/reset-password
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Called from a Route Handler — safe to ignore; cookies will be
              // set on the response below.
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Session cookie is now set; forward to the destination page.
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Code missing or exchange failed — send user back to login with an error
  // flag so the UI can show a "reset link expired, try again" message.
  return NextResponse.redirect(
    `${origin}/forgot-password?error=link_expired`
  );
}
