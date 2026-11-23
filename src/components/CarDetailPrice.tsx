"use client";

import { useSearchParams } from "next/navigation";
import { rentalDaysBetween } from "@/lib/rental-days";
import { getPriceForDays, getSeasonPricePerDay, type Car } from "@/data/cars";
import { getSeasonForDate, type SeasonPeriod } from "@/data/seasons";
import { useI18n } from "@/i18n/LocaleProvider";
import { interpolate } from "@/i18n/interpolate";

interface CarDetailPriceProps {
  car: Car;
  seasons?: SeasonPeriod[];
  /** Afișare pe fundal închis (pagina de detaliu) */
  dark?: boolean;
}

export function CarDetailPrice({ car, seasons = [], dark }: CarDetailPriceProps) {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const pickup = searchParams.get("pickup") ?? "";
  const returnParam = searchParams.get("return") ?? "";
  const pickupTime = searchParams.get("pickupTime") ?? "10:00";
  const returnTime = searchParams.get("returnTime") ?? "10:00";
  const days = rentalDaysBetween(pickup, pickupTime, returnParam, returnTime);
  const season = getSeasonForDate(pickup, seasons);
  const resolved =
    days != null && days > 0
      ? getPriceForDays(car, days, season, { pickupDate: pickup, pickupTime, seasons })
      : null;
  const pricePerDay = resolved?.pricePerDay ?? car.pricePerDay;
  const totalForDisplay =
    resolved != null
      ? resolved.total
      : days != null && days > 0
        ? Math.round(pricePerDay * days)
        : car.price3Days ?? null;
  const seasonDays = days != null && days > 0 ? days : 1;
  const seasonNormal = getSeasonPricePerDay(car, "normal", seasonDays);
  const seasonFull = getSeasonPricePerDay(car, "full", seasonDays);
  const seasonExtra = getSeasonPricePerDay(car, "extra", seasonDays);

  return (
    <div className={`mt-6 max-w-md rounded-lg px-4 py-3 ring-1 ${dark ? "bg-gray-800/50 ring-gray-600" : "price-block"}`}>
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="text-3xl font-bold text-primary">{Math.round(pricePerDay)} €</span>
        <span className={`text-base font-bold ${dark ? "text-gray-400" : "text-gray-600"}`}>{t.car.perDay}</span>
        {totalForDisplay != null && (
          <span className={`text-base font-bold ${dark ? "text-gray-200" : "text-gray-900"}`}>
            {t.car.sumEquals}{" "}
            <span className="text-3xl font-bold">{Math.round(totalForDisplay)} €</span>
          </span>
        )}
      </div>
      <p className={`mt-2 text-sm font-bold ${dark ? "text-gray-400" : "text-gray-600"}`}>{t.car.includedFull}</p>
      {seasonNormal != null && seasonFull != null && seasonExtra != null ? (
        <p className={`mt-2 text-sm ${dark ? "text-gray-300" : "text-gray-700"}`}>
          {interpolate(t.car.seasonPrices, { normal: seasonNormal, full: seasonFull, extra: seasonExtra })}
        </p>
      ) : null}
    </div>
  );
}
