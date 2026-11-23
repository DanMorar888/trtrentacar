import type { SeasonKey } from "./cars";

export type SeasonPeriodType = "full" | "extra";

/** Perioadă de sezon fără an: se repetă în fiecare an calendaristic. */
export interface SeasonPeriod {
  id: string;
  type: SeasonPeriodType;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
  name?: string;
}

export const MONTHS_RO = [
  "Ianuarie",
  "Februarie",
  "Martie",
  "Aprilie",
  "Mai",
  "Iunie",
  "Iulie",
  "August",
  "Septembrie",
  "Octombrie",
  "Noiembrie",
  "Decembrie",
] as const;

/** Februarie acceptă 29 (inclusiv 29 februarie în anii bisecți). */
export const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export const SEASON_TYPE_LABELS: Record<SeasonPeriodType, string> = {
  full: "Full sezon",
  extra: "Extra sezon",
};

export function daysInMonth(month: number): number {
  if (!Number.isInteger(month) || month < 1 || month > 12) return 0;
  return DAYS_IN_MONTH[month - 1];
}

export function isValidMonthDay(month: number, day: number): boolean {
  if (!Number.isInteger(month) || !Number.isInteger(day)) return false;
  if (month < 1 || month > 12 || day < 1) return false;
  return day <= DAYS_IN_MONTH[month - 1];
}

export function formatMonthDay(month: number, day: number): string {
  const name = MONTHS_RO[month - 1] ?? "";
  return `${day} ${name}`;
}

export function periodWrapsYear(period: SeasonPeriod): boolean {
  return period.startMonth * 100 + period.startDay > period.endMonth * 100 + period.endDay;
}

export function isMonthDayInPeriod(month: number, day: number, period: SeasonPeriod): boolean {
  const value = month * 100 + day;
  const start = period.startMonth * 100 + period.startDay;
  const end = period.endMonth * 100 + period.endDay;
  if (start <= end) return value >= start && value <= end;
  return value >= start || value <= end;
}

/**
 * Sezonul pentru o dată (YYYY-MM-DD), după luna și ziua din an.
 * Dacă Full și Extra se suprapun, Full sezon câștigă.
 * Fără perioade sau dată invalidă → Sezon Normal.
 */
export function getSeasonForDate(
  dateStr: string | undefined | null,
  periods: SeasonPeriod[]
): SeasonKey {
  if (!dateStr || !Array.isArray(periods) || periods.length === 0) return "normal";
  const parts = dateStr.trim().split("-");
  if (parts.length < 3) return "normal";
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (!Number.isInteger(month) || !Number.isInteger(day) || month < 1 || month > 12 || day < 1 || day > 31) {
    return "normal";
  }

  let hasFull = false;
  let hasExtra = false;
  for (const period of periods) {
    if (!isMonthDayInPeriod(month, day, period)) continue;
    if (period.type === "full") hasFull = true;
    else if (period.type === "extra") hasExtra = true;
  }
  if (hasFull) return "full";
  if (hasExtra) return "extra";
  return "normal";
}

export function parseSeasonPeriodInput(
  body: Record<string, unknown>
): { error: string } | { period: Omit<SeasonPeriod, "id"> } {
  const type: SeasonPeriodType | null =
    body.type === "extra" ? "extra" : body.type === "full" ? "full" : null;
  if (!type) return { error: "Tipul trebuie să fie Full sezon sau Extra sezon" };

  const startMonth = Number(body.startMonth);
  const startDay = Number(body.startDay);
  const endMonth = Number(body.endMonth);
  const endDay = Number(body.endDay);

  if (!isValidMonthDay(startMonth, startDay)) {
    return { error: "Data de început nu este validă (verifică luna și ziua)" };
  }
  if (!isValidMonthDay(endMonth, endDay)) {
    return { error: "Data de sfârșit nu este validă (verifică luna și ziua)" };
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  return {
    period: {
      type,
      startMonth,
      startDay,
      endMonth,
      endDay,
      ...(name ? { name } : {}),
    },
  };
}
