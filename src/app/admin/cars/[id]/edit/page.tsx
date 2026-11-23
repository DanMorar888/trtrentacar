import Link from "next/link";
import { notFound } from "next/navigation";
import { readCars, getCarById } from "@/lib/cars-db";
import { CarForm } from "../../CarForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCarPage({ params }: PageProps) {
  const { id } = await params;
  const cars = await readCars();
  const car = getCarById(cars, id);
  if (!car) notFound();

  return (
    <div>
      <nav className="mb-6 text-sm text-gray-400">
        <Link href="/admin" className="hover:text-primary">Admin</Link>
        <span className="mx-2">/</span>
        <Link href="/admin/cars" className="hover:text-primary">Mașini</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-200">{car.name}</span>
      </nav>
      <h1 className="text-2xl font-bold text-white">Editează mașina</h1>
      <p className="mt-2 text-gray-300">{car.name}</p>
      <div className="mt-8">
        <CarForm car={car} isNew={false} />
      </div>
    </div>
  );
}
