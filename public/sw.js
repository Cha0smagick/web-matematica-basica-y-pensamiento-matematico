// Service Worker - Offline-first para GitHub Pages
const CACHE_NAME = 'math-course-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/src/main.js',
  '/src/router.js',
  '/src/styles/globals.css',
  '/src/components/layout/Layout.js',
  '/src/components/layout/Header.js',
  '/src/components/layout/Sidebar.js',
  '/src/components/layout/Footer.js',
  '/src/components/math/LatexRenderer.js',
  '/src/components/math/FormulaExplorer.js',
  '/src/components/math/InteractiveGraph.js'
];

// Instalar - cachear assets estáticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Activar - limpiar caches viejas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
});

// Fetch - estrategia cache-first para assets, network-first para datos
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo manejar peticiones del mismo origen
  if (url.origin !== location.origin) return;

  // Para archivos estáticos (JS, CSS, HTML): cache-first
  if (request.destination === 'script' || request.destination === 'style' || request.destination === 'document') {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
          return response;
        });
      })
    );
    return;
  }

  // Para datos (JSON, API): network-first con fallback a cache
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// Mensaje para saltar espera y activar inmediatamente
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});