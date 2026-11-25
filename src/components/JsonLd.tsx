import { siteConfig } from "@/config/site";
import type { Car } from "@/data/cars";
import { DAY_INTERVALS } from "@/data/cars";
import type { Locale } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-locale";
import { interpolate } from "@/i18n/interpolate";
import { localePath } from "@/i18n/paths";
import {
  ORGANIZATION_ID,
  ORGANIZATION_LOGO_URL,
  ORGANIZATION_SAME_AS,
  SITE_URL,
} from "@/lib/site-identity";

export { ORGANIZATION_ID };

function absoluteImageUrl(path: string): string {
  if (!path) return ORGANIZATION_LOGO_URL;
  if (path.startsWith("http")) return path;
  const base = SITE_URL.replace(/\/$/, "");
  return path.startsWith("/") ? base + path : `${base}/${path}`;
}

function schemaTelephone(): string {
  const digits = siteConfig.contact.phoneRaw.replace(/\D/g, "");
  return digits ? `+${digits}` : siteConfig.contact.phone;
}

function brandName(car: Car): string {
  return car.name.trim().split(/\s+/)[0] || "Auto";
}

function absoluteLocaleUrl(locale: Locale, path: string): string {
  const base = SITE_URL.replace(/\/$/, "");
  return `${base}${localePath(locale, path)}`;
}

function asLocale(value: string | undefined): Locale {
  return value === "en" || value === "hu" ? value : "ro";
}

function carPageUrl(car: Car, locale: Locale): string {
  return absoluteLocaleUrl(locale, `/inchirieri-masini-cluj/${car.slug}`);
}

function productDescription(car: Car, locale: Locale): string {
  const yearLabel = car.year
    ? locale === "hu"
      ? `év ${car.year}`
      : locale === "en"
        ? `year ${car.year}`
        : `an ${car.year}`
    : null;
  return [brandName(car), car.name, car.categoryLabel, yearLabel].filter(Boolean).join(" · ");
}

function carImages(car: Car): { "@type": "ImageObject"; url: string } | { "@type": "ImageObject"; url: string }[] {
  const urls = [car.image, ...(car.gallery ?? [])].filter(Boolean).slice(0, 6);
  const images = (urls.length ? urls : [""]).map((url) => ({
    "@type": "ImageObject" as const,
    url: absoluteImageUrl(url),
  }));
  return images.length === 1 ? images[0] : images;
}

const OPENING_HOURS_SPECIFICATION = {
  "@type": "OpeningHoursSpecification",
  dayOfWeek: [
    "https://schema.org/Monday",
    "https://schema.org/Tuesday",
    "https://schema.org/Wednesday",
    "https://schema.org/Thursday",
    "https://schema.org/Friday",
    "https://schema.org/Saturday",
    "https://schema.org/Sunday",
  ],
  opens: "00:00",
  closes: "23:59",
} as const;

function getCarPriceMinMax(car: Car): { min: number; max: number } {
  let min = car.pricePerDay;
  let max = car.pricePerDay;
  if (car.pricingByInterval) {
    for (const interval of DAY_INTERVALS) {
      const p = car.pricingByInterval[interval.key];
      if (p?.pricePerDay != null) {
        min = Math.min(min, p.pricePerDay);
        max = Math.max(max, p.pricePerDay);
      }
    }
  }
  if (car.pricingBySeason) {
    for (const table of Object.values(car.pricingBySeason)) {
      if (!table) continue;
      for (const interval of DAY_INTERVALS) {
        const p = table[interval.key];
        if (p?.pricePerDay != null) {
          min = Math.min(min, p.pricePerDay);
          max = Math.max(max, p.pricePerDay);
        }
      }
    }
  }
  if (max < min) max = min;
  return { min, max };
}

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    url: `${SITE_URL}/`,
    description: siteConfig.tagline,
    email: siteConfig.contact.email,
    telephone: schemaTelephone(),
    logo: ORGANIZATION_LOGO_URL,
    image: ORGANIZATION_LOGO_URL,
    sameAs: ORGANIZATION_SAME_AS,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.street,
      addressLocality: siteConfig.address.locality,
      addressRegion: siteConfig.address.region,
      postalCode: siteConfig.address.postalCode,
      addressCountry: siteConfig.address.country,
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: schemaTelephone(),
      email: siteConfig.contact.email,
      contactType: "customer service",
      availableLanguage: ["Romanian", "English", "Hungarian"],
      areaServed: "RO",
    },
  } as const;
}

