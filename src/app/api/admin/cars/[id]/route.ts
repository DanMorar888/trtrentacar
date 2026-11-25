import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminRole, getCookieName } from "@/lib/admin-auth";
import type { AdminRole } from "@/lib/admin-credentials";
import { readCars, writeCars, getCarById, slugFromName } from "@/lib/cars-db";
import { CATEGORY_LABELS, DAY_INTERVALS } from "@/data/cars";
import type { Car, CarCategory, DayIntervalKey, PricingByInterval } from "@/data/cars";

async function adminRole(): Promise<AdminRole | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(getCookieName())?.value ?? null;
  return getAdminRole(token);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const role = await adminRole();
  if (!role) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const cars = await readCars();
  const index = cars.findIndex((c) => c.id === id);
  if (index === -1) return NextResponse.json({ error: "Mașina nu există" }, { status: 404 });

  const existing = cars[index];
  const slug = (body.slug ?? existing.slug).trim() || slugFromName(body.name || existing.name);
  const category = (body.category ?? existing.category) as CarCategory;
  const categoryLabel = CATEGORY_LABELS[category] ?? body.categoryLabel ?? existing.categoryLabel;

  const pricingByInterval =
    body.pricingByInterval && typeof body.pricingByInterval === "object"
      ? (() => {
          const out: PricingByInterval = {};
          DAY_INTERVALS.forEach((i) => {
            const p = body.pricingByInterval[i.key];
            if (p && (Number(p.pricePerDay) || 0) > 0) {
              out[i.key as DayIntervalKey] = {
                pricePerDay: Number(p.pricePerDay) || 0,
                scdwPerDay: p.scdwPerDay != null && p.scdwPerDay !== "" ? Number(p.scdwPerDay) : undefined,
              };
            }
          });
          return Object.keys(out).length ? out : undefined;
        })()
      : undefined;
  const resolvedPricing = pricingByInterval ?? existing.pricingByInterval;
  const firstInterval = resolvedPricing?.["1-3"];
  const pricePerDay =
    body.pricePerDay != null
      ? Number(body.pricePerDay)
      : firstInterval?.pricePerDay ?? existing.pricePerDay;
  const scdwPerDay =
    body.scdwPerDay !== undefined
      ? (body.scdwPerDay === "" ? undefined : Number(body.scdwPerDay))
      : firstInterval?.scdwPerDay ?? existing.scdwPerDay;

  const updated: Car = {
    ...existing,
    slug,
    name: body.name ?? existing.name,
    category,
    categoryLabel,
    pricePerDay,
    price3Days: body.price3Days !== undefined ? (body.price3Days === "" ? undefined : Number(body.price3Days)) : existing.price3Days,
    guarantee: body.guarantee != null ? Number(body.guarantee) : existing.guarantee,
    scdwPerDay,
    pricingByInterval: resolvedPricing,
    year: body.year != null ? Number(body.year) : existing.year,
    engine: body.engine ?? existing.engine,
    fuel: body.fuel ?? existing.fuel,
    transmission: body.transmission ?? existing.transmission,
    traction: body.traction !== undefined ? (body.traction || undefined) : existing.traction,
    seats: body.seats != null ? Number(body.seats) : existing.seats,
    doors: body.doors != null ? Number(body.doors) : existing.doors,
    features: Array.isArray(body.features) ? body.features : (body.features != null ? String(body.features).split(",").map((s: string) => s.trim()).filter(Boolean) : existing.features),
    image: body.image ?? existing.image,
    gallery: body.gallery !== undefined ? (Array.isArray(body.gallery) ? body.gallery : undefined) : existing.gallery,
    featured: body.featured !== undefined ? Boolean(body.featured) : existing.featured,
  };

  if (slug !== existing.slug && cars.some((c) => c.id !== id && c.slug === slug)) {
    return NextResponse.json({ error: "Slug deja există" }, { status: 400 });
  }

  cars[index] = updated;
  await writeCars(cars);
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const role = await adminRole();
  if (!role) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  if (role === "limited") {
    return NextResponse.json({ error: "Nu poți șterge mașini." }, { status: 403 });
  }

  const { id } = await params;
  const cars = await readCars();
  const filtered = cars.filter((c) => c.id !== id);
  if (filtered.length === cars.length) return NextResponse.json({ error: "Mașina nu există" }, { status: 404 });
  await writeCars(filtered);
  return NextResponse.json({ ok: true });
}
