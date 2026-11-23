"use client";

import { useEffect, useMemo } from "react";
import { dictionaries } from "@/i18n/messages";

function readLocaleFromCookie(): "ro" | "en" {
  if (typeof document === "undefined") return "ro";
  const match = document.cookie.match(/(?:^|; )NEXT_LOCALE=([^;]*)/);
  return match?.[1] === "en" ? "en" : "ro";
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = useMemo(() => readLocaleFromCookie(), []);
  const t = dictionaries[locale].error;

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang={locale}>
      <body className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 px-4 font-sans">
        <h1 className="text-xl font-bold text-gray-900">{t.globalTitle}</h1>
        <p className="max-w-md text-center text-gray-600">
          {t.globalText}
        </p>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          {t.reload}
        </button>
      </body>
    </html>
  );
}
