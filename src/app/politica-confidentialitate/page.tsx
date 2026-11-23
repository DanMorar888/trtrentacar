import { ReservationWidgetWithSuspense } from "@/components/ReservationWidgetWithSuspense";
import { LegalDocument } from "@/components/LegalDocument";
import { privacyContent } from "@/components/legal/PrivacyContent";
import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/i18n/get-locale";
import { buildPageMetadata } from "@/lib/metadata";
import { HeroBackdrop } from "@/components/HeroBackdrop";

export async function generateMetadata(): Promise<Metadata> {
  const locale = getLocale();
  const t = getDictionary(locale);
  return buildPageMetadata({
    locale,
    path: "/politica-confidentialitate",
    title: t.meta.privacyTitle,
    description: t.meta.privacyDescription,
  });
}

export default function PoliticaConfidentialitatePage() {
  const t = getDictionary();
  return (
    <>
      <section className="hero-home-bg relative border-b border-gray-800 py-12 lg:py-24 lg:min-h-[50vh] lg:flex lg:items-center">
        <HeroBackdrop priority />
        <div className="container-narrow relative z-10 flex w-full flex-col items-center text-center">
          <h1 className="section-title-dark max-w-full">{t.legal.privacyTitle}</h1>
          <p className="mx-auto mt-2 max-w-3xl text-gray-200">
            {t.legal.privacySubtitle}
          </p>
        </div>
      </section>

      <section className="section-dark py-10 lg:py-14">
        <div className="container-narrow">
          <p className="mb-8 rounded-lg border border-gray-700 bg-gray-900/60 px-4 py-3 text-sm text-gray-300">
            {t.legal.officialNote}
          </p>
          <LegalDocument tocLabel={t.legal.toc}>
            {privacyContent}
          </LegalDocument>
        </div>
      </section>

      <section className="contact-reservation-bg relative border-t border-gray-700/50 py-12 lg:py-16">
        <div className="container-narrow relative z-10 w-full">
          <div className="mx-auto w-full max-w-5xl">
            <ReservationWidgetWithSuspense variant="compact" />
          </div>
        </div>
      </section>
    </>
  );
}
