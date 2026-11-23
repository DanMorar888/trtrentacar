"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { siteConfig } from "@/config/site";
import { useI18n } from "@/i18n/LocaleProvider";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useI18n();

  const navLinks = [
    { href: "/inchirieri-masini-cluj", label: t.nav.cars },
    { href: "/tarife", label: t.nav.rates },
    { href: "/blog", label: t.nav.blog },
    { href: "/despre-noi", label: t.nav.about },
    { href: "/contact", label: t.nav.contact },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-700 bg-dark shadow-sm">
      <div className="container-narrow">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="inline-flex items-center">
            <Image
              src="/images/cars/logo-header.jpg"
              alt={siteConfig.name}
              width={240}
              height={48}
              priority
              className="h-8 w-auto md:h-10"
            />
          </Link>

          <nav className="hidden md:flex md:items-center md:gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium md:text-base ${
                  pathname.startsWith(link.href) ? "text-primary" : "text-gray-300 hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex md:items-center md:gap-4">
            <LanguageSwitcher />
            <a
              href={`tel:${siteConfig.contact.phoneRaw}`}
              className="text-sm font-semibold text-gray-200 hover:text-primary md:text-base"
            >
              {siteConfig.contact.phone}
            </a>
            <a
              href={`https://wa.me/${siteConfig.contact.whatsapp.replace(/\s/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp text-sm md:text-base"
            >
              WhatsApp
            </a>
          </div>

          <button
            type="button"
            className="rounded p-2 text-gray-300 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={t.nav.menu}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-gray-800 py-4 md:hidden">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded px-3 py-2 text-sm font-medium ${
                    pathname.startsWith(link.href) ? "bg-primary/20 text-primary" : "text-gray-300"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="px-3 py-2">
                <LanguageSwitcher />
              </div>
              <a href={`tel:${siteConfig.contact.phoneRaw}`} className="rounded px-3 py-2 text-sm font-medium text-gray-300">
                {siteConfig.contact.phone}
              </a>
              <a
                href={`https://wa.me/${siteConfig.contact.whatsapp.replace(/\s/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp mx-3 mt-2 text-center"
              >
                WhatsApp
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
