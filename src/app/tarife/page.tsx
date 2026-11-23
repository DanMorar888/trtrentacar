import { readCars, sortCarsByPriceAsc } from "@/lib/cars-db";
import { readSeasons } from "@/lib/seasons-db";
import { ReviewsSection } from "@/components/ReviewsSection";
import { TarifeContent } from "./TarifeContent";
import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/i18n/get-locale";
import { buildPageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = getLocale();
  const t = getDictionary(locale);
  return buildPageMetadata({
    locale,
    path: "/tarife",
    title: t.meta.tarifeTitle,
    description: t.meta.tarifeDescription,
  });
}

export default async function TarifePage() {
  const cars = sortCarsByPriceAsc(await readCars());
  let seasons: Awaited<ReturnType<typeof readSeasons>> = [];
  try {
    seasons = await readSeasons();
  } catch {
    seasons = [];
  }
  return (
    <>
      <TarifeContent cars={cars} seasons={seasons} />
      <ReviewsSection />
    </>
  );
}
