import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isLocale, LOCALE_COOKIE } from "@/i18n/config";
import { SITE_URL } from "@/lib/site-identity";
import { ADMIN_PASSWORD } from "@/lib/admin-credentials";

const COOKIE_NAME = "admin_session";
const SALT = "888rentacar-admin";

async function getExpectedToken(secret: string): Promise<string> {
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
    new TextEncoder().encode(SALT)
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

export async function middleware(request: NextRequest) {
  const canonicalRedirect = redirectToCanonicalHttps(request);
  if (canonicalRedirect) return canonicalRedirect;

  const { pathname } = request.nextUrl;
  const lang = request.nextUrl.searchParams.get("lang");

  if (isLocale(lang)) {
    const url = request.nextUrl.clone();
    url.searchParams.delete("lang");
    const res = NextResponse.redirect(url);
    res.cookies.set(LOCALE_COOKIE, lang, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return res;
  }

  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (pathname === "/admin/login") return NextResponse.next();

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const secret = ADMIN_PASSWORD;
  const expected = await getExpectedToken(secret);
  const valid = token && token.length === expected.length && token === expected;

  if (!valid) {
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("from", pathname);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/).*)"],
};
