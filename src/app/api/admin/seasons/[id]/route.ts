import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken, getCookieName } from "@/lib/admin-auth";
import { readSeasons, writeSeasons, getSeasonById } from "@/lib/seasons-db";
import { parseSeasonPeriodInput, type SeasonPeriod } from "@/data/seasons";

async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(getCookieName())?.value ?? null;
  return verifyAdminToken(token);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ok = await isAdmin();
  if (!ok) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const { id } = await params;
  const seasons = await readSeasons();
  const season = getSeasonById(seasons, id);
  if (!season) return NextResponse.json({ error: "Perioada nu există" }, { status: 404 });
  return NextResponse.json(season);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ok = await isAdmin();
  if (!ok) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Date invalide" }, { status: 400 });
  }

  const seasons = await readSeasons();
  const index = seasons.findIndex((s) => s.id === id);
  if (index === -1) return NextResponse.json({ error: "Perioada nu există" }, { status: 404 });

  const parsed = parseSeasonPeriodInput(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const updated: SeasonPeriod = {
    id,
    ...parsed.period,
  };

  seasons[index] = updated;
  await writeSeasons(seasons);
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ok = await isAdmin();
  if (!ok) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const { id } = await params;
  const seasons = await readSeasons();
  const filtered = seasons.filter((s) => s.id !== id);
  if (filtered.length === seasons.length) {
    return NextResponse.json({ error: "Perioada nu există" }, { status: 404 });
  }
  await writeSeasons(filtered);
  return NextResponse.json({ ok: true });
}
