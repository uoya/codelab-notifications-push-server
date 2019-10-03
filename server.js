const express = require('express');
const webpush = require('web-push');
const bodyparser = require('body-parser');
const app = express();
require('./handlers.js');

app.use(bodyparser.json());

/*
const vapidKeys = webpush.generateVAPIDKeys();
console.log(vapidKeys);
*/

webpush.setGCMAPIKey(process.env.FCM_KEY);
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

let subscriptions = {};
let notification = {};

function sendNotifications(subscriptions, notification) {
  let myArray = Object.keys(subscriptions);
  //console.log(myArray);
  myArray.map((i) => {
    sendNotification(subscriptions[i], notification);
  })
}

function sendNotification(subscription, notification) {  
  if (!(subscriptions[subscription.endpoint])) {
    return;
  }
  let payload = JSON.stringify(notification);
  let end = subscription.endpoint.length;
  let id = subscription.endpoint.substr((end - 8), end);
  let options = {
    gcmAPIKey: process.env.FCM_KEY,
    vapidDetails: {
      subject: process.env.VAPID_SUBJECT,
      publicKey: process.env.VAPID_PUBLIC_KEY,
      privateKey: process.env.VAPID_PRIVATE_KEY
    },
    TTL: 9000
  };
    
  webpush.sendNotification(subscription, payload, options)
    .then((result) => { 
      console.log(id, result.statusCode);
    })
    .catch((error) => { 
      console.log(id, error.body);
      delete subscriptions[error.endpoint];
    });
}

app.use(express.static('public'));

app.post('/addsubscription', addSubscription);

app.post('/removesubscription', (request, response) => {
  let subscription = request.body;
  delete subscriptions[subscription.endpoint];
  response.sendStatus(200);
});

app.post('/notify-all', (request, response) => {
  let notification = request.body.notification;
  sendNotifications(subscriptions, notification);
  response.sendStatus(200);
});

app.post('/notify-me', (request, response) => {
  let subscription = request.body.subscription;
  let notification = request.body.notification;
  sendNotification(subscription, notification);
  response.sendStatus(200);
});

app.get('/favicon.ico', (request, response) => {
  response.sendStatus(200);
});

app.get('/', (request, response) => {
  response.sendFile(__dirname + '/views/index.html');
});

const listener = app.listen(process.env.PORT, () => {
  console.log('Listening on port ' + listener.address().port);
});
