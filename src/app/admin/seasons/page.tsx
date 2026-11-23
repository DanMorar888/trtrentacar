"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  SEASON_TYPE_LABELS,
  formatMonthDay,
  periodWrapsYear,
  type SeasonPeriod,
} from "@/data/seasons";
import {
  AdminCard,
  AdminCardActions,
  AdminCardRow,
  adminCardDeleteClass,
  adminCardEditClass,
} from "../AdminMobileList";

function periodRangeLabel(period: SeasonPeriod): string {
  const range = `${formatMonthDay(period.startMonth, period.startDay)} → ${formatMonthDay(period.endMonth, period.endDay)}`;
  return periodWrapsYear(period) ? `${range} (peste Anul Nou)` : range;
}

function seasonTypeClass(type: SeasonPeriod["type"]): string {
  return type === "full" ? "font-medium text-green-400" : "font-medium text-sky-400";
}

export default function AdminSeasonsPage() {
  const [seasons, setSeasons] = useState<SeasonPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/seasons")
      .then((res) => {
        if (!res.ok) throw new Error("Neautorizat");
        return res.json();
      })
      .then((data) => setSeasons(Array.isArray(data) ? data : []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string, label: string) {
    if (!confirm(`Ștergi perioada „${label}"?`)) return;
    const res = await fetch(`/api/admin/seasons/${id}`, { method: "DELETE" });
    if (!res.ok) {
      alert("Eroare la ștergere");
      return;
    }
    setSeasons((prev) => prev.filter((s) => s.id !== id));
  }

  if (loading) return <p className="text-gray-400">Se încarcă…</p>;
  if (error) return <p className="text-red-400">{error}. Verifică autentificarea.</p>;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-white">Sezoane</h1>
        <Link href="/admin/seasons/new" className="btn-primary min-h-11">
          Adaugă perioadă
        </Link>
      </div>
      <p className="mt-2 text-sm text-gray-300">
        Perioadele nu au an și se repetă în fiecare an. În zilele fără Full sau Extra sezon se aplică prețul de Sezon
        Normal. Dacă Full sezon și Extra sezon se suprapun, se aplică Full sezon. Prețul întregii închirieri folosește
        sezonul din data de preluare.
      </p>

      <div className="mt-6 space-y-3 md:hidden">
        {seasons.map((s) => {
          const label = s.name || SEASON_TYPE_LABELS[s.type];
          return (
            <AdminCard key={s.id}>
              <dl>
                <AdminCardRow label="Nume">{s.name || "—"}</AdminCardRow>
                <AdminCardRow label="Tip">
                  <span className={seasonTypeClass(s.type)}>{SEASON_TYPE_LABELS[s.type]}</span>
                </AdminCardRow>
                <AdminCardRow label="Perioadă">{periodRangeLabel(s)}</AdminCardRow>
              </dl>
              <AdminCardActions>
                <Link href={`/admin/seasons/${s.id}/edit`} className={adminCardEditClass}>
                  Editează
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(s.id, label)}
                  className={adminCardDeleteClass}
                >
                  Șterge
                </button>
              </AdminCardActions>
            </AdminCard>
          );
        })}
      </div>

      <div className="mt-6 hidden overflow-hidden rounded-xl border border-gray-600 bg-gray-800/50 shadow md:block">
        <table className="min-w-full divide-y divide-gray-600">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">Nume</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">Tip</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">Perioadă</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-400">Acțiuni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-600">
            {seasons.map((s) => {
              const label = s.name || SEASON_TYPE_LABELS[s.type];
              return (
                <tr key={s.id} className="hover:bg-gray-800/80">
                  <td className="px-4 py-3 font-medium text-gray-100">{s.name || "—"}</td>
                  <td className={`px-4 py-3 text-sm ${seasonTypeClass(s.type)}`}>
                    {SEASON_TYPE_LABELS[s.type]}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">{periodRangeLabel(s)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/seasons/${s.id}/edit`}
                      className="mr-3 text-sm font-medium text-green-400 hover:text-green-300 hover:underline"
                    >
                      Editează
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(s.id, label)}
                      className="text-sm text-red-400 hover:underline"
                    >
                      Șterge
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {seasons.length === 0 && (
        <p className="mt-6 text-center text-gray-400">
          Nu există perioade de Full sau Extra sezon. Se aplică prețul de Sezon Normal tot anul, până adaugi o perioadă.
        </p>
      )}
    </div>
  );
}
