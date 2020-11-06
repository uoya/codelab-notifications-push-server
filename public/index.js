const VAPID_PUBLIC_KEY = 'BOyFjA9NR-Bf9lSB_T9EOqAMZ_pwMLZEwGC9QPBD8AQgGCeR3QUcKFRihphzsC9bzrFiAYZr2wOgy4SlIiFhok4';

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
  if (!subscription || !subscription.endpoint) { 
    console.log('No current subscription endpoint exists.');
    return; 
  }
  console.log('Requesting test notification to', subscription.endpoint);
  postToServer('/notify-me', { endpoint: subscription.endpoint });
}

// Ask server to send a test notification to all subscriptions
async function notifyAll() {
  const response = await fetch('/notify-all', {
    method: 'POST'
  });
  if (response.status === 409) {
    document.getElementById('notification-status-message').textContent =
        'There are no subscribed endpoints to send messages to, yet.';
  }
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
  let notifyMeButton = document.getElementById('notify-me');
  let notifyAllButton = document.getElementById('notify-all');

  // Reset all UI elements
  regP.textContent = '';
  subP.textContent = '';
  regButton.disabled = false;
  subButton.disabled = true;
  unRegButton.disabled = true;
  unSubButton.disabled = true;
  notifyMeButton.disabled = true;
  notifyAllButton.disabled = false;
  
  // Set state of UI elements based on registration 
  // and subscription states
  if (registration) {
    regP.textContent = 
      'Service worker registered. Scope: ' + registration.scope;
    unRegButton.disabled = false;
    regButton.disabled = true;
  } else {
    regP.textContent = 'No service worker registration.'
    regButton.disabled = false;
  }
  if (subscription && subscription.endpoint) {
    subP.textContent = 
      'Subscription endpoint: ' + subscription.endpoint;
    unSubButton.disabled = false;
    notifyMeButton.disabled = false;
  } else {
    subP.textContent = 'No push subscription.'
    if (registration && VAPID_PUBLIC_KEY) {
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
  let registration = await getRegistration();
  // console.log('Servce worker registered. Scope:', registration.scope);
  document.getElementById('register').disabled = true;
  document.getElementById('unregister').disabled = false;
  document.getElementById('subscribe').disabled = false;
}

// Unregister service worker, then update the UI
async function unRegisterServiceWorker() {
  let registration = await getRegistration();
  await registration.unregister();
  document.getElementById('register').disabled = false;
  document.getElementById('unregister').disabled = true;
  document.getElementById('subscribe').disabled = true;
  document.getElementById('unsubscribe').disabled = true;
  document.getElementById('notify-me').disabled = true;
}

// Subscribe the user to push notifications
async function subscribeToPush() {
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC_KEY)
  });
  if (subscription && subscription.endpoint) {
    postToServer('/add-subscription', subscription);
    document.getElementById('subscribe').disabled = true;
    document.getElementById('unsubscribe').disabled = false;
    document.getElementById('notify-me').disabled = false;
    document.getElementById('subscription-status-message').textContent =
        `Subscription endpoint: ${subscription.endpoint}`;
  }
}

// Unsubscribe the user from push notifications
async function unSubscribeFromPush() {
  let subscription = await getSubscription();
  if (!subscription || !subscription.endpoint) return;
  postToServer('/remove-subscription', { 
    endpoint: subscription.endpoint
  });
  await subscription.unsubscribe();
  updateUI();
}

// Perform feature-detection, update the UI
async function initializePage() {
  if (!('serviceWorker' in navigator)) {
    document.getElementById('registration-status-message').textContent =
        "This browser doesn't support service workers.";
    document.getElementById('register').disabled = true;
    return;
  }
  document.getElementById('register').disabled = false;
  const registration = await navigator.serviceWorker.getRegistration();
  if (registration) {
    document.getElementById('register').disabled = true;
    document.getElementById('unregister').disabled = false;
    document.getElementById('registration-status-message').textContent = 
        `Service worker registered. Scope: ${registration.scope}`;
  }
  const subscription = await registration.pushManager.getSubscription();
  if (registration.active && subscription) {
    document.getElementById('subscribe').disabled = false;
    document.getElementById('unsubscribe').disabled = true;
    document.getElementById('notify-me').disabled = false;
    document.getElementById('subscription-status-message').textContent = 
        `Subscription endpoint: ${subscription.endpoint}`;
  }
  // const isServiceWorkerCapable = 'serviceWorker' in navigator;
  // const isPushCapable = 'PushManager' in window;
  // if (!isServiceWorkerCapable || !isPushCapable) {      
  //   console.log('User agent must be service worker- ' + 
  //               'and push-capable to use this page.');
  //   return;
  // }
  // updateUI();
}

window.onload = initializePage;
