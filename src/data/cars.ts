import { getSeasonForDate, type SeasonPeriod } from "./seasons";

export type CarCategory = "economy" | "business" | "vans" | "premium" | "supercars";

/** Tracțiune: față, 4x4, spate */
export type CarTraction = "fata" | "4x4" | "spate";

export const TRACTION_LABELS: Record<CarTraction, string> = {
  fata: "Față",
  "4x4": "4x4",
  spate: "Spate",
};

/** Intervale de zile pentru prețuri. Cheia folosită în pricingByInterval. */
export type DayIntervalKey = "1-3" | "4-9" | "10-15" | "16-21" | "22-30" | "31+";

export const DAY_INTERVALS: { key: DayIntervalKey; label: string; min: number; max: number | null }[] = [
  { key: "1-3", label: "1–3 zile", min: 1, max: 3 },
  { key: "4-9", label: "4–9 zile", min: 4, max: 9 },
  { key: "10-15", label: "10–15 zile", min: 10, max: 15 },
  { key: "16-21", label: "16–21 zile", min: 16, max: 21 },
  { key: "22-30", label: "22–30 zile", min: 22, max: 30 },
  { key: "31+", label: "Peste 30 zile", min: 31, max: null },
];

export type SeasonKey = "normal" | "full" | "extra";

/** Garanție redusă: depozit mai mic, contra unui cost pe zi. */
export interface ReducedGuarantee {
  deposit: number;
  perDay: number;
}

export interface IntervalPricing {
  pricePerDay: number;
  scdwPerDay?: number;
}

/** Prețuri și SCDW per interval de zile. Dacă lipsește, se folosesc pricePerDay/scdwPerDay. */
export type PricingByInterval = Partial<Record<DayIntervalKey, IntervalPricing>>;

export interface Car {
  id: string;
  slug: string;
  name: string;
  category: CarCategory;
  categoryLabel: string;
  /** Preț/zi folosit când nu există pricingByInterval sau ca fallback. */
  pricePerDay: number;
  price3Days?: number;
  guarantee: number;
  /** SCDW/zi folosit când nu există pricingByInterval sau ca fallback. */
  scdwPerDay?: number;
  /** Prețuri și SCDW pe intervale de zile. Pentru mașinile din lista de prețuri, acesta e sezonul normal. */
  pricingByInterval?: PricingByInterval;
  /** Preț/zi pe sezon (normal, full, extra) și pe interval de zile. */
  pricingBySeason?: Partial<Record<SeasonKey, PricingByInterval>>;
  /** Garanție redusă: depozit + cost/zi. */
  reducedGuarantee?: ReducedGuarantee;
  /** A doua treaptă de garanție redusă. */
  reducedGuarantee2?: ReducedGuarantee;
  /** Lipsă dacă anul nu este cunoscut. */
  year?: number;
  engine: string;
  fuel: string;
  transmission: string;
  traction?: CarTraction;
  seats: number;
  doors: number;
  features: string[];
  image: string;
  /** Poze suplimentare (galerie). Prima poză din listă pe site e image. */
  gallery?: string[];
  featured?: boolean;
}

export interface GetPriceForDaysContext {
  pickupDate?: string;
  pickupTime?: string;
  seasons?: SeasonPeriod[];
}

export interface DailyRentalRate {
  date: string;
  season: SeasonKey;
  pricePerDay: number;
}

function formatLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseLocalDateTime(dateStr: string | undefined, timeStr?: string): Date | null {
  if (!dateStr || !dateStr.trim()) return null;
  const parts = dateStr.trim().split("-").map(Number);
  if (parts.length < 3) return null;
  const [y, m, d] = parts;
  const timePart = (timeStr || "10:00").trim();
  const [hh, mm] = timePart.includes(":") ? timePart.split(":").map(Number) : [10, 0];
  const date = new Date(y, (m ?? 1) - 1, d ?? 1, hh ?? 0, mm ?? 0, 0, 0);
  return Number.isNaN(date.getTime()) ? null : date;
}

function findDayInterval(days: number) {
  return DAY_INTERVALS.find((i) => days >= i.min && (i.max == null || days <= i.max));
}

