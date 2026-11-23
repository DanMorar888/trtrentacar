import type { Metadata } from "next";
import { AboutPageContent } from "@/components/AboutPageContent";
import { getDictionary, getLocale } from "@/i18n/get-locale";
import { buildPageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = getLocale();
  const t = getDictionary(locale);
  return buildPageMetadata({
    locale,
    path: "/despre-noi",
    title: t.meta.aboutTitle,
    description: t.meta.aboutDescription,
  });
}

export default function AboutPage() {
  return <AboutPageContent />;
}
