"use client";

import { useState } from "react";
import { CarImage } from "@/components/CarImage";

interface CarGalleryProps {
  images: string[];
  alt: string;
  /** Clasă pentru containerul principal */
  className?: string;
  sizes?: string;
}

export function CarGallery({ images, alt, className = "", sizes }: CarGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const list = images.filter(Boolean);
  if (list.length === 0) {
    return (
      <div className={`flex items-center justify-center rounded-xl bg-gray-700 text-gray-400 ${className}`}>
        <span className="text-sm">{alt}</span>
      </div>
    );
  }
  const mainSrc = list[currentIndex] ?? list[0];
  const goToPrevImage = () => {
    if (list.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + list.length) % list.length);
  };
  const goToNextImage = () => {
    if (list.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % list.length);
  };
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="relative aspect-video overflow-hidden rounded-xl bg-gray-700">
        <CarImage
          src={mainSrc}
          alt={alt}
          fallbackName={alt}
          className="!absolute inset-0 rounded-xl"
          sizes={sizes ?? "(max-width: 1024px) 100vw, 66vw"}
          priority
        />
        {list.length > 1 && (
          <>
            <button
              type="button"
              onClick={goToPrevImage}
              aria-label="Imagine anterioară"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/45 px-3 py-2 text-white transition hover:bg-black/60"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={goToNextImage}
              aria-label="Imagine următoare"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/45 px-3 py-2 text-white transition hover:bg-black/60"
            >
              ›
            </button>
          </>
        )}
      </div>
      {list.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {list.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setCurrentIndex(i)}
              className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                i === currentIndex ? "border-primary ring-2 ring-primary/30" : "border-gray-600 hover:border-gray-500"
              }`}
            >
              <CarImage
                src={src}
                alt=""
                className="object-cover"
                fill
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
