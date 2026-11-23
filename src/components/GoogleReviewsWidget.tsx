"use client";

import { useState } from "react";
import type { Locale } from "@/i18n/config";
import {
  formatReviewAge,
  selectFiveStarReviews,
  type GooglePlaceSummary,
  type GoogleReview,
} from "@/data/google-reviews";

type Tone = "light" | "dark";

const copy = {
  ro: {
    basedOn: (count: number) => `Pe baza a ${count} de recenzii`,
    seeOnGoogle: "Vezi pe Google",
    readMore: "Mai mult",
    readLess: "Mai puțin",
    prev: "Recenzii anterioare",
    next: "Recenzii următoare",
    stars: (n: number) => `${n} din 5 stele`,
  },
  en: {
    basedOn: (count: number) => `Based on ${count} reviews`,
    seeOnGoogle: "See on Google",
    readMore: "Read more",
    readLess: "Show less",
    prev: "Previous reviews",
    next: "Next reviews",
    stars: (n: number) => `${n} out of 5 stars`,
  },
} as const;

function GoogleMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.3 4.2-4.2 5.6l6.3 5.3C40.2 36.2 44 30.8 44 24c0-1.3-.1-2.7-.4-3.5z"
      />
    </svg>
  );
}

function Stars({ value, label }: { value: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-lg leading-none tracking-tight text-[#FBBC04]" role="img" aria-label={label}>
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} aria-hidden className={index < value ? "text-[#FBBC04]" : "text-gray-300"}>
          ★
        </span>
      ))}
    </span>
  );
}

export function GoogleReviewsWidget({
  locale,
  tone = "light",
  place,
  reviews,
}: {
  locale: Locale;
  tone?: Tone;
  place: GooglePlaceSummary;
  reviews: GoogleReview[];
}) {
  const t = copy[locale];
  const cards = selectFiveStarReviews(reviews);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const light = tone === "light";
  const ratingLabel = place.rating.toLocaleString(locale === "ro" ? "ro-RO" : "en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  function scrollByCard(direction: number) {
    const scroller = document.getElementById("google-reviews-scroller");
    if (!scroller) return;
    const card = scroller.querySelector("article");
    const distance = card ? card.getBoundingClientRect().width + 16 : scroller.clientWidth * 0.85;
    scroller.scrollBy({ left: direction * distance, behavior: "smooth" });
  }

  return (
    <div className="min-w-0 max-w-full">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <GoogleMark className="h-11 w-11 shrink-0" />
          <div className="min-w-0">
            <p className={`text-3xl font-bold leading-none ${light ? "text-gray-900" : "text-white"}`}>{ratingLabel}</p>
            <div className="mt-1">
              <Stars value={Math.round(place.rating)} label={t.stars(Math.round(place.rating))} />
            </div>
            <p className={`mt-1 text-sm ${light ? "text-gray-600" : "text-gray-300"}`}>
              {t.basedOn(place.reviewCount)}
              <span className="sr-only"> Google, {place.name}</span>
            </p>
          </div>
        </div>
        <a
          href={place.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border-2 border-primary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
        >
          <GoogleMark className="h-4 w-4" />
          {t.seeOnGoogle}
        </a>
      </div>

      <div className="relative mt-6 min-w-0">
        <div
          id="google-reviews-scroller"
          className="grid w-full min-w-0 auto-cols-[85%] grid-flow-col gap-4 overflow-x-auto overscroll-x-contain snap-x snap-mandatory pb-1 [scrollbar-width:none] sm:auto-cols-[calc((100%-1rem)/2)] lg:auto-cols-[calc((100%-2rem)/3)] [&::-webkit-scrollbar]:hidden"
        >
          {cards.map((review, index) => {
            const key = `${review.name}-${index}`;
            const expanded = Boolean(open[key]);
            const long = review.text.length > 220;
            return (
              <article
                key={key}
                className={`flex min-w-0 snap-start flex-col rounded-xl border p-5 ${
                  light ? "border-gray-200 bg-gray-50" : "border-white/70 bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold uppercase text-primary"
                      aria-hidden
                    >
                      {review.name.trim().charAt(0)}
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold text-gray-900">{review.name}</h3>
                      <p className="text-xs text-gray-500">{formatReviewAge(locale, review.age)}</p>
                    </div>
                  </div>
                  <GoogleMark className="h-5 w-5 shrink-0" />
                </div>
                <div className="mt-3">
                  <Stars value={review.stars} label={t.stars(review.stars)} />
                </div>
                <p
                  className={`mt-3 whitespace-pre-line break-words text-sm leading-6 text-gray-600 ${
                    expanded || !long ? "" : "line-clamp-5"
                  }`}
                >
                  {review.text}
                </p>
                {long ? (
                  <button
                    type="button"
                    className="mt-2 self-start text-sm font-semibold text-primary hover:underline"
                    aria-expanded={expanded}
                    onClick={() => setOpen((current) => ({ ...current, [key]: !expanded }))}
                  >
                    {expanded ? t.readLess : t.readMore}
                  </button>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex justify-start gap-2">
        <button
          type="button"
          aria-label={t.prev}
          onClick={() => scrollByCard(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary text-lg text-primary transition hover:bg-primary hover:text-white"
        >
          ‹
        </button>
        <button
          type="button"
          aria-label={t.next}
          onClick={() => scrollByCard(1)}
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary text-lg text-primary transition hover:bg-primary hover:text-white"
        >
          ›
        </button>
      </div>
    </div>
  );
}
