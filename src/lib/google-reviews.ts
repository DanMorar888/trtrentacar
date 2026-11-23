import { promises as fs } from "fs";
import path from "path";
import { siteConfig } from "@/config/site";
import {
  isGoogleReview,
  selectFiveStarReviews,
  type GooglePlaceSummary,
  type GoogleReview,
  type ReviewAge,
} from "@/data/google-reviews";

const CACHE_PATH = path.join(process.cwd(), "data", "google-reviews.json");
const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export type GoogleReviewsSnapshot = {
  place: GooglePlaceSummary;
  reviews: GoogleReview[];
};

type GoogleReviewsCache = GoogleReviewsSnapshot & {
  fetchedAt: string;
};

/**
 * Recenziile citite public pe Google Maps la 12 noiembrie 2026.
 * Lista completă cere autentificare; pagina arată 5 recenzii, toate de 5 stele.
 * Nota afișată: 5,0 din 82 de recenzii.
 */
const PUBLIC_SNAPSHOT: GoogleReviewsSnapshot = {
  place: {
    name: "Transylvania Rent & Tourism",
    rating: 5,
    reviewCount: 82,
    mapsUrl: siteConfig.mapsUrl,
  },
  reviews: [
    {
      name: "Andrada Hoca",
      stars: 5,
      age: { amount: 4, unit: "month" },
      text: "Am avut o experiență excelentă cu TRT. Serviciile de închiriere m-au lasat placut surprinsa au fost foarte rapide și profesioniste. Personalu foarte corect și respectuos am închiriat o mașină și când a venit să ma ia de la aeroport și-a dat seama că o roată se tot dezumflă și mi-a oferit instant posibilitatea de a lua alta mașină la același preț și chiar mai noua de cat ceea care o închiriasem și cutie automata dar mi-a dat și posibilitatea de a merge cu mine la vulcanizare in cazul în care vroiam sa răman la mașina care o închiriasem la început.Sincer  recomand cu încredere această firmă oricarui  are nevoie de un serviciu de închiriere de calitate! Voi apela din nou\ncu siguranță.",
    },
    {
      name: "alina tarta",
      stars: 5,
      age: { amount: 5, unit: "month" },
      text: "Am venit acasa din sua si am cautat o masina de inchiriat. Janos a fost asa dragut si ne-a adus masina si ne-a si dus inapoi la destinatie. Pretul a fost foarte accesibil asa ca il recomand daca ai nevoie de o masina automata.",
    },
    {
      name: "Carla Roberta",
      stars: 5,
      age: { amount: 5, unit: "month" },
      text: "Am rămas extrem de plăcut surprinsă de serviciile oferite! Dl. Janoș Botar este un profesionist desăvârșit, de o amabilitate rară și gata să te ajute în orice moment. Nu cunoșteam bine Clujul și am fost la un pas de a pierde zborul spre aeroport. Datorită promptitudinii și implicării sale, totul s-a rezolvat extrem de rapid și am ajuns la timp. Recomand cu toată încrederea și cu siguranță voi mai apela la serviciile dumnealui!",
    },
    {
      name: "Dumitru Blanariu",
      stars: 5,
      age: { amount: 2, unit: "month" },
      text: "Recomand cu toată încrederea TRT pentru închiriere\nServicii de calitate 10+++\nVom apela fără ezitare la serviciile voastre și in viitor\nMULȚUMIM Janos",
    },
    {
      name: "Daniel Ungurianu",
      stars: 5,
      age: { amount: 6, unit: "month" },
      text: "A fost o experienta plăcută, pare a fi o gama variata de masini, inclusiv accesibile ca pret. Mulțumiri lui Janos pentru tot ajutorul oferit pe întreg procesul. Voi reveni cu siguranță.",
    },
  ],
};

let pending: Promise<GoogleReviewsSnapshot> | null = null;

export function getGoogleReviews(): Promise<GoogleReviewsSnapshot> {
  if (!pending) {
    pending = loadGoogleReviews().finally(() => {
      pending = null;
    });
  }
  return pending;
}

async function loadGoogleReviews(): Promise<GoogleReviewsSnapshot> {
  const cached = await readCache();
  if (cached && isFresh(cached.fetchedAt)) {
    return publish(cached);
  }

  const refreshed = await refreshFromPublicPage(cached);
  await writeCache(refreshed);
  return publish(refreshed);
}

function publish(cache: GoogleReviewsCache): GoogleReviewsSnapshot {
  return {
    place: cache.place,
    reviews: selectFiveStarReviews(cache.reviews),
  };
}

function isFresh(fetchedAt: string): boolean {
  const fetched = Date.parse(fetchedAt);
  if (Number.isNaN(fetched)) return false;
  return Date.now() - fetched < CACHE_MAX_AGE_MS;
}

async function readCache(): Promise<GoogleReviewsCache | null> {
  try {
    const raw = await fs.readFile(CACHE_PATH, "utf-8");
    return normalizeCache(JSON.parse(raw));
  } catch {
    return null;
  }
}

async function writeCache(cache: GoogleReviewsCache): Promise<void> {
  try {
    await fs.mkdir(path.dirname(CACHE_PATH), { recursive: true });
    await fs.writeFile(CACHE_PATH, `${JSON.stringify(cache, null, 2)}\n`, "utf-8");
  } catch {
    // Fișierul poate fi nemodificabil în unele medii; pagina rămâne pe ultimul instantaneu.
  }
}

