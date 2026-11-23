"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { CarCard } from "@/components/CarCard";
import { CarFiltersBar, filterCars, type CarFiltersState } from "@/components/CarFiltersBar";
import { rentalDaysBetween } from "@/lib/rental-days";
import { getPriceForDays } from "@/data/cars";
import type { Car } from "@/data/cars";
import { getSeasonForDate, type SeasonPeriod } from "@/data/seasons";
import { useI18n } from "@/i18n/LocaleProvider";

const initialFilters: CarFiltersState = {
  clasa: "",
  marca: "",
  cutie: "",
  tractiune: "",
  motorizare: "",
  locuri: "",
};

interface CarListWithFiltersProps {
  cars: Car[];
  seasons?: SeasonPeriod[];
}

export function CarListWithFilters({ cars: carsProp, seasons = [] }: CarListWithFiltersProps) {
  const { t, locale } = useI18n();
  const cars = Array.isArray(carsProp) ? carsProp : [];
  const [filters, setFilters] = useState<CarFiltersState>(initialFilters);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const filtered = filterCars(cars, filters);

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
  const season = getSeasonForDate(pickup, seasons);
  const priceContext = { pickupDate: pickup, pickupTime: pickupTimeParam, seasons };
  const sortedFiltered = [...filtered].sort((a, b) => {
    const resolvedA = days != null && days > 0 ? getPriceForDays(a, days, season, priceContext) : null;
    const resolvedB = days != null && days > 0 ? getPriceForDays(b, days, season, priceContext) : null;
    const priceA = resolvedA?.pricePerDay ?? a.pricePerDay;
    const priceB = resolvedB?.pricePerDay ?? b.pricePerDay;
    if (priceA !== priceB) return priceA - priceB;
    return a.name.localeCompare(b.name, locale);
  });

  const reservationParams = new URLSearchParams();
  if (pickup) reservationParams.set("pickup", pickup);
  if (returnParam) reservationParams.set("return", returnParam);
  reservationParams.set("pickupTime", pickupTime);
  reservationParams.set("returnTime", returnTime);
  if (loc) reservationParams.set("loc", loc);
  if (returnLoc) reservationParams.set("returnLoc", returnLoc);
  const reservationQuery = reservationParams.toString();

  return (
    <div className="container-narrow">
      <aside className="mb-8 rounded-xl border border-gray-600 bg-white p-6 shadow-md">
        <div className="flex items-center justify-between lg:justify-center">
          <h2 className="text-center text-lg font-bold text-gray-900">{t.fleet.filters}</h2>
          <button
            type="button"
            onClick={() => setMobileFiltersOpen((v) => !v)}
            aria-expanded={mobileFiltersOpen}
            aria-controls="cars-filters-panel"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-gray-700 transition hover:bg-gray-50 lg:hidden"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              {mobileFiltersOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        <div id="cars-filters-panel" className={`${mobileFiltersOpen ? "mt-5 block" : "hidden"} lg:mt-5 lg:block`}>
          <CarFiltersBar cars={cars} filters={filters} onChange={setFilters} />
        </div>
      </aside>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sortedFiltered.map((car) => (
          <CarCard key={car.id} car={car} showCategory={false} days={days} reservationQuery={reservationQuery} pickupDate={pickup} pickupTime={pickupTimeParam} seasons={seasons} />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="py-12 text-center text-gray-400">{t.fleet.empty}</p>
      )}
    </div>
  );
}
