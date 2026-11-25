"use client";

import { useState, useEffect } from "react";
import { pickupLocations } from "@/config/locations";
import { checkoutExtras } from "@/config/checkout-extras";
import { siteConfig } from "@/config/site";
import { rentalDaysBetween } from "@/lib/rental-days";
import { getPriceForDays, type Car } from "@/data/cars";
import { getSeasonForDate, type SeasonPeriod } from "@/data/seasons";
import { DateField } from "@/components/DateField";
import { formatDisplayDate } from "@/lib/format-date";
import { normalizeTime24 } from "@/lib/format-time";
import { TimeSelect } from "@/components/TimeSelect";
import { CarImage } from "@/components/CarImage";
import { interpolate } from "@/i18n/interpolate";
import { useI18n } from "@/i18n/LocaleProvider";
import { LegalDocLink, LegalModal, type LegalDoc } from "@/components/LegalModal";

const inputClass =
  "w-full h-11 rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";
const inputErrorClass = inputClass + " border-red-500";
const labelClass = "mb-1.5 block text-sm font-semibold text-gray-800";

function parseDate(s: string): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

type PaymentMethod = "cash" | "card_delivery" | "bank_transfer";

interface ExtraState {
  checked: boolean;
  quantity: number;
}

const DEFAULT_TIME = "10:00";

interface CheckoutFormProps {
  cars: Car[];
  seasons?: SeasonPeriod[];
  initialCar: Car | null;
  initialPickup: string;
  initialReturn: string;
  initialPickupTime?: string;
  initialReturnTime?: string;
  initialPickupLocation: string;
  initialReturnLocation: string;
}

