import { MetadataRoute } from "next";
import { readCars } from "@/lib/cars-db";
import { articles } from "@/data/articles";
import { locales, type Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import { SITE_URL } from "@/lib/site-identity";

type PageOptions = {
  path: string;
  lastModified: Date;
  changeFrequency: "weekly" | "monthly";
  priority: number;
};

function languageUrls(base: string, path: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[locale] = `${base}${localePath(locale, path)}`;
  }
  languages["x-default"] = `${base}${localePath("ro", path)}`;
  return languages;
}

function localizedEntries(base: string, page: PageOptions): MetadataRoute.Sitemap {
  const languages = languageUrls(base, page.path);
  return locales.map((locale: Locale) => ({
    url: languages[locale],
    lastModified: page.lastModified,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL.replace(/\/$/, "");
  const cars = await readCars();
  const now = new Date();

  const pages: PageOptions[] = [
    { path: "/", lastModified: now, changeFrequency: "weekly", priority: 1 },
    { path: "/inchirieri-masini-cluj", lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { path: "/tarife", lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { path: "/termeni-si-conditii", lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { path: "/politica-confidentialitate", lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { path: "/contact", lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { path: "/blog", lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { path: "/despre-noi", lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    ...articles.map((article) => ({
      path: `/blog/${article.slug}`,
      lastModified: new Date(article.date),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...cars.map((car) => ({
      path: `/inchirieri-masini-cluj/${car.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];

  return pages.flatMap((page) => localizedEntries(base, page));
}
