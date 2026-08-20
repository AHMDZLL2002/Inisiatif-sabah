/* ══════════════════════════════════════════════
   SSMJ Portal — Service Worker
   Versi cache dikemaskini bila app deploy baru
   ══════════════════════════════════════════════ */

const CACHE_NAME = 'ssmj-portal-v3';

// Fail statik yang dicache untuk akses pantas
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/dashboard.css',
  '/dashboard.js?v=20260821-initiative',
  '/manifest.json',
  '/assets/LOGO SMJ.jpg',
  '/assets/logo-footer.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css'
];

// ── Install: cache semua fail statik ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    }).catch(err => {
      console.warn('[SW] Cache install error (non-fatal):', err);
    })
  );
  self.skipWaiting();
});

// ── Activate: buang cache lama ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: Network-first untuk API, Cache-first untuk statik ──
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Jangan cache API calls, WebSocket, atau external requests selain font-awesome
  const isApi = url.pathname.startsWith('/api/') ||
                url.pathname.startsWith('/login') ||
                url.pathname.startsWith('/logout');
  const isExternal = url.origin !== self.location.origin &&
                     !url.href.includes('cdnjs.cloudflare.com');

  if (isApi || isExternal || event.request.method !== 'GET') {
    // Network only — jangan interfere dengan API
    return;
  }

  // HTML pages: network-first supaya update terbaru sentiasa dipapar
  const isHtml = event.request.headers.get('accept')?.includes('text/html') ||
                 url.pathname.endsWith('.html') ||
                 url.pathname === '/';

  if (isHtml) {
    event.respondWith(
      fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const toCache = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, toCache));
        }
        return response;
      }).catch(() => caches.match(event.request))
    );
    return;
  }

  // CSS/JS/aset: Cache-first dengan network fallback
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        // Hanya cache response yang berjaya
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }
        const toCache = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, toCache));
        return response;
      }).catch(() => {
        // Offline fallback
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/index.html');
        }
      });
    })
  );
});
