// Print permission status to the console and update the onscreen message.
async function updateUI() {
  let permissionState = Notification.permission;
  let subscriptionState = await getSubscription();
  
  console.log('Notification permission is ' + permissionState);
  console.log('Subscription is ' + subscriptionState);
  
  let p1 = document.getElementById('permission');
  let p2 = document.getElementById('subscription');
  
  p1.textContent = 'Notification permission is ' + Notification.permission;
  p2.textContent = 'Subscription is ' + subscriptionState;
  
}

// Use the Notification API to request permission to send notifications.
function requestPermission() {
  Notification.requestPermission()
    .then((permission) => {
      console.log('Promise resolved: ' + permission);
      showPermission();
    })
    .catch((error) => {
      console.log('Promise was rejected');
      console.log(error);
    });
}

async function getRegistration() {
  let reg = await navigator.serviceWorker.getRegistration()
    .then((registration) => { 
      console.log(registration.scope);
      return registration; 
    })
    .catch((err => { 
      console.log(err); 
      return; 
    }));
  return reg;
}

async function getSubscription() {
  let reg = await getRegistration();
  console.log(await reg.pushManager.getSubscription());
  return 'i am a subscription';
}

async function subscribeToPush() {
  let reg = await getRegistration;
  if (reg) {
    console.log(reg.pushManager);
    return reg.pushManager;
  }
}

// Use the Notification constructor to create and send a new Notification. 
function sendNotification() {
  let title = 'Test';
  let options = {
    body: 'body',
    data: { 
      cheese: 'I like cheese',
      pizza: 'Excellent cheese delivery mechanism',
      arbitrary: { 
        faveNumber: 42,
        myBool: true
      }
    },
    actions: [{
      action: 'cart',
      title: 'View Cart'
    },{
      action: 'buy',
      title: 'Buy Stuff'
    }],
    icon: 'https://cdn2.thecatapi.com/images/b50.gif'
  };
  console.log('Creating new notification');
  
  navigator.serviceWorker.getRegistration()
    .then((registration) => {
      registration.showNotification(title, options)
        .then((result) => { console.log(result); })
        .catch((err) => { console.log(err); } );
    })
    .catch((err) => { console.log(err); } );
}

window.onload = () => { 
  updateUI();  
};

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./serviceworker.js')
    .then((registration) => { 
      console.log('Service worker registered. Scope: ' + registration.scope); 
      /* 
      let worker = navigator.serviceWorker.controller;
      if (worker) {
        worker.postMessage('hi');
      }
      else { console.log(
        'Either there is no active service worker, ' + 
        'or you did a hard refresh. ' + 
        'Try doing a soft refresh.'
      );}
      */
    })
    .catch((error) => { console.log(error); });
}
