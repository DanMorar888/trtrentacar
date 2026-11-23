import Link from "next/link";
import { notFound } from "next/navigation";
import { readSeasons, getSeasonById } from "@/lib/seasons-db";
import { SEASON_TYPE_LABELS } from "@/data/seasons";
import { SeasonForm } from "../../SeasonForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSeasonPage({ params }: PageProps) {
  const { id } = await params;
  const seasons = await readSeasons();
  const season = getSeasonById(seasons, id);
  if (!season) notFound();

  const title = season.name || SEASON_TYPE_LABELS[season.type];

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
        <span className="text-gray-200">{title}</span>
      </nav>
      <h1 className="text-2xl font-bold text-white">Editează perioada</h1>
      <p className="mt-2 text-gray-300">{title}</p>
      <div className="mt-8">
        <SeasonForm season={season} isNew={false} />
      </div>
    </div>
  );
}
