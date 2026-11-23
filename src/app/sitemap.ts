import { MetadataRoute } from "next";
import { readCars } from "@/lib/cars-db";
import { articles } from "@/data/articles";
import { SITE_URL } from "@/lib/site-identity";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL.replace(/\/$/, "");
  const cars = await readCars();

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/inchirieri-masini-cluj`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/tarife`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/termeni-si-conditii`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/politica-confidentialitate`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/despre-noi`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  ];

  const blogPages: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${base}/blog/${article.slug}`,
    lastModified: new Date(article.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const carPages: MetadataRoute.Sitemap = cars.map((car) => ({
    url: `${base}/inchirieri-masini-cluj/${car.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...blogPages, ...carPages];
}
