import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken, getCookieName } from "@/lib/admin-auth";
import { readReservations } from "@/lib/reservations-db";

async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(getCookieName())?.value ?? null;
  return verifyAdminToken(token);
}

export async function GET() {
  const ok = await isAdmin();
  if (!ok) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  const list = await readReservations();
  return NextResponse.json(list);
}
