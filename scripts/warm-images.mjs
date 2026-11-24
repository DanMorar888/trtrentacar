// Generează din timp, pe server, toate variantele de poze folosite în pagini.
// Rulare după fiecare deploy: npm run warm-images [-- https://domeniu.ro]
const base = (process.argv[2] || process.env.SITE_URL || "https://trtrentacar.ro").replace(/\/$/, "");
const ACCEPTS = ["image/avif,image/webp,*/*", "image/webp,*/*"];
const CONCURRENCY = 3;

async function text(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

const sitemap = await text(`${base}/sitemap.xml`);
const pages = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/^https?:\/\/[^/]+/, base));

const imageUrls = new Set();
for (const page of pages) {
  try {
    const html = (await text(page)).replace(/&amp;/g, "&");
    for (const m of html.matchAll(/\/_next\/image\?url=[^"'\s,]+/g)) imageUrls.add(m[0]);
  } catch (error) {
    console.warn(`Sar peste ${page}: ${error.message}`);
  }
}

const jobs = [...imageUrls].flatMap((url) => ACCEPTS.map((accept) => ({ url, accept })));
console.log(`${pages.length} pagini, ${imageUrls.size} variante de poze, ${jobs.length} cereri`);

let done = 0;
let generated = 0;
let failed = 0;
async function worker() {
  while (jobs.length) {
    const { url, accept } = jobs.shift();
    try {
      const res = await fetch(base + url, { headers: { Accept: accept } });
      await res.arrayBuffer();
      if (!res.ok) failed++;
      else if (res.headers.get("x-nextjs-cache") !== "HIT") generated++;
    } catch {
      failed++;
    }
    done++;
    if (done % 50 === 0) console.log(`${done} gata`);
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));
console.log(`Gata: ${generated} generate acum, ${done - generated - failed} erau deja pregătite, ${failed} erori`);
