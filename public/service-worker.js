
self.addEventListener('push', (event) => {
  let notification = event.data.json();
  const image = 'https://cdn.glitch.com/614286c9-b4fc-4303-a6a9-a4cef0601b74%2Flogo.png?v=1605150951230';
  const options = {
    body: notification.options.body,
    icon: image
  }
  
  self.registration.showNotification(
    notification.title, 
    options
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close(); 
  console.log("notification clicked");
  event.waitUntil(self.clients.openWindow('https://web.dev'))  
});