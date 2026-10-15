// Service worker das notificações da HeivCar Oficina.
// Não intercepta as requisições da página, para não bloquear o carregamento do site.
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCVzdiTjpMQP4Aq_jRikby7f8YZCBUJujQ",
  projectId: "heivcar-agenda",
  messagingSenderId: "55189281337",
  appId: "1:55189281337:web:e11e5178d5cb9a01bdcbe8"
});

const messaging = firebase.messaging();

// Mensagens só com "data" (sem "notification"), para o aviso aparecer uma única vez
messaging.onBackgroundMessage(payload => {
  const title = payload.data?.title || 'HeivCar Oficina';
  const body = payload.data?.body || '';
  self.registration.showNotification(title, {
    body,
    icon: './icon-192.png',
    badge: './icon-192.png',
    tag: payload.data?.orderId || 'heivcar',
    data: { url: './' }
  });
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data?.url || './'));
});

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
