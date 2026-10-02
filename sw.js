'use strict';
// Bump this version whenever a release changes the offline app shell.
const CACHE_PREFIX = 'highnoon-ict-';
const CACHE_NAME = CACHE_PREFIX + '20261002-pwa-v2';
const ROOT = new URL('./', self.location.href);
const INDEX = new URL('index.html', ROOT).href;
const SHELL = ['index.html', 'manifest.webmanifest', 'app.js', 'app.css',
  'assets/app-icon-192.png', 'assets/app-icon-512.png', 'assets/apple-touch-icon.png',
  'assets/telecom-tower-sunset.png', 'assets/network-maintenance.jpg',
  'assets/field-safety-meeting.png'].map(path => new URL(path, ROOT).href);
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL)));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== ROOT.origin || !url.pathname.startsWith(ROOT.pathname)) return;
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok && (url.pathname === ROOT.pathname || url.pathname === new URL(INDEX).pathname)) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(INDEX, response.clone());
        }
        return response;
      } catch (error) {
        return (await caches.match(INDEX)) || Response.error();
      }
    })());
    return;
  }
  // Cache only the declared shell, never unrelated files on this origin.
  if (!SHELL.includes(url.href)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    return cached || fetch(request);
  })());
});