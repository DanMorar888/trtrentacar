import { randomInt } from "crypto";
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

const REFERENCE_PREFIX = "TRT";
const REFERENCE_DIGITS = 6;
const REFERENCE_SPACE = 10 ** REFERENCE_DIGITS;
const REFERENCE_REGEX = /^TRT(\d{6})$/;

function formatReference(n: number): string {
  return REFERENCE_PREFIX + String(n).padStart(REFERENCE_DIGITS, "0");
}

/** TRT + 6 cifre aleatorii. Un număr nu se repetă până se epuizează toate cele 1.000.000 de combinații. */
function nextReference(existingReservations: Reservation[]): string {
  const used = new Set<number>();
  for (const r of existingReservations) {
    const match = r.reference?.match(REFERENCE_REGEX);
    if (match) used.add(parseInt(match[1], 10));
  }

  if (used.size >= REFERENCE_SPACE) {
    return formatReference(randomInt(REFERENCE_SPACE));
  }

  for (let attempt = 0; attempt < 32; attempt++) {
    const n = randomInt(REFERENCE_SPACE);
    if (!used.has(n)) return formatReference(n);
  }

  const start = randomInt(REFERENCE_SPACE);
  for (let i = 0; i < REFERENCE_SPACE; i++) {
    const n = (start + i) % REFERENCE_SPACE;
    if (!used.has(n)) return formatReference(n);
  }

  return formatReference(randomInt(REFERENCE_SPACE));
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
