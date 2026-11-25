"use client";

import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";
import { localePath, stripLocalePrefix } from "@/i18n/paths";
import { useI18n } from "@/i18n/LocaleProvider";

const LABEL_KEY: Record<Locale, "switchToRo" | "switchToEn" | "switchToHu"> = {
  ro: "switchToRo",
  en: "switchToEn",
  hu: "switchToHu",
};

function LanguageSwitcherLinks({ className = "" }: { className?: string }) {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const bare = stripLocalePrefix(pathname);
  const search = searchParams.toString();

  return (
    <div className={`inline-flex rounded-lg bg-gray-600 p-px text-xs font-semibold leading-none ${className}`}>
      {locales.map((code, index) => {
        const path = localePath(code, bare);
        const href = search ? `${path}?${search}` : path;
        const active = locale === code;
        const radius = index === 0 ? "rounded-l-[7px]" : index === locales.length - 1 ? "rounded-r-[7px]" : "";
        // <a> nativ, nu next/link: middleware rescrie /en și /hu la aceeași pagină,
        // iar navigarea din client păstrează textul limbii vechi.
        return (
          <a
            key={code}
            href={href}
            hrefLang={code}
            lang={code}
            aria-current={active ? "true" : undefined}
            aria-label={t.nav[LABEL_KEY[code]]}
            className={`px-2 py-1 ${radius} ${active ? "bg-primary text-white" : "bg-dark text-gray-300 hover:text-white"}`}
            onClick={(event) => {
              event.preventDefault();
              if (!active) window.location.assign(href);
            }}
          >
            {code.toUpperCase()}
          </a>
        );
      })}
    </div>
  );
}

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  return (
    <Suspense fallback={<span className={`inline-flex h-[26px] w-[96px] rounded-lg bg-gray-600 ${className}`} />}>
      <LanguageSwitcherLinks className={className} />
    </Suspense>
  );
}
