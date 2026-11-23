"use client";

import { useI18n } from "@/i18n/LocaleProvider";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className={`inline-flex items-center rounded-lg border border-gray-600 text-xs font-semibold ${className}`}>
      <button
        type="button"
        onClick={() => setLocale("ro")}
        aria-pressed={locale === "ro"}
        aria-label={t.nav.switchToRo}
        className={`px-2 py-1 ${locale === "ro" ? "bg-primary text-white" : "text-gray-300 hover:text-white"}`}
      >
        RO
      </button>
      <button
        type="button"
        onClick={() => setLocale("en")}
        aria-pressed={locale === "en"}
        aria-label={t.nav.switchToEn}
        className={`px-2 py-1 ${locale === "en" ? "bg-primary text-white" : "text-gray-300 hover:text-white"}`}
      >
        EN
      </button>
    </div>
  );
}
