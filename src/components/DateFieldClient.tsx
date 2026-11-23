"use client";

import dynamic from "next/dynamic";

/** Placeholder până se încarcă calendarul – păstrează înălțimea și stilul câmpului. */
function DateFieldFallback() {
  return (
    <div
      className="flex w-full items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-500"
      style={{ minHeight: "2.75rem" }}
    >
      <span>Alege data</span>
      <span className="shrink-0 text-gray-400">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </span>
    </div>
  );
}

const DateField = dynamic(
  () => import("./DateField").then((mod) => ({ default: mod.DateField })),
  { ssr: false, loading: DateFieldFallback }
);

export { DateField };
