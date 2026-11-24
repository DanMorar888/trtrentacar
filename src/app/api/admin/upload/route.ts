import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { writeFile, mkdir, readdir } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { verifyAdminToken, getCookieName } from "@/lib/admin-auth";
import { slugFromName } from "@/lib/cars-db";

const MAX_UPLOAD_WIDTH = 1600;

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
  let buffer: Buffer = Buffer.from(bytes);
  let ext = path.extname(file.name) || ".jpg";
  try {
    buffer = await sharp(buffer)
      .rotate()
      .resize({ width: MAX_UPLOAD_WIDTH, withoutEnlargement: true })
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: 80, mozjpeg: true, progressive: true })
      .toBuffer();
    ext = ".jpg";
  } catch {
    // Format necunoscut pentru sharp: păstrăm fișierul original.
  }
  const safeSlug = slugFromName(slug) || "image";
  const dir = path.join(process.cwd(), "public", "images", "cars");
  await mkdir(dir, { recursive: true });
  const numbered = new RegExp(`^${safeSlug}-(\\d+)\\.[a-z]+$`, "i");
  let lastNumber = 0;
  for (const name of await readdir(dir)) {
    const match = name.match(numbered);
    if (match) lastNumber = Math.max(lastNumber, Number(match[1]));
  }
  const filename = `${safeSlug}-${lastNumber + 1}${ext}`;
  const filepath = path.join(dir, filename);
  await writeFile(filepath, buffer);

  const url = `/images/cars/${filename}`;
  return NextResponse.json({ url });
}
