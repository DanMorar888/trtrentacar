import { readCars, getCarBySlug, sortCarsByPriceAsc } from "@/lib/cars-db";
import { readSeasons } from "@/lib/seasons-db";
import { CheckoutForm } from "@/components/CheckoutForm";
import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/i18n/get-locale";
import { buildPageMetadata, ROBOTS_NOINDEX_FOLLOW } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = getLocale();
  const t = getDictionary(locale);
  return buildPageMetadata({
    locale,
    path: "/rezervare",
    title: t.meta.rezervareTitle,
    description: t.meta.rezervareDescription,
    robots: ROBOTS_NOINDEX_FOLLOW,
  });
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function RezervarePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const carSlug = typeof params?.car === "string" ? params.car : undefined;
  const pickup = typeof params?.pickup === "string" ? params.pickup : "";
  const returnParam = typeof params?.return === "string" ? params.return : "";
  const pickupTime = typeof params?.pickupTime === "string" ? params.pickupTime : "";
  const returnTime = typeof params?.returnTime === "string" ? params.returnTime : "";
  const loc = typeof params?.loc === "string" ? params.loc : "";
  const returnLoc = typeof params?.returnLoc === "string" ? params.returnLoc : "";

  const t = getDictionary();
  const cars = sortCarsByPriceAsc(await readCars());
  const initialCar = carSlug ? getCarBySlug(cars, carSlug) ?? null : null;
  let seasons: Awaited<ReturnType<typeof readSeasons>> = [];
  try {
    seasons = await readSeasons();
  } catch {
    seasons = [];
  }

  return (
    <section className="section-dark py-12">
      <div className="container-narrow">
        <h1 className="section-title-dark">{t.checkout.pageTitle}</h1>
        <p className="mt-2 text-gray-300">
          {t.checkout.pageSubtitle}
        </p>
        <CheckoutForm
          key={carSlug ?? "rezervare"}
          cars={cars}
          seasons={seasons}
          initialCar={initialCar}
          initialPickup={pickup}
          initialReturn={returnParam}
          initialPickupTime={pickupTime}
          initialReturnTime={returnTime}
          initialPickupLocation={loc}
          initialReturnLocation={returnLoc}
        />
      </div>
    </section>
  );
}
