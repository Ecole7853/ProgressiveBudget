console.log("HAL: I am completely operational, and all my circuits are functioning perfectly")

const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/db.js",
    "/index.js",
    "/manifest.webmanifest",
    "/styles.css",
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
]

const CACHE_NAME = "static-cache-v2"; //static
const DATA_CACHE_NAME = "data-cache-v1"; //dynamic

// install
self.addEventListener("install", function (evt) {
    evt.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("HAL: I've saved your files for you");
            return cache.addAll(FILES_TO_CACHE);
        })
    );
});

self.addEventListener("fetch", function(evt) {
    // cache successful requests to the API
    if (evt.request.url.includes("/api/")) {
      evt.respondWith(
        caches.open(DATA_CACHE_NAME).then(cache => {
          return fetch(evt.request)
            .then(response => {
              // If the response was good, clone it and store it in the cache.
              if (response.status === 200) {
                cache.put(evt.request.url, response.clone());
              }
  
              return response;
            })
            .catch(err => {
              // Network request failed, try to get it from the cache.
              return cache.match(evt.request);
            });
        }).catch(err => console.log(err))
      );
  
      return;
    }
  
    // if the request is not for the API, serve static assets using "offline-first" approach.
    // see https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook#cache-falling-back-to-network
    evt.respondWith(
        fetch(evt.request).catch(function() {
          return caches.match(evt.request).then(function(response) {
            if (response) {
              return response;
            } else if (evt.request.headers.get("accept").includes("text/html")) {
              // return the cached home page for all requests for html pages
              return caches.match("/");
            }
          });
        })
      );
    })