console.log('Hello from serviceworker.js');

self.addEventListener('push', (data) => {
  console.log(data);
  self.registration.showNotification('hi');
});
