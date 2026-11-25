"use client";

import { LocaleLink } from "@/components/LocaleLink";
import Image from "next/image";
import { useState } from "react";
import { siteConfig } from "@/config/site";
import { useI18n } from "@/i18n/LocaleProvider";

export function Footer() {
  const { t } = useI18n();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const [newsletterError, setNewsletterError] = useState("");

  const footerLinks = [
    { href: "/blog", label: t.nav.blog },
    { href: "/despre-noi", label: t.nav.about },
    { href: "https://www.cursbnr.ro/", label: t.footer.exchange, external: true },
    { href: "https://iturist.ro/obiective-turistice-cluj/", label: t.footer.attractions, external: true },
    { href: "/termeni-si-conditii", label: t.footer.terms },
    { href: "/politica-confidentialitate", label: t.footer.privacy },
    { href: "/contact", label: t.footer.contact },
  ];

  async function handleNewsletterSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNewsletterMessage("");
    setNewsletterError("");
    const email = newsletterEmail.trim();
    if (!email) {
      setNewsletterError(t.footer.newsletterInvalid);
      return;
    }

    setNewsletterSubmitting(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || t.footer.newsletterError);

      setNewsletterEmail("");
      setNewsletterMessage(data.alreadySubscribed ? t.footer.newsletterAlready : t.footer.newsletterOk);
    } catch (err) {
      setNewsletterError(err instanceof Error ? err.message : t.footer.newsletterError);
    } finally {
      setNewsletterSubmitting(false);
    }
  }

  return (
    <footer className="border-t border-gray-800 bg-dark">
      <div className="container-narrow py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:items-start">
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <LocaleLink href="/" className="inline-flex">
              <Image
                src="/images/cars/logo-footer.webp"
                alt={siteConfig.name}
                width={320}
                height={128}
                unoptimized
                className="h-28 w-auto md:h-24"
              />
            </LocaleLink>
            <p className="mt-3 max-w-[16rem] text-sm leading-relaxed text-gray-400">{t.footer.tagline}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 md:justify-start">
              <a
                href={`tel:${siteConfig.contact.phoneRaw}`}
                className="text-sm font-semibold text-gray-200 hover:text-primary"
              >
                {siteConfig.contact.phone}
              </a>
              <a
                href={`https://wa.me/${siteConfig.contact.whatsapp.replace(/\s/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-green-400 hover:underline"
              >
                WhatsApp
              </a>
            </div>
            <a
              href={siteConfig.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="mt-4 inline-flex text-white transition-colors hover:text-primary"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-7 w-7">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300">{t.footer.useful}</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <LocaleLink href="/inchirieri-masini-cluj" className="text-sm text-gray-400 hover:text-primary">
                  {t.footer.reservations}
                </LocaleLink>
              </li>
              {footerLinks.map((link) => (
                <li key={link.href}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-400 hover:text-primary"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <LocaleLink href={link.href} className="text-sm text-gray-400 hover:text-primary">
                      {link.label}
                    </LocaleLink>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300">{t.footer.contact}</h3>
            <ul className="mt-3 space-y-1 text-sm text-gray-400">
              <li>
                <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-primary">
                  {siteConfig.contact.email}
                </a>
              </li>
              <li>
                <a href={`tel:${siteConfig.contact.phoneRaw}`} className="hover:text-primary">
                  {siteConfig.contact.phone}
                </a>
              </li>
            </ul>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <a
                href="https://reclamatiisal.anpc.ro/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="ANPC SAL"
              >
                <Image
                  src="/images/cars/anpc-sal.webp"
                  alt="ANPC SAL"
                  width={120}
                  height={36}
                  unoptimized
                  className="h-10 w-auto object-contain transition-opacity hover:opacity-90"
                />
              </a>
              <a
                href="https://consumer-redress.ec.europa.eu/site-relocation_en"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Consumer Redress EU"
              >
                <Image
                  src="/images/cars/anpc-sol.webp"
                  alt="ANPC SOL"
                  width={120}
                  height={36}
                  unoptimized
                  className="h-10 w-auto object-contain transition-opacity hover:opacity-90"
                />
              </a>
            </div>
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300">{t.footer.newsletter}</h3>
            <p className="mt-3 text-sm text-gray-400">{t.footer.newsletterText}</p>
            <form className="mt-3 flex min-w-0 flex-col gap-2" onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                placeholder={t.footer.newsletterPlaceholder}
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="w-full min-w-0 rounded-lg border border-gray-600 bg-dark-light px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                aria-label={t.footer.newsletterPlaceholder}
                required
              />
              <button type="submit" className="btn-primary self-start whitespace-nowrap" disabled={newsletterSubmitting}>
                {newsletterSubmitting ? t.footer.newsletterSending : t.footer.newsletterSubmit}
              </button>
            </form>
            {newsletterMessage && <p className="mt-2 text-xs text-green-400">{newsletterMessage}</p>}
            {newsletterError && <p className="mt-2 text-xs text-red-400">{newsletterError}</p>}
          </div>
        </div>

        <div className="mt-10 border-t border-gray-800 pt-8 text-center text-xs leading-relaxed text-gray-500 sm:text-sm">
          <p className="mx-auto max-w-5xl text-balance">
            © {siteConfig.name} - {t.footer.rights} - Auto Garage Project BJL SRL, CIF: 47296710,
            J12/7252/2022 - Made with ❤️ by Web{"\u00A0"}Institute
          </p>
        </div>
      </div>
    </footer>
  );
}
