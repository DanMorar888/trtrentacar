"use client";

import { interpolate } from "@/i18n/interpolate";
import { useI18n } from "@/i18n/LocaleProvider";

interface PriceSummaryProps {
  /** Număr de zile (din date preluare/predare). Null dacă datele nu sunt valide. */
  days: number | null;
  /** Preț per zi în EUR */
  pricePerDay: number;
  /** Total închiriere (sumă zile mixte pe sezon). Dacă lipsește, se calculează pricePerDay × zile. */
  total?: number | null;
  /** Garanție în EUR */
  guarantee: number;
  /** SCDW opțional per zi în EUR */
  scdwPerDay?: number | null;
  /** Garanție redusă, dacă mașina o are în lista de prețuri. */
  reducedGuarantee?: { deposit: number; perDay: number } | null;
  reducedGuarantee2?: { deposit: number; perDay: number } | null;
  /** Clasă CSS pentru container */
  className?: string;
  /** Afișare pe fundal închis (sidebar pagina de detaliu) */
  dark?: boolean;
}

export function PriceSummary({ days, pricePerDay, total, guarantee, scdwPerDay, reducedGuarantee, reducedGuarantee2, className = "", dark }: PriceSummaryProps) {
  const { t } = useI18n();
  const totalRental =
    days != null && days > 0
      ? total != null
        ? Math.round(total)
        : Math.round(pricePerDay * days)
      : null;
  const totalScdw = days != null && days > 0 && scdwPerDay != null ? Math.round(scdwPerDay * days) : null;

  const cardClass = dark
    ? "rounded-xl border border-gray-600 bg-gray-800/50 p-4 shadow-sm"
    : "rounded-xl border border-gray-200 bg-white p-4 shadow-sm";

  return (
    <div className={`${cardClass} ${className}`.trim()}>
      <h3 className={`text-sm font-semibold uppercase tracking-wider ${dark ? "text-gray-400" : "text-gray-500"}`}>{t.checkout.priceSummary}</h3>
      {days != null && days > 0 ? (
        <div className="mt-3 space-y-2 text-sm">
          <div className={`flex justify-between ${dark ? "text-gray-200" : "text-gray-700"}`}>
            <span>
              {Math.round(pricePerDay)} €{t.car.perDay} {interpolate(t.checkout.timesDays, { n: days })}
            </span>
            <span className="font-semibold">
              {t.car.sumEquals} {totalRental} €
            </span>
          </div>
          {reducedGuarantee ? (
            <div className={`flex justify-between ${dark ? "text-gray-200" : "text-gray-700"}`}>
              <span>
                {interpolate(t.checkout.guaranteeReduced, {
                  deposit: reducedGuarantee.deposit,
                  perDay: reducedGuarantee.perDay,
                })}
              </span>
            </div>
          ) : null}
          {reducedGuarantee2 ? (
            <div className={`flex justify-between ${dark ? "text-gray-200" : "text-gray-700"}`}>
              <span>
                {interpolate(t.checkout.guaranteeReduced2, {
                  deposit: reducedGuarantee2.deposit,
                  perDay: reducedGuarantee2.perDay,
                })}
              </span>
            </div>
          ) : null}
          {!reducedGuarantee && !reducedGuarantee2 && totalScdw != null ? (
            <div className={`flex justify-between ${dark ? "text-gray-200" : "text-gray-700"}`}>
              <span>{t.checkout.scdwOptional}</span>
              <span>~{totalScdw} €</span>
            </div>
          ) : null}
          <div className={`flex justify-between border-t pt-2 ${dark ? "border-gray-600 text-gray-300" : "border-gray-100 text-gray-600"}`}>
            <span>{t.checkout.guaranteeOnPickup}</span>
            <span>{Math.round(guarantee)} €</span>
          </div>
          <p className={`pt-1 text-xs ${dark ? "text-gray-400" : "text-gray-500"}`}>{t.checkout.includedNote}</p>
        </div>
      ) : (
        <p className={`mt-2 text-sm ${dark ? "text-gray-400" : "text-gray-600"}`}>{t.checkout.chooseDatesHint}</p>
      )}
    </div>
  );
}
