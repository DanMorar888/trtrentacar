import { promises as fs } from "fs";
import path from "path";
import type { Car, CarCategory } from "@/data/cars";

const CARS_PATH = path.join(process.cwd(), "data", "cars.json");

export async function readCars(): Promise<Car[]> {
  try {
    const data = await fs.readFile(CARS_PATH, "utf-8");
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function writeCars(cars: Car[]): Promise<void> {
  const dir = path.dirname(CARS_PATH);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(CARS_PATH, JSON.stringify(cars, null, 2), "utf-8");
}

export function getCarBySlug(cars: Car[], slug: string): Car | undefined {
  return cars.find((c) => c.slug === slug);
}

export function getCarById(cars: Car[], id: string): Car | undefined {
  return cars.find((c) => c.id === id);
}

const HOMEPAGE_FALLBACK_COUNT = 6;

export function getFeaturedCars(cars: Car[]): Car[] {
  const featured = cars.filter((c) => c.featured);
  if (featured.length > 0) return featured;
  return sortCarsByPriceAsc(cars).slice(0, HOMEPAGE_FALLBACK_COUNT);
}

export function getCarsByCategory(cars: Car[], category: CarCategory): Car[] {
  return cars.filter((c) => c.category === category);
}

/** Returnează o copie a listei de mașini sortate după preț/zi crescător. */
export function sortCarsByPriceAsc(cars: Car[]): Car[] {
  return [...cars].sort((a, b) => a.pricePerDay - b.pricePerDay);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function slugFromName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