function normalizeCache(value: unknown): GoogleReviewsCache | null {
  if (!value || typeof value !== "object") return null;
  const cache = value as GoogleReviewsCache;
  if (typeof cache.fetchedAt !== "string") return null;
  if (!cache.place || typeof cache.place.name !== "string" || typeof cache.place.mapsUrl !== "string") return null;
  if (typeof cache.place.rating !== "number" || typeof cache.place.reviewCount !== "number") return null;
  if (!Array.isArray(cache.reviews)) return null;
  const reviews = cache.reviews.filter(isGoogleReview);
  if (reviews.length === 0) return null;
  return {
    fetchedAt: cache.fetchedAt,
    place: {
      name: cache.place.name,
      rating: cache.place.rating,
      reviewCount: cache.place.reviewCount,
      mapsUrl: cache.place.mapsUrl,
    },
    reviews,
  };
}

async function refreshFromPublicPage(previous: GoogleReviewsCache | null): Promise<GoogleReviewsCache> {
  const fallback = previous ?? { ...PUBLIC_SNAPSHOT, fetchedAt: new Date().toISOString() };
  const nextFetchedAt = new Date().toISOString();

  try {
    const response = await fetch(siteConfig.mapsUrl, {
      redirect: "follow",
      cache: "no-store",
      headers: {
        Accept: "text/html",
        "Accept-Language": "ro",
      },
      signal: AbortSignal.timeout(15000),
    });
    const finalUrl = response.url || "";
    const html = (await response.text()).slice(0, 2_000_000);
    if (!response.ok || isBlockedPage(finalUrl, html)) {
      return { ...fallback, fetchedAt: nextFetchedAt };
    }

    const parsed = parsePublicReviews(html);
    if (!parsed || parsed.reviews.length === 0) {
      return { ...fallback, fetchedAt: nextFetchedAt };
    }

    return {
      fetchedAt: nextFetchedAt,
      place: {
        name: fallback.place.name,
        mapsUrl: fallback.place.mapsUrl,
        rating: parsed.rating ?? fallback.place.rating,
        reviewCount: parsed.reviewCount ?? fallback.place.reviewCount,
      },
      reviews: selectFiveStarReviews(parsed.reviews),
    };
  } catch {
    return { ...fallback, fetchedAt: nextFetchedAt };
  }
}

function isBlockedPage(url: string, html: string): boolean {
  const head = html.slice(0, 8000).toLowerCase();
  return (
    url.includes("/sorry/") ||
    head.includes("unusual traffic") ||
    head.includes("g-recaptcha") ||
    head.includes("our systems have detected")
  );
}

function parsePublicReviews(html: string): { rating?: number; reviewCount?: number; reviews: GoogleReview[] } | null {
  const reviews: GoogleReview[] = [];
  let rating: number | undefined;
  let reviewCount: number | undefined;

  for (const match of Array.from(html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi))) {
    try {
      collectJsonLd(JSON.parse(decodeHtml(match[1])), (found) => {
        if (found.rating != null) rating = found.rating;
        if (found.reviewCount != null) reviewCount = found.reviewCount;
        reviews.push(...found.reviews);
      });
    } catch {
      // Blocul nu e JSON public de recenzii.
    }
  }

  const fiveStar = selectFiveStarReviews(reviews);
  if (fiveStar.length === 0) return null;
  return { rating, reviewCount, reviews: fiveStar };
}

function collectJsonLd(
  node: unknown,
  emit: (found: { rating?: number; reviewCount?: number; reviews: GoogleReview[] }) => void,
) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const item of node) collectJsonLd(item, emit);
    return;
  }

  const record = node as Record<string, unknown>;
  if (record.aggregateRating && typeof record.aggregateRating === "object") {
    const aggregate = record.aggregateRating as Record<string, unknown>;
    const rating = numberFrom(aggregate.ratingValue);
    const reviewCount = numberFrom(aggregate.reviewCount ?? aggregate.ratingCount);
    emit({
      rating: rating != null && rating >= 1 && rating <= 5 ? rating : undefined,
      reviewCount: reviewCount != null && reviewCount >= 1 ? Math.round(reviewCount) : undefined,
      reviews: [],
    });
  }

  if (Array.isArray(record.review)) {
    const reviews = record.review.map(reviewFromJsonLd).filter((review): review is GoogleReview => review != null);
    if (reviews.length > 0) emit({ reviews });
  }

  if (record["@graph"]) collectJsonLd(record["@graph"], emit);
}

function reviewFromJsonLd(value: unknown): GoogleReview | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const name = authorName(record.author);
  const text = typeof record.reviewBody === "string" ? record.reviewBody.trim() : "";
  const stars = numberFrom(
    record.reviewRating && typeof record.reviewRating === "object"
      ? (record.reviewRating as Record<string, unknown>).ratingValue
      : undefined,
  );
  const age = typeof record.datePublished === "string" ? ageFromDate(record.datePublished) : null;
  if (!name || !text || stars == null || !age) return null;
  const review = { name, text, stars, age };
  return isGoogleReview(review) ? review : null;
}

function authorName(author: unknown): string {
  if (typeof author === "string") return author.trim();
  if (author && typeof author === "object" && typeof (author as { name?: unknown }).name === "string") {
    return (author as { name: string }).name.trim();
  }
  return "";
}

function numberFrom(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.replace(",", "."));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function ageFromDate(iso: string): ReviewAge | null {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return null;
  const elapsed = Math.max(0, Date.now() - then);
  const days = Math.round(elapsed / 86_400_000);
  if (days >= 365) return { amount: Math.max(1, Math.round(days / 365)), unit: "year" };
  if (days >= 30) return { amount: Math.max(1, Math.round(days / 30)), unit: "month" };
  if (days >= 7) return { amount: Math.max(1, Math.round(days / 7)), unit: "week" };
  if (days >= 1) return { amount: days, unit: "day" };
  return { amount: Math.max(1, Math.round(elapsed / 3_600_000)), unit: "hour" };
}

function decodeHtml(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}