export function buildWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: siteConfig.name,
    url: `${SITE_URL}/`,
    inLanguage: ["ro", "en", "hu"],
    publisher: { "@id": ORGANIZATION_ID },
  } as const;
}

export function AutoRentalSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "AutoRental",
    "@id": `${SITE_URL}/#autorental`,
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    url: siteConfig.url,
    description: siteConfig.tagline,
    telephone: schemaTelephone(),
    email: siteConfig.contact.email,
    logo: ORGANIZATION_LOGO_URL,
    image: ORGANIZATION_LOGO_URL,
    hasMap: siteConfig.mapsUrl,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.street,
      addressLocality: siteConfig.address.locality,
      addressRegion: siteConfig.address.region,
      postalCode: siteConfig.address.postalCode,
      addressCountry: siteConfig.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: siteConfig.geo.latitude,
      longitude: siteConfig.geo.longitude,
    },
    openingHours: siteConfig.openingHours,
    openingHoursSpecification: OPENING_HOURS_SPECIFICATION,
    currenciesAccepted: siteConfig.currenciesAccepted,
    paymentAccepted: siteConfig.paymentAccepted,
    priceRange: siteConfig.priceRange,
    areaServed: [
      { "@type": "City", name: "Cluj-Napoca" },
      { "@type": "Place", name: "Aeroportul Internațional Cluj-Napoca" },
    ],
    sameAs: ORGANIZATION_SAME_AS,
    parentOrganization: { "@id": ORGANIZATION_ID },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function OrganizationWebSiteJsonLd() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildOrganizationJsonLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildWebSiteJsonLd()) }}
      />
    </>
  );
}

export type BuildProductJsonLdOptions = {
  offerPath?: string;
  inLanguage?: string;
};

export function buildProductJsonLdForCar(
  car: Car,
  options?: BuildProductJsonLdOptions
): Record<string, unknown> {
  const { min, max } = getCarPriceMinMax(car);
  const low = Math.round(min * 100) / 100;
  const high = Math.round(max * 100) / 100;
  const locale = asLocale(options?.inLanguage);
  const pageUrl = carPageUrl(car, locale);
  const offerPath = options?.offerPath;
  const offerUrl = offerPath
    ? absoluteLocaleUrl(locale, offerPath.startsWith("/") ? offerPath : `/${offerPath}`)
    : pageUrl;

  const base: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${pageUrl}#product`,
    name: car.name,
    url: pageUrl,
    sku: car.id,
    description: productDescription(car, locale),
    image: carImages(car),
    brand: {
      "@type": "Brand",
      name: brandName(car),
    },
    seller: {
      "@id": ORGANIZATION_ID,
    },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "EUR",
      lowPrice: low,
      highPrice: high,
      offerCount: 1,
      availability: "https://schema.org/InStock",
      url: offerUrl,
    },
  };
  if (options?.inLanguage) {
    base.inLanguage = options.inLanguage;
  }
  return base;
}

