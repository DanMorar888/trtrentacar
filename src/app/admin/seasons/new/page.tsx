import Link from "next/link";
import { SeasonForm } from "../SeasonForm";

export default function NewSeasonPage() {
  return (
    <div>
      <nav className="mb-6 text-sm text-gray-400">
        <Link href="/admin" className="hover:text-primary">
          Admin
        </Link>
        <span className="mx-2">/</span>
        <Link href="/admin/seasons" className="hover:text-primary">
          Sezoane
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-200">Adaugă perioadă</span>
      </nav>
      <h1 className="text-2xl font-bold text-white">Adaugă perioadă de sezon</h1>
      <p className="mt-2 text-gray-300">
        Alege Full sezon sau Extra sezon și luna/ziua, fără an. Perioada se repetă în fiecare an.
      </p>
      <div className="mt-8">
        <SeasonForm season={null} isNew />
      </div>
    </div>
  );
}
