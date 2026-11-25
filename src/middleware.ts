import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isLocale, LOCALE_COOKIE, type Locale } from "@/i18n/config";
import { stripLocalePrefix } from "@/i18n/paths";
import { SITE_URL } from "@/lib/site-identity";
import { ADMIN_PASSWORD } from "@/lib/admin-credentials";

const COOKIE_NAME = "admin_session";
const SALT = "888rentacar-admin";

async function getExpectedToken(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message)
  );
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function redirectToCanonicalHttps(request: NextRequest): NextResponse | null {
  const raw = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "";
  const hostname = raw.split(":")[0].toLowerCase();
  if (!hostname) return null;

  if (
    hostname === "localhost" ||
    hostname.startsWith("127.0.0.1") ||
    hostname.endsWith(".local")
  ) {
    return null;
  }

  const canonical = new URL(SITE_URL);
  const canonicalHost = canonical.hostname.toLowerCase();

  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim().toLowerCase();
  const isHttp =
    forwardedProto === "http" ||
    (forwardedProto === undefined && request.nextUrl.protocol === "http:");
  const hostMismatch = hostname !== canonicalHost;

  if (!isHttp && !hostMismatch) return null;

  const dest = new URL(
    request.nextUrl.pathname + request.nextUrl.search + request.nextUrl.hash,
    `https://${canonicalHost}`
  );
  return NextResponse.redirect(dest, 301);
}

const LOCALE_COOKIE_OPTIONS = {
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
  sameSite: "lax" as const,
};

function localeFromPrefix(pathname: string): Locale | null {
  const bare = stripLocalePrefix(pathname);
  if (bare === pathname) return null;
  const prefix = pathname.split("/")[1];
  return isLocale(prefix) ? prefix : null;
}

export async function middleware(request: NextRequest) {
  const canonicalRedirect = redirectToCanonicalHttps(request);
  if (canonicalRedirect) return canonicalRedirect;

  const { pathname } = request.nextUrl;
  const lang = request.nextUrl.searchParams.get("lang");

  if (isLocale(lang)) {
    const url = request.nextUrl.clone();
    url.searchParams.delete("lang");
    const bare = stripLocalePrefix(url.pathname);
    url.pathname = lang === "ro" ? bare : `/${lang}${bare === "/" ? "" : bare}`;
    const res = NextResponse.redirect(url, 301);
    res.cookies.set(LOCALE_COOKIE, lang, LOCALE_COOKIE_OPTIONS);
    return res;
  }

  const prefixed = localeFromPrefix(pathname);
  if (prefixed) {
    const bare = stripLocalePrefix(pathname);
    const url = request.nextUrl.clone();
    url.pathname = bare;
    if (bare.startsWith("/admin") || bare.startsWith("/api")) {
      return NextResponse.redirect(url, 301);
    }
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-locale", prefixed);
    const res = NextResponse.rewrite(url, { request: { headers: requestHeaders } });
    res.cookies.set(LOCALE_COOKIE, prefixed, LOCALE_COOKIE_OPTIONS);
    return res;
  }

  if (!pathname.startsWith("/admin")) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.delete("x-locale");
    const res = NextResponse.next({ request: { headers: requestHeaders } });
    if (!pathname.startsWith("/api")) {
      res.cookies.set(LOCALE_COOKIE, "ro", LOCALE_COOKIE_OPTIONS);
    }
    return res;
  }
  if (pathname === "/admin/login") return NextResponse.next();

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const secret = ADMIN_PASSWORD;
  const fullToken = await getExpectedToken(secret, SALT);
  const limitedToken = await getExpectedToken(secret, `${SALT}:limited`);
  const role =
    token && token.length === fullToken.length && token === fullToken
      ? "full"
      : token && token.length === limitedToken.length && token === limitedToken
        ? "limited"
        : null;

  if (!role) {
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("from", pathname);
    return NextResponse.redirect(login);
  }

  if (role === "limited" && (pathname === "/admin/cars/new" || pathname.startsWith("/admin/cars/new/"))) {
    return NextResponse.redirect(new URL("/admin/cars", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/).*)"],
};
