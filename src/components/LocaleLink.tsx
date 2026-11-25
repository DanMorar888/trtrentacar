"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useI18n } from "@/i18n/LocaleProvider";
import { localePath } from "@/i18n/paths";

type LocaleLinkProps = ComponentProps<typeof Link>;

/** Link intern care păstrează limba din adresă (/en, /hu). */
export function LocaleLink({ href, ...props }: LocaleLinkProps) {
  const { locale } = useI18n();
  const localized = typeof href === "string" ? localePath(locale, href) : href;
  return <Link href={localized} {...props} />;
}
