"use client";

import Image from "next/image";
import { useRef, useState, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase";

// ─── Constants ────────────────────────────────────────────────────────────────

const ACCEPTED_TYPES    = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE_BYTES    = 5 * 1024 * 1024;
const BUCKET            = "listing-images";

// Real per-file HTTP timeout — the fetch AbortController fires this and
// ACTUALLY cancels the in-flight request (unlike the old Promise.race approach).
const UPLOAD_TIMEOUT_MS = 45_000;

// Compression settings — images are shrunk before upload so they fit well
// within the timeout even on slow mobile connections.
const MAX_DIMENSION_PX = 1_600;   // max width or height after resize
const JPEG_QUALITY     = 0.85;    // output quality (0–1)

// ─── Types ────────────────────────────────────────────────────────────────────

// State machine:
//
//   queued → processing → uploading → (removed on success)
//     ↑                        ↓
//     └──────── retry ─────────┴────→ error
//
// A file NEVER stays in "uploading" past UPLOAD_TIMEOUT_MS because the
// AbortController fires and the fetch throws, transitioning it to "error".

type FileStatus = "queued" | "processing" | "uploading" | "error";

interface QueueEntry {
  id:     string;
  file:   File;       // original File; kept for retry
  name:   string;
  status: FileStatus;
  error?: string;
}

type UploadResult = { publicUrl: string } | { error: string };

interface ImageUploadZoneProps {
  previewUrls: string[];
  onAdd:       (url: string) => void;
  onRemove:    (index: number) => void;
  maxImages?:  number;
  minImages?:  number;
  /** Authenticated host UID — provided by the server-rendered page. */
  userId:      string;
}

// ─── Image compression ────────────────────────────────────────────────────────
//
// Resizes large images using Canvas and re-encodes as JPEG at JPEG_QUALITY.
// This reduces a typical 4 MB PNG screenshot to ~300–600 KB — small enough
// to upload reliably even on a 1 Mbps connection within the timeout.
//
// Files already small enough (< 800 KB AND within dimension limits) are
// returned unchanged to avoid quality loss on intentionally small photos.

async function compressImage(file: File): Promise<File> {
  if (!ACCEPTED_TYPES.includes(file.type)) return file;

  return new Promise<File>((resolve) => {
    const img      = document.createElement("img");
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      const oversized   = width > MAX_DIMENSION_PX || height > MAX_DIMENSION_PX;
      const needsEncode = file.size > 800_000; // > 800 KB

      if (!oversized && !needsEncode) {
        console.log(`[Compress] ${file.name}: skipped (${(file.size / 1024).toFixed(0)} KB already small)`);
        resolve(file);
        return;
      }

      // Scale proportionally so the longer edge equals MAX_DIMENSION_PX.
      if (oversized) {
        if (width >= height) {
          height = Math.round(height * (MAX_DIMENSION_PX / width));
          width  = MAX_DIMENSION_PX;
        } else {
          width  = Math.round(width * (MAX_DIMENSION_PX / height));
          height = MAX_DIMENSION_PX;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width  = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; }

          // Rename to .jpg so the extension matches the JPEG MIME type.
          const baseName   = file.name.replace(/\.[^.]+$/, "");
          const compressed = new File([blob], `${baseName}.jpg`, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });

          console.log(
            `[Compress] ${file.name}: ${(file.size / 1024).toFixed(0)} KB → ${(compressed.size / 1024).toFixed(0)} KB`,
          );
          resolve(compressed);
        },
        "image/jpeg",
        JPEG_QUALITY,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      console.warn(`[Compress] ${file.name}: canvas failed, using original`);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

// ─── Auth token ───────────────────────────────────────────────────────────────
//
// getSession() reads from cookies for active sessions (< 1 ms) or makes a
// token-refresh network call for expired ones (1–8 s, fully normal).
// No artificial timeout here — the 45 s AbortController on the fetch() handles
// the overall upload deadline.
//
// WHY no timeout: after a page reload the JWT in cookies is often expired.
// The middleware refreshes it server-side, but the browser GoTrueClient may
// still trigger its own refresh on the first getSession() call.  That call
// takes 2–8 s — a previous 3 s race killed it prematurely, returning null
// and showing "Session expired" for fully authenticated users.

async function getAccessToken(
  supabase: ReturnType<typeof createClient>,
): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  } catch {
    return null;
  }
}

// ─── Storage upload via direct fetch ─────────────────────────────────────────
//
// WHY fetch() instead of supabase.storage.upload():
//   The Supabase SDK wraps fetch() but does not expose an AbortSignal option.
//   Promise.race() against a timeout rejects the JS promise but leaves the
//   HTTP request running — consuming a browser connection slot until it finishes
//   or the tab closes.  With 6 connection slots per host, three timed-out uploads
//   fill the pool; the fourth queues at the TCP layer and immediately re-times-out
//   at the JS level (the 69 KB file in the logs).
//
//   Using fetch() with signal means controller.abort() sends a RST/FIN on the
//   socket, freeing the slot immediately.  Each file gets a clean connection.

async function uploadFile(
  file:     File,
  supabase: ReturnType<typeof createClient>,
  uid:      string,
  signal:   AbortSignal,
): Promise<UploadResult> {
  const ext  = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${uid}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  console.log("[Upload] ▶ start", { name: file.name, size: file.size, type: file.type, path });

  try {
    // ── Obtain auth token ────────────────────────────────────────────────────
    const token = await getAccessToken(supabase);
    if (!token) {
      return { error: "Your session has expired. Please log in again to continue uploading." };
    }

    // ── Direct fetch with AbortSignal ────────────────────────────────────────
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const endpoint    = `${supabaseUrl}/storage/v1/object/${BUCKET}/${path}`;

    const response = await fetch(endpoint, {
      method:  "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": file.type || "application/octet-stream",
        "Cache-Control": "3600",
        "x-upsert": "false",
      },
      body:   file,
      signal,                   // AbortController.abort() cancels this socket
    });

    if (!response.ok) {
      let msg = `Upload failed (HTTP ${response.status})`;
      try {
        const body = (await response.json()) as { message?: string; error?: string };
        msg = body.message ?? body.error ?? msg;
      } catch { /* ignore JSON parse error */ }
      console.error("[Upload] ✕ HTTP error:", msg);
      return { error: msg };
    }

    // getPublicUrl is synchronous — constructs URL from config, no network call.
    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);
    console.log("[Upload] ✓ success:", publicUrl);
    return { publicUrl };

  } catch (err) {
    // AbortError is thrown when either the timeout fires OR the user clicks cancel.
    // In both cases the HTTP socket is closed, freeing the connection slot.
    const isAbort = err instanceof DOMException && err.name === "AbortError";
    const msg     = err instanceof Error ? err.message : "Upload failed";

    if (isAbort) {
      console.log("[Upload] ✕ aborted:", file.name);
    } else {
      console.error("[Upload] ✕ caught:", msg);
    }

    return {
      error: isAbort
        ? `Upload timed out after ${UPLOAD_TIMEOUT_MS / 1000}s — check connection and retry.`
        : msg,
    };
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ImageUploadZone({
  previewUrls,
  onAdd,
  onRemove,
  maxImages = 10,
  minImages = 3,
  userId,
}: ImageUploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [entries, setEntries] = useState<QueueEntry[]>([]);

  // Keep callbacks in refs so the worker closure is never stale.
  const onAddRef   = useRef(onAdd);
  const userIdRef  = useRef(userId);
  useEffect(() => { onAddRef.current  = onAdd;   }, [onAdd]);
  useEffect(() => { userIdRef.current = userId;  }, [userId]);

  // ── Auth readiness ────────────────────────────────────────────────────────
  //
  // Call getSession() once on mount so the GoTrueClient warms up its in-memory
  // session (and performs a token refresh if the JWT in cookies is expired).
  // This eliminates the race window where a user selects files in the first
  // few hundred ms of page load before INITIAL_SESSION has fired — without
  // this warm-up, the worker would be the first to call getSession() and would
  // bear the full cost of the token-refresh network round-trip.
  //
  // authReady is set to true once the first getSession() settles.
  const authReady = useRef(false);
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(() => {
      authReady.current = true;
    }).catch(() => {
      authReady.current = true; // let the worker proceed and report the real error
    });
  }, []);

  // ── Queue / worker refs ───────────────────────────────────────────────────
  const workQueue         = useRef<QueueEntry[]>([]);
  const isWorkerRunning   = useRef(false);
  const discarded         = useRef<Set<string>>(new Set());
  // Holds the AbortController for whichever fetch is currently in-flight.
  // removeEntry() calls abort() on this to immediately cancel the socket.
  const currentController = useRef<AbortController | null>(null);

  // ── Serial queue worker ───────────────────────────────────────────────────
  //
  // Files are processed ONE AT A TIME (serial).  Concurrency would exhaust
  // the connection pool faster — serial is both safer and simpler.
  //
  // Every code path guarantees the entry exits "uploading" / "processing":
  //   • validation fail → "error"
  //   • successful upload → removed from list
  //   • timeout / abort → AbortError caught in uploadFile → "error"
  //   • user cancel → discarded check removes entry silently
  //   • outer catch → "error" (final safety net)

  const runWorker = useCallback(async () => {
    if (isWorkerRunning.current) return;
    isWorkerRunning.current = true;
    console.log("[Worker] ▶ started");

    // Wait for the mount-time getSession() warm-up to settle before uploading.
    // Avoids bearing the token-refresh cost mid-queue on a fresh page load.
    // Cap at 10 s so a hung getSession() never blocks forever.
    if (!authReady.current) {
      const deadline = Date.now() + 10_000;
      while (!authReady.current && Date.now() < deadline) {
        await new Promise<void>((r) => setTimeout(r, 50));
      }
    }

    // Create supabase client once per worker run (singleton internally).
    const supabase = createClient();

    while (workQueue.current.length > 0) {
      const entry = workQueue.current.shift()!;

      // ── Skip if user removed while queued ──────────────────────────────
      if (discarded.current.has(entry.id)) {
        console.log("[Worker] skip discarded (queued):", entry.name);
        discarded.current.delete(entry.id);
        setEntries((prev) => prev.filter((e) => e.id !== entry.id));
        continue;
      }

      try {

        // ── PHASE 1 : Compression ─────────────────────────────────────────
        setEntries((prev) =>
          prev.map((e) => e.id === entry.id ? { ...e, status: "processing" as const } : e),
        );
        console.log("[Worker] compressing:", entry.name);

        let fileToUpload: File;
        try {
          fileToUpload = await compressImage(entry.file);
        } catch {
          fileToUpload = entry.file;   // compression failure → upload original
        }

        // Check discard AFTER the async compress step.
        if (discarded.current.has(entry.id)) {
          console.log("[Worker] skip discarded (post-compress):", entry.name);
          discarded.current.delete(entry.id);
          setEntries((prev) => prev.filter((e) => e.id !== entry.id));
          continue;
        }

        // ── Client-side validation ──────────────────────────────────────────
        if (!ACCEPTED_TYPES.includes(entry.file.type)) {
          setEntries((prev) =>
            prev.map((e) => e.id === entry.id
              ? { ...e, status: "error" as const, error: "Unsupported type. Use JPEG, PNG or WebP." }
              : e,
            ),
          );
          continue;
        }
        if (entry.file.size > MAX_SIZE_BYTES) {
          setEntries((prev) =>
            prev.map((e) => e.id === entry.id
              ? { ...e, status: "error" as const, error: `File too large (max ${MAX_SIZE_BYTES / 1024 / 1024} MB).` }
              : e,
            ),
          );
          continue;
        }

        // ── PHASE 2 : Upload ──────────────────────────────────────────────
        setEntries((prev) =>
          prev.map((e) => e.id === entry.id ? { ...e, status: "uploading" as const } : e),
        );
        console.log("[Worker] processing:", entry.name);

        // Create a fresh AbortController for this file's fetch request.
        const controller = new AbortController();
        currentController.current = controller;

        // The timeout calls controller.abort() which sends a RST on the socket.
        // The fetch() inside uploadFile() throws DOMException("AbortError"),
        // uploadFile() catches it and returns { error: "Upload timed out…" }.
        // The connection slot is freed immediately — no ghost uploads.
        const timeoutId = setTimeout(() => {
          console.log("[Upload] ⏱ timeout — aborting HTTP request:", entry.name);
          controller.abort(new DOMException("Upload timed out", "AbortError"));
        }, UPLOAD_TIMEOUT_MS);

        const result = await uploadFile(
          fileToUpload,
          supabase,
          userIdRef.current,
          controller.signal,
        );

        clearTimeout(timeoutId);
        currentController.current = null;

        // Check discard AFTER the async upload step.
        // (User clicked ✕ while file was uploading — abort() was already called,
        //  entry already removed from UI; we just skip adding the error/URL.)
        if (discarded.current.has(entry.id)) {
          console.log("[Worker] skip discarded (uploading):", entry.id);
          discarded.current.delete(entry.id);
          setEntries((prev) => prev.filter((e) => e.id !== entry.id));
          continue;
        }

        if ("error" in result) {
          setEntries((prev) =>
            prev.map((e) => e.id === entry.id
              ? { ...e, status: "error" as const, error: result.error }
              : e,
            ),
          );
        } else {
          onAddRef.current(result.publicUrl);
          setEntries((prev) => prev.filter((e) => e.id !== entry.id));
        }

      } catch (err) {
        // Final safety net: any unexpected throw lands here so the entry
        // always exits "uploading" and never gets stuck in that state.
        const msg = err instanceof Error ? err.message : "Unexpected error. Please retry.";
        console.error("[Worker] ✕ unhandled for", entry.name, ":", msg);
        currentController.current = null;
        setEntries((prev) =>
          prev.map((e) => e.id === entry.id
            ? { ...e, status: "error" as const, error: msg }
            : e,
          ),
        );
      }
    }

    currentController.current = null;
    isWorkerRunning.current = false;
    console.log("[Worker] ■ idle — queue empty");
  }, []);

  // ── Add files ─────────────────────────────────────────────────────────────

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    const activeCount = entries.filter((e) => e.status !== "error").length;
    const available   = maxImages - previewUrls.length - activeCount;
    const batch       = Array.from(files).slice(0, Math.max(0, available));
    if (batch.length === 0) return;

    const newEntries: QueueEntry[] = batch.map((f) => ({
      id:     Math.random().toString(36).slice(2),
      file:   f,
      name:   f.name,
      status: "queued" as const,
    }));

    workQueue.current.push(...newEntries);
    setEntries((prev) => [...prev, ...newEntries]);
    runWorker();
  }

  // ── Remove / cancel ───────────────────────────────────────────────────────

  function removeEntry(id: string) {
    const entry = entries.find((e) => e.id === id);

    // If this entry is currently being uploaded OR compressed, abort the
    // in-flight fetch so the TCP socket is closed immediately.
    if (entry?.status === "uploading" || entry?.status === "processing") {
      currentController.current?.abort(
        new DOMException("Upload cancelled by user", "AbortError"),
      );
    }

    discarded.current.add(id);
    workQueue.current = workQueue.current.filter((e) => e.id !== id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  // ── Retry ─────────────────────────────────────────────────────────────────
  //
  // The previous attempt has already finished (timeout or error) so there is
  // no in-flight request to abort.  We simply re-enqueue the original File.

  function retryEntry(entry: QueueEntry) {
    const fresh: QueueEntry = {
      id:     entry.id,
      file:   entry.file,
      name:   entry.name,
      status: "queued" as const,
    };
    workQueue.current.push(fresh);
    setEntries((prev) => prev.map((e) => e.id === entry.id ? fresh : e));
    runWorker();
  }

  // ── URL fallback ──────────────────────────────────────────────────────────

  const [showUrlFallback, setShowUrl] = useState(false);
  const [urlInput, setUrlInput]       = useState("");
  const [urlError, setUrlError]       = useState("");

  function handleAddUrl() {
    const url = urlInput.trim();
    if (!url)                            { setUrlError("Please enter a URL."); return; }
    if (!/^https?:\/\/.+/i.test(url))   { setUrlError("URL must start with https://"); return; }
    if (previewUrls.includes(url))       { setUrlError("Already added."); return; }
    if (previewUrls.length >= maxImages) { setUrlError(`Maximum ${maxImages} images.`); return; }
    setUrlError("");
    onAdd(url);
    setUrlInput("");
  }

  // ── Drag-and-drop ─────────────────────────────────────────────────────────

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }

  // ── Derived counts ────────────────────────────────────────────────────────

  const processingCount = entries.filter((e) => e.status === "processing").length;
  const uploadingCount  = entries.filter((e) => e.status === "uploading").length;
  const queuedCount     = entries.filter((e) => e.status === "queued").length;
  const errorCount      = entries.filter((e) => e.status === "error").length;
  const totalActive     = processingCount + uploadingCount + queuedCount;
  const canAdd          =
    previewUrls.length + entries.filter((e) => e.status !== "error").length < maxImages;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-4">

      {/* ── Drop zone ── */}
      {canAdd && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-[#e8dfd4] rounded-2xl p-8 cursor-pointer hover:border-[#8b5e38] hover:bg-[#fdf9f5] transition-colors group"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#fdf5ee] group-hover:bg-[#f5e8d8] flex items-center justify-center transition-colors">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-[#8b5e38]">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-[#1a0e02]">Click to upload or drag & drop</p>
            <p className="text-xs text-[#a09080] mt-0.5">
              JPEG, PNG or WebP · Max 5 MB · Up to {maxImages} photos
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            multiple
            className="sr-only"
            onChange={(e) => { e.stopPropagation(); handleFiles(e.target.files); e.target.value = ""; }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* ── Queue / progress list ── */}
      {entries.length > 0 && (
        <div className="flex flex-col gap-2">

          {/* Batch status header */}
          {totalActive > 0 && (
            <p className="text-[10px] font-bold text-[#64707d] uppercase tracking-widest px-1">
              {uploadingCount > 0
                ? `Uploading${queuedCount > 0 ? ` — ${queuedCount} queued` : ""}…`
                : processingCount > 0
                ? `Compressing image${processingCount !== 1 ? "s" : ""}…`
                : `${queuedCount} file${queuedCount !== 1 ? "s" : ""} queued…`}
            </p>
          )}
          {errorCount > 0 && totalActive === 0 && (
            <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest px-1">
              {errorCount} upload{errorCount !== 1 ? "s" : ""} failed — retry or remove
            </p>
          )}

          {entries.map((entry) => (
            <div
              key={entry.id}
              className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm ${
                entry.status === "error"
                  ? "bg-red-50 border-red-200"
                  : entry.status === "queued"
                  ? "bg-[#f8f4f0] border-[#e8dfd4]"
                  : "bg-[#fdf8ee] border-[#ead9a6]"
              }`}
            >
              {/* Status icon */}
              {(entry.status === "uploading" || entry.status === "processing") && (
                <svg className="animate-spin w-4 h-4 shrink-0 mt-0.5 text-[#8b6a1f]" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2.5" />
                  <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              )}
              {entry.status === "queued" && (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-0.5 text-[#a09080]">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              )}
              {entry.status === "error" && (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-0.5 text-red-500">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              )}

              {/* File name + subtext */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${
                  entry.status === "error"       ? "text-red-700"
                  : entry.status === "queued"    ? "text-[#64707d]"
                  : "text-[#8b6a1f]"
                }`}>
                  {entry.name}
                </p>
                {entry.status === "processing" && (
                  <p className="text-[10px] text-[#a09080] mt-0.5">Compressing…</p>
                )}
                {entry.status === "uploading" && (
                  <p className="text-[10px] text-[#a09080] mt-0.5">Uploading…</p>
                )}
                {entry.status === "queued" && (
                  <p className="text-[10px] text-[#a09080] mt-0.5">Queued…</p>
                )}
                {entry.status === "error" && entry.error && (
                  <p className="text-xs text-red-600 mt-0.5 leading-relaxed">{entry.error}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {entry.status === "error" && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); retryEntry(entry); }}
                    className="text-xs font-semibold text-[#8b5e38] hover:text-[#461e00] border border-[#e8c89a] hover:border-[#8b5e38] px-2 py-1 rounded-lg transition-colors"
                  >
                    Retry
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeEntry(entry.id); }}
                  className={`transition-colors ${
                    entry.status === "uploading" || entry.status === "processing"
                      ? "text-[#c4a97a] hover:text-[#8b5e38]"
                      : "text-[#a09080] hover:text-red-600"
                  }`}
                  aria-label={
                    entry.status === "uploading" || entry.status === "processing"
                      ? "Cancel upload"
                      : "Remove"
                  }
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Preview grid ── */}
      {previewUrls.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {previewUrls.map((url, i) => (
            <div key={`${url}-${i}`} className="relative aspect-square rounded-xl overflow-hidden group">
              <Image
                src={url}
                alt={`Photo ${i + 1}`}
                fill
                className="object-cover"
                sizes="120px"
                unoptimized
              />
              {i === 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] font-bold text-center py-1 uppercase tracking-wider">
                  Cover
                </div>
              )}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onRemove(i); }}
                className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Photo count feedback ── */}
      {previewUrls.length > 0 && previewUrls.length < minImages
        && uploadingCount === 0 && queuedCount === 0 && processingCount === 0 && (
        <p className="text-xs text-[#8b5e38] font-medium flex items-center gap-1.5">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          Add {minImages - previewUrls.length} more photo{minImages - previewUrls.length !== 1 ? "s" : ""} — guests love seeing the full space
        </p>
      )}
      {previewUrls.length >= minImages && (
        <p className="text-xs text-[#049153] font-medium flex items-center gap-1.5">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M5 12l5 5 9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          {previewUrls.length} photo{previewUrls.length !== 1 ? "s" : ""} added
        </p>
      )}

      {/* ── URL fallback ── */}
      <div>
        <button
          type="button"
          onClick={() => setShowUrl((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-[#8b94a4] hover:text-[#64707d] transition-colors"
        >
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none"
            className={`transition-transform ${showUrlFallback ? "rotate-180" : ""}`}
          >
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {showUrlFallback ? "Hide" : "Or paste an image URL (demo / external link)"}
        </button>

        {showUrlFallback && (
          <div className="mt-2 flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => { setUrlInput(e.target.value); setUrlError(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddUrl(); } }}
                placeholder="https://example.com/photo.jpg"
                className="flex-1 px-3 py-2 border border-[#e8dfd4] rounded-xl text-sm text-[#1a0e02] bg-white placeholder:text-[#a09080] focus:outline-none focus:border-[#8b5e38] transition-colors"
              />
              <button
                type="button"
                onClick={handleAddUrl}
                disabled={!urlInput.trim() || !canAdd}
                className="px-4 py-2 bg-[#461e00] text-white text-sm font-semibold rounded-xl hover:bg-[#5a2800] disabled:opacity-40 transition-colors"
              >
                Add
              </button>
            </div>
            {urlError && <p className="text-xs text-red-600">{urlError}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
