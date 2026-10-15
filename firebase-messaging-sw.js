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
  const orderId = payload.data?.orderId || '';
  self.registration.showNotification(title, {
    body,
    tag: orderId || 'heivcar',
    data: { orderId },
    actions: [
      { action: 'confirmar', title: 'Confirmar' },
      { action: 'editar', title: 'Editar' }
    ]
  });
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  // "Confirmar" só fecha a notificação e o serviço continua como está
  if (event.action === 'confirmar') return;
  const orderId = event.notification.data?.orderId || '';
  const url = event.action === 'editar'
    ? `./?pedido=${encodeURIComponent(orderId)}&acao=editar`
    : './';
  event.waitUntil(clients.openWindow(url));
});

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
