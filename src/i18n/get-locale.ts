import { cookies } from "next/headers";
import { defaultLocale, isLocale, LOCALE_COOKIE, type Locale } from "@/i18n/config";
import { dictionaries, type Messages } from "@/i18n/messages";

export function getLocale(): Locale {
  const value = cookies().get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : defaultLocale;
}

export function getDictionary(locale?: Locale): Messages {
  return dictionaries[locale ?? getLocale()];
}
