"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  categories,
  DAY_INTERVALS,
  TRACTION_LABELS,
  type CarTraction,
  type DayIntervalKey,
} from "@/data/cars";
import type { Car } from "@/data/cars";

interface CarFormProps {
  car?: Car | null;
  isNew: boolean;
}

export function CarForm({ car, isNew }: CarFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState(() => {
    const pricingByInterval = {} as Record<DayIntervalKey, { pricePerDay: string; scdwPerDay: string }>;
    DAY_INTERVALS.forEach((i) => {
      pricingByInterval[i.key] = {
        pricePerDay: String(car?.pricingByInterval?.[i.key]?.pricePerDay ?? car?.pricePerDay ?? ""),
        scdwPerDay: String(car?.pricingByInterval?.[i.key]?.scdwPerDay ?? car?.scdwPerDay ?? ""),
      };
    });
    const images: string[] = car?.image ? [car.image, ...(car.gallery ?? [])].filter(Boolean) : [];
    return {
    name: car?.name ?? "",
    slug: car?.slug ?? "",
    category: car?.category ?? "economy",
    pricePerDay: car?.pricePerDay ?? 0,
    price3Days: car?.price3Days ?? "",
    guarantee: car?.guarantee ?? 0,
    scdwPerDay: car?.scdwPerDay ?? "",
    pricingByInterval,
    year: car ? (car.year ?? "") : new Date().getFullYear(),
    engine: car?.engine ?? "",
    fuel: car?.fuel ?? "Benzina",
    transmission: car?.transmission ?? "Manuală",
    traction: car?.traction ?? "",
    seats: car?.seats ?? 5,
    doors: car?.doors ?? 4,
    features: car?.features?.join(", ") ?? "",
    images,
    featured: car?.featured ?? false,
  };
  });

  function update(f: Partial<typeof form>) {
    setForm((prev) => ({ ...prev, ...f }));
  }

  function updateInterval(key: DayIntervalKey, field: "pricePerDay" | "scdwPerDay", value: string) {
    setForm((prev) => ({
      ...prev,
      pricingByInterval: {
        ...prev.pricingByInterval,
        [key]: { ...prev.pricingByInterval[key], [field]: value },
      },
    }));
  }

  async function handleImagesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    setError("");
    setUploading(true);
    const slug = form.name || form.slug || "car";
    const newUrls: string[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fd = new FormData();
        fd.set("image", file);
        fd.set("slug", slug);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Eroare upload");
        newUrls.push(data.url);
      }
      update({ images: [...form.images, ...newUrls] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare la încărcare imagini");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removeImage(index: number) {
    update({ images: form.images.filter((_, i) => i !== index) });
  }

  function moveImage(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
    const updated = [...form.images];
    const [moved] = updated.splice(fromIndex, 1);
    if (!moved) return;
    updated.splice(toIndex, 0, moved);
    update({ images: updated });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const pricingByInterval: Record<string, { pricePerDay: number; scdwPerDay?: number }> = {};
    DAY_INTERVALS.forEach((i) => {
      const p = form.pricingByInterval[i.key];
      const pricePerDay = p?.pricePerDay ? Number(p.pricePerDay) : 0;
      const scdwPerDay = p?.scdwPerDay ? Number(p.scdwPerDay) : undefined;
      pricingByInterval[i.key] = { pricePerDay, ...(scdwPerDay != null && scdwPerDay > 0 ? { scdwPerDay } : {}) };
    });
    const firstPrice = form.pricingByInterval["1-3"]?.pricePerDay ? Number(form.pricingByInterval["1-3"].pricePerDay) : form.pricePerDay;
    const firstScdw = form.pricingByInterval["1-3"]?.scdwPerDay ? Number(form.pricingByInterval["1-3"].scdwPerDay) : form.scdwPerDay;
    const payload = {
      ...form,
      image: form.images[0] ?? "",
      gallery: form.images.length > 1 ? form.images.slice(1) : undefined,
      pricePerDay: firstPrice,
      price3Days: form.price3Days === "" ? undefined : Number(form.price3Days),
      scdwPerDay: firstScdw === "" ? undefined : Number(firstScdw),
      pricingByInterval,
      traction: form.traction || undefined,
      features: form.features ? form.features.split(",").map((s) => s.trim()).filter(Boolean) : [],
    };
    try {
      const url = isNew ? "/api/admin/cars" : `/api/admin/cars/${car!.id}`;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Eroare la salvare");
      router.push("/admin/cars");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="min-w-0 space-y-8">
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Imagini</h2>
        <p className="mb-3 text-sm text-gray-600">Poți selecta mai multe fișiere dintr-o dată. Prima imagine este imaginea principală.</p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex flex-wrap gap-3">
            {form.images.map((url, index) => (
              <div
                key={`${url}-${index}`}
                className={`relative ${dragIndex === index ? "opacity-70" : ""}`}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragEnd={() => setDragIndex(null)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragIndex === null) return;
                  moveImage(dragIndex, index);
                  setDragIndex(null);
                }}
              >
                <div className="relative h-32 w-40 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                  <Image src={url} alt="" fill className="object-cover" sizes="160px" />
                </div>
                <span className="mt-1 block text-center text-xs text-gray-500">
                  {index === 0 ? "Principală" : index}
                </span>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600"
                  aria-label="Șterge imaginea"
                >
                  ×
                </button>
              </div>
            ))}
            {form.images.length === 0 && (
              <div className="flex h-32 w-40 shrink-0 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-400">
                Fără imagini
              </div>
            )}
          </div>
          <div>
            <label className="cursor-pointer">
              <span className="inline-block rounded border-0 bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50">
                {uploading ? "Se încarcă…" : "Choose file"}
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={uploading}
                onChange={handleImagesChange}
                className="hidden"
              />
            </label>
            <p className="mt-1 text-xs text-gray-500">JPG, PNG. Recomandat minim 800×600. Selectează una sau mai multe poze.</p>
            <p className="mt-1 text-xs text-gray-500">Poți rearanja ordinea cu drag & drop. Prima poză rămâne imaginea principală.</p>
          </div>
        </div>
        {form.images.length > 0 && (
          <input type="hidden" name="image" value={form.images[0]} />
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Date generale</h2>
        <div className="grid min-w-0 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Nume mașină *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => update({ name: e.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Slug URL</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => update({ slug: e.target.value })}
              placeholder="ex: dacia-logan"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <p className="mt-1 text-xs text-gray-500">Lăsat gol = generat automat din nume</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Categorie</label>
            <select
              value={form.category}
              onChange={(e) => update({ category: e.target.value as Car["category"] })}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Prețuri pe intervale de zile</h2>
        <p className="mb-4 text-sm text-gray-600">
          Preț per zi și asigurare SCDW per zi pentru fiecare interval. Folosit pentru calculul total la rezervare.
        </p>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">Garanție (€) *</label>
          <input
            type="number"
            required
            min={0}
            value={form.guarantee || ""}
            onChange={(e) => update({ guarantee: Number(e.target.value) || 0 })}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:max-w-xs"
          />
        </div>
        <div className="space-y-4">
          {DAY_INTERVALS.map((interval) => (
            <div
              key={interval.key}
              className="min-w-0 rounded-lg border border-gray-100 bg-gray-50/50 p-4 sm:flex sm:items-end sm:gap-4"
            >
              <div className="mb-3 font-medium text-gray-900 sm:mb-0 sm:w-32 sm:shrink-0">
                {interval.label}
              </div>
              <div className="grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500">Preț / zi (€)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.pricingByInterval[interval.key]?.pricePerDay ?? ""}
                    onChange={(e) => updateInterval(interval.key, "pricePerDay", e.target.value)}
                    placeholder="ex: 28"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500">Asigurare SCDW / zi (€)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.pricingByInterval[interval.key]?.scdwPerDay ?? ""}
                    onChange={(e) => updateInterval(interval.key, "scdwPerDay", e.target.value)}
                    placeholder="ex: 15"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Specificații</h2>
        <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">An</label>
            <input
              type="number"
              min={2000}
              max={2030}
              value={form.year || ""}
              onChange={(e) => update({ year: Number(e.target.value) || 0 })}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Motor</label>
            <input
              type="text"
              value={form.engine}
              onChange={(e) => update({ engine: e.target.value })}
              placeholder="ex: 1.0 TSI"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Combustibil</label>
            <select
              value={form.fuel}
              onChange={(e) => update({ fuel: e.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option>Benzina</option>
              <option>Diesel</option>
              <option>Benzina/Hybrid</option>
              <option>Diesel/Plug-in Hybrid</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Cutie viteze</label>
            <select
              value={form.transmission}
              onChange={(e) => update({ transmission: e.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option>Manuală</option>
              <option>Automată</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tracțiune</label>
            <select
              value={form.traction}
              onChange={(e) => update({ traction: e.target.value as CarTraction | "" })}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">– Alege –</option>
              {(Object.entries(TRACTION_LABELS) as [CarTraction, string][]).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Locuri</label>
            <input
              type="number"
              min={1}
              max={9}
              value={form.seats || ""}
              onChange={(e) => update({ seats: Number(e.target.value) || 0 })}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Uși</label>
            <input
              type="number"
              min={2}
              max={5}
              value={form.doors || ""}
              onChange={(e) => update({ doors: Number(e.target.value) || 0 })}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Dotări (separate prin virgulă)</label>
          <input
            type="text"
            value={form.features}
            onChange={(e) => update({ features: e.target.value })}
            placeholder="ex: Aer condiționat, Bluetooth, Navigație"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Afișare</h2>
        <div className="flex gap-6">
          <label className="flex min-h-11 items-center gap-2">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => update({ featured: e.target.checked })}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm text-gray-700">Afișare pe prima pagină</span>
          </label>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={loading} className="btn-primary min-h-11">
          {loading ? "Se salvează…" : isNew ? "Adaugă mașina" : "Salvează modificările"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-outline min-h-11"
        >
          Anulare
        </button>
      </div>
    </form>
  );
}
