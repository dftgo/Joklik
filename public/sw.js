// Minimal service worker: no caching.
// The fetch handler does not call respondWith, so the browser sends every request
// straight to the network itself (no cache, and no extra errors when a request is aborted).
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
