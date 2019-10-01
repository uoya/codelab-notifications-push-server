console.log('Hello from serviceworker.js');

this.onmessage = (message) => {
  console.log('This is your service worker, I received this data: ' + message.data);
}
