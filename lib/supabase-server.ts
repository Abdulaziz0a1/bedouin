import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Bedouin – Supabase server client
 *
 * Use this in:
 *   - Server Components  (async page.tsx / layout.tsx functions)
 *   - Route Handlers     (app/api/[route]/route.ts)
 *   - middleware.ts      (import separately — see note below)
 *
 * IMPORTANT: Must be called inside a request context (i.e. inside an async
 * Server Component or Route Handler) because it reads from next/headers.
 * Do NOT call at module-level or outside a request.
 *
 * For middleware.ts use a separate pattern with NextRequest/NextResponse
 * cookies (the @supabase/ssr middleware helper). This file is for
 * Server Components and Route Handlers only.
 *
 * Usage example:
 *   const supabase = await createClient();
 *   const { data: { user } } = await supabase.auth.getUser();
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
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
            // setAll called from a Server Component — session cookies are
            // refreshed automatically by the middleware; this catch is safe.
          }
        },
      },
    }
  );
}
