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
    icon: 'https://cdn2.thecatapi.com/images/b50.gif'
  };
  console.log('Creating new notification');
  let notification = new Notification(title, options);
  notification.onerror = (event) => { 
    console.log('Could not send notification');
    console.log(event);
  };
}

window.onload = () => { 
  showPermission();  
};

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./serviceworker.js')
    .then((registration) => { 
      console.log('Service worker registered. Scope: ' + registration.scope); 
      console.log()
    })
    .catch((error) => { console.log(error); });
}