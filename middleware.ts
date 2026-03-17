import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// ──────────────────────────────────────────────────────────────────────────────
// Route policy
// ──────────────────────────────────────────────────────────────────────────────

/** Prefixes that require an authenticated session */
const PROTECTED_PREFIXES = [
  "/booking",
  "/dashboard",
  "/account",
  "/messages",
  "/wishlist",
  "/host/new",
  "/host/onboarding",
  "/provide-service",
  "/admin",
] as const;

/** Exact auth-entry paths — redirect away if the user is already signed in */
const AUTH_PATHS = ["/login", "/signup"] as const;

// ──────────────────────────────────────────────────────────────────────────────
// Middleware
// ──────────────────────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  /**
   * Start with a plain pass-through response.
   * The Supabase client may replace this reference via setAll() in order to
   * attach refreshed session cookies — do NOT use NextResponse.next() directly
   * after this point; always return `supabaseResponse`.
   */
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // 1. Write cookies onto the mutated request so later middleware sees them
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // 2. Rebuild the response so the refreshed cookies reach the browser
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  /**
   * IMPORTANT: use getUser() — not getSession().
   * getSession() reads from the cookie without re-validating with Supabase;
   * getUser() sends the JWT to Supabase Auth for server-side verification.
   */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // ── 1. Protected routes ────────────────────────────────────────────────────
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    // Preserve the original destination so LoginForm can redirect back after sign-in.
    loginUrl.searchParams.set("returnTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── 2. Auth routes (login / signup) ───────────────────────────────────────
  const isAuthPath = (AUTH_PATHS as readonly string[]).includes(pathname);

  if (isAuthPath && user) {
    // Redirect authenticated users away from auth pages.
    // Use /account (works for every role) rather than /dashboard
    // which is role-gated to host/admin only.
    const accountUrl = request.nextUrl.clone();
    accountUrl.pathname = "/account";
    return NextResponse.redirect(accountUrl);
  }

  // ── 3. All other routes — pass through with refreshed session cookie ───────
  return supabaseResponse;
}

// ──────────────────────────────────────────────────────────────────────────────
// Matcher
// ──────────────────────────────────────────────────────────────────────────────

export const config = {
  /**
   * Run on every path EXCEPT:
   *   - _next/static  (JS/CSS bundles)
   *   - _next/image   (Next.js image optimisation)
   *   - favicon.ico, logo.png, logo-icon.png (public assets)
   *   - Any file with a static extension (.svg, .png, .jpg, etc.)
   */
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo\\.png|logo-icon\\.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
