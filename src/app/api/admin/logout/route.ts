import { NextResponse } from "next/server";
import { getCookieName } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const res = NextResponse.redirect(new URL("/admin/login", request.url));
  res.cookies.set(getCookieName(), "", { maxAge: 0, path: "/" });
  return res;
}
