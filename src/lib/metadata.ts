import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { locales, type Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import { openGraphDefaultImages, SITE_URL } from "@/lib/site-identity";

export const ROBOTS_NOINDEX_FOLLOW: Metadata["robots"] = {
  index: false,
  follow: true,
};

export function absoluteUrl(path: string): string {
  const base = SITE_URL.replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

/**
 * Fiecare limbă are adresă proprie: /tarife, /en/tarife, /hu/tarife.
 * hreflang indică aceste adrese, iar x-default rămâne varianta română.
 */
export function alternateLanguages(path: string): Record<string, string> {
  const canonicalPath = path.startsWith("/") ? path : `/${path}`;
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[locale] = absoluteUrl(localePath(locale, canonicalPath));
  }
  languages["x-default"] = absoluteUrl(localePath("ro", canonicalPath));
  return languages;
}

export function openGraphLocale(locale: Locale): string {
  if (locale === "en") return "en_US";
  if (locale === "hu") return "hu_HU";
  return "ro_RO";
}

type BuildPageMetadataOptions = {
  locale?: Locale;
  path: string;
  title: string;
  description: string;
  robots?: Metadata["robots"];
  ogImage?: string;
};

export function buildPageMetadata({
  locale = "ro",
  path,
  title,
  description,
  robots,
  ogImage,
}: BuildPageMetadataOptions): Metadata {
  const canonicalPath = path.startsWith("/") ? path : `/${path}`;
  const localizedPath = localePath(locale, canonicalPath);
  const noindex = typeof robots === "object" && robots !== null && "index" in robots && robots.index === false;
  const defaultImages = openGraphDefaultImages();
  const images = ogImage
    ? [
        {
          url: ogImage.startsWith("http") ? ogImage : absoluteUrl(ogImage),
          width: 1200,
          height: 630,
          alt: title,
        },
      ]
    : defaultImages;

  const imageUrl = images?.[0]?.url;

  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(localizedPath),
      ...(noindex ? {} : { languages: alternateLanguages(canonicalPath) }),
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(localizedPath),
      siteName: siteConfig.name,
      locale: openGraphLocale(locale),
      alternateLocale: locales.filter((item) => item !== locale).map(openGraphLocale),
      type: "website",
      ...(images?.length ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
    ...(robots ? { robots } : {}),
  };
}