/** Preț/zi și SCDW/zi din grila sezonului, pentru un interval de durată. */
function intervalPricingForSeason(
  car: Car,
  intervalKey: DayIntervalKey,
  season: SeasonKey
): { pricePerDay: number; scdwPerDay: number | undefined } {
  const fallback = { pricePerDay: car.pricePerDay, scdwPerDay: car.scdwPerDay };

  if (season === "full" || season === "extra") {
    const seasonal = car.pricingBySeason?.[season]?.[intervalKey];
    if (seasonal) {
      return {
        pricePerDay: seasonal.pricePerDay,
        scdwPerDay:
          seasonal.scdwPerDay ??
          car.pricingByInterval?.[intervalKey]?.scdwPerDay ??
          car.scdwPerDay,
      };
    }
  }

  if (!car.pricingByInterval) return fallback;
  const p = car.pricingByInterval[intervalKey];
  if (!p) return fallback;
  return {
    pricePerDay: p.pricePerDay,
    scdwPerDay: p.scdwPerDay ?? car.scdwPerDay,
  };
}

/**
 * Un tarif pe zi facturată: același interval de durată pentru toată închirierea,
 * sezonul zilei după începutul fiecărui bloc de 24h (pickup + i × 24h).
 */
export function getDailyRentalRates(
  car: Car,
  days: number,
  pickupDate: string,
  seasons: SeasonPeriod[] = [],
  pickupTime: string = "10:00"
): DailyRentalRate[] | null {
  if (days <= 0) return [];
  const pickup = parseLocalDateTime(pickupDate, pickupTime);
  if (!pickup) return null;
  const interval = findDayInterval(days);
  if (!interval) return null;

  const out: DailyRentalRate[] = [];
  for (let i = 0; i < days; i++) {
    const dayStart = new Date(pickup.getTime() + i * 24 * 60 * 60 * 1000);
    const date = formatLocalDate(dayStart);
    const season = getSeasonForDate(date, seasons);
    out.push({
      date,
      season,
      pricePerDay: intervalPricingForSeason(car, interval.key, season).pricePerDay,
    });
  }
  return out;
}

/**
 * Returnează prețul/zi, SCDW/zi și totalul pentru un număr dat de zile.
 * Dacă există data de preluare, fiecare zi facturată e tarifată la sezonul ei,
 * din rândul de durată al totalului de zile. Fără date, folosește un singur sezon.
 * SCDW rămâne perDay × zile din rândul de durată (sezonul de preluare / activ).
 */
export function getPriceForDays(
  car: Car,
  days: number,
  season: SeasonKey = "normal",
  context?: GetPriceForDaysContext
): { pricePerDay: number; scdwPerDay: number | undefined; total: number } {
  const fallback = {
    pricePerDay: car.pricePerDay,
    scdwPerDay: car.scdwPerDay,
    total: days > 0 ? Math.round(car.pricePerDay * days) : 0,
  };
  if (days <= 0) return { ...fallback, total: 0 };

  const interval = findDayInterval(days);
  if (!interval) return fallback;

  const scdwSeason = context?.pickupDate
    ? getSeasonForDate(context.pickupDate, context.seasons ?? [])
    : season;
  const scdwResolved = intervalPricingForSeason(car, interval.key, scdwSeason);

  const daily =
    context?.pickupDate
      ? getDailyRentalRates(car, days, context.pickupDate, context.seasons ?? [], context.pickupTime)
      : null;
  if (daily && daily.length === days) {
    const sum = daily.reduce((acc, day) => acc + day.pricePerDay, 0);
    const total = Math.round(sum);
    return {
      pricePerDay: sum / days,
      scdwPerDay: scdwResolved.scdwPerDay,
      total,
    };
  }

  const resolved = intervalPricingForSeason(car, interval.key, season);
  return {
    pricePerDay: resolved.pricePerDay,
    scdwPerDay: resolved.scdwPerDay,
    total: Math.round(resolved.pricePerDay * days),
  };
}

/** Preț/zi dintr-un sezon, pentru intervalul corespunzător numărului de zile. */
export function getSeasonPricePerDay(car: Car, season: SeasonKey, days: number): number | undefined {
  const table = car.pricingBySeason?.[season];
  if (!table) return undefined;
  const safeDays = days > 0 ? days : 1;
  const interval = DAY_INTERVALS.find((i) => safeDays >= i.min && (i.max == null || safeDays <= i.max));
  if (!interval) return undefined;
  return table[interval.key]?.pricePerDay;
}

export const categories: { id: CarCategory; label: string }[] = [
  { id: "economy", label: "Economic" },
  { id: "business", label: "Medium" },
  { id: "vans", label: "Microbuz" },
  { id: "premium", label: "SUV" },
  { id: "supercars", label: "Premium" },
];

export const CATEGORY_LABELS: Record<CarCategory, string> = {
  economy: "Economic",
  business: "Medium",
  vans: "Microbuz",
  premium: "SUV",
  supercars: "Premium",
};
