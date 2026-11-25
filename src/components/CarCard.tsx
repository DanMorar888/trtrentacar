"use client";

import { LocaleLink } from "@/components/LocaleLink";
import { siteConfig } from "@/config/site";
import { getPriceForDays, type Car } from "@/data/cars";
import { getSeasonForDate, type SeasonPeriod } from "@/data/seasons";
import { CarImage } from "@/components/CarImage";
import { interpolate } from "@/i18n/interpolate";
import { useI18n } from "@/i18n/LocaleProvider";
import { localePath } from "@/i18n/paths";



const iconClass = "h-4 w-4 shrink-0 text-gray-400";

const IconYear = () => (
  <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const IconEngine = () => (
  <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h3l2-2h7l2 2h2l2 2v4h-2l-1 2h-5l-1-2H9l-2 2H3v-8z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6M10 14h4M15 8V6M11 8V6" />
  </svg>
);

const IconFuel = () => (
  <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2h-2m-4-1V7a2 2 0 012-2h2a2 2 0 012 2v1M14 5v12" />
  </svg>
);

const IconTransmission = () => (
  <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <circle cx="7" cy="6" r="2" strokeWidth={2} />
    <circle cx="17" cy="6" r="2" strokeWidth={2} />
    <circle cx="12" cy="12" r="2" strokeWidth={2} />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8v8M17 8v8M12 14v4M7 12h10" />
  </svg>
);

interface CarCardProps {
  car: Car;
  showCategory?: boolean;
  /** Când e setat, se afișează totalul pentru acest număr de zile (din formularul de rezervare). */
  days?: number | null;
  /** Parametri URL pentru linkul Rezerva acum (ex: pickup, return, loc, returnLoc). */
  reservationQuery?: string;
  pickupDate?: string;
  pickupTime?: string;
  seasons?: SeasonPeriod[];
}

export function CarCard({ car, showCategory, days, reservationQuery, pickupDate = "", pickupTime = "10:00", seasons = [] }: CarCardProps) {
  const { t, locale } = useI18n();
  const fuel = t.specs[car.fuel as keyof typeof t.specs] ?? car.fuel;
  const transmission = t.specs[car.transmission as keyof typeof t.specs] ?? car.transmission;
  const rezervareHref = localePath(locale, `/rezervare?car=${car.slug}${reservationQuery ? `&${reservationQuery}` : ""}`);
  const detaliiHref = localePath(locale, `/inchirieri-masini-cluj/${car.slug}${reservationQuery ? `?${reservationQuery}` : ""}`);
  const season = getSeasonForDate(pickupDate, seasons);
  const resolved =
    days != null && days > 0
      ? getPriceForDays(car, days, season, { pickupDate, pickupTime, seasons })
      : null;
  const pricePerDay = resolved?.pricePerDay ?? car.pricePerDay;
  const totalForPeriod =
    resolved != null
      ? resolved.total
      : days != null && days > 0
        ? Math.round(pricePerDay * days)
        : car.price3Days ?? null;
  const periodDays = days != null && days > 0 ? days : 3;
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      <LocaleLink href={detaliiHref} prefetch={false} className="relative block aspect-[4/3] overflow-hidden bg-gray-200">
        <CarImage
          src={car.image}
          alt={car.name}
          fallbackName={car.name}
          className="!absolute inset-0"
          sizes="(max-width: 639px) calc(100vw - 2rem), (max-width: 1023px) calc(50vw - 2rem), 400px"
        />
      </LocaleLink>
      <div className="flex flex-1 flex-col p-4">
        {showCategory && (
          <span className="mb-1 text-xs font-medium uppercase tracking-wider text-primary">{car.categoryLabel}</span>
        )}
        <h2 className="text-lg font-semibold text-gray-900">
          <LocaleLink href={detaliiHref} prefetch={false} className="hover:text-primary">
            {car.name}
          </LocaleLink>
        </h2>
        <ul className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-gray-600" aria-label={t.car.detailsAria}>
          {car.year ? (
            <li className="flex items-center gap-1.5">
              <IconYear />
              <span>{car.year}</span>
            </li>
          ) : null}
          <li className="flex items-center gap-1.5">
            <IconEngine />
            <span>{car.engine}</span>
          </li>
          <li className="flex items-center gap-1.5">
            <IconFuel />
            <span>{fuel}</span>
          </li>
          <li className="flex items-center gap-1.5">
            <IconTransmission />
            <span>{transmission}</span>
          </li>
        </ul>
        <div className="price-block mt-4">
          <div className="flex flex-nowrap items-baseline justify-between gap-1 overflow-hidden">
            <span className="flex shrink-0 flex-nowrap items-baseline gap-1">
              <span className="text-xl font-bold text-primary sm:text-2xl">{Math.round(pricePerDay)}€</span>
              <span className="text-sm font-bold text-gray-600">{t.car.perDay}</span>
            </span>
            {totalForPeriod != null && (
              <span className="flex min-w-0 shrink-0 flex-nowrap items-baseline gap-1 text-right">
                <span className="text-sm font-bold text-gray-600">{t.car.totalPrefix}</span>
                <span className="text-xl font-bold text-primary sm:text-2xl">{Math.round(totalForPeriod)}€</span>
                <span className="text-sm font-bold text-gray-600">
                  {interpolate(t.car.daysSuffix, { n: periodDays })}
                </span>
              </span>
            )}
          </div>
          <p className="mt-1.5 text-xs font-bold text-gray-600">{t.car.included}</p>
        </div>
        <div className="mt-auto flex items-stretch gap-2 pt-4">
          <LocaleLink href={rezervareHref} prefetch={false} className="btn-primary flex-1 text-center">
            {t.car.bookNow}
          </LocaleLink>
          <a
            href={`https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(interpolate(t.car.whatsappText, { name: car.name }))}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-[#25D366] py-2.5 text-center text-sm font-semibold text-[#25D366] transition hover:bg-[#25D366] hover:text-white"
          >
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp
          </a>
        </div>
      </div>
    </article>
  );
}
