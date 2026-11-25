"use client";

import { LocaleLink } from "@/components/LocaleLink";
import { useSearchParams } from "next/navigation";
import { CarCard } from "@/components/CarCard";
import { rentalDaysBetween } from "@/lib/rental-days";
import { getPriceForDays, type Car } from "@/data/cars";
import { getSeasonForDate, type SeasonPeriod } from "@/data/seasons";
import { useI18n } from "@/i18n/LocaleProvider";

interface FeaturedCarsWithPricesProps {
  cars: Car[];
  seasons?: SeasonPeriod[];
}

export function FeaturedCarsWithPrices({ cars, seasons = [] }: FeaturedCarsWithPricesProps) {
  const { t, locale } = useI18n();
  const searchParams = useSearchParams();
  const pickup = searchParams.get("pickup") ?? "";
  const returnParam = searchParams.get("return") ?? "";
  const pickupTime = searchParams.get("pickupTime") ?? "10:00";
  const returnTime = searchParams.get("returnTime") ?? "10:00";
  const loc = searchParams.get("loc") ?? "";
  const returnLoc = searchParams.get("returnLoc") ?? "";
  const pickupTimeParam = searchParams.get("pickupTime") ?? "10:00";
  const returnTimeParam = searchParams.get("returnTime") ?? "10:00";
  const days = rentalDaysBetween(pickup, pickupTimeParam, returnParam, returnTimeParam);

  const listingParams = new URLSearchParams();
  if (pickup) listingParams.set("pickup", pickup);
  if (returnParam) listingParams.set("return", returnParam);
  listingParams.set("pickupTime", pickupTime);
  listingParams.set("returnTime", returnTime);
  if (loc) listingParams.set("loc", loc);
  if (returnLoc) listingParams.set("returnLoc", returnLoc);
  const listingQuery = listingParams.toString();
  const listingHref = `/inchirieri-masini-cluj${listingQuery ? `?${listingQuery}` : ""}`;

  const reservationQuery = listingQuery;
  const season = getSeasonForDate(pickup, seasons);
  const priceContext = { pickupDate: pickup, pickupTime: pickupTimeParam, seasons };
  const sortedCars = [...cars].sort((a, b) => {
    const resolvedA = days != null && days > 0 ? getPriceForDays(a, days, season, priceContext) : null;
    const resolvedB = days != null && days > 0 ? getPriceForDays(b, days, season, priceContext) : null;
    const sortPriceA = resolvedA?.pricePerDay ?? a.pricePerDay;
    const sortPriceB = resolvedB?.pricePerDay ?? b.pricePerDay;
    if (sortPriceA !== sortPriceB) return sortPriceA - sortPriceB;
    return a.name.localeCompare(b.name, locale === "hu" ? "hu-HU" : locale === "en" ? "en-US" : "ro-RO");
  });

  return (
    <>
      <h2 className="section-title-dark mb-2">{t.home.featuredTitle}</h2>
      <p className="mb-8 text-base text-gray-300">{t.home.featuredSubtitle}</p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sortedCars.map((car) => (
          <CarCard key={car.id} car={car} showCategory days={days} reservationQuery={reservationQuery} pickupDate={pickup} pickupTime={pickupTimeParam} seasons={seasons} />
        ))}
      </div>
      <div className="mt-10 text-center">
        <LocaleLink href={listingHref} className="btn-primary">
          {t.home.seeAll}
        </LocaleLink>
      </div>
    </>
  );
}
