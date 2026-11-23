import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/i18n/get-locale";
import { buildPageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = getLocale();
  const t = getDictionary(locale);
  return buildPageMetadata({
    locale,
    path: "/contact",
    title: t.meta.contactTitle,
    description: t.meta.contactDescription,
  });
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
