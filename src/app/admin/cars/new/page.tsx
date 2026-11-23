import Link from "next/link";
import { CarForm } from "../CarForm";

export default function NewCarPage() {
  return (
    <div>
      <nav className="mb-6 text-sm text-gray-400">
        <Link href="/admin" className="hover:text-primary">Admin</Link>
        <span className="mx-2">/</span>
        <Link href="/admin/cars" className="hover:text-primary">Mașini</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-200">Adaugă mașină</span>
      </nav>
      <h1 className="text-2xl font-bold text-white">Adaugă mașină</h1>
      <p className="mt-2 text-gray-300">Completează detaliile și încarcă o imagine.</p>
      <div className="mt-8">
        <CarForm car={null} isNew />
      </div>
    </div>
  );
}