export function ProductJsonLdScripts({
  cars,
  offerPath,
  inLanguage,
}: {
  cars: Car[];
  offerPath?: string;
  inLanguage?: string;
}) {
  return (
    <>
      {cars.map((car) => (
        <script
          key={`product-jsonld-${car.id}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildProductJsonLdForCar(car, { offerPath, inLanguage })),
          }}
        />
      ))}
    </>
  );
}

export function FaqJsonLd({
  items,
}: {
  items: ReadonlyArray<{ readonly q: string; readonly a: string }>;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/** Schema JSON-LD pentru pagina de detaliu mașină: WebPage + Product + BreadcrumbList */
export function CarDetailJsonLd({ car, slug }: { car: Car; slug: string }) {
  const locale = getLocale();
  const t = getDictionary(locale);
  const pageUrl = absoluteLocaleUrl(locale, `/inchirieri-masini-cluj/${slug}`);
  const listUrl = absoluteLocaleUrl(locale, "/inchirieri-masini-cluj");
  const homeUrl = absoluteLocaleUrl(locale, "/");
  const productId = `${pageUrl}#product`;
  const breadcrumbId = `${pageUrl}#breadcrumb`;
  const fuel = t.specs[car.fuel as keyof typeof t.specs] ?? car.fuel;
  const pageTitle = interpolate(t.car.metaTitle, { name: car.name });
  const pageDescription = interpolate(t.car.metaDescription, {
    name: car.name,
    year: car.year ? `, ${car.year}` : "",
    engine: car.engine,
    fuel,
    price: car.pricePerDay,
  });
  const brand = brandName(car);
  const unitText = locale === "hu" ? "nap" : locale === "en" ? "day" : "zi";

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: pageTitle,
        description: pageDescription,
        publisher: { "@id": ORGANIZATION_ID },
        mainEntity: { "@id": productId },
        breadcrumb: { "@id": breadcrumbId },
      },
      {
        "@type": "Product",
        "@id": productId,
        name: car.name,
        url: pageUrl,
        sku: car.id,
        description: productDescription(car, locale),
        image: carImages(car),
        brand: { "@type": "Brand", name: brand },
        category: car.categoryLabel,
        ...(car.year ? { vehicleModelDate: car.year } : {}),
        vehicleConfiguration: [car.engine, car.fuel, car.transmission].filter(Boolean).join(", "),
        numberOfDoors: car.doors,
        vehicleSeatingCapacity: car.seats,
        seller: { "@id": ORGANIZATION_ID },
        offers: {
          "@type": "AggregateOffer",
          url: absoluteLocaleUrl(locale, `/rezervare?car=${slug}`),
          priceCurrency: "EUR",
          lowPrice: Math.round(getCarPriceMinMax(car).min * 100) / 100,
          highPrice: Math.round(getCarPriceMinMax(car).max * 100) / 100,
          offerCount: 1,
          availability: "https://schema.org/InStock",
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: car.pricePerDay,
            priceCurrency: "EUR",
            unitCode: "DAY",
            unitText,
          },
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": breadcrumbId,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: t.car.home, item: homeUrl },
          { "@type": "ListItem", position: 2, name: t.car.cars, item: listUrl },
          { "@type": "ListItem", position: 3, name: car.name },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ItemListJsonLd({
  name,
  items,
}: {
  name: string;
  items: Array<{ name: string; url: string }>;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: item.url,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BlogPostingJsonLd({
  title,
  description,
  slug,
  date,
  image,
  locale,
}: {
  title: string;
  description: string;
  slug: string;
  date: string;
  image: string;
  locale: string;
}) {
  const lang = asLocale(locale);
  const t = getDictionary(lang);
  const pageUrl = absoluteLocaleUrl(lang, `/blog/${slug}`);
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${pageUrl}#article`,
        headline: title,
        description,
        datePublished: date,
        dateModified: date,
        inLanguage: lang,
        image: { "@type": "ImageObject", url: absoluteImageUrl(image) },
        author: { "@id": ORGANIZATION_ID },
        publisher: { "@id": ORGANIZATION_ID },
        mainEntityOfPage: { "@id": `${pageUrl}#webpage` },
        url: pageUrl,
      },
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: title,
        description,
        publisher: { "@id": ORGANIZATION_ID },
        breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: t.car.home, item: absoluteLocaleUrl(lang, "/") },
          { "@type": "ListItem", position: 2, name: t.nav.blog, item: absoluteLocaleUrl(lang, "/blog") },
          { "@type": "ListItem", position: 3, name: title },
        ],
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
