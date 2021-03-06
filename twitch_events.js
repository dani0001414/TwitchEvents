/*
 Copyright 2016 Google Inc. All Rights Reserved.
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
     http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/

// Names of the two caches used in this version of the service worker.
// Change to v2, etc. when you update any of the local resources, which will
// in turn trigger the install event again.
//const CACHE_VERSION = '{{ site.time }}';


const version = "v3";

const PRECACHE = 't_precache-' + version;
const RUNTIME = 't_runtime' + version;
console.log(PRECACHE);
console.log(RUNTIME);
// A list of local resources we always want to be cached.
const PRECACHE_URLS = [
  'index.html',
  'offline_state.png',
];

// The install handler takes care of precaching the resources we always need.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(PRECACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(self.skipWaiting())
  );
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', event => {
  const currentCaches = [PRECACHE, RUNTIME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

const trimCache = (cacheName, maxItems) => {
  caches.open(cacheName).then(cache => {
    cache.keys().then(keys => {
      if (keys.length > maxItems)
        cache.delete(keys[0]).then(trimCache(cacheName, maxItems));

    });
  });
};
function timestamp(b) {
  var utcDate = b;
  var localDate = new Date(utcDate);
  var localDate = localDate.getTime() / 1000;
  return localDate;
}
function aktualisido() {
  var d = new Date().getTime();
  return d / 1000;
}
var time;
// The fetch handler serves responses for same-origin resources from a cache.
// If no response is found, it populates the runtime cache with the response
// from the network before returning it to the page.
i = 0;
self.addEventListener('fetch', event => {
  // Skip cross-origin requests, like those for Google Analytics.
  var same_origin = event.request.url.startsWith(self.location.origin);
  var google_fonts = event.request.url.startsWith('https://fonts');
  var twitch_cover = event.request.url.startsWith('https://static-cdn.jtvnw.net/twitch-event');
  var imgur = event.request.url.startsWith('https://i.imgur.com/9KP46NF.png');
  var javascript = event.request.url.startsWith('https://dani0001414.github.io/TheVRMobilMenetrend/javascript_code.js');
  var cached_time = null;
  var cached_time_catch = false;
  i++;

  if (same_origin | google_fonts | imgur | javascript) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          time = cachedResponse.headers.get("Date");
          if (time != null) {
            cached_time = timestamp(time);
            time = aktualisido() - cached_time;
            console.log('ido:', time);
            if (259200 < time) {
              trimCache(PRECACHE, 0);
              trimCache(RUNTIME, 0);
            }
          }
          return cachedResponse;
        }

        return caches.open(RUNTIME).then(cache => {
          return fetch(event.request).then(response => {
            // Put a copy of the response in the runtime cache.
            return cache.put(event.request, response.clone()).then(() => {
              return response;
            });
          });
        });
      })
    );
  }
});






