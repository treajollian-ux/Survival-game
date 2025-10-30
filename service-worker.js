console.log('🔧 Service Worker محمل');
// service-worker.js - لجعل التطبيق يعمل بدون اتصال
const CACHE_NAME = 'survival-game-v1.0.1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/game.js',
  '/config.js',
  '/modules/player.js',
  '/modules/buildings.js',
  '/modules/resources.js',
  '/modules/ui.js',
  '/modules/audio.js',
  '/modules/missions.js',
  '/modules/combat.js'
];

// تثبيت Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 جاري تخزين الأصول في الكاش');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// تفعيل Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ جاري حذف الكاش القديم:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// اعتراض الطلبات
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // إرجاع النسخة المخبأة إذا وجدت
        if (response) {
          return response;
        }

        // استخراج الطلب الأصلي
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // التحقق من أن الاستجابة صالحة
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // استخراج الاستجابة للتخزين
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(() => {
          // السقوط إلى صفحة غير متصل إذا فشل الطلب
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// التعامل مع التحديثات في الخلفية
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
