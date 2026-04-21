"use client";

import Image from "next/image";
import { useRef, useState, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase";

// ─── Constants ────────────────────────────────────────────────────────────────

const ACCEPTED_TYPES    = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE_BYTES    = 5 * 1024 * 1024;          // 5 MB
const BUCKET            = "listing-images";
const UPLOAD_TIMEOUT_MS = 20_000;                    // per-file storage upload timeout

// ─── State machine ────────────────────────────────────────────────────────────
//
//  queued  →  uploading  →  (removed from list on success)
//     ↑           ↓
//     └─── retry ─┴──────→  error
//
// A file NEVER remains in "uploading" beyond UPLOAD_TIMEOUT_MS.
// A file NEVER remains in "queued" once the worker is running.

type FileStatus = "queued" | "uploading" | "error";

interface QueueEntry {
  id:     string;
  file:   File;       // kept for retry — same reference reused
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
  /** Authenticated host UID — provided by the server-rendered page, avoids getSession() during upload */
  userId:      string;
}

// ─── Pure timeout helper ──────────────────────────────────────────────────────
//
// Races a promise against a hard deadline. If the deadline fires first the
// returned promise REJECTS — so every awaiter must be inside a try/catch.

function withTimeout<T>(promise: Promise<T>, ms: number, msg: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(msg)), ms),
    ),
  ]);
}

// ─── Storage upload helper ────────────────────────────────────────────────────
//
// NEVER throws — always returns { publicUrl } or { error }.
// The hard timeout inside means no call can hang past UPLOAD_TIMEOUT_MS.

