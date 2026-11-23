import { NextResponse } from "next/server";
import { isLocale, LOCALE_COOKIE } from "@/i18n/config";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!isLocale(body?.locale)) {
      return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
    }
    const res = NextResponse.json({ ok: true, locale: body.locale });
    res.cookies.set(LOCALE_COOKIE, body.locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
