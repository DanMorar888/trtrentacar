import { LocaleLink } from "@/components/LocaleLink";
import { Suspense } from "react";
import { ReservationWidgetWithSuspense } from "@/components/ReservationWidgetWithSuspense";
import { FeaturedCarsWithPrices } from "@/components/FeaturedCarsWithPrices";
import { HomeFaq } from "@/components/HomeFaq";
import { ReviewsSection } from "@/components/ReviewsSection";
import { FaqJsonLd, ProductJsonLdScripts } from "@/components/JsonLd";
import { HeroBackdrop } from "@/components/HeroBackdrop";
import { LazyMap } from "@/components/LazyMap";
import { readCars, getFeaturedCars } from "@/lib/cars-db";
import { readSeasons } from "@/lib/seasons-db";
import { siteConfig } from "@/config/site";
import { getDictionary, getLocale } from "@/i18n/get-locale";

export const revalidate = 120;

async function HomeFeatured() {
  const locale = getLocale();
  const allCars = await readCars();
  const featuredCars = getFeaturedCars(allCars);
  let seasons: Awaited<ReturnType<typeof readSeasons>> = [];
  try {
    seasons = await readSeasons();
  } catch {
    seasons = [];
  }
  const jsonLdLang = locale;
  return (
    <>
      <ProductJsonLdScripts cars={featuredCars} inLanguage={jsonLdLang} />
      <FeaturedCarsWithPrices cars={featuredCars} seasons={seasons} />
    </>
  );
}

export default async function HomePage() {
  const locale = getLocale();
  const t = getDictionary(locale);

  return (
    <>
      <FaqJsonLd items={t.home.faq} />

      <section className="hero-home-bg relative py-8 lg:py-10">
        <HeroBackdrop
          priority
          src="/images/cars/banner-1-trt-rent-a-car-cluj.webp"
          overlayClassName="bg-gradient-to-b from-slate-950/75 via-slate-950/35 to-slate-950/55"
        />
        <div className="container-narrow relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {t.home.title}
            </h1>
            <p className="mt-4 text-lg font-medium text-gray-200 sm:text-xl">
              {t.home.subtitle}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <span className="key-info-dark">{t.home.vat}</span>
              <span className="key-info-dark">{t.home.insurance}</span>
              <span className="key-info-dark">{t.home.delivery}</span>
              <span className="key-info-dark">{t.home.scdw}</span>
            </div>
          </div>
          <div className="mt-6 flex w-full flex-col items-center lg:mt-8">
            <ReservationWidgetWithSuspense />
          </div>
        </div>
      </section>

      <section className="section-dark py-12 lg:py-16">
        <div className="container-narrow">
          <Suspense fallback={
            <>
              <div className="mb-2 h-8 w-64 animate-pulse rounded bg-gray-700" />
              <div className="mb-8 h-4 w-96 animate-pulse rounded bg-gray-700/80" />
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-80 animate-pulse rounded-xl bg-gray-700/50" />
                ))}
              </div>
            </>
          }>
            <HomeFeatured />
          </Suspense>
        </div>
      </section>

      <section className="relative overflow-hidden py-14 lg:py-20">
        <HeroBackdrop
          src="/images/cars/banner-2-trt-rent-a-car-cluj.webp"
          priority={false}
          overlayClassName="bg-gradient-to-b from-slate-950/72 via-slate-950/48 to-slate-950/70"
        />
        <div className="container-narrow relative z-10">
          <h2 className="section-title-dark mb-8">{t.home.whyTitle}</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { title: t.home.why1Title, text: t.home.why1Text },
              { title: t.home.why2Title, text: t.home.why2Text },
              { title: t.home.why3Title, text: t.home.why3Text },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-white/60 bg-white/95 p-6 shadow-lg backdrop-blur-sm"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary" aria-hidden>
                  ✓
                </div>
                <h3 className="mt-3 font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-dark py-12 lg:py-16">
        <div className="container-narrow">
          <div>
            <h2 className="section-title-dark">{t.home.aboutTitle}</h2>
            <p className="mt-4 text-body-dark">
              {t.home.about1.replace("{name}", siteConfig.name)}
            </p>
            <p className="mt-4 text-gray-300">{t.home.about2}</p>
          </div>
        </div>
      </section>

      <ReviewsSection />

      <HomeFaq title={t.home.faqTitle} subtitle={t.home.faqSubtitle} items={t.home.faq} />

      <section className="cta-delivery-bg relative overflow-hidden py-14 text-white lg:py-24 lg:min-h-[50vh] lg:flex lg:items-center">
        <HeroBackdrop
          src="/images/cars/banner-3-trt-rent-a-car-cluj.webp"
          priority={false}
          overlayClassName="bg-[radial-gradient(ellipse_at_center,rgba(2,6,23,0.78)_0%,rgba(2,6,23,0.5)_48%,rgba(2,6,23,0.32)_100%)]"
        />
        <div className="container-narrow relative z-10 text-center">
          <h2 className="section-title-dark">{t.home.ctaTitle}</h2>
          <p className="mt-6 text-base text-white/90">{t.home.ctaText}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <LocaleLink href="/inchirieri-masini-cluj" className="rounded-lg bg-white px-8 py-3.5 text-base font-semibold text-primary shadow-md transition hover:bg-gray-100 hover:shadow-lg">
              {t.home.ctaBook}
            </LocaleLink>
            <LocaleLink href="/termeni-si-conditii" className="rounded-lg border-2 border-white px-8 py-3.5 text-base font-semibold transition hover:bg-white/15">
              {t.home.ctaTerms}
            </LocaleLink>
          </div>
        </div>
      </section>

      <section className="section-dark border-t border-gray-700/50">
        <LazyMap
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d107574.75947220862!2d23.53411235512668!3d46.783473631559595!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47490c1f916c0b8b%3A0xbbc601c331f148b!2sCluj-Napoca!5e1!3m2!1sro!2sro!4v1774269906952!5m2!1sro!2sro"
          title={t.home.mapTitle}
          className="block h-[450px] w-full"
        />
      </section>
    </>
  );
}
