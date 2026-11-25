import { LocaleLink } from "@/components/LocaleLink";
import { AboutStats } from "@/components/AboutStats";
import { HeroBackdrop } from "@/components/HeroBackdrop";
import { LazyMap } from "@/components/LazyMap";
import { ReviewsSection } from "@/components/ReviewsSection";
import { siteConfig } from "@/config/site";
import { getDictionary, getLocale } from "@/i18n/get-locale";

export function AboutPageContent() {
  const locale = getLocale();
  const t = getDictionary(locale);
  const whatsappHref = `https://wa.me/${siteConfig.contact.whatsapp.replace(/\s/g, "")}`;

  const facts = [
    { label: t.about.fact247, detail: t.about.fact247Detail },
    { label: t.about.factCity, detail: t.about.factCityDetail },
    { label: t.about.factAirport, detail: t.about.factAirportDetail },
  ];
  const who = [
    { title: t.about.who1Title, text: t.about.who1 },
    { title: t.about.who2Title, text: t.about.who2 },
    { title: t.about.who3Title, text: t.about.who3 },
  ];
  const offer = [
    { title: t.about.offer1Title, text: t.about.offer1Text },
    { title: t.about.offer2Title, text: t.about.offer2Text },
    { title: t.about.offer3Title, text: t.about.offer3Text },
  ];
  const why = [t.about.why1, t.about.why2, t.about.why3];
  const stats = [
    { value: 1800, label: t.about.clients, animate: true },
    { value: 40, label: t.about.cars, animate: true },
    { value: 9, label: t.about.years, animate: true },
    { value: 7, label: t.about.counties, animate: false },
  ];

  return (
    <>
      <section className="hero-home-bg relative border-b border-gray-800 py-12 lg:py-24 lg:min-h-[50vh] lg:flex lg:items-center">
        <HeroBackdrop priority />
        <div className="container-narrow relative z-10 w-full min-w-0">
          <div className="flex flex-col items-center text-center">
            <h1 className="section-title-dark max-w-full">{t.about.title}</h1>
            <p className="mt-2 max-w-full text-gray-200">{t.about.brand}</p>
            <div className="mx-auto mt-8 grid w-full min-w-0 max-w-5xl gap-3 sm:grid-cols-3">
              {facts.map((fact) => (
                <div
                  key={fact.label}
                  className="min-w-0 rounded-lg border border-white/70 bg-white/85 px-3 py-2.5 text-center text-sm shadow-sm backdrop-blur-sm"
                >
                  <p className="font-semibold text-primary">{fact.label}</p>
                  <p className="mt-1 break-words font-normal text-gray-700">{fact.detail}</p>
                </div>
              ))}
            </div>
            <p className="mx-auto mt-6 w-full max-w-4xl text-center text-lg font-semibold leading-relaxed text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.55)]">
              {t.about.welcome}
            </p>
          </div>
        </div>
      </section>

      <section className="section-dark py-12 lg:py-16">
        <div className="container-narrow">
          <h2 className="section-title-dark">{t.about.whoTitle}</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {who.map((item) => (
              <article key={item.title} className="min-w-0 rounded-xl border border-white/60 bg-white p-6 shadow-lg">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary"
                  aria-hidden
                >
                  ✓
                </div>
                <h3 className="mt-3 font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-12 lg:py-16">
        <HeroBackdrop
          src="/images/cars/banner-2-trt-rent-a-car-cluj.webp"
          priority={false}
          overlayClassName="bg-gradient-to-b from-slate-950/75 via-slate-950/55 to-slate-950/75"
        />
        <div className="container-narrow relative z-10">
          <h2 className="section-title-dark">{t.about.offerTitle}</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {offer.map((item) => (
              <article key={item.title} className="min-w-0 rounded-xl border border-gray-200 bg-gray-50 p-6">
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.text}</p>
              </article>
            ))}
          </div>
          <LocaleLink href="/inchirieri-masini-cluj" className="btn-primary mt-8">
            {t.nav.cars}
          </LocaleLink>
        </div>
      </section>

      <section className="section-dark py-12 lg:py-16">
        <div className="container-narrow">
          <h2 className="section-title-dark">
            {t.about.whyLead} <span className="text-primary">{siteConfig.name}</span>
          </h2>
          <p className="mt-4 text-body-dark">{t.about.founded}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {why.map((item) => (
              <span key={item} className="key-info-dark">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <ReviewsSection />

      <section className="section-dark py-12 lg:py-16">
        <div className="container-narrow">
          <h2 className="section-title-dark">{t.about.statsTitle}</h2>
          <AboutStats stats={stats} />

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="min-w-0 rounded-xl border border-gray-700 bg-gray-900/50 p-5">
              <h3 className="text-lg font-semibold text-white">{t.about.locationTitle}</h3>
              <p className="mt-2 break-words text-gray-300">{t.about.locationText}</p>
            </div>
            <div className="min-w-0 rounded-xl border border-gray-700 bg-gray-900/50 p-5">
              <h3 className="text-lg font-semibold text-white">{t.about.whatsappTitle}</h3>
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn-whatsapp mt-3">
                {t.about.whatsappText}
              </a>
            </div>
            <div className="min-w-0 rounded-xl border border-gray-700 bg-gray-900/50 p-5">
              <h3 className="text-lg font-semibold text-white">{t.about.contactTitle}</h3>
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="mt-2 inline-block break-all text-primary hover:underline"
              >
                {siteConfig.contact.email}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section-dark border-t border-gray-700/50">
        <LazyMap
          src="https://maps.google.com/maps?hl=ro&q=Transylvania+Rent+%26+Tourism&ll=46.7822489,23.6978928&z=17&output=embed"
          title={t.about.mapTitle}
          className="block h-[450px] w-full"
        />
      </section>
    </>
  );
}
