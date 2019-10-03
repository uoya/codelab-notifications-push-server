const VAPID_PUBLIC_KEY = 'BLNuAat43YdqpTNKEZFXqUp8uJAriWOzLBWtVAvWy6Axbusnedn8bm4EpLGqCFxGzyjl4-c9GP9sJ5XheswDjTA';

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
    reg.textContent = 
      'Service worker registered. Scope: ' + 
      registration.scope;
    unRegButton.disabled = false;
  } else {
    reg.textContent = 'No service worker registration.'
    regButton.disabled = false;
  }
  
  if (subscription) {
    sub.textContent = 
      'Subscription endpoint: ' + 
      subscription.endpoint;
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
  if (!(registration && registration.active)) {
    return false;
  } else { 
    return registration.pushManager.getSubscription();
  }
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

function sendSubscriptionToServer(subscription) {
  let xhr = new XMLHttpRequest();
  let loadHandler = (event) => { 
    let text = event.srcElement.responseText;
    let status = event.srcElement.status;
    let url = event.srcElement.responseURL;
  };
  
  xhr.onload = loadHandler;
  xhr.open('POST', '/addsubscription');
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify(subscription));
}

function removeSubscriptionFromServer(subscription) {
  let xhr = new XMLHttpRequest();
  let loadHandler = (event) => { 
    let text = event.srcElement.responseText;
    let status = event.srcElement.status;
    let url = event.srcElement.responseURL;
  };
  
  xhr.onload = loadHandler;
  xhr.open('POST', '/removesubscription');
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify(subscription));
}

async function subscribeToPush() {
  let registration = await getRegistration();
  let subscription = await getSubscription(registration);
  if (!subscription) {
    let options = {
      userVisibleOnly: true,
      applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC_KEY)
    };
    subscription = await registration.pushManager.subscribe(options);
  }
  sendSubscriptionToServer(subscription);
  updateUI();
}

async function unSubscribeFromPush() {
  let registration = await getRegistration();
  let subscription = await getSubscription(registration);
  if (!subscription) { 
    return; 
  } else {
    removeSubscriptionFromServer(subscription);
    await subscription.unsubscribe();
  }
  updateUI();
}

async function sendNotification() {
  let registration = await getRegistration();
  let subscription = await getSubscription(registration);
  if (!subscription) {
    console.log('No push subscription.');
    return;
  }
  let xhr = new XMLHttpRequest();
  let loadHandler = (event) => { 
    let text = event.srcElement.responseText;
    let status = event.srcElement.status;
    let url = event.srcElement.responseURL;
  };
  
  xhr.onload = loadHandler;
  xhr.open('POST', '/notify-me');
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({ 
    subscription: subscription,
    title: 'Test title', 
    options: { body: 'Test body'}
  }));
}

async function sendNotificationToAll() {
  let xhr = new XMLHttpRequest();
  let loadHandler = (event) => { 
    let text = event.srcElement.responseText;
    let status = event.srcElement.status;
    let url = event.srcElement.responseURL;
  };
  
  xhr.onload = loadHandler;
  xhr.open('POST', '/notify-all');
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({ 
    title: 'Test title', 
    options: { body: 'Test body'}
  }));
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
