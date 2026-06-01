/**
 * Jekyll Forge PWA Service Worker
 * Provides offline caching, network-first fallbacks, and sync capabilities.
 */

const CACHE_NAME = "jekyll-forge-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/src/main.tsx",
  "/src/App.tsx",
  "/src/index.css",
  "/site.webmanifest",
  "/pwa-icon.png"
];

// Install Event
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Install Event Active");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Pre-caching Core Web Assets...");
      // Cache assets, allowing any failure without crashing the whole install
      return Promise.allSettled(
        ASSETS_TO_CACHE.map((url) => {
          return cache.add(url).catch((err) => {
            console.warn(`[Service Worker] Failed to cache: ${url}`, err);
          });
        })
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate Event (Cleanup old caches)
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activate Event Active");
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log(`[Service Worker] Purging legacy cache: ${key}`);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Intercept (Network First fallback to Cache for assets)
self.addEventListener("fetch", (event) => {
  const req = event.request;
  
  // Ignore non-get or API requests so backend data remains active and fresh
  if (req.method !== "GET" || req.url.includes("/api/")) {
    return;
  }

  event.respondWith(
    fetch(req)
      .then((networkResponse) => {
        // Clone and save the latest version of the asset to cache
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        console.log(`[Service Worker] Network offline, resolving cached copy for: ${req.url}`);
        return caches.match(req).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If the page is requested, fallback to root context index.html
          if (req.mode === "navigate") {
            return caches.match("/");
          }
          return new Response("Asset offline and uncached.", {
            status: 503,
            statusText: "Service Unavailable (Offline)"
          });
        });
      })
  );
});
