"use client";

import Image from "next/image";
import { useState } from "react";

interface GalleryGridProps {
  images: string[];
  title: string;
}

export default function GalleryGrid({ images, title }: GalleryGridProps) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  // Ensure we have at least 5 images (pad if needed)
  const imgs = [...images];
  while (imgs.length < 5) imgs.push(imgs[0]);

  return (
    <>
      {/* ── Grid ──────────────────────────────────────────────────────────── */}
      <div className="relative w-full overflow-hidden rounded-3xl">
        {/* Mobile: single hero image */}
        <div className="md:hidden relative w-full h-[280px]">
          <Image
            src={imgs[0]}
            alt={title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 616px"
          />
          <button
            onClick={() => setLightbox(0)}
            className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-[#1a0e02] text-xs font-semibold px-3 py-1.5 rounded-xl shadow-sm hover:bg-white transition-colors"
          >
            Show all photos
          </button>
        </div>

        {/* Desktop: 2-column grid — 1 big left + 2×2 right */}
        <div className="hidden md:grid grid-cols-2 gap-2 h-[500px]">
          {/* Big left image */}
          <div
            className="relative h-full cursor-zoom-in rounded-l-3xl overflow-hidden"
            onClick={() => setLightbox(0)}
          >
            <Image
              src={imgs[0]}
              alt={title}
              fill
              className="object-cover hover:scale-105 transition-transform duration-500"
              priority
              sizes="50vw"
            />
          </div>

          {/* Right 2×2 grid */}
          <div className="grid grid-cols-2 gap-2">
            {imgs.slice(1, 5).map((src, i) => (
              <div
                key={i}
                className={`relative cursor-zoom-in overflow-hidden ${
                  i === 1 ? "rounded-tr-3xl" : i === 3 ? "rounded-br-3xl" : ""
                }`}
                onClick={() => setLightbox(i + 1)}
              >
                <Image
                  src={src}
                  alt={`${title} ${i + 2}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                  sizes="25vw"
                />
                {/* "Show all" button on last thumb */}
                {i === 3 && (
                  <div className="absolute inset-0 bg-black/30 flex items-end justify-end p-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); setLightbox(0); }}
                      className="bg-white text-[#1a0e02] text-xs font-semibold px-3 py-1.5 rounded-xl shadow hover:bg-[#f4efe6] transition-colors"
                    >
                      + {Math.max(0, images.length - 5)} more
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Lightbox ──────────────────────────────────────────────────────── */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          {/* Close button */}
          <button
            className="absolute top-5 right-5 text-white/80 hover:text-white w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            onClick={() => setLightbox(null)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          {/* Prev */}
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            onClick={(e) => { e.stopPropagation(); setLightbox((prev) => (prev! - 1 + imgs.length) % imgs.length); }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Image */}
          <div
            className="relative w-full max-w-4xl mx-16 aspect-[4/3]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={imgs[lightbox]}
              alt={`${title} ${lightbox + 1}`}
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>

          {/* Next */}
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            onClick={(e) => { e.stopPropagation(); setLightbox((prev) => (prev! + 1) % imgs.length); }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Counter */}
          <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/70 text-sm">
            {lightbox + 1} / {imgs.length}
          </p>
        </div>
      )}
    </>
  );
}
