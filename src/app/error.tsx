"use client";

import { useEffect } from "react";
import { useI18n } from "@/i18n/LocaleProvider";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useI18n();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4">
      <h2 className="text-lg font-semibold text-gray-900">{t.error.title}</h2>
      <p className="max-w-md text-center text-sm text-gray-600">
        {t.error.text}
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          {t.error.retry}
        </button>
        <a
          href="/"
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          {t.error.home}
        </a>
      </div>
    </div>
  );
}
