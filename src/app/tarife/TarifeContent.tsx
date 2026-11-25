"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { pickupLocations } from "@/config/locations";
import { getPriceForDays, type Car } from "@/data/cars";
import { getSeasonForDate, type SeasonPeriod } from "@/data/seasons";
import { DateField } from "@/components/DateField";
import { rentalDaysBetween } from "@/lib/rental-days";
import { TimeSelect } from "@/components/TimeSelect";
import { useI18n } from "@/i18n/LocaleProvider";
import { localePath } from "@/i18n/paths";
import { HeroBackdrop } from "@/components/HeroBackdrop";
import { LegalDocLink, LegalModal, type LegalDoc } from "@/components/LegalModal";
import { interpolate } from "@/i18n/interpolate";

const DEFAULT_LOCATION_ID = "aeroport-cluj";

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

interface TarifeContentProps {
  cars: Car[];
  seasons?: SeasonPeriod[];
}

export function TarifeContent({ cars, seasons = [] }: TarifeContentProps) {
  const router = useRouter();
  const { t, locale } = useI18n();
  const locationName = (id: string, fallback: string) => t.locations[id as keyof typeof t.locations] ?? fallback;
  const DEFAULT_TIME = "10:00";

  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [pickupTime, setPickupTime] = useState(DEFAULT_TIME);
  const [returnTime, setReturnTime] = useState(DEFAULT_TIME);
  const [pickupLocation, setPickupLocation] = useState(DEFAULT_LOCATION_ID);
  const [returnLocation, setReturnLocation] = useState(DEFAULT_LOCATION_ID);
  const [legalDoc, setLegalDoc] = useState<LegalDoc | null>(null);

  useEffect(() => {
    const today = new Date();
    const inFourDays = new Date(today);
    inFourDays.setDate(inFourDays.getDate() + 4);
    setPickupDate((prev) => (prev ? prev : formatDate(today)));
    setReturnDate((prev) => (prev ? prev : formatDate(inFourDays)));
  }, []);

  const days = rentalDaysBetween(pickupDate, pickupTime || DEFAULT_TIME, returnDate, returnTime || DEFAULT_TIME);
  const season = getSeasonForDate(pickupDate, seasons);
  const priceContext = { pickupDate, pickupTime: pickupTime || DEFAULT_TIME, seasons };
  const sortedCars = [...cars].sort((a, b) => {
    const resolvedA = days != null && days > 0 ? getPriceForDays(a, days, season, priceContext) : null;
    const resolvedB = days != null && days > 0 ? getPriceForDays(b, days, season, priceContext) : null;
    const sortPriceA = resolvedA?.pricePerDay ?? a.pricePerDay;
    const sortPriceB = resolvedB?.pricePerDay ?? b.pricePerDay;
    if (sortPriceA !== sortPriceB) return sortPriceA - sortPriceB;
    return a.name.localeCompare(b.name, locale);
  });

  const tariffRows = sortedCars.map((car) => {
    const resolved = days != null && days > 0 ? getPriceForDays(car, days, season, priceContext) : null;
    const scdwPerDay = resolved?.scdwPerDay ?? car.scdwPerDay;
    const pricePerDay = resolved?.pricePerDay ?? car.pricePerDay;
    const total =
      resolved != null
        ? resolved.total
        : days != null && days > 0
          ? Math.round(pricePerDay * days)
          : null;
    const href = localePath(
      locale,
      days != null && pickupDate && returnDate
        ? `/rezervare?car=${car.slug}&pickup=${pickupDate}&return=${returnDate}&pickupTime=${pickupTime || "10:00"}&returnTime=${returnTime || "10:00"}&loc=${pickupLocation}&returnLoc=${returnLocation}`
        : `/rezervare?car=${car.slug}`
    );
    return { car, scdwPerDay, pricePerDay, total, href };
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (pickupDate) params.set("pickup", pickupDate);
    if (returnDate) params.set("return", returnDate);
    params.set("pickupTime", pickupTime || DEFAULT_TIME);
    params.set("returnTime", returnTime || DEFAULT_TIME);
    if (pickupLocation) params.set("loc", pickupLocation);
    if (returnLocation) params.set("returnLoc", returnLocation);
    const query = params.toString();
    router.push(localePath(locale, `/inchirieri-masini-cluj${query ? `?${query}` : ""}`));
  };

  const selectClass =
    "w-full h-11 rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";
  const labelClass = "mb-1.5 block text-base font-medium text-gray-700";

  return (
    <>
      <section className="hero-home-bg relative py-12 lg:py-20 lg:min-h-[60vh]">
        <HeroBackdrop priority />
        <div className="container-narrow relative z-10">
          <div className="flex w-full flex-col items-center text-center">
            <h1 className="section-title-dark max-w-full">{t.tarife.title}</h1>
            <p className="mt-2 max-w-full text-gray-200">
              {t.tarife.subtitle}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="mx-auto mt-6 w-full max-w-5xl rounded-xl bg-white p-4 shadow-lg">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">{t.widget.title}</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label htmlFor="tarife-pickup-date" className={labelClass}>
                  {t.widget.pickupDate}
                </label>
                <input
                  id="tarife-pickup-date"
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className={selectClass}
                />
              </div>
              <div>
                <label htmlFor="tarife-pickup-time" className={labelClass}>
                  {t.widget.pickupTime}
                </label>
                <TimeSelect
                  id="tarife-pickup-time"
                  value={pickupTime}
                  onChange={setPickupTime}
                />
              </div>
              <div>
                <label htmlFor="tarife-pickup-loc" className={labelClass}>
                  {t.widget.pickupLoc}
                </label>
                <select
                  id="tarife-pickup-loc"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  className={selectClass}
                >
                  {pickupLocations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {locationName(loc.id, loc.name)} {loc.fee === 0 ? "" : `– ${loc.fee} €`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="tarife-return-date" className={labelClass}>
                  {t.widget.returnDate}
                </label>
                <DateField
                  id="tarife-return-date"
                  value={returnDate}
                  onChange={setReturnDate}
                  min={pickupDate || undefined}
                  className={selectClass}
                  placeholder={t.widget.chooseDate}
                />
              </div>
              <div>
                <label htmlFor="tarife-return-time" className={labelClass}>
                  {t.widget.returnTime}
                </label>
                <TimeSelect
                  id="tarife-return-time"
                  value={returnTime}
                  onChange={setReturnTime}
                />
              </div>
              <div>
                <label htmlFor="tarife-return-loc" className={labelClass}>
                  {t.widget.returnLoc}
                </label>
                <select
                  id="tarife-return-loc"
                  value={returnLocation}
                  onChange={(e) => setReturnLocation(e.target.value)}
                  className={selectClass}
                >
                  {pickupLocations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {locationName(loc.id, loc.name)} {loc.fee === 0 ? "" : `– ${loc.fee} €`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <button type="submit" className="btn-primary">
                {t.widget.continue}
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="section-dark py-12">
        <div className="container-narrow">
          <p className="mb-6 text-sm text-gray-300">
            {t.tarife.note}
          </p>

          <ul className="space-y-3 md:hidden">
            {tariffRows.map(({ car, scdwPerDay, pricePerDay, total, href }) => (
              <li key={car.id} className="rounded-xl border border-gray-600 bg-gray-800/40 p-4">
                <h3 className="text-base font-semibold text-white">{car.name}</h3>
                <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <span className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-primary">{Math.round(pricePerDay)}€</span>
                    <span className="text-sm font-bold text-gray-400">{t.car.perDay}</span>
                  </span>
                  {total != null && days != null && days > 0 ? (
                    <span className="flex flex-wrap items-baseline gap-1">
                      <span className="text-sm font-bold text-gray-400">{t.car.totalPrefix}</span>
                      <span className="text-xl font-bold text-primary">{Math.round(total)}€</span>
                      <span className="text-sm font-bold text-gray-400">
                        {interpolate(t.car.daysSuffix, { n: days })}
                      </span>
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">–</span>
                  )}
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-300">
                  <p>
                    {t.tarife.guarantee}: {Math.round(car.guarantee)}€
                  </p>
                  <p>
                    {car.reducedGuarantee
                      ? interpolate(t.checkout.guaranteeReduced, {
                          deposit: car.reducedGuarantee.deposit,
                          perDay: car.reducedGuarantee.perDay,
                        })
                      : `${t.tarife.scdw}: ${scdwPerDay != null ? `~${Math.round(scdwPerDay)} ${t.tarife.perDay}` : "–"}`}
                  </p>
                </div>
                <Link
                  href={href}
                  className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-[#25D366] px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1fa855]"
                >
                  {t.car.bookNow}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden md:block">
            <table className="w-full border-collapse border border-gray-600 text-left text-sm text-gray-200">
              <thead>
                <tr className="bg-gray-800/80">
                  <th className="border border-gray-600 px-4 py-3 font-semibold text-white">{t.tarife.car}</th>
                  <th className="border border-gray-600 px-4 py-3 font-semibold text-white">{t.tarife.priceDay}</th>
                  <th className="border border-gray-600 px-4 py-3 font-semibold text-white">
                    {t.tarife.sum}
                  </th>
                  <th className="border border-gray-600 px-4 py-3 font-semibold text-white">{t.tarife.guarantee}</th>
                  <th className="border border-gray-600 px-4 py-3 font-semibold text-white">{t.tarife.scdw}</th>
                  <th className="border border-gray-600 px-4 py-3 font-semibold text-white">{t.tarife.actions}</th>
                </tr>
              </thead>
              <tbody>
                {tariffRows.map(({ car, scdwPerDay, pricePerDay, total, href }) => (
                  <tr key={car.id} className="hover:bg-gray-800/50">
                    <td className="border border-gray-600 px-4 py-3 font-medium text-gray-100">{car.name}</td>
                    <td className="border border-gray-600 px-4 py-3 text-gray-200">
                      {`${Math.round(pricePerDay)}€`}
                    </td>
                    <td className="border border-gray-600 px-4 py-3 whitespace-nowrap">
                      {total != null && days != null && days > 0 ? (
                        <span className="inline-flex flex-nowrap items-baseline gap-1">
                          <span className="text-sm font-bold text-gray-400">{t.car.totalPrefix}</span>
                          <span className="text-xl font-bold text-primary">{Math.round(total)}€</span>
                          <span className="text-sm font-bold text-gray-400">
                            {interpolate(t.car.daysSuffix, { n: days })}
                          </span>
                        </span>
                      ) : (
                        "–"
                      )}
                    </td>
                    <td className="border border-gray-600 px-4 py-3 text-gray-200">{Math.round(car.guarantee)}€</td>
                    <td className="border border-gray-600 px-4 py-3 text-gray-200">
                      {car.reducedGuarantee
                        ? interpolate(t.checkout.guaranteeReduced, {
                            deposit: car.reducedGuarantee.deposit,
                            perDay: car.reducedGuarantee.perDay,
                          })
                        : scdwPerDay != null
                          ? `~${Math.round(scdwPerDay)} ${t.tarife.perDay}`
                          : "–"}
                    </td>
                    <td className="border border-gray-600 px-4 py-3">
                      <Link
                        href={href}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-lg bg-[#25D366] px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1fa855]"
                      >
                        {t.car.bookNow}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-8 text-center">
            <LegalDocLink
              doc="terms"
              onOpen={setLegalDoc}
              className="font-medium text-primary hover:underline"
            >
              {t.tarife.terms}
            </LegalDocLink>
          </p>
        </div>
      </section>
      <LegalModal document={legalDoc} onClose={() => setLegalDoc(null)} />
    </>
  );
}
