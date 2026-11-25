"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@/i18n/LocaleProvider";
import { localePath } from "@/i18n/paths";

interface RezervaAcumLinkProps {
  carSlug: string;
  className?: string;
  children?: React.ReactNode;
}

/** Link „Rezerva acum” care include întotdeauna parametrii din URL (pickup, return, loc, returnLoc). */
export function RezervaAcumLink({ carSlug, className, children }: RezervaAcumLinkProps) {
  const { t, locale } = useI18n();
  const searchParams = useSearchParams();
  const pickup = searchParams.get("pickup") ?? "";
  const returnParam = searchParams.get("return") ?? "";
  const pickupTime = searchParams.get("pickupTime") ?? "10:00";
  const returnTime = searchParams.get("returnTime") ?? "10:00";
  const loc = searchParams.get("loc") ?? "";
  const returnLoc = searchParams.get("returnLoc") ?? "";

  const params = new URLSearchParams();
  params.set("car", carSlug);
  if (pickup) params.set("pickup", pickup);
  if (returnParam) params.set("return", returnParam);
  params.set("pickupTime", pickupTime);
  params.set("returnTime", returnTime);
  if (loc) params.set("loc", loc);
  if (returnLoc) params.set("returnLoc", returnLoc);

  const href = localePath(locale, `/rezervare?${params.toString()}`);

  return (
    <Link href={href} className={className}>
      {children ?? t.car.bookNow}
    </Link>
  );
}
