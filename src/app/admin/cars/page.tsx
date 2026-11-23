"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { DAY_INTERVALS, type Car } from "@/data/cars";
import {
  AdminCard,
  AdminCardActions,
  AdminCardRow,
  adminCardDeleteClass,
  adminCardEditClass,
} from "../AdminMobileList";

export default function AdminCarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingFeaturedId, setSavingFeaturedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/cars")
      .then((res) => {
        if (!res.ok) throw new Error("Neautorizat");
        return res.json();
      })
      .then(setCars)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleToggleFeatured(car: Car) {
    const next = !car.featured;
    setSavingFeaturedId(car.id);
    try {
      const res = await fetch(`/api/admin/cars/${car.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: next }),
      });
      if (!res.ok) throw new Error("Salvare eșuată");
      setCars((prev) => prev.map((c) => (c.id === car.id ? { ...c, featured: next } : c)));
    } catch {
      alert("Eroare la salvare. Reîncearcă.");
    } finally {
      setSavingFeaturedId(null);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Ștergi mașina „${name}"?`)) return;
    const res = await fetch(`/api/admin/cars/${id}`, { method: "DELETE" });
    if (!res.ok) {
      alert("Eroare la ștergere");
      return;
    }
    setCars((prev) => prev.filter((c) => c.id !== id));
  }

  function exportCarsCsv() {
    if (cars.length === 0) return;

    const csvEscape = (value: unknown) => {
      const text = value == null ? "" : String(value);
      return `"${text.replace(/"/g, '""')}"`;
    };

    const headers = [
      "ID",
      "Slug",
      "Nume",
      "Categorie",
      "Pret pe zi EUR",
      "Garantie EUR",
      "SCDW pe zi EUR",
      "An",
      "Motor",
      "Combustibil",
      "Transmisie",
      "Tractiune",
      "Locuri",
      "Usi",
      "Dotari",
      "Imagine",
      "Galerie",
      "Pe prima pagina",
      ...DAY_INTERVALS.flatMap((interval) => [
        `Pret ${interval.key} zile EUR`,
        `SCDW ${interval.key} zile EUR`,
      ]),
    ];

    const rows = cars.map((car) => {
      const intervalValues = DAY_INTERVALS.flatMap((interval) => {
        const pricing = car.pricingByInterval?.[interval.key];
        return [pricing?.pricePerDay ?? "", pricing?.scdwPerDay ?? ""];
      });

      return [
        car.id,
        car.slug,
        car.name,
        car.categoryLabel || car.category,
        car.pricePerDay,
        car.guarantee,
        car.scdwPerDay ?? "",
        car.year ?? "",
        car.engine,
        car.fuel,
        car.transmission,
        car.traction ?? "",
        car.seats,
        car.doors,
        (car.features || []).join(", "),
        car.image,
        (car.gallery || []).join(", "),
        car.featured ? "Da" : "Nu",
        ...intervalValues,
      ];
    });

    const csvContent = [
      headers.map(csvEscape).join(","),
      ...rows.map((row) => row.map(csvEscape).join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `masini-${dateStamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  if (loading) return <p className="text-gray-400">Se încarcă…</p>;
  if (error) return <p className="text-red-400">{error}. Verifică autentificarea.</p>;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-white">Mașini</h1>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={exportCarsCsv}
            disabled={cars.length === 0}
            className="min-h-11 rounded-lg border border-green-500 px-4 py-2 text-sm font-medium text-green-300 hover:bg-green-900/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Export CSV
          </button>
          <Link href="/admin/cars/new" className="btn-primary min-h-11">
            Adaugă mașină
          </Link>
        </div>
      </div>

      <div className="mt-6 space-y-3 md:hidden">
        {cars.map((car) => (
          <AdminCard key={car.id}>
            <dl>
              <AdminCardRow label="Imagine" stacked>
                <div className="relative h-28 w-full overflow-hidden rounded-lg bg-gray-700">
                  {car.image ? (
                    <Image src={car.image} alt="" fill className="object-cover" sizes="100vw" />
                  ) : (
                    <span className="flex h-full items-center justify-center text-xs text-gray-500">—</span>
                  )}
                </div>
              </AdminCardRow>
              <AdminCardRow label="Nume">{car.name}</AdminCardRow>
              <AdminCardRow label="Categorie">{car.categoryLabel}</AdminCardRow>
              <AdminCardRow label="Preț/zi">{car.pricePerDay} €</AdminCardRow>
              <AdminCardRow label="Pe prima pagină">
                <label
                  className="inline-flex min-h-11 cursor-pointer items-center gap-2"
                  title="Afișare pe prima pagină"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(car.featured)}
                    disabled={savingFeaturedId === car.id}
                    onChange={() => handleToggleFeatured(car)}
                    className="h-5 w-5 rounded border-gray-500 bg-gray-700 text-green-500 focus:ring-2 focus:ring-green-500 focus:ring-offset-0 disabled:cursor-wait disabled:opacity-60"
                  />
                  <span className="text-sm text-gray-300">{car.featured ? "Da" : "Nu"}</span>
                </label>
              </AdminCardRow>
            </dl>
            <AdminCardActions>
              <Link href={`/admin/cars/${car.id}/edit`} className={adminCardEditClass}>
                Editează
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(car.id, car.name)}
                className={adminCardDeleteClass}
              >
                Șterge
              </button>
            </AdminCardActions>
          </AdminCard>
        ))}
      </div>

      <div className="mt-6 hidden overflow-hidden rounded-xl border border-gray-600 bg-gray-800/50 shadow md:block">
        <table className="min-w-full divide-y divide-gray-600">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">Imagine</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">Nume</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">Categorie</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">Preț/zi</th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-400">Pe prima pagină</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-400">Acțiuni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-600">
            {cars.map((car) => (
              <tr key={car.id} className="hover:bg-gray-800/80">
                <td className="px-4 py-3">
                  <div className="relative h-12 w-20 overflow-hidden rounded bg-gray-700">
                    {car.image ? (
                      <Image src={car.image} alt="" fill className="object-cover" sizes="80px" />
                    ) : (
                      <span className="flex h-full items-center justify-center text-xs text-gray-500">—</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-gray-100">{car.name}</td>
                <td className="px-4 py-3 text-sm text-gray-300">{car.categoryLabel}</td>
                <td className="px-4 py-3 text-sm text-gray-300">{car.pricePerDay} €</td>
                <td className="px-4 py-3 text-center">
                  <label
                    className="inline-flex cursor-pointer items-center gap-2"
                    title="Afișare pe prima pagină"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(car.featured)}
                      disabled={savingFeaturedId === car.id}
                      onChange={() => handleToggleFeatured(car)}
                      className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-green-500 focus:ring-2 focus:ring-green-500 focus:ring-offset-0 disabled:cursor-wait disabled:opacity-60"
                    />
                    <span className="hidden text-xs text-gray-400 sm:inline">
                      {car.featured ? "Da" : "Nu"}
                    </span>
                  </label>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/cars/${car.id}/edit`} className="mr-3 text-sm text-green-500 hover:text-green-400 hover:underline">
                    Editează
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(car.id, car.name)}
                    className="text-sm text-red-400 hover:underline"
                  >
                    Șterge
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {cars.length === 0 && (
        <p className="mt-6 text-center text-gray-400">Nicio mașină. Adaugă prima mașină.</p>
      )}
    </div>
  );
}
