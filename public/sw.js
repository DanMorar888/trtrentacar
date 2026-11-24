/*
 * Serverul trimite `Cache-Control: no-store` pe toate răspunsurile și gazda nu
 * poate schimba asta, așa că browserul ar redescărca scripturile și pozele la
 * fiecare pagină. Service worker-ul ține el o copie, în Cache Storage, unde
 * antetele de la server nu au efect.
 *
 * Paginile HTML nu sunt păstrate niciodată: ele vin mereu de la server, ca
 * prețurile și textele să fie la zi.
 *
 * Dacă vreodată trebuie oprit, se înlocuiește conținutul acestui fișier cu
 * `self.registration.unregister()`. Fișierul nu este ținut în cache de browser,
 * așa că schimbarea ajunge la toți vizitatorii de la prima pagină deschisă.
 */

const VERSION = "v1";
const STATIC_CACHE = `trt-static-${VERSION}`;
const IMAGE_CACHE = `trt-images-${VERSION}`;
const STATIC_LIMIT = 150;
const IMAGE_LIMIT = 200;

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name !== STATIC_CACHE && name !== IMAGE_CACHE)
          .map((name) => caches.delete(name))
      );
      await self.clients.claim();
    })()
  );
});

/** Șterge cele mai vechi intrări când depășim limita. */
async function trim(cacheName, limit) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= limit) return;
  await Promise.all(keys.slice(0, keys.length - limit).map((key) => cache.delete(key)));
}

/** Fișierele din /_next/static au hash în nume, deci conținutul lor nu se schimbă. */
async function cacheFirst(request, cacheName, limit) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;

  const response = await fetch(request);
  if (response.ok) {
    await cache.put(request, response.clone());
    trim(cacheName, limit);
  }
  return response;
}

/** Pozele se afișează din copie și se împrospătează în fundal. */
async function staleWhileRevalidate(request, cacheName, limit) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);

  const update = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone()).then(() => trim(cacheName, limit));
      }
      return response;
    })
    .catch(() => hit);

  return hit || update;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/admin")) return;

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, STATIC_CACHE, STATIC_LIMIT));
    return;
  }

  if (url.pathname.startsWith("/_next/image") || url.pathname.startsWith("/images/")) {
    event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE, IMAGE_LIMIT));
  }
});
