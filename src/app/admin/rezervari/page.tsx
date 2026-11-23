"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Reservation, ReservationStatus } from "@/data/reservations";
import { RESERVATION_STATUS_LABELS } from "@/data/reservations";
import { formatDisplayDate } from "@/lib/format-date";
import {
  AdminCard,
  AdminCardActions,
  AdminCardRow,
  adminCardDeleteClass,
  adminCardEditClass,
  adminCardSecondaryClass,
} from "../AdminMobileList";

export default function AdminRezervariPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/reservations")
      .then((res) => {
        if (!res.ok) throw new Error("Neautorizat");
        return res.json();
      })
      .then(setReservations)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function updateStatus(id: string, status: ReservationStatus) {
    const label = status === "confirmed" ? "Confirmă" : "Anulează";
    if (!confirm(`${label} rezervarea? Clientul va primi un email.`)) return;
    setActing(id);
    try {
      const res = await fetch(`/api/admin/reservations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Eroare");
      }
      const updated = await res.json();
      setReservations((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Eroare la actualizare");
    } finally {
      setActing(null);
    }
  }

  function exportReservationsCsv() {
    if (reservations.length === 0) return;

    const csvEscape = (value: unknown) => {
      const text = value == null ? "" : String(value);
      return `"${text.replace(/"/g, '""')}"`;
    };

    const paymentLabels: Record<Reservation["payment"], string> = {
      cash: "Numerar la preluare",
      card_delivery: "Card la predare",
      bank_transfer: "Transfer bancar",
    };

    const headers = [
      "ID",
      "Nr. rezervare",
      "Status",
      "Data creare",
      "Data actualizare",
      "Client",
      "Email",
      "Telefon",
      "Mesaj",
      "Zbor",
      "Masina",
      "Slug masina",
      "Preluare data",
      "Preluare ora",
      "Preluare locatie",
      "Predare data",
      "Predare ora",
      "Predare locatie",
      "Zile",
      "Total EUR",
      "Garantie EUR",
      "SCDW",
      "Plata",
      "Extras",
    ];

    const rows = reservations.map((r) => [
      r.id,
      r.reference || "",
      RESERVATION_STATUS_LABELS[r.status],
      r.createdAt,
      r.updatedAt,
      r.name,
      r.email,
      r.phone,
      r.message || "",
      r.flightNumber || "",
      r.carName,
      r.carSlug,
      r.pickupDate,
      r.pickupTime,
      r.pickupLocationName || r.pickupLocation,
      r.returnDate,
      r.returnTime,
      r.returnLocationName || r.returnLocation,
      r.days,
      r.total,
      r.guarantee,
      r.scdw ? "Da" : "Nu",
      paymentLabels[r.payment],
      JSON.stringify(r.extras || {}),
    ]);

    const csvContent = [
      headers.map(csvEscape).join(","),
      ...rows.map((row) => row.map(csvEscape).join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `rezervari-${dateStamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  if (loading) return <p className="text-gray-400">Se încarcă…</p>;
  if (error) return <p className="text-red-400">{error}. Verifică autentificarea.</p>;

  const pending = reservations.filter((r) => r.status === "pending");
  const others = reservations.filter((r) => r.status !== "pending");

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Rezervări</h1>
          <p className="mt-2 text-gray-300">
            Solicitările de rezervare sunt salvate aici. Confirmă sau anulează; clientul și tu veți primi email-uri.
          </p>
        </div>
        <button
          type="button"
          onClick={exportReservationsCsv}
          disabled={reservations.length === 0}
          className="min-h-11 rounded-lg border border-green-500 px-4 py-2 text-sm font-medium text-green-300 hover:bg-green-900/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Export CSV
        </button>
      </div>

      <div className="mt-6 space-y-3 md:hidden">
        {[...pending, ...others].map((r) => (
          <AdminCard key={r.id}>
            <dl>
              <AdminCardRow label="Nr. rezervare">
                <span className="font-mono font-medium text-primary">{r.reference || "—"}</span>
              </AdminCardRow>
              <AdminCardRow label="Data">
                {new Date(r.createdAt).toLocaleDateString("ro-RO", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </AdminCardRow>
              <AdminCardRow label="Client / Mașină" stacked>
                <div className="font-medium text-gray-100">{r.name}</div>
                <div className="break-all text-sm text-gray-300">{r.email}</div>
                <div className="text-sm text-gray-400">{r.carName}</div>
              </AdminCardRow>
              <AdminCardRow label="Preluare – Predare" stacked>
                {formatDisplayDate(r.pickupDate)} {r.pickupTime} → {formatDisplayDate(r.returnDate)} {r.returnTime}
              </AdminCardRow>
              <AdminCardRow label="Total">
                <span className="font-semibold">{r.total} €</span>
              </AdminCardRow>
              <AdminCardRow label="Status">
                {r.status === "pending" && (
                  <span className="rounded bg-amber-900/50 px-2 py-0.5 text-xs font-medium text-amber-200">
                    {RESERVATION_STATUS_LABELS[r.status]}
                  </span>
                )}
                {r.status === "confirmed" && (
                  <span className="rounded bg-green-900/50 px-2 py-0.5 text-xs font-medium text-green-200">
                    {RESERVATION_STATUS_LABELS[r.status]}
                  </span>
                )}
                {r.status === "cancelled" && (
                  <span className="rounded bg-gray-700 px-2 py-0.5 text-xs text-gray-400">
                    {RESERVATION_STATUS_LABELS[r.status]}
                  </span>
                )}
              </AdminCardRow>
            </dl>
            <AdminCardActions>
              <Link href={`/admin/rezervari/${r.id}`} className={adminCardEditClass}>
                Vezi detalii
              </Link>
              {r.status === "pending" && (
                <button
                  type="button"
                  onClick={() => updateStatus(r.id, "confirmed")}
                  disabled={acting === r.id}
                  className={`${adminCardSecondaryClass} border-green-500 text-green-300 hover:bg-green-900/30 disabled:opacity-50`}
                >
                  {acting === r.id ? "Se trimite…" : "Confirmă"}
                </button>
              )}
              {(r.status === "pending" || r.status === "confirmed") && (
                <button
                  type="button"
                  onClick={() => updateStatus(r.id, "cancelled")}
                  disabled={acting === r.id}
                  className={`${adminCardDeleteClass} disabled:opacity-50`}
                >
                  Anulează
                </button>
              )}
            </AdminCardActions>
          </AdminCard>
        ))}
      </div>

      <div className="mt-6 hidden overflow-hidden rounded-xl border border-gray-600 bg-gray-800/50 shadow md:block">
        <table className="min-w-full divide-y divide-gray-600">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">Nr. rezervare</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">Data</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">Client / Mașină</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">Preluare – Predare</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">Total</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">Status</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-400">Acțiuni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-600">
            {[...pending, ...others].map((r) => (
              <tr key={r.id} className="hover:bg-gray-800/80">
                <td className="px-4 py-3 font-mono text-sm font-medium text-primary">{r.reference || "—"}</td>
                <td className="px-4 py-3 text-sm text-gray-300">
                  {new Date(r.createdAt).toLocaleDateString("ro-RO", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-100">{r.name}</div>
                  <div className="text-sm text-gray-300">{r.email}</div>
                  <div className="text-sm text-gray-400">{r.carName}</div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">
                  {formatDisplayDate(r.pickupDate)} {r.pickupTime} → {formatDisplayDate(r.returnDate)} {r.returnTime}
                </td>
                <td className="px-4 py-3 font-semibold text-gray-100">{r.total} €</td>
                <td className="px-4 py-3">
                  {r.status === "pending" && (
                    <span className="rounded bg-amber-900/50 px-2 py-0.5 text-xs font-medium text-amber-200">
                      {RESERVATION_STATUS_LABELS[r.status]}
                    </span>
                  )}
                  {r.status === "confirmed" && (
                    <span className="rounded bg-green-900/50 px-2 py-0.5 text-xs font-medium text-green-200">
                      {RESERVATION_STATUS_LABELS[r.status]}
                    </span>
                  )}
                  {r.status === "cancelled" && (
                    <span className="rounded bg-gray-700 px-2 py-0.5 text-xs text-gray-400">
                      {RESERVATION_STATUS_LABELS[r.status]}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/rezervari/${r.id}`}
                    className="mr-3 text-sm font-medium text-green-400 hover:text-green-300 hover:underline"
                  >
                    Vezi detalii
                  </Link>
                  {r.status === "pending" && (
                    <button
                      type="button"
                      onClick={() => updateStatus(r.id, "confirmed")}
                      disabled={acting === r.id}
                      className="mr-2 text-sm font-medium text-green-400 hover:underline disabled:opacity-50"
                    >
                      {acting === r.id ? "Se trimite…" : "Confirmă"}
                    </button>
                  )}
                  {(r.status === "pending" || r.status === "confirmed") && (
                    <button
                      type="button"
                      onClick={() => updateStatus(r.id, "cancelled")}
                      disabled={acting === r.id}
                      className="text-sm text-red-400 hover:underline disabled:opacity-50"
                    >
                      Anulează
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {reservations.length === 0 && (
        <p className="mt-6 text-center text-gray-400">Nicio rezervare încă.</p>
      )}
    </div>
  );
}
