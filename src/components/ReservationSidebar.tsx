"use client";

import { useSearchParams } from "next/navigation";
import { PriceSummary } from "@/components/PriceSummary";
import { ReservationWidget } from "@/components/ReservationWidget";
import { rentalDaysBetween } from "@/lib/rental-days";
import { getPriceForDays, type Car } from "@/data/cars";
import { getSeasonForDate, type SeasonPeriod } from "@/data/seasons";
import { useI18n } from "@/i18n/LocaleProvider";

interface ReservationSidebarProps {
  car: Car;
  seasons?: SeasonPeriod[];
  /** Afișare pe fundal închis (pagina de detaliu) */
  dark?: boolean;
}

export function ReservationSidebar({ car, seasons = [], dark }: ReservationSidebarProps) {
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

  return (
    <div className="space-y-3 lg:sticky lg:top-24 lg:space-y-6">
      <PriceSummary
        days={days}
        pricePerDay={pricePerDay}
        total={resolved?.total}
        guarantee={car.guarantee}
        scdwPerDay={resolved?.scdwPerDay ?? car.scdwPerDay}
        reducedGuarantee={car.reducedGuarantee}
        reducedGuarantee2={car.reducedGuarantee2}
        dark={dark}
      />
      <ReservationWidget variant="full" carSlug={car.slug} title={t.checkout.changeDates} hideActions />
    </div>
  );
}
