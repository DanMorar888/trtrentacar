"use client";

import { categories, type CarTraction } from "@/data/cars";
import type { Car } from "@/data/cars";
import { interpolate } from "@/i18n/interpolate";
import { useI18n } from "@/i18n/LocaleProvider";

function getUniqueBrands(cars: Car[]): string[] {
  const set = new Set<string>();
  cars.forEach((c) => {
    const first = (c.name ?? "").trim().split(/\s+/)[0];
    if (first) set.add(first);
  });
  return Array.from(set).sort();
}

function getUniqueTransmissions(cars: Car[]): string[] {
  return Array.from(new Set(cars.map((c) => c.transmission))).sort();
}

function getUniqueFuels(cars: Car[]): string[] {
  return Array.from(new Set(cars.map((c) => c.fuel))).sort();
}

function getUniqueSeats(cars: Car[]): number[] {
  return Array.from(new Set(cars.map((c) => c.seats))).sort((a, b) => a - b);
}

function carMatchesTraction(car: Car, tractiune: string): boolean {
  if (!tractiune) return true;
  if (car.traction) return car.traction === tractiune;
  const name = (car.name ?? "").toLowerCase();
  const features = (Array.isArray(car.features) ? car.features.join(" ") : "").toLowerCase();
  const is4x4 = name.includes("4x4") || name.includes("4matic") || name.includes("x-drive") || features.includes("4x4");
  if (tractiune === "4x4") return is4x4;
  if (tractiune === "fata") return !is4x4;
  return false;
}

function is4x4(car: Car): boolean {
  const name = (car.name ?? "").toLowerCase();
  const features = (Array.isArray(car.features) ? car.features.join(" ") : "").toLowerCase();
  return name.includes("4x4") || name.includes("4matic") || name.includes("x-drive") || features.includes("4x4");
}

export interface CarFiltersState {
  clasa: string;
  marca: string;
  cutie: string;
  tractiune: string;
  motorizare: string;
  locuri: string;
}

const defaultState: CarFiltersState = {
  clasa: "",
  marca: "",
  cutie: "",
  tractiune: "",
  motorizare: "",
  locuri: "",
};

interface CarFiltersBarProps {
  cars: Car[];
  filters: CarFiltersState;
  onChange: (f: CarFiltersState) => void;
}

const wrapperClass = "relative min-w-[160px]";
const selectClass =
  "w-full min-h-[2.75rem] appearance-none rounded-lg border border-gray-300 bg-white py-3 pl-4 pr-9 text-base text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";
const chevronClass = "pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500";

export function CarFiltersBar({ cars: carsProp, filters, onChange }: CarFiltersBarProps) {
  const { t } = useI18n();
  const cars = Array.isArray(carsProp) ? carsProp : [];
  const brands = getUniqueBrands(cars);
  const transmissions = getUniqueTransmissions(cars);
  const fuels = getUniqueFuels(cars);
  const seatsOptions = getUniqueSeats(cars);

  const update = (key: keyof CarFiltersState, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const Chevron = () => (
    <svg className={chevronClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );

  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <div className={wrapperClass}>
        <select
          value={filters.clasa}
          onChange={(e) => update("clasa", e.target.value)}
          className={selectClass}
          aria-label={t.fleet.filterClass}
        >
        <option value="">{t.fleet.class}</option>
        {categories
          .filter((cat) => cars.some((c) => c.category === cat.id))
          .map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.label}
          </option>
        ))}
        </select>
        <Chevron />
      </div>
      <div className={wrapperClass}>
        <select
          value={filters.marca}
        onChange={(e) => update("marca", e.target.value)}
        className={selectClass}
        aria-label={t.fleet.filterBrand}
      >
        <option value="">{t.fleet.brand}</option>
        {brands.map((b) => (
          <option key={b} value={b}>
            {b}
          </option>
        ))}
        </select>
        <Chevron />
      </div>
      <div className={wrapperClass}>
        <select
          value={filters.cutie}
          onChange={(e) => update("cutie", e.target.value)}
          className={selectClass}
          aria-label={t.fleet.filterGearbox}
        >
        <option value="">{t.fleet.gearbox}</option>
        {transmissions.map((item) => (
          <option key={item} value={item}>
            {t.specs[item as keyof typeof t.specs] ?? item}
          </option>
        ))}
        </select>
        <Chevron />
      </div>
      <div className={wrapperClass}>
        <select
          value={filters.tractiune}
          onChange={(e) => update("tractiune", e.target.value)}
          className={selectClass}
          aria-label={t.fleet.filterTraction}
        >
          <option value="">{t.fleet.traction}</option>
          {(Object.keys(t.traction) as CarTraction[]).map((value) => (
            <option key={value} value={value}>
              {t.traction[value]}
            </option>
          ))}
        </select>
        <Chevron />
      </div>
      <div className={wrapperClass}>
        <select
          value={filters.motorizare}
          onChange={(e) => update("motorizare", e.target.value)}
          className={selectClass}
          aria-label="Filtrează după motorizare"
        >
          <option value="">Motorizare</option>
          {fuels.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
        <Chevron />
      </div>
      <div className={wrapperClass}>
        <select
          value={filters.locuri}
          onChange={(e) => update("locuri", e.target.value)}
          className={selectClass}
          aria-label={t.fleet.filterSeats}
        >
        <option value="">{t.fleet.seats}</option>
        {seatsOptions.map((n) => (
          <option key={n} value={String(n)}>
            {interpolate(t.fleet.seatsCount, { n })}
          </option>
        ))}
        </select>
        <Chevron />
      </div>
    </div>
  );
}

/** Aplică filtrele pe lista de mașini */
export function filterCars(cars: Car[], filters: CarFiltersState): Car[] {
  const list = Array.isArray(cars) ? cars : [];
  return list.filter((car) => {
    if (filters.clasa && car.category !== filters.clasa) return false;
    const brand = (car.name ?? "").trim().split(/\s+/)[0];
    if (filters.marca && brand !== filters.marca) return false;
    if (filters.cutie && car.transmission !== filters.cutie) return false;
    if (filters.tractiune && !carMatchesTraction(car, filters.tractiune)) return false;
    if (filters.motorizare && car.fuel !== filters.motorizare) return false;
    if (filters.locuri && car.seats !== Number(filters.locuri)) return false;
    return true;
  });
}

export { defaultState as defaultFiltersState };
