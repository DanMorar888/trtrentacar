import Image from "next/image";
import { GoogleReviewsWidget } from "@/components/GoogleReviewsWidget";
import { HeroBackdrop } from "@/components/HeroBackdrop";
import { getDictionary, getLocale } from "@/i18n/get-locale";
import { getGoogleReviews } from "@/lib/google-reviews";

export async function ReviewsSection() {
  const locale = getLocale();
  const t = getDictionary(locale);
  const { place, reviews } = await getGoogleReviews();

  return (
    <section className="relative overflow-hidden py-12 lg:py-16">
      <HeroBackdrop
        src="/images/cars/banner-3-trt-rent-a-car-cluj.webp"
        priority={false}
        overlayClassName="bg-gradient-to-b from-slate-950/75 via-slate-950/55 to-slate-950/75"
      />
      <div className="container-narrow relative z-10 min-w-0">
        <h2 className="section-title-dark">{t.about.rating}</h2>
        <div className="mt-6">
          <GoogleReviewsWidget locale={locale} tone="dark" place={place} reviews={reviews} />
        </div>
        <div className="mt-8 flex min-w-0 flex-wrap items-center justify-center gap-x-6 gap-y-4">
          <a href="https://topcarrentals.ro/" target="_blank" rel="noopener" className="block max-w-full">
            <Image
              src="/images/cars/topcarrentals-trtrentacar-937x250.png"
              alt={
                locale === "en"
                  ? "TopCarRentals.ro — rating 5.0 out of 5"
                  : "TopCarRentals.ro — notă 5,0 din 5"
              }
              width={937}
              height={250}
              className="h-12 w-auto max-w-full rounded-md bg-white object-contain sm:h-16"
            />
          </a>
          <a
            href="https://www.firmadeincredere.ro/company,73684,auto-garage-project-bjl-s-r-l"
            target="_blank"
            rel="noopener"
            className="block max-w-full"
          >
            <Image
              src="/images/cars/dark_horizontal_ro.png"
              alt={
                locale === "en"
                  ? "Partner of the Firmă de Încredere project"
                  : "Partener al proiectului Firmă de Încredere"
              }
              width={1149}
              height={263}
              className="h-12 w-auto max-w-full object-contain sm:h-16"
            />
          </a>
        </div>
      </div>
    </section>
  );
}
