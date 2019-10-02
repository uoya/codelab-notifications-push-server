const isServiceWorkerCapable = 'serviceWorker' in navigator;
const isPushCapable = 'PushManager' in window;

async function registerServiceWorker() {
  console.log('TODO: Implement registerServiceWorker');
}

async function subscribeToPush() {
  console.log('TODO: Implement subscribeToPush');
}

function getRegistration() {
  return navigator.serviceWorker.getRegistration();
}

function getSubscription(registration) {
  if (registration) {
    if (registration.active) {
      return registration.push
    }
  }
}

getRegistration().then(registration => { 
  if (registration) {
    console.log(registration.scope);
  } else {
    console.log('No service worker registered.');
  }
});
