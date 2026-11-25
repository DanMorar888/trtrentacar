import { defaultLocale, locales, type Locale } from "@/i18n/config";

const prefixedLocales = new Set<string>(locales.filter((locale) => locale !== defaultLocale));

/** Scoate prefixul /en sau /hu. Româna rămâne fără prefix. */
export function stripLocalePrefix(pathname: string): string {
  const segments = pathname.split("/");
  if (!prefixedLocales.has(segments[1] ?? "")) return pathname || "/";
  const rest = `/${segments.slice(2).join("/")}`;
  if (rest === "/" || rest === "") return "/";
  return rest.length > 1 && rest.endsWith("/") ? rest.slice(0, -1) : rest;
}

/**
 * Pune limba în adresă: româna rămâne /tarife, engleza /en/tarife, maghiara /hu/tarife.
 * Păstrează query-ul și hash-ul. Nu prefixează /admin și /api.
 */
export function localePath(locale: Locale, href: string): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;

  const hashIndex = href.indexOf("#");
  const hash = hashIndex >= 0 ? href.slice(hashIndex) : "";
  const beforeHash = hashIndex >= 0 ? href.slice(0, hashIndex) : href;
  const queryIndex = beforeHash.indexOf("?");
  const query = queryIndex >= 0 ? beforeHash.slice(queryIndex) : "";
  const pathname = queryIndex >= 0 ? beforeHash.slice(0, queryIndex) : beforeHash;

  if (pathname.startsWith("/admin") || pathname.startsWith("/api")) return href;

  const bare = stripLocalePrefix(pathname || "/");
  const localized = locale === defaultLocale ? bare : `/${locale}${bare === "/" ? "" : bare}`;
  return `${localized}${query}${hash}`;
}
