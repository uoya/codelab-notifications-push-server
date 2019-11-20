const VAPID_PUBLIC_KEY = 'BLNuAat43YdqpTNKEZFXqUp8uJAriWOzLBWtVAvWy6Axbusnedn8bm4EpLGqCFxGzyjl4-c9GP9sJ5XheswDjTA';

// Convert a base64 string to Uint8Array.
// Must do this so the server can understand the VAPID_PUBLIC_KEY.
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

// Send a request to one of the server's POST URLs
async function postToServer(url, data) {
  let response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }).catch(console.log);
  console.log(url, response.status);
}

// Ask server to send a test notification to current subscription
async function notifyMe() {
  let subscription = await getSubscription();  
  postToServer('/notify-me', { 
    endpoint: subscription.endpoint 
  });
}

// Ask server to send a test notification all subscriptions
async function notifyAll() {
  postToServer('/notify-all', {});
}

// Refresh onscreen messages, set up UI.
async function updateUI() {
  let registration = await getRegistration();
  let subscription = await getSubscription();
  
  // Get references to elements on the page
  let regP = document.getElementById('registration-status-message');
  let subP = document.getElementById('subscription-status-message');
  let regButton = document.getElementById('register');
  let subButton = document.getElementById('subscribe');
  let unRegButton = document.getElementById('unregister');
  let unSubButton = document.getElementById('unsubscribe');
  
  // Reset all UI elements
  regP.textContent = '';
  subP.textContent = '';
  regButton.disabled = true;
  subButton.disabled = true;
  unRegButton.disabled = true;
  unSubButton.disabled = true;
  
  // Set state of UI elements based on registration 
  // and subscription states
  if (registration) {
    regP.textContent = 
      'Service worker registered. Scope: ' + registration.scope;
    unRegButton.disabled = false;
  } else {
    regP.textContent = 'No service worker registration.'
    regButton.disabled = false;
  }
  if (subscription) {
    subP.textContent = 
      'Subscription endpoint: ' + subscription.endpoint;
    unSubButton.disabled = false;
  } else {
    subP.textContent = 'No push subscription.'
    if (registration) {
      subButton.disabled = false;
    }
  }
}

// Get current service worker registration, if any
async function getRegistration() {
  return navigator.serviceWorker.getRegistration();
}

// Get current push subscription, if any
async function getSubscription() {
  let registration = await getRegistration();
  if (!(registration && registration.active)) {
    return null;
  } else { 
    return registration.pushManager.getSubscription();
  }
}

// Register service worker, then update the UI
async function registerServiceWorker() {
  await navigator.serviceWorker.register('./service-worker.js');
  updateUI();
}

// Unregister service worker, then update the UI
async function unRegisterServiceWorker() {
  let registration = await getRegistration();
  await registration.unregister();
  updateUI();
}

// Subscribe the user to push notifications
async function subscribeToPush() {
  let registration = await getRegistration();
  let subscription = await getSubscription();
  if (!registration || subscription) { return; }
  subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC_KEY)
  });
  if (subscription.endpoint) {
    postToServer('/add-subscription', subscription);
  }
  updateUI();
}

// Unsubscribe the user from push notifications
async function unSubscribeFromPush() {
  let subscription = await getSubscription();
  if (!subscription) { 
    return; 
  } 
  // Tell the server to remove the subscription
  postToServer('/remove-subscription', { endpoint: subscription.endpoint });
  await subscription.unsubscribe();
  updateUI();
}

// Perform feature-detection and update the UI
const isServiceWorkerCapable = 'serviceWorker' in navigator;
const isPushCapable = 'PushManager' in window;
async function initializePage() {
  if (!isServiceWorkerCapable || !isPushCapable) {
    let message = 
      'User agent must be service worker- ' + 
      'and push-capable to use this page.';
    console.log(message);
    return;
  }
  updateUI();
}

window.onload = initializePage;
