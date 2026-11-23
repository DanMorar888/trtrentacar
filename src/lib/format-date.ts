const LUNI_RO = ["ian.", "feb.", "mar.", "apr.", "mai", "iun.", "iul.", "aug.", "sep.", "oct.", "nov.", "dec."];
const LUNI_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * Formatează o dată ISO (YYYY-MM-DD) pentru afișare: "9 feb. 2026".
 * Dacă stringul e invalid, îl returnează neschimbat.
 */
export function formatDisplayDate(dateStr: string, locale: "ro" | "en" = "ro"): string {
  if (!dateStr || typeof dateStr !== "string") return dateStr ?? "";
  const trimmed = dateStr.trim();
  const match = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!match) return trimmed;
  const [, y, m, d] = match;
  const monthNum = parseInt(m, 10);
  if (monthNum < 1 || monthNum > 12) return trimmed;
  const dayNum = parseInt(d, 10);
  const monthLabel = (locale === "en" ? LUNI_EN : LUNI_RO)[monthNum - 1];
  return `${dayNum} ${monthLabel} ${y}`;
}
