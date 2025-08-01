// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyBbE4E3wqhiRjDSF3yHujnyh6CZxKTF2UM',
  authDomain: 'push-notification-6b1c5.firebaseapp.com',
  projectId: 'push-notification-6b1c5',
  messagingSenderId: '986143695561',
  appId: '1:986143695561:web:9cde90a834d07fc7aba318',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/noise-pink.jpg'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});