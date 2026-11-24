import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";

/**
 * Generează imaginea de Open Graph (cea afișată când linkul e distribuit pe
 * Facebook, WhatsApp sau LinkedIn). Rulează: npm run make-og-image
 */

const root = process.cwd();
const source = path.join(root, "public/images/cars/banner-1-trt-rent-a-car-cluj.webp");
const target = path.join(root, "public/images/cars/banner-og.jpg");

const WIDTH = 1200;
const HEIGHT = 630;

const overlay = Buffer.from(`
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#020617" stop-opacity="0.55"/>
      <stop offset="55%" stop-color="#020617" stop-opacity="0.66"/>
      <stop offset="100%" stop-color="#020617" stop-opacity="0.86"/>
    </linearGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#shade)"/>
  <text x="${WIDTH / 2}" y="288" text-anchor="middle" font-family="Arial, Helvetica, sans-serif"
        font-size="80" font-weight="700" fill="#ffffff">TRT Rent a Car</text>
  <text x="${WIDTH / 2}" y="352" text-anchor="middle" font-family="Arial, Helvetica, sans-serif"
        font-size="36" fill="#e2e8f0">Inchirieri auto in Cluj-Napoca</text>
  <text x="${WIDTH / 2}" y="424" text-anchor="middle" font-family="Arial, Helvetica, sans-serif"
        font-size="28" font-weight="600" fill="#ffffff">trtrentacar.ro</text>
</svg>
`);

await sharp(source)
  .resize({ width: WIDTH, height: HEIGHT, fit: "cover", position: "centre" })
  .composite([{ input: overlay, top: 0, left: 0 }])
  .jpeg({ quality: 82, mozjpeg: true, progressive: true })
  .toFile(target);

const { size } = await fs.stat(target);
console.log(`${path.relative(root, target)} — ${WIDTH}x${HEIGHT}, ${Math.round(size / 1024)} KB`);
