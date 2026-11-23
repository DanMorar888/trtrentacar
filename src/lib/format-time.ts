/** Normalizează un string de oră la format 24h HH:mm (ex: "9:30" → "09:30", "14:00" → "14:00"). */
export function normalizeTime24(s: string): string {
  const trimmed = s.trim();
  if (!trimmed) return "10:00";
  const match = trimmed.match(/^(\d{1,2}):?(\d{0,2})$/);
  if (!match) return "10:00";
  let h = Math.min(23, Math.max(0, parseInt(match[1], 10) || 0));
  let m = match[2] ? Math.min(59, Math.max(0, parseInt(match[2].padEnd(2, "0"), 10) || 0)) : 0;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
