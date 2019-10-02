console.log('Hello from serviceworker.js');

self.addEventListener('push', (event) => {
  console.log(event.data);
  self.registration.showNotification('hi');
});
