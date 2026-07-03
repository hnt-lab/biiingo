// Service worker MINIMAL pour l'installabilité (APK/PWA).
// ⚠️ VOLONTAIREMENT SANS AUCUN CACHE : tout passe toujours par le réseau,
// pour que chaque déploiement soit visible immédiatement (leçon du MJ Toolkit).
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => { /* réseau par défaut — aucun respondWith, aucun cache */ });
