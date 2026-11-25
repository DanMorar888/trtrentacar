import { notFound } from "next/navigation";
import { LocaleLink } from "@/components/LocaleLink";
import { Suspense } from "react";
import { siteConfig } from "@/config/site";
import { CarDetailJsonLd } from "@/components/JsonLd";
import { CarDetailPrice } from "@/components/CarDetailPrice";
import { CarGallery } from "@/components/CarGallery";
import { ReservationSidebar } from "@/components/ReservationSidebar";
import { RezervaAcumLink } from "@/components/RezervaAcumLink";
import { readCars, getCarBySlug } from "@/lib/cars-db";
import { readSeasons } from "@/lib/seasons-db";
import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/i18n/get-locale";
import { interpolate } from "@/i18n/interpolate";
import { buildPageMetadata } from "@/lib/metadata";

export const revalidate = 120;


interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateStaticParams() {
  const cars = await readCars();
  return cars.map((car) => ({ slug: car.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = getLocale();
  const cars = await readCars();
  const car = getCarBySlug(cars, slug);
  const t = getDictionary(locale);
  if (!car) return { title: t.car.cars };
  const fuel = t.specs[car.fuel as keyof typeof t.specs] ?? car.fuel;
  const title = interpolate(t.car.metaTitle, { name: car.name });
  const description = interpolate(t.car.metaDescription, {
    name: car.name,
    year: car.year ? `, ${car.year}` : "",
    engine: car.engine,
    fuel,
    price: car.pricePerDay,
  });
  return buildPageMetadata({
    locale,
    path: `/inchirieri-masini-cluj/${slug}`,
    title,
    description,
    ogImage: car.image,
  });
}

export default async function CarDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const cars = await readCars();
  const car = getCarBySlug(cars, slug);
  if (!car) notFound();
  const t = getDictionary();
  const fuel = t.specs[car.fuel as keyof typeof t.specs] ?? car.fuel;
  const transmission = t.specs[car.transmission as keyof typeof t.specs] ?? car.transmission;
  let seasons: Awaited<ReturnType<typeof readSeasons>> = [];
  try {
    seasons = await readSeasons();
  } catch {
    seasons = [];
  }

  return (
    <>
      <CarDetailJsonLd car={car} slug={slug} />
      <section className="section-dark py-8">
        <div className="container-narrow">
          <nav className="mb-4 text-sm text-gray-400" aria-label="Breadcrumb">
            <LocaleLink href="/" className="hover:text-primary">{t.car.home}</LocaleLink>
            <span className="mx-2">/</span>
            <LocaleLink href="/inchirieri-masini-cluj" className="hover:text-primary">{t.car.cars}</LocaleLink>
            <span className="mx-2">/</span>
            <span className="font-medium text-white">{car.name}</span>
          </nav>
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <CarGallery
                images={[car.image, ...(car.gallery ?? [])]}
                alt={car.name}
                className="rounded-xl"
                sizes="(max-width: 1023px) calc(100vw - 2rem), 66vw"
              />
              <h1 className="mt-6 text-2xl font-bold text-white">{car.name}</h1>
              <p className="mt-2 text-base text-gray-300">
                {interpolate(t.car.intro, {
                  name: car.name,
                  year: car.year ? `${car.year}, ` : "",
                  engine: car.engine,
                  fuel,
                })}
              </p>
              <Suspense fallback={<div className="mt-6 h-24 rounded-lg bg-gray-800 animate-pulse" />}>
                <CarDetailPrice car={car} seasons={seasons} dark />
              </Suspense>
              <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-gray-300 sm:grid-cols-3">
                {car.year ? <div><span className="font-medium text-gray-400">{t.car.year}:</span> {car.year}</div> : null}
                <div><span className="font-medium text-gray-400">{t.car.classLabel}:</span> {car.categoryLabel}</div>
                <div><span className="font-medium text-gray-400">{t.car.engine}:</span> {car.engine}</div>
                <div><span className="font-medium text-gray-400">{t.car.fuelLabel}:</span> {fuel}</div>
                <div><span className="font-medium text-gray-400">{t.car.gearbox}:</span> {transmission}</div>
                <div><span className="font-medium text-gray-400">{t.car.seatsLabel}:</span> {car.seats}</div>
                <div><span className="font-medium text-gray-400">{t.car.guarantee}:</span> {car.guarantee} €</div>
                {car.reducedGuarantee ? (
                  <div className="col-span-2 sm:col-span-3">
                    {interpolate(t.checkout.guaranteeReduced, {
                      deposit: car.reducedGuarantee.deposit,
                      perDay: car.reducedGuarantee.perDay,
                    })}
                    {car.reducedGuarantee2
                      ? ` · ${interpolate(t.checkout.guaranteeReduced2, {
                          deposit: car.reducedGuarantee2.deposit,
                          perDay: car.reducedGuarantee2.perDay,
                        })}`
                      : ""}
                  </div>
                ) : null}
              </div>
              <ul className="mt-4 flex flex-wrap gap-2">
                {car.features.map((f) => (
                  <li key={f} className="rounded bg-gray-700/80 px-2 py-1 text-sm text-gray-300">
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <Suspense fallback={<span className="btn-primary">{t.car.bookNow}</span>}>
                  <RezervaAcumLink carSlug={car.slug} className="btn-primary" />
                </Suspense>
                <a
                  href={`https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(interpolate(t.car.whatsappText, { name: car.name }))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-[#25D366] px-5 py-2.5 text-sm font-semibold text-[#25D366] transition hover:bg-[#25D366] hover:text-white"
                >
                  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </a>
              </div>
            </div>
            <div id="formreservation" className="lg:col-span-1">
              <Suspense fallback={<div className="rounded-xl border border-gray-600 bg-gray-800 p-6 shadow-sm animate-pulse h-80" />}>
                <ReservationSidebar car={car} seasons={seasons} dark />
              </Suspense>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
