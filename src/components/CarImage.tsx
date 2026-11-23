"use client";

import Image from "next/image";
import { useState } from "react";

interface CarImageProps {
  src: string;
  alt: string;
  /** Text afișat când imaginea lipsește sau nu se încarcă */
  fallbackName?: string;
  /** Pentru card: aspect-[4/3], pentru detaliu: aspect-video */
  className?: string;
  sizes?: string;
  fill?: boolean;
  priority?: boolean;
}

export function CarImage({ src, alt, fallbackName = "Mașină", className = "", sizes, fill = true, priority }: CarImageProps) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 text-gray-500 ${className}`}
        style={fill ? {} : { minHeight: "200px" }}
      >
        <span className="text-sm font-medium">{fallbackName}</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes ?? "(max-width: 768px) 100vw, 400px"}
      quality={70}
      className={`object-cover ${className}`}
      onError={() => setError(true)}
      priority={priority}
    />
  );
}
