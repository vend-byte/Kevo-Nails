"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

interface GalleryImageItem {
  id: string;
  url: string;
  altText: string | null;
  categoryLabel: string;
}

/**
 * Requests a smaller version directly from Cloudinary's CDN for grid
 * thumbnails, by inserting a transformation segment into the URL. This
 * keeps thumbnails fast without going through Next's image optimizer
 * (which is disabled — see next.config.js). The lightbox always uses the
 * original, untransformed URL so the full uploaded quality is shown.
 */
function cloudinaryThumb(url: string, width = 500) {
  const marker = "/upload/";
  const i = url.indexOf(marker);
  if (i === -1) return url;
  const insertAt = i + marker.length;
  return `${url.slice(0, insertAt)}w_${width},c_limit,q_auto,f_auto/${url.slice(insertAt)}`;
}

export default function GalleryGrid({ images }: { images: GalleryImageItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    if (openIndex === null) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenIndex(null);
      if (e.key === "ArrowRight") {
        setZoomed(false);
        setOpenIndex((i) => (i === null ? null : (i + 1) % images.length));
      }
      if (e.key === "ArrowLeft") {
        setZoomed(false);
        setOpenIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length));
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [openIndex, images.length]);

  const active = openIndex !== null ? images[openIndex] : null;

  return (
    <>
      <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {images.map((image, i) => (
          <button
            key={image.id}
            type="button"
            onClick={() => {
              setOpenIndex(i);
              setZoomed(false);
            }}
            className="group relative aspect-square overflow-hidden rounded-lg bg-white/5"
          >
            {/* object-contain shows the full image with no cropping; a blurred
                cover copy fills the background so square tiles never letterbox
                to empty black bars. */}
            <Image
              src={cloudinaryThumb(image.url, 500)}
              alt=""
              fill
              aria-hidden
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
              className="scale-110 object-cover opacity-30 blur-xl"
            />
            <Image
              src={cloudinaryThumb(image.url, 500)}
              alt={image.altText ?? image.categoryLabel}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
              className="object-contain transition duration-300 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-sm"
          onClick={() => setOpenIndex(null)}
        >
          <div className="flex items-center justify-between px-6 py-4 text-white/70">
            <span className="text-sm">{active.categoryLabel}</span>
            <div className="flex items-center gap-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomed((z) => !z);
                }}
                aria-label={zoomed ? "Zoom out" : "Zoom in"}
                className="hover:text-white"
              >
                {zoomed ? <ZoomOut size={22} /> : <ZoomIn size={22} />}
              </button>
              <button
                onClick={() => setOpenIndex(null)}
                aria-label="Close"
                className="hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="relative flex-1 overflow-auto px-4 pb-6">
            <div
              className={`relative mx-auto h-full ${zoomed ? "w-[180%] max-w-none" : "max-w-4xl"}`}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={active.url}
                alt={active.altText ?? active.categoryLabel}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
          </div>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomed(false);
                  setOpenIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length));
                }}
                aria-label="Previous image"
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomed(false);
                  setOpenIndex((i) => (i === null ? null : (i + 1) % images.length));
                }}
                aria-label="Next image"
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
