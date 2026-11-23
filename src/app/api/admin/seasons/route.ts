import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken, getCookieName } from "@/lib/admin-auth";
import { readSeasons, writeSeasons, generateId } from "@/lib/seasons-db";
import { parseSeasonPeriodInput, type SeasonPeriod } from "@/data/seasons";

async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(getCookieName())?.value ?? null;
  return verifyAdminToken(token);
}

export async function GET() {
  const ok = await isAdmin();
  if (!ok) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  const seasons = await readSeasons();
  return NextResponse.json(seasons);
}

export async function POST(request: Request) {
  const ok = await isAdmin();
  if (!ok) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Date invalide" }, { status: 400 });
  }

  const parsed = parseSeasonPeriodInput(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const newPeriod: SeasonPeriod = {
    id: generateId(),
    ...parsed.period,
  };

  const seasons = await readSeasons();
  seasons.push(newPeriod);
  await writeSeasons(seasons);
  return NextResponse.json(newPeriod);
}
