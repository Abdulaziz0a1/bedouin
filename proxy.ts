import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Supabase session-refresh middleware.
 *
 * This middleware exists for ONE reason only: to allow @supabase/ssr's
 * createServerClient to write a refreshed access token back to the browser
 * via Set-Cookie when the current JWT is about to expire.
 *
 * Without this, supabase-server.ts's setAll() is called but can never
 * write cookies on a Server Component response — so any token that expires
 * while the user is browsing breaks server-side auth checks silently.
 *
 * Auth redirects are handled by individual pages, NOT here.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Mirror refreshed cookies onto the request so downstream Server
          // Components see the updated token in the same request cycle.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          // Create a fresh NextResponse so we can attach Set-Cookie headers
          // that propagate the refreshed token back to the browser.
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // This call is what triggers token refresh when the JWT is close to expiry.
  // The result is intentionally unused — pages do their own auth checks.
  // Do NOT add any code between createServerClient and getUser(); the
  // @supabase/ssr docs warn this can cause hard-to-debug logout issues.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    // Run on all routes except Next.js internals and static assets.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
