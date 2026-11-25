import { Suspense } from "react";
import { ReservationWidgetWithSuspense } from "@/components/ReservationWidgetWithSuspense";
import { CarListWithFilters } from "@/components/CarListWithFilters";
import { CarListSkeleton } from "@/components/CarListSkeleton";
import { HeroBackdrop } from "@/components/HeroBackdrop";
import { LazyMap } from "@/components/LazyMap";
import { ReviewsSection } from "@/components/ReviewsSection";
import { readSeasons } from "@/lib/seasons-db";
import { readCars, sortCarsByPriceAsc } from "@/lib/cars-db";
import type { Metadata } from "next";
import { ItemListJsonLd, ProductJsonLdScripts } from "@/components/JsonLd";
import { getDictionary, getLocale } from "@/i18n/get-locale";
import { buildPageMetadata } from "@/lib/metadata";
import { localePath } from "@/i18n/paths";
import { SITE_URL } from "@/lib/site-identity";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const locale = getLocale();
  const t = getDictionary(locale);
  return buildPageMetadata({
    locale,
    path: "/inchirieri-masini-cluj",
    title: t.meta.fleetTitle,
    description: t.meta.fleetDescription,
  });
}

async function MasiniListAsync() {
  let cars: Awaited<ReturnType<typeof readCars>> = [];
  let seasons: Awaited<ReturnType<typeof readSeasons>> = [];
  try {
    cars = sortCarsByPriceAsc(await readCars());
  } catch {
    cars = [];
  }
  try {
    seasons = await readSeasons();
  } catch {
    seasons = [];
  }
  const locale = getLocale();
  const t = getDictionary(locale);
  const jsonLdLang = locale;
  return (
    <>
      <ProductJsonLdScripts cars={cars} inLanguage={jsonLdLang} />
      <ItemListJsonLd
        name={t.fleet.title}
        items={cars.map((car) => ({
          name: car.name,
          url: `${SITE_URL.replace(/\/$/, "")}${localePath(locale, `/inchirieri-masini-cluj/${car.slug}`)}`,
        }))}
      />
      <CarListWithFilters cars={cars} seasons={seasons} />
    </>
  );
}

export default async function MasiniPage() {
  const locale = getLocale();
  const t = getDictionary(locale);

  return (
    <>
      <section className="hero-home-bg relative py-12 lg:py-16 lg:min-h-[50vh] lg:flex lg:items-center">
        <HeroBackdrop priority />
        <div className="container-narrow relative z-10">
          <div className="flex w-full flex-col items-center text-center">
            <h1 className="section-title-dark max-w-full">{t.fleet.title}</h1>
            <p className="mt-2 max-w-full text-gray-200">
              {t.fleet.subtitle}
            </p>
          </div>
          <div className="mt-6 flex w-full flex-col items-center justify-center">
            <ReservationWidgetWithSuspense />
          </div>
        </div>
      </section>

      <section className="section-dark py-12">
        <Suspense fallback={<CarListSkeleton />}>
          <MasiniListAsync />
        </Suspense>
      </section>

      <ReviewsSection />

      <section className="section-dark border-t border-gray-700/50">
        <LazyMap
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3361.7777664320392!2d23.685427076757637!3d46.78240814452723!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47490b64f9a57925%3A0x248bd8241afed92e!2sAeroportul%20Interna%C8%9Bional%20Avram%20Iancu%20Cluj-Napoca!5e1!3m2!1sro!2sro!4v1774269599211!5m2!1sro!2sro"
          title="Harta Aeroportul International Avram Iancu Cluj-Napoca"
          className="block h-[450px] w-full"
        />
      </section>
    </>
  );
}
