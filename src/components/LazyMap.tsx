"use client";

import { useEffect, useRef, useState } from "react";

interface LazyMapProps {
  src: string;
  title: string;
  className?: string;
}

/** Harta Google se încarcă o singură dată, când blocul se apropie de ecran. */
export function LazyMap({ src, title, className = "block h-[450px] w-full" }: LazyMapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [activeSrc, setActiveSrc] = useState<string | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || activeSrc) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        if (entry.boundingClientRect.height < 1) return;
        setActiveSrc(src);
        observer.disconnect();
      },
      { rootMargin: "320px 0px", threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [activeSrc, src]);

  return (
    <div ref={ref} className={`${className} relative max-w-full overflow-hidden bg-dark`}>
      {activeSrc ? (
        <iframe
          src={activeSrc}
          title={title}
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          className="absolute inset-0 block h-full w-full max-w-full border-0"
        />
      ) : (
        <div className="absolute inset-0 bg-dark" aria-hidden />
      )}
    </div>
  );
}
