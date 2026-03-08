"use client";

import Image from "next/image";
import { useRef, useState } from "react";

interface ImageUploadZoneProps {
  previewUrls: string[];
  onAdd:    (files: FileList | File[]) => void;
  onRemove: (index: number) => void;
  maxImages?: number;
  minImages?: number;
}

export default function ImageUploadZone({
  previewUrls,
  onAdd,
  onRemove,
  maxImages = 10,
  minImages = 3,
}: ImageUploadZoneProps) {
  const inputRef  = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = maxImages - previewUrls.length;
    if (remaining <= 0) return;
    const valid = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, remaining);
    if (valid.length > 0) onAdd(valid);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const canAdd = previewUrls.length < maxImages;

  return (
    <div className="flex flex-col gap-4">

      {/* Dropzone */}
      {canAdd && (
        <div
          className={[
            "border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all",
            dragging
              ? "border-[#8b5e38] bg-[#fdf5ee]"
              : "border-[#e8dfd4] bg-[#faf7f4] hover:border-[#c49a4f] hover:bg-[#fff9f2]",
          ].join(" ")}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
        >
          <div className="w-14 h-14 bg-white border border-[#e8dfd4] rounded-2xl flex items-center justify-center text-[#8b5e38]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                stroke="currentColor" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="17 8 12 3 7 8"
                stroke="currentColor" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round" />
              <line x1="12" y1="3" x2="12" y2="15"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-[#1a0e02]">
              {dragging ? "Drop photos here" : "Drag & drop your photos"}
            </p>
            <p className="text-xs text-[#64707d] mt-0.5">
              or <span className="text-[#8b5e38] font-semibold underline underline-offset-2">browse files</span>
            </p>
          </div>
          <p className="text-[10px] text-[#a09080]">
            JPG, PNG or WEBP · Max {maxImages} photos
            {previewUrls.length < minImages
              ? ` · ${minImages - previewUrls.length} more needed`
              : ""}
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      )}

      {/* Preview grid */}
      {previewUrls.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {previewUrls.map((url, i) => (
            <div key={url} className="relative aspect-square rounded-xl overflow-hidden group">
              <Image
                src={url}
                alt={`Photo ${i + 1}`}
                fill
                className="object-cover"
                sizes="120px"
              />
              {/* Cover label on first photo */}
              {i === 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] font-bold text-center py-1 uppercase tracking-wider">
                  Cover
                </div>
              )}
              {/* Remove button */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onRemove(i); }}
                className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12"
                    stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          ))}

          {/* Add more tile */}
          {canAdd && (
            <div
              className="aspect-square rounded-xl border-2 border-dashed border-[#e8dfd4] flex items-center justify-center cursor-pointer hover:border-[#c49a4f] transition-colors bg-[#faf7f4]"
              onClick={() => inputRef.current?.click()}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[#a09080]">
                <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          )}
        </div>
      )}

      {/* Min photos notice */}
      {previewUrls.length > 0 && previewUrls.length < minImages && (
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
          Great! {previewUrls.length} photo{previewUrls.length !== 1 ? "s" : ""} uploaded
        </p>
      )}
    </div>
  );
}
