import type { Locale } from "@/i18n/config";

export const MAX_FIVE_STAR_REVIEWS = 15;

export type ReviewAgeUnit = "hour" | "day" | "week" | "month" | "year";

export type ReviewAge = {
  amount: number;
  unit: ReviewAgeUnit;
};

export type GooglePlaceSummary = {
  name: string;
  rating: number;
  reviewCount: number;
  mapsUrl: string;
};

export type GoogleReview = {
  name: string;
  stars: number;
  text: string;
  age: ReviewAge;
};

const AGE_UNITS: ReviewAgeUnit[] = ["hour", "day", "week", "month", "year"];

export function isGoogleReview(value: unknown): value is GoogleReview {
  if (!value || typeof value !== "object") return false;
  const review = value as GoogleReview;
  return (
    typeof review.name === "string" &&
    review.name.trim().length > 0 &&
    typeof review.text === "string" &&
    review.text.trim().length > 0 &&
    typeof review.stars === "number" &&
    review.stars >= 1 &&
    review.stars <= 5 &&
    !!review.age &&
    typeof review.age.amount === "number" &&
    review.age.amount >= 0 &&
    AGE_UNITS.includes(review.age.unit)
  );
}

/** Păstrează doar recenziile de 5 stele, în ordinea publică, maximum 15. */
export function selectFiveStarReviews(reviews: GoogleReview[]): GoogleReview[] {
  return reviews.filter((review) => review.stars === 5).slice(0, MAX_FIVE_STAR_REVIEWS);
}

export function formatReviewAge(locale: Locale, age: ReviewAge): string {
  const amount = Math.max(0, Math.round(age.amount));
  if (locale === "en") {
    const labels: Record<ReviewAgeUnit, [string, string]> = {
      hour: ["1 hour ago", `${amount} hours ago`],
      day: ["1 day ago", `${amount} days ago`],
      week: ["1 week ago", `${amount} weeks ago`],
      month: ["1 month ago", `${amount} months ago`],
      year: ["1 year ago", `${amount} years ago`],
    };
    return amount === 1 ? labels[age.unit][0] : labels[age.unit][1];
  }

  if (locale === "hu") {
    const labels: Record<ReviewAgeUnit, [string, string]> = {
      hour: ["1 órája", `${amount} órája`],
      day: ["1 napja", `${amount} napja`],
      week: ["1 hete", `${amount} hete`],
      month: ["1 hónapja", `${amount} hónapja`],
      year: ["1 éve", `${amount} éve`],
    };
    return amount === 1 ? labels[age.unit][0] : labels[age.unit][1];
  }

  if (age.unit === "hour") return amount === 1 ? "acum o oră" : `acum ${amount} ore`;
  if (age.unit === "day") return amount === 1 ? "acum o zi" : `acum ${amount} zile`;
  if (age.unit === "week") return amount === 1 ? "acum o săptămână" : `acum ${amount} săptămâni`;
  if (age.unit === "year") return amount === 1 ? "acum un an" : `acum ${amount} ani`;
  return amount === 1 ? "acum o lună" : `acum ${amount} luni`;
}
