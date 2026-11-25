import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { AutoRentalSchema, OrganizationWebSiteJsonLd } from "@/components/JsonLd";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { getDictionary, getLocale } from "@/i18n/get-locale";
import { buildPageMetadata } from "@/lib/metadata";
import { SITE_URL } from "@/lib/site-identity";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-geist-sans",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = getLocale();
  const t = getDictionary(locale);
  return {
    metadataBase: new URL(SITE_URL),
    ...buildPageMetadata({
      locale,
      path: "/",
      title: t.meta.homeTitle,
      description: t.meta.homeDescription,
    }),
    title: {
      default: t.meta.homeTitle,
      template: "%s",
    },
    keywords: locale === "hu"
      ? [
          "autóbérlés Kolozsvár",
          "autókölcsönző Cluj",
          "bérelhető autó Kolozsvár",
          "autóbérlés repülőtér Cluj",
          "TRT rent a car",
        ]
      : locale === "en"
        ? [
            "car rental Cluj",
            "car hire Cluj-Napoca",
            "Cluj airport car rental",
            "TRT rent a car",
          ]
        : [
            "rent a car Cluj",
            "închirieri auto Cluj",
            "mașini de închiriat Cluj",
            "rent a car Cluj-Napoca",
            "închirieri auto aeroport Cluj",
            "TRT rent a car",
          ],
    icons: {
      icon: "/favicon.png",
    },
    robots: { index: true, follow: true },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = getLocale();
  const messages = getDictionary(locale);
  return (
    <html lang={locale} className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-dark font-sans">
        <script
          dangerouslySetInnerHTML={{
            __html: `document.addEventListener("click",function(e){var a=e.target&&e.target.closest&&e.target.closest("a[hreflang]");if(!a||a.getAttribute("aria-current")==="true")return;e.preventDefault();e.stopPropagation();location.assign(a.href);},true);`,
          }}
        />
        <LocaleProvider locale={locale} messages={messages}>
          <AutoRentalSchema />
          <OrganizationWebSiteJsonLd />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <BackToTop />
          <ServiceWorkerRegister />
        </LocaleProvider>
      </body>
    </html>
  );
}
