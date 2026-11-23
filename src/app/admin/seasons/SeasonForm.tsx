"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MONTHS_RO,
  SEASON_TYPE_LABELS,
  daysInMonth,
  isValidMonthDay,
  type SeasonPeriod,
  type SeasonPeriodType,
} from "@/data/seasons";

interface SeasonFormProps {
  season: SeasonPeriod | null;
  isNew: boolean;
}

function dayOptions(month: number): number[] {
  const max = daysInMonth(month) || 31;
  return Array.from({ length: max }, (_, i) => i + 1);
}

export function SeasonForm({ season, isNew }: SeasonFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: season?.name ?? "",
    type: (season?.type ?? "full") as SeasonPeriodType,
    startMonth: season?.startMonth ?? 6,
    startDay: season?.startDay ?? 15,
    endMonth: season?.endMonth ?? 9,
    endDay: season?.endDay ?? 15,
  });

  function update(partial: Partial<typeof form>) {
    setForm((prev) => {
      const next = { ...prev, ...partial };
      const startMax = daysInMonth(next.startMonth);
      const endMax = daysInMonth(next.endMonth);
      if (next.startDay > startMax) next.startDay = startMax;
      if (next.endDay > endMax) next.endDay = endMax;
      return next;
    });
  }

  const startDays = useMemo(() => dayOptions(form.startMonth), [form.startMonth]);
  const endDays = useMemo(() => dayOptions(form.endMonth), [form.endMonth]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!isValidMonthDay(form.startMonth, form.startDay)) {
      setError("Data de început nu este validă (ex. 31 februarie nu există).");
      return;
    }
    if (!isValidMonthDay(form.endMonth, form.endDay)) {
      setError("Data de sfârșit nu este validă (ex. 31 februarie nu există).");
      return;
    }
    setLoading(true);
    try {
      const url = isNew ? "/api/admin/seasons" : `/api/admin/seasons/${season!.id}`;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim() || undefined,
          type: form.type,
          startMonth: form.startMonth,
          startDay: form.startDay,
          endMonth: form.endMonth,
          endDay: form.endDay,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Eroare la salvare");
      router.push("/admin/seasons");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare la salvare");
    } finally {
      setLoading(false);
    }
  }

  const selectClass =
    "w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <form onSubmit={handleSubmit} className="w-full min-w-0 max-w-xl space-y-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div>
        <label htmlFor="season-name" className="mb-1 block text-sm font-medium text-gray-700">
          Nume (opțional)
        </label>
        <input
          id="season-name"
          type="text"
          value={form.name}
          onChange={(e) => update({ name: e.target.value })}
          className={selectClass}
          placeholder="Ex: Vară, Sărbători"
        />
      </div>

      <div>
        <label htmlFor="season-type" className="mb-1 block text-sm font-medium text-gray-700">
          Tip sezon
        </label>
        <select
          id="season-type"
          value={form.type}
          onChange={(e) => update({ type: e.target.value as SeasonPeriodType })}
          className={selectClass}
          required
        >
          <option value="full">{SEASON_TYPE_LABELS.full}</option>
          <option value="extra">{SEASON_TYPE_LABELS.extra}</option>
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <fieldset className="min-w-0">
          <legend className="mb-2 text-sm font-medium text-gray-700">Început</legend>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="season-start-month" className="mb-1 block text-xs text-gray-600">
                Luna
              </label>
              <select
                id="season-start-month"
                value={form.startMonth}
                onChange={(e) => update({ startMonth: Number(e.target.value) })}
                className={selectClass}
                required
              >
                {MONTHS_RO.map((label, i) => (
                  <option key={label} value={i + 1}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="season-start-day" className="mb-1 block text-xs text-gray-600">
                Ziua
              </label>
              <select
                id="season-start-day"
                value={form.startDay}
                onChange={(e) => update({ startDay: Number(e.target.value) })}
                className={selectClass}
                required
              >
                {startDays.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset className="min-w-0">
          <legend className="mb-2 text-sm font-medium text-gray-700">Sfârșit</legend>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="season-end-month" className="mb-1 block text-xs text-gray-600">
                Luna
              </label>
              <select
                id="season-end-month"
                value={form.endMonth}
                onChange={(e) => update({ endMonth: Number(e.target.value) })}
                className={selectClass}
                required
              >
                {MONTHS_RO.map((label, i) => (
                  <option key={label} value={i + 1}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="season-end-day" className="mb-1 block text-xs text-gray-600">
                Ziua
              </label>
              <select
                id="season-end-day"
                value={form.endDay}
                onChange={(e) => update({ endDay: Number(e.target.value) })}
                className={selectClass}
                required
              >
                {endDays.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>
      </div>

      <p className="text-xs text-gray-500">
        Fără an: perioada se repetă în fiecare an. Dacă începutul e după sfârșit (ex. 20 Decembrie – 10 Ianuarie),
        intervalul trece peste Anul Nou. Sezonul întregii închirieri este cel din data de preluare. Dacă Full sezon și
        Extra sezon se suprapun, se aplică Full sezon. În restul anului se folosește Sezon Normal.
      </p>

      <div className="flex flex-wrap gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary min-h-11 disabled:opacity-50">
          {loading ? "Se salvează…" : isNew ? "Adaugă perioada" : "Salvează"}
        </button>
        <Link
          href="/admin/seasons"
          className="inline-flex min-h-11 items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          Anulare
        </Link>
      </div>
    </form>
  );
}
