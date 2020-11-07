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

// Perform feature-detection, update the UI
async function initializePage() {

  document.getElementById('register').disabled = false;
  const registration = await navigator.serviceWorker.getRegistration();
  if (registration) {
    // document.getElementById('register').disabled = true;
    // document.getElementById('unregister').disabled = false;
    // document.getElementById('registration-status-message').textContent = 
    //     `Service worker registered. Scope: ${registration.scope}`;
  }
  const subscription = await registration.pushManager.getSubscription();
  if (registration.active && subscription) {
    // document.getElementById('subscribe').disabled = false;
    // document.getElementById('unsubscribe').disabled = true;
    // document.getElementById('notify-me').disabled = false;
    // document.getElementById('subscription-status-message').textContent = 
    //     `Subscription endpoint: ${subscription.endpoint}`;
  }

}


async function updateUI() {
  const registrationButton = document.getElementById('register');
  const unregistrationButton = document.getElementById('unregister');
  const registrationStatus = document.getElementById('registration-status-message');
  const subscriptionButton = document.getElementById('subscribe');
  const unsubscriptionButton = document.getElementById('unsubscribe');
  const subscriptionStatus = document.getElementById('subscription-status-message');
  const notifyMeButton = document.getElementById('notify-me');
  const notificationStatus = document.getElementById('notification-status-message');
  // Disable all buttons by default.
  registrationButton.disabled = true;
  unregistrationButton.disabled = true;
  subscriptionButton.disabled = true;
  unsubscriptionButton.disabled = true;
  notifyMeButton.disabled = true;
  // Service worker is not supported so we can't go any further.
  if (!'serviceWorker' in navigator) {
    registrationStatus.textContent = "This browser doesn't support service workers.";
    subscriptionStatus.textContent = "Push subscription on this client isn't possible because of lack of service worker support.";
    notificationStatus.textContent = "Push notification to this client isn't possible because of lack of service worker support.";
    return;
  }  
  const registration = await navigator.serviceWorker.getRegistration();
  // Service worker is available and now we need to register one.
  if (!registration) {
    registrationButton.disabled = false;
    registrationStatus.textContent = 'No service worker has been registered yet.';
    subscriptionStatus.textContent = "Push subscription on this client isn't possible until a service worker is registered.";
    notificationStatus.textContent = "Push notification to this client isn't possible until a service worker is registered.";
    return;
  }
  registrationStatus.textContent =
      `Service worker registered. Scope: ${registration.scope}`;
  const subscription = await registration.pushManager.getSubscription();
  // Service worker is registered and now we need to subscribe for push
  // or unregister the existing service worker.
  if (!subscription) {
    unregistrationButton.disabled = false;
    subscriptionButton.disabled = false;
    subscriptionStatus.textContent = 'Ready to subscribe this client to push.';
    notificationStatus.textContent = 'Push notification to this client will be possible once subscribed.';
    return;
  }
  // Service worker is registered and subscribed for push and now we need
  // to unregister service worker, unsubscribe to push, or send notifications.
  subscriptionStatus.textContent =
      `Service worker subscribed to push. Endpoint: ${subscription.endpoint}`;
  notificationStatus.textContent = 'Ready to send a push notification to this client!';
  unregistrationButton.disabled = false;
  notifyMeButton.disabled = false;
  unsubscriptionButton.disabled = false;
}

async function getRegistration() {
  return navigator.serviceWorker.getRegistration();
}

async function getSubscription() {
  let registration = await getRegistration();
  if (!(registration && registration.active)) {
    return null;
  } else { 
    return registration.pushManager.getSubscription();
  }
}

async function registerServiceWorker() {
  await navigator.serviceWorker.register('./service-worker.js');
  let registration = await getRegistration();
  updateUI();
}

async function unRegisterServiceWorker() {
  let registration = await getRegistration();
  await registration.unregister();
  updateUI();
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
    updateUI();
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



window.onload = updateUI;
