import { createClient } from "@/lib/supabase";

const BUCKET         = "listing-images";
const UPLOAD_TIMEOUT = 45_000;
const AUTH_TIMEOUT   = 12_000;

// ─── Auth token ───────────────────────────────────────────────────────────────
//
// Races getSession() against a 12 s resolve-null timeout so a hung GoTrueClient
// refresh (can take 2–8 s normally, hangs indefinitely on network failure) never
// blocks the upload indefinitely.  clearTimeout() is called after the race so
// the timer never fires a false warning after a successful token retrieval.

async function getAccessToken(
  supabase: ReturnType<typeof createClient>,
): Promise<string | null> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  try {
    console.log("[upload] getting access token…");

    const timeoutPromise = new Promise<null>((resolve) => {
      timeoutId = setTimeout(() => {
        console.warn("[upload] getSession() taking > 12 s — possible auth hang");
        resolve(null);
      }, AUTH_TIMEOUT);
    });

    const result = await Promise.race([supabase.auth.getSession(), timeoutPromise]);
    clearTimeout(timeoutId); // prevent false warning if getSession() won the race

    if (!result) return null;
    const token = result.data.session?.access_token ?? null;
    console.log("[upload] access token:", token ? "OK" : "MISSING (no active session)");
    return token;
  } catch (err) {
    clearTimeout(timeoutId);
    console.error("[upload] getAccessToken error:", err);
    return null;
  }
}

// ─── Single file upload ───────────────────────────────────────────────────────

type FileUploadOk  = { publicUrl: string; path: string };
type FileUploadErr = { error: string };
type FileUploadResult = FileUploadOk | FileUploadErr;

async function uploadFile(
  file:     File,
  supabase: ReturnType<typeof createClient>,
  uid:      string,
  signal:   AbortSignal,
): Promise<FileUploadResult> {
  const ext  = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${uid}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  console.log("[upload] ▶ start", { name: file.name, size: `${(file.size / 1024).toFixed(0)} KB`, path });

  try {
    const token = await getAccessToken(supabase);
    if (!token) return { error: "Session expired — please log in again." };

    const endpoint = `${process.env.NEXT_PUBLIC_SUPABASE_URL!}/storage/v1/object/${BUCKET}/${path}`;

    console.log("[upload] sending to storage…");
    const response = await fetch(endpoint, {
      method:  "POST",
      headers: {
        Authorization:   `Bearer ${token}`,
        "Content-Type":  file.type || "application/octet-stream",
        "Cache-Control": "3600",
        "x-upsert":      "false",
      },
      body:   file,
      signal,
    });

    if (!response.ok) {
      let msg = `Upload failed (HTTP ${response.status})`;
      try {
        const body = (await response.json()) as { message?: string; error?: string };
        msg = body.message ?? body.error ?? msg;
      } catch { /* ignore parse error */ }
      console.error("[upload] ✕ HTTP error:", msg);
      return { error: msg };
    }

    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);
    console.log("[upload] ✓ success:", publicUrl);
    return { publicUrl, path }; // path returned for rollback cleanup

  } catch (err) {
    const isAbort = err instanceof DOMException && err.name === "AbortError";
    const msg     = err instanceof Error ? err.message : "Upload failed";
    if (isAbort) console.log("[upload] ✕ aborted:", file.name);
    else         console.error("[upload] ✕ error:", msg);
    return {
      error: isAbort ? "Upload timed out — check your connection and retry." : msg,
    };
  }
}

// ─── Public types ─────────────────────────────────────────────────────────────

export type UploadImagesResult = {
  /** Final public URLs, parallel to the input previewUrls array. */
  urls:          string[];
  /** Storage paths of files uploaded during this call — used for rollback. */
  uploadedPaths: string[];
};

// ─── Batch upload (called on form submit) ─────────────────────────────────────
//
// `files` is parallel to `previewUrls`.  Slots where files[i] is null already
// have a final https URL and are passed through unchanged.  Blob preview URLs
// are revoked after upload.
//
// Throws with a human-readable message if any upload fails.  The caller should
// immediately call deleteUploadedImages(result.uploadedPaths) on any error to
// prevent orphaned Storage files.

export async function uploadImages(
  previewUrls: string[],
  files:       (File | null)[],
  userId:      string,
): Promise<UploadImagesResult> {
  if (!userId) throw new Error("Not authenticated — please log in and try again.");

  const toUpload = files.filter(Boolean).length;
  console.log(`[uploadImages] ${previewUrls.length} image(s) total, ${toUpload} to upload`);

  const supabase       = createClient();
  const urls:          string[] = [];
  const uploadedPaths: string[] = [];

  for (let i = 0; i < previewUrls.length; i++) {
    const file = i < files.length ? files[i] : null;
    const url  = previewUrls[i];

    if (!file) {
      console.log(`[uploadImages] slot ${i}: pass-through (existing URL)`);
      urls.push(url);
      continue;
    }

    console.log(`[uploadImages] slot ${i}: uploading "${file.name}"…`);

    const controller = new AbortController();
    const timeoutId  = setTimeout(
      () => controller.abort(new DOMException("Upload timed out", "AbortError")),
      UPLOAD_TIMEOUT,
    );

    const result = await uploadFile(file, supabase, userId, controller.signal);
    clearTimeout(timeoutId);

    // Revoke blob URL regardless — it's no longer needed after this point
    if (url.startsWith("blob:")) URL.revokeObjectURL(url);

    if ("error" in result) {
      console.error(`[uploadImages] slot ${i}: FAILED —`, result.error);
      // Caller must delete uploadedPaths so far to avoid orphaned files
      throw new Error(`Photo ${i + 1} failed to upload: ${result.error}`);
    }

    console.log(`[uploadImages] slot ${i}: OK —`, result.publicUrl);
    urls.push(result.publicUrl);
    uploadedPaths.push(result.path);
  }

  // Safety: never let a blob: URL reach the database
  const leaked = urls.filter((u) => u.startsWith("blob:"));
  if (leaked.length > 0) {
    console.error("[uploadImages] BUG — blob URLs in final array:", leaked);
    throw new Error("Some photos were not uploaded — please remove them and try again.");
  }

  console.log(
    `[uploadImages] done — ${urls.length} URL(s) ready, ${uploadedPaths.length} newly uploaded`,
  );
  return { urls, uploadedPaths };
}

// ─── Rollback cleanup ─────────────────────────────────────────────────────────
//
// Called when the DB write fails after a successful upload, preventing orphan
// Storage files.  Only deletes paths from the current submit attempt — existing
// listing images (whose file slot was null) are never included in uploadedPaths
// and are therefore never deleted.
//
// Never throws — cleanup failure is logged but must not crash the error UI.

export async function deleteUploadedImages(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  console.log("[rollback] deleting", paths.length, "orphaned Storage file(s)…", paths);
  try {
    const supabase = createClient();
    const { error } = await supabase.storage.from(BUCKET).remove(paths);
    if (error) console.error("[rollback] Storage delete failed:", error.message);
    else       console.log("[rollback] ✓ cleanup complete");
  } catch (err) {
    console.error("[rollback] Storage delete threw:", err);
  }
}
