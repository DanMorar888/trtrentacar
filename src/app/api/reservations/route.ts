import { NextResponse } from "next/server";
import { createReservation } from "@/lib/reservations-db";
import { sendClientRequestReceived, sendAdminNewRequest } from "@/lib/email";
import type { Reservation } from "@/data/reservations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const carSlug = String(body.carSlug ?? "").trim();
    const carName = String(body.carName ?? "").trim();
    const pickupDate = String(body.pickupDate ?? "").trim();
    const returnDate = String(body.returnDate ?? "").trim();
    const pickupTime = String(body.pickupTime ?? "10:00").trim();
    const returnTime = String(body.returnTime ?? "10:00").trim();
    const pickupLocation = String(body.pickupLocation ?? "").trim();
    const returnLocation = String(body.returnLocation ?? "").trim();
    const pickupLocationName = body.pickupLocationName != null ? String(body.pickupLocationName).trim() : undefined;
    const returnLocationName = body.returnLocationName != null ? String(body.returnLocationName).trim() : undefined;
    const days = Math.max(1, Number(body.days) || 1);
    const total = Math.max(0, Number(body.total) || 0);
    const guarantee = Math.max(0, Number(body.guarantee) || 0);
    const scdw = Boolean(body.scdw);
    const extras = body.extras && typeof body.extras === "object" ? body.extras : {};
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const message = body.message != null ? String(body.message).trim() : undefined;
    const flightNumber = body.flightNumber != null ? String(body.flightNumber).trim() : undefined;
    const payment = body.payment === "card_delivery" ? "card_delivery" : body.payment === "bank_transfer" ? "bank_transfer" : "cash";

    if (!carSlug || !carName || !pickupDate || !returnDate || !name || !email || !phone) {
      return NextResponse.json(
        { error: "Lipsesc câmpuri obligatorii." },
        { status: 400 }
      );
    }

    const reservation = await createReservation({
      status: "pending",
      carSlug,
      carName,
      pickupDate,
      returnDate,
      pickupTime,
      returnTime,
      pickupLocation,
      returnLocation,
      pickupLocationName,
      returnLocationName,
      days,
      total,
      guarantee,
      scdw,
      extras,
      name,
      email,
      phone,
      message: message || undefined,
      flightNumber: flightNumber || undefined,
      payment,
    } as Omit<Reservation, "id" | "reference" | "createdAt" | "updatedAt">);

    await sendClientRequestReceived(reservation).catch(() => {});
    await sendAdminNewRequest(reservation).catch(() => {});

    return NextResponse.json({ id: reservation.id, reference: reservation.reference });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Eroare la salvare.";
    console.error("POST /api/reservations", e);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "development" ? message : "Eroare la salvare. Încearcă din nou." },
      { status: 500 }
    );
  }
}
