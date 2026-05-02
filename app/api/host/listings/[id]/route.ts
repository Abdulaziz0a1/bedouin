import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { coreUpdateListing } from "@/lib/server/listing-submission";
import type { ListingPayload } from "@/lib/types/listing";

/**
 * PATCH /api/host/listings/[id]
 *
 * Stable Route Handler for listing edits and template-draft submission.
 * Not a Server Action — immune to Fast Refresh stale-ID invalidation.
 *
 * Auth: cookies → server Supabase client → verified user.
 * Ownership: validated inside coreUpdateListing against the DB row's host_id.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    // ── Params ───────────────────────────────────────────────────────────────
    const { id: submissionId } = await params;
    if (!submissionId) {
      return NextResponse.json(
        { success: false, error: "Missing submission ID." },
        { status: 400 },
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
    const result = await coreUpdateListing(user.id, submissionId, payload);
    return NextResponse.json(result);

  } catch (err) {
    console.error("[PATCH /api/host/listings/[id]]", err);
    return NextResponse.json(
      { success: false, error: "We could not save your listing. Please try again." },
      { status: 500 },
    );
  }
}
