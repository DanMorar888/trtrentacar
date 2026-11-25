"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { pickupLocations } from "@/config/locations";
import { Button } from "@/components/Button";
import { DateField } from "@/components/DateField";
import { TimeSelect } from "@/components/TimeSelect";
import { useI18n } from "@/i18n/LocaleProvider";
import { localePath, stripLocalePrefix } from "@/i18n/paths";

const DEFAULT_LOCATION_ID = "aeroport-cluj";

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function parseDate(s: string): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

interface ReservationWidgetProps {
  variant?: "compact" | "full";
  carSlug?: string;
  /** Titlu custom (ex. „Modifică datele” în sidebar pe pagina mașinii). */
  title?: string;
  /** Ascunde butoanele Continua și Vezi toate mașinile. */
  hideActions?: boolean;
}

export function ReservationWidget({ variant = "full", carSlug, title, hideActions }: ReservationWidgetProps) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const DEFAULT_TIME = "10:00";

  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [pickupTime, setPickupTime] = useState(DEFAULT_TIME);
  const [returnTime, setReturnTime] = useState(DEFAULT_TIME);
  const [pickupLocation, setPickupLocation] = useState(DEFAULT_LOCATION_ID);
  const [returnLocation, setReturnLocation] = useState(DEFAULT_LOCATION_ID);
  const [returnDateError, setReturnDateError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Sincronizare URL ↔ formular: la citire din URL setăm și state și, dacă lipseau parametrii, punem imediat defaulturile în URL
  useEffect(() => {
    const pickup = searchParams.get("pickup");
    const returnParam = searchParams.get("return");
    const loc = searchParams.get("loc");
    const returnLoc = searchParams.get("returnLoc");
    const pt = searchParams.get("pickupTime") ?? "";
    const rt = searchParams.get("returnTime") ?? "";
    const today = new Date();
    const inFourDays = new Date(today);
    inFourDays.setDate(inFourDays.getDate() + 4);
    const defaultPickup = pickup || formatDate(today);
    const defaultReturn = returnParam || formatDate(inFourDays);
    setPickupDate((prev) => (prev ? prev : defaultPickup));
    setReturnDate((prev) => (prev ? prev : defaultReturn));
    setPickupTime((prev) => (pt ? pt : prev || DEFAULT_TIME));
    setReturnTime((prev) => (rt ? rt : prev || DEFAULT_TIME));
    if (loc) setPickupLocation(loc);
    if (returnLoc) setReturnLocation(returnLoc);

    if (!pickup || !returnParam) {
      const params = new URLSearchParams();
      params.set("pickup", defaultPickup);
      params.set("return", defaultReturn);
      params.set("pickupTime", pt || DEFAULT_TIME);
      params.set("returnTime", rt || DEFAULT_TIME);
      if (loc) params.set("loc", loc);
      if (returnLoc) params.set("returnLoc", returnLoc);
      const query = params.toString();
      const barePath = stripLocalePrefix(pathname);
      if (barePath === "/") {
        router.replace(localePath(locale, `/?${query}`), { scroll: false });
      } else if (barePath.startsWith("/inchirieri-masini-cluj")) {
        router.replace(localePath(locale, `${barePath}?${query}`), { scroll: false });
      }
    }
  }, [searchParams, pathname, carSlug, router, locale]);

  useEffect(() => {
    if (!returnDate || !pickupDate) {
      setReturnDateError(null);
      return;
    }
    const start = parseDate(pickupDate);
    const end = parseDate(returnDate);
    if (!start || !end) {
      setReturnDateError(null);
      return;
    }
    if (end < start) {
      setReturnDateError(t.widget.dateError);
      return;
    }
    setReturnDateError(null);
  }, [pickupDate, returnDate]);

  // Actualizează URL-ul când utilizatorul schimbă datele/orele în formular
  useEffect(() => {
    if (returnDateError || !pickupDate || !returnDate) return;
    const start = parseDate(pickupDate);
    const end = parseDate(returnDate);
    if (!start || !end || end < start) return;
    const params = new URLSearchParams();
    params.set("pickup", pickupDate);
    params.set("return", returnDate);
    params.set("pickupTime", pickupTime || DEFAULT_TIME);
    params.set("returnTime", returnTime || DEFAULT_TIME);
    if (pickupLocation) params.set("loc", pickupLocation);
    if (returnLocation) params.set("returnLoc", returnLocation);
    const query = params.toString();
    const barePath = stripLocalePrefix(pathname);
    if (barePath === "/") {
      router.replace(localePath(locale, query ? `/?${query}` : "/"), { scroll: false });
    } else if (barePath.startsWith("/inchirieri-masini-cluj")) {
      router.replace(localePath(locale, query ? `${barePath}?${query}` : barePath), { scroll: false });
    }
  }, [carSlug, pathname, pickupDate, returnDate, pickupTime, returnTime, pickupLocation, returnLocation, returnDateError, router, locale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (returnDateError) return;
    const start = parseDate(pickupDate);
    const end = parseDate(returnDate);
    if (!start || !end || end < start) {
      setReturnDateError(t.widget.dateError);
      return;
    }
    setSubmitting(true);
    const params = new URLSearchParams();
    if (pickupDate) params.set("pickup", pickupDate);
    if (returnDate) params.set("return", returnDate);
    params.set("pickupTime", pickupTime || DEFAULT_TIME);
    params.set("returnTime", returnTime || DEFAULT_TIME);
    if (pickupLocation) params.set("loc", pickupLocation);
    if (returnLocation) params.set("returnLoc", returnLocation);
    const query = params.toString();
    const path = carSlug
      ? localePath(locale, `/inchirieri-masini-cluj/${carSlug}${query ? `?${query}` : ""}`)
      : localePath(locale, `/inchirieri-masini-cluj${query ? `?${query}` : ""}`);
    router.push(path);
    setSubmitting(false);
  };

  const inputHeightClass = "h-11"; // 2.75rem – aceeași înălțime pentru toate câmpurile
  const selectClass =
    `w-full ${inputHeightClass} rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`;
  const selectClassError =
    `w-full ${inputHeightClass} rounded-lg border-2 border-red-500 bg-white px-3 py-2 text-base text-gray-900 placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`;
  const labelClass = "mb-1.5 block text-base font-semibold text-gray-800";

  // Link „Vezi toate mașinile” cu aceiași parametri preluare/predare ca în formular
  const allCarsParams = new URLSearchParams();
  if (pickupDate) allCarsParams.set("pickup", pickupDate);
  if (returnDate) allCarsParams.set("return", returnDate);
  allCarsParams.set("pickupTime", pickupTime || DEFAULT_TIME);
  allCarsParams.set("returnTime", returnTime || DEFAULT_TIME);
  if (pickupLocation) allCarsParams.set("loc", pickupLocation);
  if (returnLocation) allCarsParams.set("returnLoc", returnLocation);
  const allCarsQuery = allCarsParams.toString();
  const allCarsHref = localePath(locale, `/inchirieri-masini-cluj${allCarsQuery ? `?${allCarsQuery}` : ""}`);

  return (
    <form onSubmit={handleSubmit} className={`mx-auto w-full max-w-5xl rounded-xl border border-gray-200/80 bg-white shadow-md ${variant === "compact" ? "p-5" : "p-6"}`}>
      <h3 className="mb-1 text-xl font-bold text-gray-900">{title ?? t.widget.title}</h3>
      <p className="mb-5 text-base text-gray-600">{t.widget.subtitle}</p>
      <div
        className={`grid gap-5 ${
          carSlug
            ? "grid-cols-1"
            : variant === "compact"
              ? "grid-cols-1 sm:grid-cols-2"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        }`}
      >
        <div>
          <label htmlFor="pickup-date" className={labelClass}>
            {t.widget.pickupDate}
          </label>
          <DateField
            id="pickup-date"
            value={pickupDate}
            onChange={setPickupDate}
            className={selectClass}
            aria-required={true}
            placeholder={t.widget.chooseDate}
          />
        </div>
        <div>
          <label htmlFor="pickup-time" className={labelClass}>
            {t.widget.pickupTime}
          </label>
          <TimeSelect id="pickup-time" value={pickupTime} onChange={setPickupTime} />
        </div>
        <div>
          <label htmlFor="pickup-loc" className={labelClass}>
            {t.widget.pickupLoc}
          </label>
          <select
            id="pickup-loc"
            value={pickupLocation}
            onChange={(e) => setPickupLocation(e.target.value)}
            className={selectClass}
          >
            <option value="">{t.widget.chooseLocation}</option>
            {pickupLocations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {t.locations[loc.id as keyof typeof t.locations] ?? loc.name} {loc.fee === 0 ? "" : `– ${loc.fee} €`}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="return-date" className={labelClass}>
            {t.widget.returnDate}
          </label>
          <DateField
            id="return-date"
            value={returnDate}
            onChange={setReturnDate}
            min={pickupDate || undefined}
            className={returnDateError ? selectClassError : selectClass}
            aria-required={true}
            aria-invalid={!!returnDateError}
            aria-describedby={returnDateError ? "return-date-error" : undefined}
            placeholder={t.widget.chooseDate}
          />
          {returnDateError && (
            <p id="return-date-error" className="mt-1.5 text-sm text-red-600" role="alert">
              {returnDateError}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="return-time" className={labelClass}>
            {t.widget.returnTime}
          </label>
          <TimeSelect id="return-time" value={returnTime} onChange={setReturnTime} />
        </div>
        <div>
          <label htmlFor="return-loc" className={labelClass}>
            {t.widget.returnLoc}
          </label>
          <select
            id="return-loc"
            value={returnLocation}
            onChange={(e) => setReturnLocation(e.target.value)}
            className={selectClass}
          >
            <option value="">{t.widget.chooseLocation}</option>
            {pickupLocations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {t.locations[loc.id as keyof typeof t.locations] ?? loc.name} {loc.fee === 0 ? "" : `– ${loc.fee} €`}
              </option>
            ))}
          </select>
        </div>
      </div>
      {!hideActions && (
        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="submit" variant="primary" loading={submitting} disabled={!!returnDateError}>
            {t.widget.continue}
          </Button>
          {variant === "full" && (
            <Link href={allCarsHref} className="btn-outline">
              {t.widget.seeAll}
            </Link>
          )}
        </div>
      )}
    </form>
  );
}
