import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import type { Locale } from "@/i18n/config";
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
 * Engleza se alege dintr-un cookie, nu dintr-o adresă separată: `?lang=en` doar
 * setează cookie-ul și redirecționează înapoi. O astfel de adresă nu poate fi
 * declarată ca alternativă hreflang, așa că anunțăm doar varianta română.
 */
export function alternateLanguages(path: string): Record<string, string> {
  const canonicalPath = path.startsWith("/") ? path : `/${path}`;
  return {
    ro: absoluteUrl(canonicalPath),
    "x-default": absoluteUrl(canonicalPath),
  };
}

export function openGraphLocale(locale: Locale): string {
  return locale === "en" ? "en_US" : "ro_RO";
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
      canonical: absoluteUrl(canonicalPath),
      languages: alternateLanguages(canonicalPath),
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(canonicalPath),
      siteName: siteConfig.name,
      locale: openGraphLocale(locale),
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
