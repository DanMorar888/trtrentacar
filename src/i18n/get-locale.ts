import { headers } from "next/headers";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import { dictionaries, type Messages } from "@/i18n/messages";

/**
 * Limba vine din adresă (/en, /hu), pusă de middleware în header.
 * Fără prefix, pagina este română. Cookie-ul nu schimbă limba unei adrese,
 * ca Google să vadă mereu aceeași limbă la același URL.
 */
export function getLocale(): Locale {
  const value = headers().get("x-locale");
  return isLocale(value) ? value : defaultLocale;
}

export function getDictionary(locale?: Locale): Messages {
  return dictionaries[locale ?? getLocale()];
}
