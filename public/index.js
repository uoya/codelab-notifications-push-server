// Print permission status to the console and update the onscreen message.
function showPermission() {
  console.log('Notification permission is ' + Notification.permission);
  let p = document.getElementById('permission');
  p.textContent = 'Notification permission is ' + Notification.permission;
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

function getRegistration() {
  let reg = navigator.serviceWorker.getRegistration()
    .then((registration) => { 
      console.log(registration.scope);
      return registration; 
    })
    .catch();
}

function subscribeToPush() {
  navigator.
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
  showPermission();  
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
