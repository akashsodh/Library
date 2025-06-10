const CACHE_NAME = 'study-point-v2'; // जब भी आप फाइलें अपडेट करें तो इस वर्जन को बदलें
// वे सभी फाइलें जिन्हें हम ऑफलाइन के लिए कैश करना चाहते हैं
const urlsToCache = [
  './',
  './login.html',
  './index.html',
  './style.css',
  './script.js',
  './auth.js',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css'
];

// 1. इंस्टॉल इवेंट: सर्विस वर्कर इंस्टॉल होने पर फाइलों को कैश करें
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. फेच इवेंट: नेटवर्क रिक्वेस्ट को मैनेज करें
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // अगर कैश में रिस्पॉन्स मिलता है, तो उसे लौटाएं, वरना नेटवर्क से रिक्वेस्ट करें
        return response || fetch(event.request);
      })
  );
});

// 3. एक्टिवेट इवेंट: पुराने कैश को साफ करें
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
