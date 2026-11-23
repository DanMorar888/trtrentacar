"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useI18n } from "@/i18n/LocaleProvider";

const SHOW_AFTER_PX = 400;

export function BackToTop() {
  const { t } = useI18n();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    if (isAdmin) return;

    const onScroll = () => {
      setVisible(window.scrollY > SHOW_AFTER_PX);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isAdmin]);

  if (isAdmin || !visible) return null;

  const label = t.nav.backToTop;

  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => {
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      }}
      className="fixed bottom-5 right-5 z-40 inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-primary px-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      <svg
        className="h-4 w-4 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6 14l6-6 6 6" />
      </svg>
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}
