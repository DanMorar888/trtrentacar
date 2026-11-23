import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken, getCookieName } from "@/lib/admin-auth";
import { readCars, writeCars, generateId, slugFromName } from "@/lib/cars-db";
import { CATEGORY_LABELS, DAY_INTERVALS } from "@/data/cars";
import type { Car, CarCategory, DayIntervalKey, PricingByInterval } from "@/data/cars";

function isAdmin(): Promise<boolean> {
  return (async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get(getCookieName())?.value ?? null;
    return verifyAdminToken(token);
  })();
}

export async function GET() {
  const ok = await isAdmin();
  if (!ok) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  const cars = await readCars();
  return NextResponse.json(cars);
}

export async function POST(request: Request) {
  const ok = await isAdmin();
  if (!ok) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const body = await request.json();
  const slug = (body.slug || slugFromName(body.name || "")).trim() || slugFromName("masina");
  const category = (body.category || "economy") as CarCategory;
  const categoryLabel = CATEGORY_LABELS[category] ?? body.categoryLabel ?? "Economy";

  const pricingByInterval = body.pricingByInterval && typeof body.pricingByInterval === "object"
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
  const firstInterval = pricingByInterval?.["1-3"];
  const pricePerDay = (firstInterval?.pricePerDay ?? Number(body.pricePerDay)) || 0;
  const scdwPerDay = firstInterval?.scdwPerDay ?? (body.scdwPerDay != null ? Number(body.scdwPerDay) : undefined);

  const newCar: Car = {
    id: generateId(),
    slug,
    name: body.name || "Mașină nouă",
    category,
    categoryLabel,
    pricePerDay,
    price3Days: body.price3Days != null ? Number(body.price3Days) : undefined,
    guarantee: Number(body.guarantee) || 0,
    scdwPerDay,
    pricingByInterval,
    year: Number(body.year) || new Date().getFullYear(),
    engine: body.engine || "",
    fuel: body.fuel || "Benzina",
    transmission: body.transmission || "Manuală",
    traction: body.traction || undefined,
    seats: Number(body.seats) || 5,
    doors: Number(body.doors) || 4,
    features: Array.isArray(body.features) ? body.features : (body.features ? String(body.features).split(",").map((s: string) => s.trim()).filter(Boolean) : []),
    image: body.image || "/images/cars/placeholder.jpg",
    gallery: Array.isArray(body.gallery) ? body.gallery : undefined,
    featured: Boolean(body.featured),
  };

  const cars = await readCars();
  if (cars.some((c) => c.slug === newCar.slug)) {
    return NextResponse.json({ error: "Slug deja există" }, { status: 400 });
  }
  cars.push(newCar);
  await writeCars(cars);
  return NextResponse.json(newCar);
}
