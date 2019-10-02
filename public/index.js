const VAPID_KEY = '';

const isServiceWorkerCapable = 'serviceWorker' in navigator;
const isPushCapable = 'PushManager' in window;

const urlB64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

async function updateUI() {
  let registration = await getRegistration();
  let subscription = await getSubscription(registration);
  
  let reg = document.getElementById('registration');
  let sub = document.getElementById('subscription');
  let regButton = document.getElementById('register');
  let subButton = document.getElementById('subscribe');
  let unRegButton = document.getElementById('unregister');
  let unSubButton = document.getElementById('unsubscribe');
  
  reg.textContent = '';
  sub.textContent = '';
  regButton.disabled = true;
  subButton.disabled = true;
  unRegButton.disabled = true;
  unSubButton.disabled = true;
  
  if (registration) {
    reg.textContent = registration.scope;
    unRegButton.disabled = false;
  } else {
    reg.textContent = 'No service worker registration.'
    regButton.disabled = false;
  }
  
  if (subscription) {
    sub.textContent = subscription.endpoint;
    unSubButton.disabled = false;
  } else {
    sub.textContent = 'No push subscription.'
    if (registration) {
      subButton.disabled = false;
    }
  }
}

function getRegistration() {
  return navigator.serviceWorker.getRegistration();
}

async function getSubscription(registration) {
  console.log('TODO: Implement getSubscription');
  return false;
}

async function registerServiceWorker() {
  await navigator.serviceWorker.register('./serviceworker.js');
  updateUI();
}

async function unRegisterServiceWorker() {
  let registration = await getRegistration();
  await registration.unregister();
  updateUI();
}

async function subscribeToPush() {
  console.log('TODO: Implement subscribeToPush');
}

async function unSubscribeFromPush() {
  console.log('TODO: Implement unSubscribeFromPush');
}

async function initializePage() {
  if (!isServiceWorkerCapable || !isPushCapable) {
    let message = 
      'User agent must be service worker ' + 
      'and push capable to use this page.';
    console.log(message);
    return;
  }
  updateUI();
}

window.onload = initializePage;
