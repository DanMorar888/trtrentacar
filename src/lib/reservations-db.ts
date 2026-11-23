import { promises as fs } from "fs";
import path from "path";
import type { Reservation, ReservationStatus } from "@/data/reservations";

const RESERVATIONS_PATH = path.join(process.cwd(), "data", "reservations.json");

export async function readReservations(): Promise<Reservation[]> {
  try {
    const data = await fs.readFile(RESERVATIONS_PATH, "utf-8");
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function writeReservations(reservations: Reservation[]): Promise<void> {
  const dir = path.dirname(RESERVATIONS_PATH);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(RESERVATIONS_PATH, JSON.stringify(reservations, null, 2), "utf-8");
}

export function getReservationById(reservations: Reservation[], id: string): Reservation | undefined {
  return reservations.find((r) => r.id === id);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

const REFERENCE_PREFIX = "8RC";
const REFERENCE_REGEX = /^8RC(\d{5})$/;

/** Returnează următorul număr de referință: 8RC + 5 cifre (ex: 8RC00001). */
function nextReference(existingReservations: Reservation[]): string {
  let maxNum = 0;
  for (const r of existingReservations) {
    if (r.reference) {
      const m = r.reference.match(REFERENCE_REGEX);
      if (m) {
        const n = parseInt(m[1], 10);
        if (n > maxNum) maxNum = n;
      }
    }
  }
  const nextNum = maxNum + 1;
  const digits = String(nextNum).padStart(5, "0");
  return REFERENCE_PREFIX + digits;
}

export async function createReservation(data: Omit<Reservation, "id" | "reference" | "createdAt" | "updatedAt">): Promise<Reservation> {
  const list = await readReservations();
  const now = new Date().toISOString();
  const reference = nextReference(list);
  const reservation: Reservation = {
    ...data,
    id: generateId(),
    reference,
    createdAt: now,
    updatedAt: now,
  };
  list.unshift(reservation);
  await writeReservations(list);
  return reservation;
}

export async function updateReservationStatus(id: string, status: ReservationStatus): Promise<Reservation | null> {
  const list = await readReservations();
  const idx = list.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  const now = new Date().toISOString();
  list[idx] = { ...list[idx], status, updatedAt: now };
  await writeReservations(list);
  return list[idx];
}
