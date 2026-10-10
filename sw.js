// BONE SIP service worker — offline app shell + runtime caching.
// Bump CACHE_VERSION whenever you deploy changed files (or let your build step do it).
const CACHE_VERSION = 'bonesip-v3.9.9';
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

const APP_SHELL = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "css/style.css?v=3.9.9",
  "css/brand.css?v=3.9.9",
  "js/config.js?v=3.9.9",
  "js/data.js?v=3.9.9",
  "js/notifications.js?v=3.9.9",
  "js/i18n.js?v=3.9.9",
  "js/app.js?v=3.9.9",
  "js/vendor/confetti.browser.min.js",
  "assets/images/bonesip_logo_720.webp",
  "assets/images/ojas-avatar.svg",
  "assets/icons/icon-192.png",
  "assets/icons/icon-512.png",
  "assets/icons/favicon-32.png",
  "assets/icons/apple-touch-icon.png",
  "assets/icons3d/airplane.webp",
  "assets/icons3d/balance.webp",
  "assets/icons3d/bandage.webp",
  "assets/icons3d/barchart.webp",
  "assets/icons3d/bathtub.webp",
  "assets/icons3d/bed.webp",
  "assets/icons3d/bell.webp",
  "assets/icons3d/biceps.webp",
  "assets/icons3d/bone.webp",
  "assets/icons3d/bone_report_3d.webp",
  "assets/icons3d/bowl.webp",
  "assets/icons3d/bp_cuff.webp",
  "assets/icons3d/bulb.webp",
  "assets/icons3d/calendar.webp",
  "assets/icons3d/cane.webp",
  "assets/icons3d/chair.webp",
  "assets/icons3d/chart.webp",
  "assets/icons3d/check.webp",
  "assets/icons3d/cheese.webp",
  "assets/icons3d/cholesterol.webp",
  "assets/icons3d/clipboard.webp",
  "assets/icons3d/coffee.webp",
  "assets/icons3d/cooking.webp",
  "assets/icons3d/couch.webp",
  "assets/icons3d/curry.webp",
  "assets/icons3d/dizzy.webp",
  "assets/icons3d/door.webp",
  "assets/icons3d/egg.webp",
  "assets/icons3d/family.webp",
  "assets/icons3d/fearful.webp",
  "assets/icons3d/fire.webp",
  "assets/icons3d/fish.webp",
  "assets/icons3d/flamingo.webp",
  "assets/icons3d/flatbread.webp",
  "assets/icons3d/glasses.webp",
  "assets/icons3d/globe.webp",
  "assets/icons3d/glucose.webp",
  "assets/icons3d/hearts.webp",
  "assets/icons3d/hourglass.webp",
  "assets/icons3d/house.webp",
  "assets/icons3d/hug.webp",
  "assets/icons3d/kidney.webp",
  "assets/icons3d/lactose.webp",
  "assets/icons3d/ladder.webp",
  "assets/icons3d/laptop.webp",
  "assets/icons3d/leafy.webp",
  "assets/icons3d/leg.webp",
  "assets/icons3d/lemon.webp",
  "assets/icons3d/lock.webp",
  "assets/icons3d/lotus.webp",
  "assets/icons3d/milk.webp",
  "assets/icons3d/money.webp",
  "assets/icons3d/nut_allergy.webp",
  "assets/icons3d/party.webp",
  "assets/icons3d/peanuts.webp",
  "assets/icons3d/phone.webp",
  "assets/icons3d/pill.webp",
  "assets/icons3d/poultry.webp",
  "assets/icons3d/protect_shield_3d.webp",
  "assets/icons3d/robot.webp",
  "assets/icons3d/running.webp",
  "assets/icons3d/salad.webp",
  "assets/icons3d/scale.webp",
  "assets/icons3d/seedling.webp",
  "assets/icons3d/shield.webp",
  "assets/icons3d/shoe.webp",
  "assets/icons3d/sparkles.webp",
  "assets/icons3d/standing.webp",
  "assets/icons3d/stethoscope.webp",
  "assets/icons3d/stopwatch.webp",
  "assets/icons3d/strengthen_bone_3d.webp",
  "assets/icons3d/stuffed.webp",
  "assets/icons3d/sun.webp",
  "assets/icons3d/sunrise.webp",
  "assets/icons3d/target.webp",
  "assets/icons3d/thyroid.webp",
  "assets/icons3d/trophy.webp",
  "assets/icons3d/walking.webp",
  "assets/icons3d/warning.webp",
  "assets/icons3d/weights.webp",
  "assets/exercises/posters/female_band_pull.webp",
  "assets/exercises/posters/female_chair_sit_down_up.webp",
  "assets/exercises/posters/female_cheststretch.webp",
  "assets/exercises/posters/female_dumbellpull.webp",
  "assets/exercises/posters/female_legsideraise.webp",
  "assets/exercises/posters/female_one_leg_balance.webp",
  "assets/exercises/posters/female_rise_heels.webp",
  "assets/exercises/posters/female_stair_climbing.webp",
  "assets/exercises/posters/male_band_pull.webp",
  "assets/exercises/posters/male_chair_sit_down_up.webp",
  "assets/exercises/posters/male_cheststretch.webp",
  "assets/exercises/posters/male_dumbellpull.webp",
  "assets/exercises/posters/male_legsideraise.webp",
  "assets/exercises/posters/male_one_leg_balance.webp",
  "assets/exercises/posters/male_rise_heels.webp",
  "assets/exercises/posters/male_stair_climbing.webp"
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(CACHE_VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // Account data must always be live, and the admin page must never replace the cached app shell.
  if (url.origin === self.location.origin && (url.pathname.startsWith('/api/') || url.pathname.startsWith('/admin'))) return;

  // Exercise videos use range requests; let the browser/CDN handle them directly.
  if (url.pathname.endsWith('.mp4') || request.headers.has('range')) return;

  // Page navigations: network first so new deploys show up, fall back to the cached shell offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(SHELL_CACHE).then((c) => c.put('index.html', copy));
          return res;
        })
        .catch(() => caches.match('index.html'))
    );
    return;
  }

  // Core application scripts and styles: network first to immediately pick up newly deployed updates
  const isAppCode = url.origin === self.location.origin && (url.pathname.endsWith('.js') || url.pathname.endsWith('.css'));
  if (isAppCode) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(SHELL_CACHE).then((c) => c.put(request, copy));
          }
          return res;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Everything else (own assets, fonts, icon CSS, confetti): stale-while-revalidate.
  const cacheable = url.origin === self.location.origin ||
    /(^|\.)(googleapis|gstatic)\.com$/.test(url.hostname) ||
    url.hostname === 'cdnjs.cloudflare.com';
  if (!cacheable) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((res) => {
          if (res && (res.ok || res.type === 'opaque')) {
            const copy = res.clone();
            caches.open(RUNTIME_CACHE).then((c) => c.put(request, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});

// -----------------------------------------------------------------------------
// PUSH & LOCAL NOTIFICATION EVENTS (Mobile PWA & Desktop)
// -----------------------------------------------------------------------------
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  const targetUrl = data.url || './';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus already open window if available
      for (const client of clientList) {
        if ('focus' in client) {
          client.postMessage({ type: 'BONESIP_NOTIFICATION_CLICK', data });
          return client.focus();
        }
      }
      // If no window is open, launch app at target URL
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (e) {
    payload = {
      title: 'BONE SIP',
      body: event.data ? event.data.text() : 'Time for your bone health booster!'
    };
  }

  const title = payload.title || 'BONE SIP';
  const options = Object.assign({
    icon: 'assets/icons/icon-192.png',
    badge: 'assets/icons/favicon-32.png',
    vibrate: [200, 100, 200],
    tag: payload.tag || 'bonesip-push',
    renotify: true,
    data: payload.data || { url: './', timestamp: Date.now() }
  }, payload.options || {});

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const title = event.data.title || 'BONE SIP';
    const options = Object.assign({
      icon: 'assets/icons/icon-192.png',
      badge: 'assets/icons/favicon-32.png',
      vibrate: [200, 100, 200],
      tag: 'bonesip-reminder'
    }, event.data.options || {});
    event.waitUntil(self.registration.showNotification(title, options));
  }
});

