function parseDate(s: string): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Parsare dată (YYYY-MM-DD) + oră (HH:mm) în Date, ora locală. */
function parseDateTime(dateStr: string, timeStr: string): Date | null {
  if (!dateStr || !dateStr.trim()) return null;
  const parts = dateStr.trim().split("-").map(Number);
  if (parts.length < 3) return null;
  const [y, m, d] = parts;
  const timePart = (timeStr || "10:00").trim();
  const [hh, mm] = timePart.includes(":") ? timePart.split(":").map(Number) : [10, 0];
  const date = new Date(y, (m ?? 1) - 1, d ?? 1, hh ?? 0, mm ?? 0, 0, 0);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Număr de zile de închiriere pe baza orelor: fiecare perioadă de 24h contează ca o zi.
 * Dacă predarea depășește 24h față de preluare în ultima zi, se adaugă o zi.
 */
export function rentalDaysBetween(
  pickupDate: string,
  pickupTime: string,
  returnDate: string,
  returnTime: string
): number | null {
  const start = parseDateTime(pickupDate, pickupTime || "10:00");
  const end = parseDateTime(returnDate, returnTime || "10:00");
  if (!start || !end || end <= start) return null;
  const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  return Math.max(1, Math.ceil(durationHours / 24));
}

/** Zile între două date calendaristice. Null dacă intervalul e invalid. */
export function daysBetween(pickup: string, returnDate: string): number | null {
  const start = parseDate(pickup);
  const end = parseDate(returnDate);
  if (!start || !end || end < start) return null;
  const diff = end.getTime() - start.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) || 1;
}
