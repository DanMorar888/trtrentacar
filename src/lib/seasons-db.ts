import { promises as fs } from "fs";
import path from "path";
import { unstable_noStore as noStore } from "next/cache";
import type { SeasonPeriod } from "@/data/seasons";

const SEASONS_PATH = path.join(process.cwd(), "data", "seasons.json");

export async function readSeasons(): Promise<SeasonPeriod[]> {
  noStore();
  try {
    const data = await fs.readFile(SEASONS_PATH, "utf-8");
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function writeSeasons(seasons: SeasonPeriod[]): Promise<void> {
  const dir = path.dirname(SEASONS_PATH);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(SEASONS_PATH, JSON.stringify(seasons, null, 2), "utf-8");
}

export function getSeasonById(seasons: SeasonPeriod[], id: string): SeasonPeriod | undefined {
  return seasons.find((s) => s.id === id);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
