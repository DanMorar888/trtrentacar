"use client";

import { Suspense } from "react";
import { ReservationWidget } from "@/components/ReservationWidget";

const Fallback = ({ variant }: { variant?: "compact" | "full" }) => (
  <div
    className={`rounded-xl border border-gray-200/80 bg-white shadow-md animate-pulse ${variant === "compact" ? "h-52 p-5" : "h-64 p-6"}`}
  />
);

interface ReservationWidgetWithSuspenseProps {
  variant?: "compact" | "full";
  carSlug?: string;
}

export function ReservationWidgetWithSuspense({ variant = "full", carSlug }: ReservationWidgetWithSuspenseProps) {
  return (
    <Suspense fallback={<Fallback variant={variant} />}>
      <ReservationWidget variant={variant} carSlug={carSlug} />
    </Suspense>
  );
}
