"use client";

import Image from "next/image";
import { useRef, useState, useCallback } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

const MAX_DIMENSION_PX = 1_600;
const JPEG_QUALITY     = 0.85;

// ─── Types ────────────────────────────────────────────────────────────────────

type EntryStatus = "processing" | "error";

interface QueueEntry {
  id:     string;
  file:   File;
  name:   string;
  status: EntryStatus;
  error?: string;
}

interface ImageUploadZoneProps {
  previewUrls: string[];
  onAdd:       (url: string, file?: File) => void;
  onRemove:    (index: number) => void;
  maxImages?:  number;
  minImages?:  number;
}

// ─── Image compression ────────────────────────────────────────────────────────

async function compressImage(file: File): Promise<File> {
  if (!ACCEPTED_TYPES.includes(file.type)) return file;

  return new Promise<File>((resolve) => {
    const img       = document.createElement("img");
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      const oversized   = width > MAX_DIMENSION_PX || height > MAX_DIMENSION_PX;
      const needsEncode = file.size > 800_000;

      if (!oversized && !needsEncode) {
        resolve(file);
        return;
      }

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
          const baseName   = file.name.replace(/\.[^.]+$/, "");
          const compressed = new File([blob], `${baseName}.jpg`, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          resolve(compressed);
        },
        "image/jpeg",
        JPEG_QUALITY,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ImageUploadZone({
  previewUrls,
  onAdd,
  onRemove,
  maxImages = 10,
  minImages = 3,
}: ImageUploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [entries, setEntries] = useState<QueueEntry[]>([]);

  const onAddRef  = useRef(onAdd);
  onAddRef.current = onAdd;

  // Tracks entries removed while compression is in progress so the async
  // callback can skip calling onAdd for discarded files.
  const discarded = useRef<Set<string>>(new Set());

  // ── Process a single file (compress → blob URL → notify parent) ──────────

  const processFile = useCallback(async (entry: QueueEntry) => {
    const { id, file } = entry;

    // Validate
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setEntries((prev) => prev.map((e) =>
        e.id === id ? { ...e, status: "error" as const, error: "Unsupported type. Use JPEG, PNG or WebP." } : e,
      ));
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setEntries((prev) => prev.map((e) =>
        e.id === id
          ? { ...e, status: "error" as const, error: `File too large (max ${MAX_SIZE_BYTES / 1024 / 1024} MB).` }
          : e,
      ));
      return;
    }

    // Compress locally
    let compressed: File;
    try {
      compressed = await compressImage(file);
    } catch {
      compressed = file;
    }

    // If user removed the entry while we were compressing, skip it
    if (discarded.current.has(id)) {
      discarded.current.delete(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      return;
    }

    // Blob URL for immediate preview; actual upload happens on form submit
    const blobUrl = URL.createObjectURL(compressed);
    onAddRef.current(blobUrl, compressed);
    setEntries((prev) => prev.filter((e) => e.id !== id));
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
      status: "processing" as const,
    }));

    setEntries((prev) => [...prev, ...newEntries]);
    newEntries.forEach((e) => processFile(e));
  }

  // ── Remove / cancel ───────────────────────────────────────────────────────

  function removeEntry(id: string) {
    discarded.current.add(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
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
    onAdd(url); // no File — treated as an already-uploaded URL
    setUrlInput("");
  }

  // ── Drag-and-drop ─────────────────────────────────────────────────────────

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }

  // ── Derived counts ────────────────────────────────────────────────────────

  const processingCount = entries.filter((e) => e.status === "processing").length;
  const errorCount      = entries.filter((e) => e.status === "error").length;
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

      {/* ── Compression queue ── */}
      {entries.length > 0 && (
        <div className="flex flex-col gap-2">
          {processingCount > 0 && (
            <p className="text-[10px] font-bold text-[#64707d] uppercase tracking-widest px-1">
              Compressing image{processingCount !== 1 ? "s" : ""}…
            </p>
          )}
          {errorCount > 0 && processingCount === 0 && (
            <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest px-1">
              {errorCount} file{errorCount !== 1 ? "s" : ""} could not be added — remove and try again
            </p>
          )}

          {entries.map((entry) => (
            <div
              key={entry.id}
              className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm ${
                entry.status === "error"
                  ? "bg-red-50 border-red-200"
                  : "bg-[#fdf8ee] border-[#ead9a6]"
              }`}
            >
              {entry.status === "processing" && (
                <svg className="animate-spin w-4 h-4 shrink-0 mt-0.5 text-[#8b6a1f]" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2.5" />
                  <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              )}
              {entry.status === "error" && (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-0.5 text-red-500">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              )}

              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${
                  entry.status === "error" ? "text-red-700" : "text-[#8b6a1f]"
                }`}>
                  {entry.name}
                </p>
                {entry.status === "processing" && (
                  <p className="text-[10px] text-[#a09080] mt-0.5">Compressing…</p>
                )}
                {entry.status === "error" && entry.error && (
                  <p className="text-xs text-red-600 mt-0.5 leading-relaxed">{entry.error}</p>
                )}
              </div>

              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeEntry(entry.id); }}
                className="text-[#a09080] hover:text-red-600 transition-colors shrink-0"
                aria-label="Remove"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
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
      {previewUrls.length > 0 && previewUrls.length < minImages && processingCount === 0 && (
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
          {previewUrls.length} photo{previewUrls.length !== 1 ? "s" : ""} added — will be uploaded when you submit
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
