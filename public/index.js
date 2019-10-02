const isServiceWorkerCapable = 'serviceWorker' in navigator;
const isPushCapable = 'PushManager' in window;

async function registerServiceWorker() {
  console.log('TODO: Implement registerServiceWorker');
}

async function subscribeToPush() {
  console.log('TODO: Implement subscribeToPush');
}

function getSubscription() {
  console.log('TODO: Implement getSubscription');
}

function updateUI() {
  let p1 = 
}

async function initializePage() {
  if (!isServiceWorkerCapable || !isPushCapable) {
    let message = 
      'User agent must be service worker ' + 
      'and push capable to use this page.';
    console.log(message);
    return;
  }
  let subscription = false;  
  let registration = await navigator.serviceWorker.getRegistration();
  if (registration) {
    subscription = await getSubscription(registration);
  }
  updateUI(registration, subscription);
}

initializePage();
