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

function buildXhr(method, contentType, url) {
  let xhr = new XMLHttpRequest();
  let loadHandler = (event) => { 
    let text = event.srcElement.responseText;
    let status = event.srcElement.status;
    console.log(url, status, text);
  };
  let errorHandler = (error) => {
    console.log(error);
  }
  xhr.onload = loadHandler;
  xhr.onerror = errorHandler;
  xhr.open(method, url);
  xhr.setRequestHeader('Content-Type', contentType);
  return xhr;
}

async function postToServer(url, data) {
  let xhr = buildXhr('POST', 'application/json', url);
  xhr.send(JSON.stringify(data));
}

async function sendNotification(who) {
  let subscription = await getSubscription();
  let randy = Math.floor(Math.random() * 100);
  let notification = {
    title: 'Test ' + randy, 
    options: { body: 'Test body ' + randy }
  };
  postToServer('/notify-' + who, {
    subscription: subscription,
    notification: notification
  });
}

async function updateUI() {
  let registration = await getRegistration();
  let subscription = await getSubscription();
  
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
      'Service worker registered. Scope: ' + registration.scope;
    unRegButton.disabled = false;
  } else {
    reg.textContent = 'No service worker registration.'
    regButton.disabled = false;
  }
  if (subscription) {
    sub.textContent = 
      'Subscription endpoint: ' + subscription.endpoint;
    unSubButton.disabled = false;
  } else {
    sub.textContent = 'No push subscription.'
    if (registration) {
      subButton.disabled = false;
    }
  }
}

async function getRegistration() {
  return navigator.serviceWorker.getRegistration();
}

async function getSubscription() {
  let registration = await getRegistration();
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

async function subscribeToPush() {
  let registration = await getRegistration();
  let subscription = await getSubscription();
  if (!subscription) {
    let options = {
      userVisibleOnly: true,
      applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC_KEY)
    };
    subscription = await registration.pushManager.subscribe(options);
  }
  postToServer('/addsubscription', subscription);
  updateUI();
}

async function unSubscribeFromPush() {
  let subscription = await getSubscription();
  if (!subscription) { 
    return; 
  } else {
    postToServer('/removesubscription', subscription);
    await subscription.unsubscribe();
  }
  updateUI();
}

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