async function uploadFile(
  file:     File,
  supabase: ReturnType<typeof createClient>,
  uid:      string,
): Promise<UploadResult> {
  const ext  = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${uid}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  console.log("[Upload] ▶ start", { name: file.name, size: file.size, type: file.type, path });

  try {
    const { data, error } = await withTimeout(
      supabase.storage.from(BUCKET).upload(path, file, { cacheControl: "3600", upsert: false }),
      UPLOAD_TIMEOUT_MS,
      `Upload timed out after ${UPLOAD_TIMEOUT_MS / 1000}s — check connection and retry.`,
    );

    if (error) {
      console.error("[Upload] ✕ storage error:", error.message);
      return { error: error.message };
    }

    // getPublicUrl is synchronous — constructs URL from config, no network call.
    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(data!.path);
    console.log("[Upload] ✓ success:", publicUrl);
    return { publicUrl };
  } catch (err) {
    // Catches withTimeout rejections (timeout) and any other unexpected throws.
    const msg = err instanceof Error ? err.message : "Upload failed";
    console.error("[Upload] ✕ caught:", msg);
    return { error: msg };
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

  // Keep onAdd in a ref so the worker closure is never stale after a parent re-render.
  const onAddRef  = useRef(onAdd);
  // Keep userId in a ref too — stable across re-renders without re-creating the worker.
  const userIdRef = useRef(userId);
  useEffect(() => { onAddRef.current = onAdd; },   [onAdd]);
  useEffect(() => { userIdRef.current = userId; }, [userId]);

  // ── Queue refs — mutable, drive the worker ────────────────────────────────
  //
  // workQueue: ordered list of entries waiting to be processed.
  // isWorkerRunning: prevents concurrent worker invocations.
  // discarded: IDs the user removed while queued or uploading.
  //   • queued → removed from workQueue immediately; discarded as belt-and-suspenders.
  //   • uploading → cannot abort mid-flight; discarded prevents adding the publicUrl
  //     to the parent and removes the entry from UI when the upload finishes.

  const workQueue       = useRef<QueueEntry[]>([]);
  const isWorkerRunning = useRef(false);
  const discarded       = useRef<Set<string>>(new Set());

  // ── Serial queue worker ───────────────────────────────────────────────────
  //
  // Processes files one at a time. Every code path inside the loop guaranteed
  // to end in either:
  //   • file removed from entries (success or discarded)
  //   • file set to status="error" with a message
  //
  // The outer try/catch is the final safety net — uploadFile and
  // getAuthenticatedClient are designed not to throw, but defensive catch
  // ensures no uncaught rejection can freeze a file in "uploading".

  const runWorker = useCallback(async () => {
    if (isWorkerRunning.current) return;
    isWorkerRunning.current = true;
    console.log("[Worker] ▶ started");

    while (workQueue.current.length > 0) {
      const entry = workQueue.current.shift()!;

      // ── Skip discarded (user removed while queued) ──
      if (discarded.current.has(entry.id)) {
        console.log("[Worker] skip discarded (queued):", entry.id);
        discarded.current.delete(entry.id);
        setEntries((prev) => prev.filter((e) => e.id !== entry.id));
        continue;
      }

      // ── queued → uploading ──
      setEntries((prev) =>
        prev.map((e) => e.id === entry.id ? { ...e, status: "uploading" } : e),
      );
      console.log("[Worker] processing:", entry.name);

      try {
        // ── Client validation (synchronous, no network) ──
        if (!ACCEPTED_TYPES.includes(entry.file.type)) {
          setEntries((prev) =>
            prev.map((e) =>
              e.id === entry.id
                ? { ...e, status: "error", error: "Unsupported type. Use JPEG, PNG or WebP." }
                : e,
            ),
          );
          continue;
        }
        if (entry.file.size > MAX_SIZE_BYTES) {
          setEntries((prev) =>
            prev.map((e) =>
              e.id === entry.id
                ? { ...e, status: "error", error: `File too large (max ${MAX_SIZE_BYTES / 1024 / 1024} MB).` }
                : e,
            ),
          );
          continue;
        }

        // ── Storage upload ────────────────────────────────────────────────────
        //
        // userId comes from the server-rendered page (already verified auth).
        // createClient() returns the browser Supabase client — it attaches the
        // session from cookies to every request automatically. No getSession()
        // call needed here; that call was the source of the token-refresh hang.
        const supabase = createClient();
        const result = await uploadFile(entry.file, supabase, userIdRef.current);

        // Check if user removed this file while it was uploading.
        if (discarded.current.has(entry.id)) {
          console.log("[Worker] skip discarded (uploading):", entry.id);
          discarded.current.delete(entry.id);
          setEntries((prev) => prev.filter((e) => e.id !== entry.id));
          continue;
        }

        if ("error" in result) {
          setEntries((prev) =>
            prev.map((e) =>
              e.id === entry.id ? { ...e, status: "error", error: result.error } : e,
            ),
          );
        } else {
          // Success: push URL to parent, remove entry from queue list.
          onAddRef.current(result.publicUrl);
          setEntries((prev) => prev.filter((e) => e.id !== entry.id));
        }
      } catch (err) {
        // Final safety net — catches any throw that slips past the helpers above.
        // This guarantees the file always transitions out of "uploading".
        const msg = err instanceof Error ? err.message : "Unexpected error. Please retry.";
        console.error("[Worker] ✕ unhandled for", entry.name, ":", msg);
        setEntries((prev) =>
          prev.map((e) =>
            e.id === entry.id ? { ...e, status: "error", error: msg } : e,
          ),
        );
      }
    }

    isWorkerRunning.current = false;
    console.log("[Worker] ■ idle — queue empty");
  }, []); // stable — all reads go through refs; setEntries is stable from useState

  // ── Add files ─────────────────────────────────────────────────────────────

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    // Available slots = maxImages minus already-uploaded minus in-flight (queued + uploading).
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

    // Push to mutable queue ref first, then update React state.
    workQueue.current.push(...newEntries);
    setEntries((prev) => [...prev, ...newEntries]);

    // Kick off worker — no-op if already running.
    runWorker();
  }

  // ── Remove / cancel ───────────────────────────────────────────────────────

  function removeEntry(id: string) {
    // Mark as discarded so the worker skips or discards result if already uploading.
    discarded.current.add(id);
    // Remove from mutable queue (effective for "queued" items not yet picked up).
    workQueue.current = workQueue.current.filter((e) => e.id !== id);
    // Remove from UI state immediately regardless of current status.
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  // ── Retry ─────────────────────────────────────────────────────────────────

  function retryEntry(entry: QueueEntry) {
    // Re-enqueue the same file (same id, same File object) as "queued".
    const fresh: QueueEntry = { id: entry.id, file: entry.file, name: entry.name, status: "queued" };
    workQueue.current.push(fresh);
    setEntries((prev) => prev.map((e) => e.id === entry.id ? fresh : e));
    runWorker(); // no-op if already running
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

  // ── Derived display values ─────────────────────────────────────────────────

  const uploadingCount = entries.filter((e) => e.status === "uploading").length;
  const queuedCount    = entries.filter((e) => e.status === "queued").length;
  const errorCount     = entries.filter((e) => e.status === "error").length;
  const totalActive    = uploadingCount + queuedCount;
  const canAdd         =
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
              {entry.status === "uploading" && (
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

              {/* File name + status text */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${
                  entry.status === "error"    ? "text-red-700"
                  : entry.status === "queued" ? "text-[#64707d]"
                  : "text-[#8b6a1f]"
                }`}>
                  {entry.name}
                </p>
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
                    entry.status === "uploading"
                      ? "text-[#c4a97a] hover:text-[#8b5e38]"
                      : "text-[#a09080] hover:text-red-600"
                  }`}
                  aria-label={entry.status === "uploading" ? "Cancel upload" : "Remove"}
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
      {previewUrls.length > 0 && previewUrls.length < minImages && uploadingCount === 0 && queuedCount === 0 && (
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
