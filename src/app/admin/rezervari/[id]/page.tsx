"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { Reservation, ReservationStatus } from "@/data/reservations";
import { RESERVATION_STATUS_LABELS } from "@/data/reservations";
import { formatDisplayDate } from "@/lib/format-date";

export default function AdminRezervareDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : params.id?.[0] ?? null;
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [acting, setActing] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("ID rezervare lipsă");
      return;
    }
    fetch(`/api/admin/reservations/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 401 ? "Neautorizat" : "Rezervare negăsită");
        return res.json();
      })
      .then(setReservation)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function updateStatus(status: ReservationStatus) {
    if (!reservation) return;
    const label = status === "confirmed" ? "Confirmă" : "Anulează";
    if (!confirm(`${label} rezervarea? Clientul va primi un email.`)) return;
    setActing(true);
    try {
      const res = await fetch(`/api/admin/reservations/${reservation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Eroare");
      }
      const updated = await res.json();
      setReservation(updated);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Eroare la actualizare");
    } finally {
      setActing(false);
    }
  }

  if (loading) return <p className="text-gray-400">Se încarcă…</p>;
  if (error) return <p className="text-red-400">{error}. <Link href="/admin/rezervari" className="underline">Înapoi la rezervări</Link></p>;
  if (!reservation) return null;

  const created = new Date(reservation.createdAt).toLocaleDateString("ro-RO", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
  const pickupLoc = reservation.pickupLocationName || reservation.pickupLocation;
  const returnLoc = reservation.returnLocationName || reservation.returnLocation;
  const extrasEntries = reservation.extras && typeof reservation.extras === "object"
    ? Object.entries(reservation.extras)
    : [];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Link href="/admin/rezervari" className="text-sm text-gray-400 hover:text-white">
          ← Rezervări
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-white">Detalii rezervare</h1>
      {reservation.reference && (
        <p className="mt-1 font-mono text-lg font-semibold text-primary">{reservation.reference}</p>
      )}
      <p className="mt-1 text-sm text-gray-400">Solicitare din {created}</p>

      <div className="mt-6 min-w-0 space-y-6 rounded-xl border border-gray-600 bg-gray-800/50 p-4 shadow sm:p-6">
        {/* Status și acțiuni */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-600 pb-4">
          <span>
            {reservation.status === "pending" && (
              <span className="rounded bg-amber-900/50 px-2 py-1 text-sm font-medium text-amber-200">
                {RESERVATION_STATUS_LABELS[reservation.status]}
              </span>
            )}
            {reservation.status === "confirmed" && (
              <span className="rounded bg-green-900/50 px-2 py-1 text-sm font-medium text-green-200">
                {RESERVATION_STATUS_LABELS[reservation.status]}
              </span>
            )}
            {reservation.status === "cancelled" && (
              <span className="rounded bg-gray-700 px-2 py-1 text-sm text-gray-400">
                {RESERVATION_STATUS_LABELS[reservation.status]}
              </span>
            )}
          </span>
          {(reservation.status === "pending" || reservation.status === "confirmed") && (
            <div className="flex flex-wrap gap-2">
              {reservation.status === "pending" && (
                <button
                  type="button"
                  onClick={() => updateStatus("confirmed")}
                  disabled={acting}
                  className="min-h-11 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {acting ? "Se trimite…" : "Confirmă"}
                </button>
              )}
              <button
                type="button"
                onClick={() => updateStatus("cancelled")}
                disabled={acting}
                className="min-h-11 rounded-lg border border-red-500 bg-transparent px-3 py-1.5 text-sm font-medium text-red-400 hover:bg-red-900/30 disabled:opacity-50"
              >
                Anulează
              </button>
            </div>
          )}
        </div>

        {/* Client */}
        <section>
          <h2 className="text-sm font-semibold uppercase text-gray-400">Client</h2>
          <dl className="mt-2 grid gap-2 sm:grid-cols-2">
            <div><dt className="text-xs text-gray-500">Nume</dt><dd className="font-medium text-gray-100">{reservation.name}</dd></div>
            <div className="min-w-0"><dt className="text-xs text-gray-500">Email</dt><dd className="break-all"><a href={`mailto:${reservation.email}`} className="text-primary hover:underline">{reservation.email}</a></dd></div>
            <div><dt className="text-xs text-gray-500">Telefon</dt><dd><a href={`tel:${reservation.phone}`} className="text-gray-200 hover:underline">{reservation.phone}</a></dd></div>
            {reservation.message && (
              <div className="sm:col-span-2"><dt className="text-xs text-gray-500">Mesaj</dt><dd className="mt-0.5 text-gray-300">{reservation.message}</dd></div>
            )}
            {reservation.flightNumber && (
              <div><dt className="text-xs text-gray-500">Zbor</dt><dd className="text-gray-300">{reservation.flightNumber}</dd></div>
            )}
          </dl>
        </section>

        {/* Mașină și perioadă */}
        <section>
          <h2 className="text-sm font-semibold uppercase text-gray-400">Mașină și perioadă</h2>
          <dl className="mt-2 grid gap-2 sm:grid-cols-2">
            <div><dt className="text-xs text-gray-500">Mașină</dt><dd className="font-medium text-gray-100">{reservation.carName}</dd></div>
            <div><dt className="text-xs text-gray-500">Zile</dt><dd className="text-gray-200">{reservation.days}</dd></div>
            <div><dt className="text-xs text-gray-500">Preluare</dt><dd className="text-gray-200">{formatDisplayDate(reservation.pickupDate)} {reservation.pickupTime} – {pickupLoc}</dd></div>
            <div><dt className="text-xs text-gray-500">Predare</dt><dd className="text-gray-200">{formatDisplayDate(reservation.returnDate)} {reservation.returnTime} – {returnLoc}</dd></div>
          </dl>
        </section>

        {/* Preț și plată */}
        <section>
          <h2 className="text-sm font-semibold uppercase text-gray-400">Preț și plată</h2>
          <dl className="mt-2 grid gap-2 sm:grid-cols-2">
            <div><dt className="text-xs text-gray-500">Total</dt><dd className="font-bold text-white">{reservation.total} €</dd></div>
            <div><dt className="text-xs text-gray-500">Garanție</dt><dd className="text-gray-200">{reservation.scdw && reservation.guarantee === 0 ? "0 € (SCDW)" : `${reservation.guarantee} €`}</dd></div>
            <div><dt className="text-xs text-gray-500">SCDW</dt><dd className="text-gray-200">{reservation.scdw ? "Da" : "Nu"}</dd></div>
            <div><dt className="text-xs text-gray-500">Plată</dt><dd className="text-gray-200">{reservation.payment === "cash" ? "Numerar la preluare" : reservation.payment === "card_delivery" ? "Card la predare" : "Transfer bancar"}</dd></div>
          </dl>
        </section>

        {/* Extras */}
        {extrasEntries.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold uppercase text-gray-400">Extras</h2>
            <ul className="mt-2 list-inside list-disc text-gray-300">
              {extrasEntries.map(([key, val]) => (
                <li key={key}>
                  {key}: {typeof val === "number" ? `×${val}` : "da"}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
