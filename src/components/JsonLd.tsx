import { siteConfig } from "@/config/site";
import type { Car } from "@/data/cars";
import { DAY_INTERVALS } from "@/data/cars";
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

function carPageUrl(car: Car): string {
  return `${SITE_URL.replace(/\/$/, "")}/inchirieri-masini-cluj/${car.slug}`;
}

function productDescription(car: Car): string {
  return [brandName(car), car.name, car.categoryLabel, car.year ? `an ${car.year}` : null]
    .filter(Boolean)
    .join(" · ");
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
      availableLanguage: ["Romanian", "English"],
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
    inLanguage: ["ro", "en"],
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
  const pageUrl = carPageUrl(car);
  const offerPath = options?.offerPath;
  const offerUrl = offerPath
    ? `${SITE_URL}${offerPath.startsWith("/") ? offerPath : `/${offerPath}`}`
    : pageUrl;

  const base: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${pageUrl}#product`,
    name: car.name,
    url: pageUrl,
    sku: car.id,
    description: productDescription(car),
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
  const baseUrl = SITE_URL.replace(/\/$/, "");
  const pageUrl = carPageUrl(car);
  const listUrl = `${baseUrl}/inchirieri-masini-cluj`;
  const productId = `${pageUrl}#product`;
  const breadcrumbId = `${pageUrl}#breadcrumb`;
  const pageTitle = `${car.name} – Închirieri Auto Cluj | ${siteConfig.name}`;
  const specLine = [car.year, car.engine, car.fuel].filter(Boolean).join(", ");
  const pageDescription = `Închiriază ${car.name} la ${siteConfig.name} Cluj. ${car.pricePerDay} €/zi. ${specLine}. Rezervare rapidă.`;
  const brand = brandName(car);

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
        description: productDescription(car),
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
          url: `${baseUrl}/rezervare?car=${slug}`,
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
            unitText: "zi",
          },
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": breadcrumbId,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Acasă", item: `${baseUrl}/` },
          { "@type": "ListItem", position: 2, name: "Mașini", item: listUrl },
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
  const pageUrl = `${SITE_URL}/blog/${slug}`;
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
        inLanguage: locale,
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
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
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
