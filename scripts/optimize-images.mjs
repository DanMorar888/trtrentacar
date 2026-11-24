// Recomprimă pozele din public/images (același nume și format), maxim 1600px lățime.
// Rulare: npm run optimize-images
import { readdir, readFile, writeFile, stat } from "fs/promises";
import path from "path";
import sharp from "sharp";

const ROOTS = ["public/images/cars", "public/images/blog"];
const MAX_WIDTH = 1600;
const MIN_SAVING = 0.05;

async function optimize(file) {
  const ext = path.extname(file).toLowerCase();
  if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) return null;

  const input = await readFile(file);
  const meta = await sharp(input).metadata();
  let pipeline = sharp(input).rotate();
  if ((meta.width ?? 0) > MAX_WIDTH) pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });

  if (ext === ".png") {
    const opaque = (await sharp(input).stats()).isOpaque;
    if (opaque) pipeline = pipeline.removeAlpha();
    pipeline = pipeline.png({ compressionLevel: 9, effort: 10 });
  } else if (ext === ".webp") {
    pipeline = pipeline.webp({ quality: 80, effort: 6 });
  } else {
    pipeline = pipeline.jpeg({ quality: 80, mozjpeg: true, progressive: true });
  }

  const output = await pipeline.toBuffer();
  if (output.length >= input.length * (1 - MIN_SAVING)) return { file, before: input.length, after: input.length };
  await writeFile(file, output);
  return { file, before: input.length, after: output.length };
}

let before = 0;
let after = 0;
for (const root of ROOTS) {
  for (const name of await readdir(root)) {
    const file = path.join(root, name);
    if (!(await stat(file)).isFile()) continue;
    const result = await optimize(file);
    if (!result) continue;
    before += result.before;
    after += result.after;
    if (result.after < result.before) {
      console.log(`${file}: ${Math.round(result.before / 1024)} KB -> ${Math.round(result.after / 1024)} KB`);
    }
  }
}
console.log(`Total: ${(before / 1048576).toFixed(1)} MB -> ${(after / 1048576).toFixed(1)} MB`);
