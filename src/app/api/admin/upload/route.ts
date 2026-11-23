import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { verifyAdminToken, getCookieName } from "@/lib/admin-auth";

async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(getCookieName())?.value ?? null;
  return verifyAdminToken(token);
}

export async function POST(request: Request) {
  const ok = await isAdmin();
  if (!ok) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("image") as File | null;
  const slug = (formData.get("slug") as string) || "image";

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Lipsește fișierul image" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = path.extname(file.name) || ".jpg";
  const safeSlug = slug.replace(/[^a-z0-9-]/gi, "-").toLowerCase() || "image";
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const filename = `${safeSlug}-${unique}${ext}`;
  const dir = path.join(process.cwd(), "public", "images", "cars");
  await mkdir(dir, { recursive: true });
  const filepath = path.join(dir, filename);
  await writeFile(filepath, buffer);

  const url = `/images/cars/${filename}`;
  return NextResponse.json({ url });
}