export function CheckoutForm({
  cars,
  seasons = [],
  initialCar,
  initialPickup,
  initialReturn,
  initialPickupTime = "",
  initialReturnTime = "",
  initialPickupLocation,
  initialReturnLocation,
}: CheckoutFormProps) {
  const { t, locale } = useI18n();
  const extraLabel = (id: string, fallback: string) => t.extras[id as keyof typeof t.extras] ?? fallback;
  const locationName = (id: string, fallback: string) => t.locations[id as keyof typeof t.locations] ?? fallback;
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedCarSlug, setSelectedCarSlug] = useState<string>(initialCar?.slug ?? cars[0]?.slug ?? "");
  const [extras, setExtras] = useState<Record<string, ExtraState>>(() => {
    const o: Record<string, ExtraState> = {};
    checkoutExtras.forEach((e) => (o[e.id] = { checked: false, quantity: 1 }));
    return o;
  });
  const [pickupDate, setPickupDate] = useState(initialPickup || "");
  const [pickupTime, setPickupTime] = useState(initialPickupTime || DEFAULT_TIME);
  const [returnDate, setReturnDate] = useState(initialReturn || "");
  const [returnTime, setReturnTime] = useState(initialReturnTime || DEFAULT_TIME);
  const [pickupLocation, setPickupLocation] = useState(initialPickupLocation || "aeroport-cluj");
  const [returnLocation, setReturnLocation] = useState(initialReturnLocation || "aeroport-cluj");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [message, setMessage] = useState("");
  const [payment, setPayment] = useState<PaymentMethod | "">("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [legalDoc, setLegalDoc] = useState<LegalDoc | null>(null);
  const [scdw, setScdw] = useState(false);
  const [guaranteeOption, setGuaranteeOption] = useState<"standard" | "reduced" | "reduced2">("standard");
  const [dateError, setDateError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [reservationReference, setReservationReference] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [dateSectionOpen, setDateSectionOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const selectedCar = cars.find((c) => c.slug === selectedCarSlug) ?? initialCar ?? cars[0] ?? null;
  const selectedCarImages = selectedCar
    ? [selectedCar.image, ...(selectedCar.gallery ?? [])].filter((img): img is string => Boolean(img))
    : [];
  const activeImage = selectedCarImages[selectedImageIndex] ?? selectedCar?.image ?? "";

  useEffect(() => {
    if (initialCar?.slug) setSelectedCarSlug(initialCar.slug);
  }, [initialCar?.slug]);
  useEffect(() => {
    setSelectedImageIndex(0);
    setGuaranteeOption("standard");
    setScdw(false);
  }, [selectedCarSlug]);

  useEffect(() => {
    if (initialPickup) setPickupDate(initialPickup);
  }, [initialPickup]);
  useEffect(() => {
    if (initialReturn) setReturnDate(initialReturn);
  }, [initialReturn]);
  useEffect(() => {
    if (initialPickupLocation) setPickupLocation(initialPickupLocation);
  }, [initialPickupLocation]);
  useEffect(() => {
    if (initialReturnLocation) setReturnLocation(initialReturnLocation);
  }, [initialReturnLocation]);
  useEffect(() => {
    if (initialPickupTime) setPickupTime(initialPickupTime);
  }, [initialPickupTime]);
  useEffect(() => {
    if (initialReturnTime) setReturnTime(initialReturnTime);
  }, [initialReturnTime]);

  useEffect(() => {
    if (!pickupDate || !returnDate) {
      setDateError(null);
      return;
    }
    const start = parseDate(pickupDate);
    const end = parseDate(returnDate);
    if (!start || !end) {
      setDateError(null);
      return;
    }
    if (end < start) {
      setDateError(t.widget.dateError);
      return;
    }
    setDateError(null);
  }, [pickupDate, returnDate, t.widget.dateError]);

  const days = rentalDaysBetween(pickupDate, pickupTime || DEFAULT_TIME, returnDate, returnTime || DEFAULT_TIME);
  const pickupLoc = pickupLocations.find((l) => l.id === pickupLocation);
  const returnLoc = pickupLocations.find((l) => l.id === returnLocation);
  const locationFee = (pickupLoc?.fee ?? 0) + (returnLoc?.fee ?? 0);
  const season = getSeasonForDate(pickupDate, seasons);
  const priceContext = { pickupDate, pickupTime: pickupTime || DEFAULT_TIME, seasons };
  const resolvedPrice =
    selectedCar && days != null && days > 0
      ? getPriceForDays(selectedCar, days, season, priceContext)
      : null;
  const pricePerDay = resolvedPrice?.pricePerDay ?? selectedCar?.pricePerDay ?? 0;
  const scdwPerDayResolved = resolvedPrice?.scdwPerDay ?? selectedCar?.scdwPerDay;
  const hasGuaranteeTiers = Boolean(selectedCar?.reducedGuarantee || selectedCar?.reducedGuarantee2);
  const selectedReduction =
    guaranteeOption === "reduced"
      ? selectedCar?.reducedGuarantee
      : guaranteeOption === "reduced2"
        ? selectedCar?.reducedGuarantee2
        : undefined;
  const totalRental = resolvedPrice?.total ?? (days != null && days > 0 ? Math.round(pricePerDay * days) : 0);
  const displayPricePerDay = pricePerDay;

  const reductionPerDay = hasGuaranteeTiers ? selectedReduction?.perDay ?? 0 : scdw ? scdwPerDayResolved ?? 0 : 0;
  const reductionCost = days != null && days > 0 ? Math.round(reductionPerDay * days) : 0;
  const extrasTotal =
    days != null &&
    days > 0 &&
    checkoutExtras.reduce((sum, opt) => {
      const s = extras[opt.id];
      if (!s?.checked) return sum;
      const q = opt.hasQuantity ? s.quantity : 1;
      return sum + Math.round(opt.pricePerDay * days * q);
    }, 0);
  const total = Math.round(totalRental + locationFee + reductionCost + (typeof extrasTotal === "number" ? extrasTotal : 0));
  const guarantee = hasGuaranteeTiers
    ? selectedReduction?.deposit ?? selectedCar?.guarantee ?? 0
    : scdw
      ? 0
      : selectedCar?.guarantee ?? 0;
  const scdwSelected = hasGuaranteeTiers ? guaranteeOption !== "standard" : scdw;

  const setExtraChecked = (id: string, checked: boolean) => {
    setExtras((prev) => ({ ...prev, [id]: { ...prev[id], checked } }));
  };
  const setExtraQuantity = (id: string, quantity: number) => {
    setExtras((prev) => ({ ...prev, [id]: { ...prev[id], quantity: Math.max(1, quantity) } }));
  };
  const goToPrevImage = () => {
    if (selectedCarImages.length <= 1) return;
    setSelectedImageIndex((prev) => (prev - 1 + selectedCarImages.length) % selectedCarImages.length);
  };
  const goToNextImage = () => {
    if (selectedCarImages.length <= 1) return;
    setSelectedImageIndex((prev) => (prev + 1) % selectedCarImages.length);
  };

  const errors = {
    email: touched && !email.trim(),
    name: touched && !name.trim(),
    phone: touched && !phone.trim(),
    payment: touched && !payment,
    terms: touched && !agreeTerms,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (dateError || !agreeTerms || !email.trim() || !name.trim() || !phone.trim() || !payment) {
      const firstErrorId = dateError
        ? "pickup-date"
        : !email.trim()
          ? "checkout-email"
          : !name.trim()
            ? "checkout-name"
            : !phone.trim()
              ? "checkout-phone"
              : !payment
                ? "checkout-payment"
                : "checkout-terms";
      setTimeout(() => {
        document.getElementById(firstErrorId)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 0);
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    const extrasPayload: Record<string, number | boolean> = {};
    checkoutExtras.forEach((opt) => {
      const s = extras[opt.id];
      if (s?.checked) extrasPayload[opt.id] = opt.hasQuantity ? (s.quantity ?? 1) : true;
    });
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carSlug: selectedCar?.slug ?? "",
          carName: selectedCar?.name ?? "",
          pickupDate,
          returnDate,
          pickupTime: normalizeTime24(pickupTime || DEFAULT_TIME),
          returnTime: normalizeTime24(returnTime || DEFAULT_TIME),
          pickupLocation,
          returnLocation,
          pickupLocationName: pickupLoc?.name,
          returnLocationName: returnLoc?.name,
          days: days ?? 0,
          total,
          guarantee,
          scdw: scdwSelected,
          extras: extrasPayload,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          message: message.trim() || undefined,
          flightNumber: flightNumber.trim() || undefined,
          payment,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || t.checkout.sendError);
      }
      const data = await res.json().catch(() => ({}));
      setReservationReference(data.reference ?? null);
      setStep(2);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t.checkout.sendError);
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappText = [
    t.checkout.whatsappIntro,
    selectedCar ? selectedCar.name : t.checkout.car.toLowerCase(),
    `${t.checkout.pickup}: ${formatDisplayDate(pickupDate, locale)} ${pickupTime} - ${locationName(pickupLocation, pickupLoc?.name ?? pickupLocation)}`,
    `${t.checkout.dropoff}: ${formatDisplayDate(returnDate, locale)} ${returnTime} - ${locationName(returnLocation, returnLoc?.name ?? returnLocation)}`,
    `${t.checkout.daysCount}: ${days ?? "-"}`,
    `${t.checkout.total}: ${total} €`,
    `${t.checkout.name}: ${name}`,
    `${t.checkout.phone}: ${phone}`,
    `${t.checkout.email}: ${email}`,
    message ? `${t.contact.message}: ${message}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  if (step === 2) {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-gray-200 bg-white p-8 shadow-md">
        <div className="mb-6 flex items-center gap-3 text-primary">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-lg font-bold">
            2
          </span>
          <h2 className="text-xl font-bold text-gray-900">{t.checkout.sentTitle}</h2>
        </div>
        {reservationReference && (
          <p className="mb-4 font-mono text-lg font-semibold text-primary">
            {t.checkout.sentRef} {reservationReference}
          </p>
        )}
        <p className="mb-6 text-gray-600">
          {t.checkout.sentText}
        </p>
        <ul className="mb-6 list-inside list-disc space-y-1 text-sm text-gray-600">
          {selectedCar && <li>{t.checkout.car}: {selectedCar.name}</li>}
          <li>{t.checkout.pickup}: {formatDisplayDate(pickupDate, locale)} {pickupTime} – {locationName(pickupLocation, pickupLoc?.name ?? "")}</li>
          <li>{t.checkout.dropoff}: {formatDisplayDate(returnDate, locale)} {returnTime} – {locationName(returnLocation, returnLoc?.name ?? "")}</li>
          <li>{t.checkout.total}: {total} €</li>
        </ul>
        <a
          href={`https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(whatsappText)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-whatsapp"
        >
          {t.checkout.whatsapp}
        </a>
        <p className="mt-4 text-sm text-gray-500">
          {t.checkout.orEmail}{" "}
          <a href={`mailto:${siteConfig.contact.email}`} className="text-primary underline">
            {siteConfig.contact.email}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8">
      {submitError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {submitError}
        </div>
      )}
      {/* Pași */}
      <div className="mb-8 flex border-b border-gray-600">
        <div className="flex items-center gap-2 border-b-2 border-primary pb-3 pr-6">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
            1
          </span>
          <span className="font-semibold text-white">{t.checkout.stepDetails}</span>
        </div>
        <div className="flex items-center gap-2 pb-3 pl-6 text-gray-400">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-600 text-sm font-bold text-gray-300">
            2
          </span>
          <span>{t.checkout.stepSent}</span>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* 1. Modifică datele – pe mobile primul, pe lg col2 row1 */}
        <div className="order-1 lg:col-start-2 lg:row-start-1">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <button
              type="button"
              onClick={() => setDateSectionOpen((o) => !o)}
              className="flex w-full items-center justify-between p-4 text-left lg:cursor-default"
              aria-expanded={dateSectionOpen}
            >
              <h3 className="text-lg font-bold uppercase tracking-wide text-gray-900">
                {t.checkout.changeDates}
              </h3>
              <span className="lg:hidden" aria-hidden>
                <svg
                  className={`h-5 w-5 text-gray-500 transition-transform ${dateSectionOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>
            <div className={`px-6 pb-6 pt-0 ${dateSectionOpen ? "block" : "hidden"} lg:block`}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="pickup-date" className={labelClass}>{t.widget.pickupDate}</label>
                <DateField
                  id="pickup-date"
                  value={pickupDate}
                  onChange={setPickupDate}
                  className={inputClass}
                  aria-required={true}
                  placeholder={t.widget.chooseDate}
                />
              </div>
              <div>
                <label htmlFor="pickup-time" className={labelClass}>{t.widget.pickupTime}</label>
                <TimeSelect id="pickup-time" value={pickupTime} onChange={setPickupTime} />
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="pickup-loc" className={labelClass}>{t.widget.pickupLoc}</label>
              <select
                id="pickup-loc"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                className={inputClass}
              >
                {pickupLocations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {locationName(loc.id, loc.name)} {loc.fee === 0 ? "" : `– ${loc.fee} €`}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="return-date" className={labelClass}>{t.widget.returnDate}</label>
                <DateField
                  id="return-date"
                  value={returnDate}
                  onChange={setReturnDate}
                  min={pickupDate || undefined}
                  className={dateError ? inputErrorClass : inputClass}
                  aria-required={true}
                  aria-invalid={!!dateError}
                  aria-describedby={dateError ? "return-date-error" : undefined}
                  placeholder={t.widget.chooseDate}
                />
                {dateError && (
                  <p id="return-date-error" className="mt-1.5 text-sm text-red-600" role="alert">{dateError}</p>
                )}
              </div>
              <div>
                <label htmlFor="return-time" className={labelClass}>{t.widget.returnTime}</label>
                <TimeSelect id="return-time" value={returnTime} onChange={setReturnTime} />
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="return-loc" className={labelClass}>{t.widget.returnLoc}</label>
              <select
                id="return-loc"
                value={returnLocation}
                onChange={(e) => setReturnLocation(e.target.value)}
                className={inputClass}
              >
                {pickupLocations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {locationName(loc.id, loc.name)} {loc.fee === 0 ? "" : `– ${loc.fee} €`}
                  </option>
                ))}
              </select>
            </div>
            <p className="mt-3 text-xs text-gray-500">{t.checkout.minPeriod}</p>
            </div>
          </div>
        </div>

        {/* 2. Selectează mașina – pe mobile al doilea, pe lg col1 row1 */}
        <div className="order-2 lg:col-start-1 lg:row-start-1">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold uppercase tracking-wide text-gray-900">
              {t.checkout.selectCar}
            </h3>
            <div className="mb-4">
              <select
                value={selectedCarSlug}
                onChange={(e) => setSelectedCarSlug(e.target.value)}
                className={inputClass}
                aria-label={t.checkout.chooseCar}
              >
                {cars.map((c) => {
                  const totalForCar =
                    days != null && days > 0
                      ? getPriceForDays(c, days, season, priceContext).total
                      : null;
                  return (
                    <option key={c.id} value={c.slug}>
                      {c.name} – {totalForCar != null ? `${Math.round(totalForCar)} €` : "–"}
                    </option>
                  );
                })}
              </select>
            </div>
            {selectedCar && (
              <>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-2xl font-bold text-primary">
                    {Math.round(displayPricePerDay)} € {t.car.perDay}
                  </span>
                  {days != null && days > 0 && (
                    <>
                      <span className="text-gray-600">{interpolate(t.checkout.timesDays, { n: days })}</span>
                      <span className="text-xl font-bold text-gray-900">
                        {t.car.sumEquals} {Math.round(totalRental)} €
                      </span>
                    </>
                  )}
                </div>
                <div className="relative mt-4 h-64 overflow-hidden rounded-lg border border-gray-200 sm:h-80 lg:h-96">
                  <CarImage
                    src={activeImage}
                    alt={selectedCar.name}
                    fallbackName={selectedCar.name}
                    className="!absolute inset-0 !object-cover"
                    sizes="(max-width: 1023px) calc(100vw - 2rem), 600px"
                  />
                  {selectedCarImages.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={goToPrevImage}
                        aria-label={t.checkout.prevImage}
                        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/45 px-3 py-2 text-white transition hover:bg-black/60"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={goToNextImage}
                        aria-label={t.checkout.nextImage}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/45 px-3 py-2 text-white transition hover:bg-black/60"
                      >
                        ›
                      </button>
                      <span className="absolute bottom-2 right-2 rounded bg-black/45 px-2 py-1 text-xs text-white">
                        {selectedImageIndex + 1} / {selectedCarImages.length}
                      </span>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* 3. Selectează opțiuni – pe mobile al treilea, pe lg col1 row2 */}
        <div className="order-3 lg:col-start-1 lg:row-start-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold uppercase tracking-wide text-gray-900">
              {t.checkout.options}
            </h3>
            <ul className="space-y-3">
              {checkoutExtras.map((opt) => (
                <li key={opt.id} className="flex flex-wrap items-center gap-3">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={extras[opt.id]?.checked ?? false}
                      onChange={(e) => setExtraChecked(opt.id, e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary"
                    />
                    <span className="text-gray-800">
                      {extraLabel(opt.id, opt.label)} ({Math.round(opt.pricePerDay)} {t.tarife.perDay})
                    </span>
                  </label>
                  {opt.hasQuantity && extras[opt.id]?.checked && (
                    <select
                      value={extras[opt.id]?.quantity ?? 1}
                      onChange={(e) => setExtraQuantity(opt.id, Number(e.target.value))}
                      className="w-16 rounded border border-gray-300 bg-white px-2 py-1.5 text-sm"
                    >
                      {[1, 2, 3].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 4. Date personale – pe mobile al patrulea (între Opțiuni și Plată), pe lg col2 row2 */}
        <div className="order-4 lg:col-start-2 lg:row-start-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold uppercase tracking-wide text-gray-900">
              {t.checkout.personal}
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="checkout-email" className={labelClass}>{t.checkout.email}</label>
                <input
                  id="checkout-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={errors.email ? inputErrorClass : inputClass}
                  placeholder="email@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{t.checkout.requiredEmail}</p>
                )}
              </div>
              <div>
                <label htmlFor="checkout-name" className={labelClass}>{t.checkout.name}</label>
                <input
                  id="checkout-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={errors.name ? inputErrorClass : inputClass}
                  placeholder={t.checkout.namePlaceholder}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{t.checkout.requiredName}</p>
                )}
              </div>
              <div>
                <label htmlFor="checkout-message" className={labelClass}>{t.checkout.message}</label>
                <textarea
                  id="checkout-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={inputClass + " min-h-[80px]"}
                  placeholder={t.checkout.messagePlaceholder}
                  rows={3}
                />
              </div>
              <div>
                <label htmlFor="checkout-phone" className={labelClass}>{t.checkout.phone}</label>
                <input
                  id="checkout-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={errors.phone ? inputErrorClass : inputClass}
                  placeholder="+40 750 000 000"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {t.checkout.phoneHint}
                </p>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{t.checkout.requiredPhone}</p>
                )}
              </div>
              <div>
                <label htmlFor="checkout-flight" className={labelClass}>{t.checkout.flight}</label>
                <input
                  id="checkout-flight"
                  type="text"
                  value={flightNumber}
                  onChange={(e) => setFlightNumber(e.target.value)}
                  className={inputClass}
                  placeholder="Ex: W6 1234"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Plată + Termeni + Sumar + Buton (full width) */}
      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h3 className="mb-4 text-lg font-bold uppercase tracking-wide text-gray-900">{t.checkout.payment}</h3>
            <div id="checkout-payment" className={`space-y-3 ${errors.payment ? "rounded-lg border-2 border-red-500 p-3" : ""}`}>
              {(
                [
                  { value: "cash" as const, label: t.checkout.payCash },
                  { value: "card_delivery" as const, label: t.checkout.payCard },
                  { value: "bank_transfer" as const, label: t.checkout.payTransfer },
                ] as const
              ).map(({ value, label }) => (
                <label key={value} className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value={value}
                    checked={payment === value}
                    onChange={() => setPayment(value)}
                    className="h-4 w-4 text-primary"
                  />
                  <span className="font-medium text-gray-900">{label}</span>
                </label>
              ))}
            </div>
            {errors.payment && (
              <p className="mt-2 text-sm text-red-600">{t.checkout.requiredPayment}</p>
            )}
            <div id="checkout-terms" className={`mt-4 ${errors.terms ? "rounded-lg border-2 border-red-500 p-3" : ""}`}>
              <div className="flex items-start gap-3">
                <input
                  id="checkout-agree-terms"
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  aria-labelledby="checkout-agree-copy"
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <p id="checkout-agree-copy" className="text-sm text-gray-700">
                  <label htmlFor="checkout-agree-terms" className="cursor-pointer">
                    {t.checkout.termsAgree}{" "}
                  </label>
                  <LegalDocLink doc="terms" onOpen={setLegalDoc}>
                    {t.checkout.termsLink}
                  </LegalDocLink>{" "}
                  <label htmlFor="checkout-agree-terms" className="cursor-pointer">
                    {t.checkout.termsRest}
                  </label>
                </p>
              </div>
              {errors.terms && (
                <p className="mt-2 text-sm text-red-600">{t.checkout.requiredTerms}</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
              {t.checkout.summary}
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex justify-between text-gray-700">
                <span>{t.checkout.rentalPrice} {days != null && days > 0 ? interpolate(t.checkout.rentalDays, { n: days }) : "–"}</span>
                <span className="font-bold">
                  {days != null && days > 0 ? `${Math.round(totalRental)} €` : "–"}
                </span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>{t.checkout.guarantee}:</span>
                <span className="font-bold">{Math.round(guarantee)} €</span>
              </div>
              {days != null &&
                days > 0 &&
                checkoutExtras.map(
                  (opt) =>
                    extras[opt.id]?.checked && (
                      <div key={opt.id} className="flex justify-between text-gray-700">
                        <span>
                          {extraLabel(opt.id, opt.label)}
                          {opt.hasQuantity && (extras[opt.id]?.quantity ?? 1) > 1
                            ? ` (×${extras[opt.id]?.quantity ?? 1})`
                            : ""}
                        </span>
                        <span className="font-bold">
                          {Math.round(opt.pricePerDay * days * (opt.hasQuantity ? extras[opt.id]?.quantity ?? 1 : 1))} €
                        </span>
                      </div>
                    )
                )}
              {hasGuaranteeTiers && selectedCar ? (
                <fieldset className="space-y-2">
                  <legend className="text-sm font-semibold text-gray-800">{t.checkout.guarantee}</legend>
                  <label className="flex cursor-pointer items-start gap-2">
                    <input
                      type="radio"
                      name="guarantee-option"
                      checked={guaranteeOption === "standard"}
                      onChange={() => setGuaranteeOption("standard")}
                      className="mt-1 h-4 w-4 border-gray-300 text-primary"
                    />
                    <span>{interpolate(t.checkout.guaranteeStandard, { amount: selectedCar.guarantee })}</span>
                  </label>
                  {selectedCar.reducedGuarantee ? (
                    <label className="flex cursor-pointer items-start gap-2">
                      <input
                        type="radio"
                        name="guarantee-option"
                        checked={guaranteeOption === "reduced"}
                        onChange={() => setGuaranteeOption("reduced")}
                        className="mt-1 h-4 w-4 border-gray-300 text-primary"
                      />
                      <span>
                        {interpolate(t.checkout.guaranteeReduced, {
                          deposit: selectedCar.reducedGuarantee.deposit,
                          perDay: selectedCar.reducedGuarantee.perDay,
                        })}
                      </span>
                    </label>
                  ) : null}
                  {selectedCar.reducedGuarantee2 ? (
                    <label className="flex cursor-pointer items-start gap-2">
                      <input
                        type="radio"
                        name="guarantee-option"
                        checked={guaranteeOption === "reduced2"}
                        onChange={() => setGuaranteeOption("reduced2")}
                        className="mt-1 h-4 w-4 border-gray-300 text-primary"
                      />
                      <span>
                        {interpolate(t.checkout.guaranteeReduced2, {
                          deposit: selectedCar.reducedGuarantee2.deposit,
                          perDay: selectedCar.reducedGuarantee2.perDay,
                        })}
                      </span>
                    </label>
                  ) : null}
                </fieldset>
              ) : (selectedCar && (resolvedPrice?.scdwPerDay != null || selectedCar.scdwPerDay != null)) ? (
                <label className="flex cursor-pointer items-center justify-between gap-2">
                  <span className="text-xl font-bold">
                    {interpolate(t.checkout.scdw, {
                      amount: Math.round((scdwPerDayResolved ?? 0) * (days != null && days > 0 ? days : 0)),
                    })}
                  </span>
                  <input
                    type="checkbox"
                    checked={scdw}
                    onChange={(e) => setScdw(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary"
                  />
                </label>
              ) : null}
              <div className="flex justify-between border-t border-gray-100 pt-2 text-gray-600">
                <span>{t.checkout.pickup}:</span>
                <span className="font-bold">
                  {pickupDate ? `${formatDisplayDate(pickupDate, locale)}, ${pickupTime || DEFAULT_TIME}` : "–"} – {locationName(pickupLocation, pickupLoc?.name ?? "–")}{" "}
                  {pickupLoc?.fee != null ? `(${pickupLoc.fee} €)` : ""}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>{t.checkout.dropoff}:</span>
                <span className="font-bold">
                  {returnDate ? `${formatDisplayDate(returnDate, locale)}, ${returnTime || DEFAULT_TIME}` : "–"} – {locationName(returnLocation, returnLoc?.name ?? "–")}{" "}
                  {returnLoc?.fee != null ? `(${returnLoc.fee} €)` : ""}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-3 text-base font-bold text-gray-900">
                <span>{t.car.sumEquals}</span>
                <span>{total} €</span>
              </div>
              <div className="flex justify-between text-sm text-gray-700">
                <span>{t.checkout.guarantee}:</span>
                <span className="font-bold">{Math.round(guarantee)} €</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-500">{t.checkout.includedNote}</p>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary mt-4 flex w-full items-center justify-center gap-2 py-3 text-base disabled:opacity-50"
            >
              {submitting ? t.checkout.submitting : t.checkout.submit}
              <span aria-hidden>→</span>
            </button>
          </div>
        </div>
      </div>
      <LegalModal document={legalDoc} onClose={() => setLegalDoc(null)} />
    </form>
  );
}
