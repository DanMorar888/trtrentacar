import { NextResponse } from "next/server";
import { getAdminToken, getCookieName, getRoleCookieName } from "@/lib/admin-auth";
import { matchAdminLogin } from "@/lib/admin-credentials";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");
    const role = matchAdminLogin(email, password);

    if (!role) {
      return NextResponse.json({ error: "Email sau parolă incorectă" }, { status: 401 });
    }

    const token = getAdminToken(role);
    const res = NextResponse.json({ ok: true });
    const cookieOptions = {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: 60 * 60 * 24 * 7, // 7 zile
      path: "/",
    };
    res.cookies.set(getCookieName(), token, { ...cookieOptions, httpOnly: true });
    res.cookies.set(getRoleCookieName(), role, { ...cookieOptions, httpOnly: false });
    return res;
  } catch {
    return NextResponse.json({ error: "Eroare" }, { status: 500 });
  }
}
