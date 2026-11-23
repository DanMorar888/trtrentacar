import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken, getCookieName } from "@/lib/admin-auth";
import { readReservations, getReservationById, updateReservationStatus } from "@/lib/reservations-db";
import {
  sendClientConfirmed,
  sendClientCancelled,
  sendAdminStatusChange,
} from "@/lib/email";
import type { ReservationStatus } from "@/data/reservations";

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
  const list = await readReservations();
  const reservation = getReservationById(list, id);
  if (!reservation) return NextResponse.json({ error: "Rezervare negăsită" }, { status: 404 });

  return NextResponse.json(reservation);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ok = await isAdmin();
  if (!ok) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const status = body.status === "cancelled" ? "cancelled" : body.status === "confirmed" ? "confirmed" : null;
  if (!status) {
    return NextResponse.json({ error: "Status invalid." }, { status: 400 });
  }

  const list = await readReservations();
  const reservation = list.find((r) => r.id === id);
  if (!reservation) return NextResponse.json({ error: "Rezervare negăsită" }, { status: 404 });

  const canConfirm = reservation.status === "pending" && status === "confirmed";
  const canCancel = (reservation.status === "pending" || reservation.status === "confirmed") && status === "cancelled";
  if (!canConfirm && !canCancel) {
    return NextResponse.json(
      { error: reservation.status === "cancelled" ? "Rezervarea anulată nu mai poate fi modificată." : "Rezervarea nu mai poate fi modificată." },
      { status: 400 }
    );
  }

  const updated = await updateReservationStatus(id, status as ReservationStatus);
  if (!updated) return NextResponse.json({ error: "Eroare la actualizare" }, { status: 500 });

  if (status === "confirmed") {
    await sendClientConfirmed(updated).catch(() => {});
  } else {
    await sendClientCancelled(updated).catch(() => {});
  }
  await sendAdminStatusChange(updated).catch(() => {});

  return NextResponse.json(updated);
}
