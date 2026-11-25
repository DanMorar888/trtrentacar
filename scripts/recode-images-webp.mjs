// Recodează pozele din public/images: maxim 1600px lățime, WebP calitate 80.
// Actualizează referințele din src/ și data/. Imaginea Open Graph rămâne JPEG.
// Rulare: npm run recode-images
import { readdir, readFile, writeFile, stat, unlink } from "fs/promises";
import path from "path";
import sharp from "sharp";

const IMAGE_ROOT = "public/images";
const TEXT_ROOTS = ["src", "data"];
const MAX_WIDTH = 1600;
const QUALITY = 80;
const SKIP = new Set(["banner-og.jpg"]);
const RASTER = new Set([".jpg", ".jpeg", ".png", ".webp"]);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

function toPosix(file) {
  return file.split(path.sep).join("/");
}

function publicUrl(file) {
  return "/" + toPosix(file).replace(/^public\//, "");
}

async function recode(file) {
  const ext = path.extname(file).toLowerCase();
  if (!RASTER.has(ext) || SKIP.has(path.basename(file))) return null;

  const input = await readFile(file);
  const meta = await sharp(input).metadata();
  const width = meta.width ?? 0;
  const target = file.slice(0, -ext.length) + ".webp";
  const alreadyWebp = ext === ".webp";

  if (alreadyWebp && width <= MAX_WIDTH) return null;

  let pipeline = sharp(input).rotate();
  if (width > MAX_WIDTH) pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
  const output = await pipeline.webp({ quality: QUALITY, alphaQuality: QUALITY, effort: 6 }).toBuffer();

  await writeFile(target, output);
  if (!alreadyWebp) await unlink(file);

  return {
    from: publicUrl(file),
    to: publicUrl(target),
    before: input.length,
    after: output.length,
  };
}

const conversions = [];
for (const file of await walk(IMAGE_ROOT)) {
  const result = await recode(file);
  if (!result) continue;
  conversions.push(result);
  console.log(
    `${result.from} -> ${result.to}: ${Math.round(result.before / 1024)} KB -> ${Math.round(result.after / 1024)} KB`
  );
}

const replacements = conversions.filter((item) => item.from !== item.to);
let touched = [];
if (replacements.length) {
  const textFiles = [];
  for (const root of TEXT_ROOTS) {
    for (const file of await walk(root)) {
      if (/\.(tsx?|jsx?|json|mjs|css|md|txt)$/.test(file)) textFiles.push(file);
    }
  }
  for (const file of textFiles) {
    let text = await readFile(file, "utf8");
    let next = text;
    for (const item of replacements) next = next.split(item.from).join(item.to);
    if (next !== text) {
      await writeFile(file, next);
      touched.push(toPosix(file));
    }
  }
}

const before = conversions.reduce((sum, item) => sum + item.before, 0);
const after = conversions.reduce((sum, item) => sum + item.after, 0);
console.log(`Poze: ${conversions.length}, ${(before / 1048576).toFixed(1)} MB -> ${(after / 1048576).toFixed(1)} MB`);
console.log(`Referințe actualizate în: ${touched.length ? touched.join(", ") : "niciun fișier"}`);
