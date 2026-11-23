import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Panou admin</h1>
      <p className="mt-2 text-gray-300">Gestionează mașinile afișate pe site.</p>
      <div className="mt-8 grid min-w-0 gap-4 sm:grid-cols-2">
        <Link
          href="/admin/cars"
          className="rounded-xl border border-gray-600 bg-gray-800/50 p-6 shadow-sm hover:border-primary hover:shadow-md"
        >
          <h2 className="font-semibold text-white">Mașini</h2>
          <p className="mt-1 text-sm text-gray-400">Vezi, adaugă, editează sau șterge mașinile din flotă.</p>
        </Link>
        <Link
          href="/admin/cars/new"
          className="rounded-xl border border-gray-600 bg-gray-800/50 p-6 shadow-sm hover:border-primary hover:shadow-md"
        >
          <h2 className="font-semibold text-white">Adaugă mașină</h2>
          <p className="mt-1 text-sm text-gray-400">Adaugă o mașină nouă cu toate detaliile și poza.</p>
        </Link>
        <Link
          href="/admin/seasons"
          className="rounded-xl border border-gray-600 bg-gray-800/50 p-6 shadow-sm hover:border-primary hover:shadow-md"
        >
          <h2 className="font-semibold text-white">Sezoane</h2>
          <p className="mt-1 text-sm text-gray-400">Perioade anuale de Full sezon și Extra sezon, fără an.</p>
        </Link>
        <Link
          href="/admin/rezervari"
          className="rounded-xl border border-gray-600 bg-gray-800/50 p-6 shadow-sm hover:border-primary hover:shadow-md"
        >
          <h2 className="font-semibold text-white">Rezervări</h2>
          <p className="mt-1 text-sm text-gray-400">Solicitările de rezervare. Confirmă sau anulează; clientul primește email.</p>
        </Link>
      </div>
    </div>
  );
}
