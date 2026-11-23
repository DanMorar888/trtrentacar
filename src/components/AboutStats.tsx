"use client";

import { useLayoutEffect, useRef, useState } from "react";

export type AboutStat = {
  value: number;
  label: string;
  animate: boolean;
};

const DURATION_MS = 1600;

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function AboutStats({ stats }: { stats: AboutStat[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(() => stats.map((stat) => stat.value));

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const finals = stats.map((stat) => stat.value);
    if (prefersReducedMotion()) {
      setShown(finals);
      return;
    }

    let frame = 0;
    let stopped = false;

    const animate = () => {
      if (stopped) return;
      const startedAt = performance.now();
      setShown(stats.map((stat) => (stat.animate ? 0 : stat.value)));
      const tick = (now: number) => {
        if (stopped) return;
        const progress = Math.min(1, (now - startedAt) / DURATION_MS);
        const eased = easeOutCubic(progress);
        setShown(stats.map((stat) => (stat.animate ? Math.round(eased * stat.value) : stat.value)));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    const rect = root.getBoundingClientRect();
    const inView = rect.top < window.innerHeight * 0.85 && rect.bottom > 0;

    if (inView) {
      animate();
      return () => {
        stopped = true;
        cancelAnimationFrame(frame);
      };
    }

    setShown(stats.map((stat) => (stat.animate ? 0 : stat.value)));

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        animate();
      },
      { threshold: 0.25 }
    );
    observer.observe(root);

    return () => {
      stopped = true;
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [stats]);

  return (
    <div ref={rootRef} className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className="min-w-0 rounded-xl border border-white/60 bg-white px-3 py-5 text-center shadow-lg"
        >
          <p
            className="whitespace-nowrap text-3xl font-bold tabular-nums text-primary sm:text-4xl"
            aria-label={stat.animate ? `+${stat.value}` : String(stat.value)}
          >
            <span className="relative inline-block">
              {stat.animate ? (
                <span aria-hidden="true" className="absolute right-full">
                  +
                </span>
              ) : null}
              <span aria-hidden="true">{shown[index] ?? stat.value}</span>
            </span>
          </p>
          <p className="mt-2 break-words text-xs font-semibold uppercase leading-tight tracking-wide text-gray-700 sm:text-sm">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}
