const CACHE_NAME = "political-post-v2";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png"
];

// ಇನ್‌ಸ್ಟಾಲ್ ಆಗುವಾಗ ಅಗತ್ಯ ಫೈಲ್‌ಗಳನ್ನು ಕ್ಯಾಶ್ ಮಾಡುವುದು
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// ಹಳೆಯ ಕ್ಯಾಶ್ ಕ್ಲಿಯರ್ ಮಾಡುವುದು
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ನೆಟ್‌ವರ್ಕ್ ಮತ್ತು ಕ್ಯಾಶ್ ನಿರ್ವಹಣೆ (Network first with cache fallback)
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || e.request.url.includes("firestore.googleapis.com") || e.request.url.includes("cloudinary.com")) {
    return;
  }
  e.respondWith(
    fetch(e.request)
      .then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => caches.match(e.request))
  );
});