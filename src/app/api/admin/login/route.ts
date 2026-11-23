import { NextResponse } from "next/server";
import { getAdminToken, getCookieName } from "@/lib/admin-auth";
import { ADMIN_LOGIN_EMAIL, ADMIN_PASSWORD } from "@/lib/admin-credentials";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");
    const valid = email === ADMIN_LOGIN_EMAIL && password === ADMIN_PASSWORD;

    if (!valid) {
      return NextResponse.json({ error: "Email sau parolă incorectă" }, { status: 401 });
    }

    const token = getAdminToken();
    const res = NextResponse.json({ ok: true });
    res.cookies.set(getCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 zile
      path: "/",
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Eroare" }, { status: 500 });
  }
}
