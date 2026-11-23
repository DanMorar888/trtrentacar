"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/admin", label: "Admin TRT", exact: true },
  { href: "/admin/cars", label: "Mașini", exact: false },
  { href: "/admin/cars/new", label: "Adaugă mașină", exact: true },
  { href: "/admin/seasons", label: "Sezoane", exact: false },
  { href: "/admin/rezervari", label: "Rezervări", exact: false },
  { href: "/admin/newsletter", label: "Newsletter", exact: false },
];

export function AdminHeader() {
  const pathname = usePathname();
  if (pathname === "/admin/login") return null;

  return (
    <header className="border-b border-gray-700 bg-dark shadow-sm">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <nav className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
          {NAV_LINKS.map((link) => {
            const active = link.exact
              ? pathname === link.href
              : link.href === "/admin/cars"
                ? pathname === "/admin/cars" ||
                  (pathname.startsWith("/admin/cars/") && !pathname.startsWith("/admin/cars/new"))
                : pathname === link.href || pathname.startsWith(`${link.href}/`);
            const isHome = link.href === "/admin";
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap text-sm ${
                  isHome ? "font-semibold" : ""
                } ${active ? "text-primary" : "text-gray-300 hover:text-primary"}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link href="/" target="_blank" className="text-sm text-gray-400 hover:text-primary">
            Vezi site
          </Link>
          <form action="/api/admin/logout" method="POST">
            <button type="submit" className="text-sm text-gray-400 hover:text-red-400">
              Deconectare
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
