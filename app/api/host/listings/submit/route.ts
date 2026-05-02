import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { coreSubmitListing } from "@/lib/server/listing-submission";
import type { ListingPayload } from "@/lib/types/listing";

/**
 * POST /api/host/listings/submit
 *
 * Stable Route Handler — not a Server Action, so it has no embedded action ID
 * and is never invalidated by Next.js Fast Refresh.  This is the primary submit
 * path for HostListingFlow after images have been uploaded to Storage.
 *
 * Auth: reads the session from cookies via the server Supabase client.
 * Ownership: the host_id is derived from the verified session — never trusted from the body.
 */
export async function POST(request: NextRequest) {
  try {
    // ── Auth ────────────────────────────────────────────────────────────────
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Your session expired. Please sign in again." },
        { status: 401 },
      );
    }

    // ── Parse body ───────────────────────────────────────────────────────────
    let payload: ListingPayload;
    try {
      payload = await request.json() as ListingPayload;
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid request body." },
        { status: 400 },
      );
    }

    // ── Business logic ───────────────────────────────────────────────────────
    const result = await coreSubmitListing(user.id, payload);

    // Return 200 for both success and business-logic errors (success: false).
    // HTTP errors (4xx/5xx) are reserved for auth failures and unexpected throws.
    return NextResponse.json(result);

  } catch (err) {
    console.error("[POST /api/host/listings/submit]", err);
    return NextResponse.json(
      { success: false, error: "We could not submit your listing. Please try again." },
      { status: 500 },
    );
  }
}
