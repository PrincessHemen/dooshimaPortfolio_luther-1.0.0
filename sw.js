const cacheName = "offline-cache-v1";
const cacheUrls = [
  "index.html",
  "js/main.js",         // Caching main.js
  "js/plugins.js",      // Caching plugins.js
  "css/styles.css",     // Caching styles.css
  "css/vendor.css",     // Caching vendor.css
];

// Installing the Service Worker
self.addEventListener("install", async (event) => {
  try {
    const cache = await caches.open(cacheName);
    await cache.addAll(cacheUrls);
  } catch (error) {
    console.error("Service Worker installation failed:", error);
  }
});

// Fetching resources
self.addEventListener("fetch", (event) => {
  event.respondWith(
    (async () => {
      const cache = await caches.open(cacheName);

      // Check if the request is for an image
      if (event.request.destination === "image") {
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          return cachedResponse; // Return cached image if available
        }
        
        try {
          const networkResponse = await fetch(event.request);
          // Cache the image if the request is successful
          if (networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse; // Return the network response
        } catch (error) {
          console.error("Network request failed:", error);
          return cachedResponse || await cache.match("index.html"); // Fallback to index.html
        }
      } else {
        // Default fetch handler for other requests (HTML, JS, CSS)
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          return cachedResponse; // Return cached response if available
        }

        try {
          const networkResponse = await fetch(event.request);
          // Cache the response if it's a successful request
          if (networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse; // Return the network response
        } catch (error) {
          console.error("Network request failed:", error);
          return await cache.match("index.html"); // Fallback to index.html
        }
      }
    })()
  );
});
