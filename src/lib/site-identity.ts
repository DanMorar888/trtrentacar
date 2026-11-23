import { siteConfig } from "@/config/site";

/** Canonical site URL. Override staging: `NEXT_PUBLIC_SITE_URL=https://...` */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || siteConfig.url
) as string;

/** Default Open Graph image for root and pages without a specific image. */
export function openGraphDefaultImages():
  | { url: string; width: number; height: number; alt: string }[]
  | undefined {
  const raw =
    process.env.NEXT_PUBLIC_OG_IMAGE?.trim() || "/images/cars/banner-og.jpg";
  if (!raw) return undefined;
  const url =
    raw.startsWith("http://") || raw.startsWith("https://")
      ? raw
      : `${SITE_URL}${raw.startsWith("/") ? raw : `/${raw}`}`;
  return [{ url, width: 1200, height: 630, alt: siteConfig.name }];
}

export const ORGANIZATION_LOGO_URL = `${SITE_URL}/images/cars/logo-header.jpg`;

export const ORGANIZATION_ID = `${SITE_URL}/#organization` as const;

export const ORGANIZATION_SAME_AS = [
  siteConfig.social.facebook,
  siteConfig.social.instagram,
  siteConfig.social.tiktok,
  siteConfig.mapsUrl,
  "https://www.firmadeincredere.ro/company,73684,auto-garage-project-bjl-s-r-l",
].filter(Boolean);
