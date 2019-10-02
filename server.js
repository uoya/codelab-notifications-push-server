const express = require('express');
const push = require('./push.js');
const webpush = require('web-push');
const app = express();

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
  myArray.map((i) => {
    sendNotification(subscriptions[i], notification);
  })
}
function sendNotification(subscription, notification) {
  if (subscriptions[subscription.endpoint]) {
    console.log('Send the notification');
  } 
}
function addSubscription(body) {
  
}

app.use(express.static('public'));

app.get('addsubscription', (request, response) => {
  console.log('Implement addsubscription endpoint');
  addSubscription(request.body);
  response.send(200);
});

app.get('removesubscription', (request, response) => {
  console.log('Implement removesubscription endpoint');
});

app.get('/test', (request, response) => {
  console.log('Implement test endpoint');
  response.send(200);
});

app.get('/favicon.ico', (request, response) => {
  response.send(200);
});

app.get('/', (request, response) => {
  response.sendFile(__dirname + '/views/index.html');
});

const listener = app.listen(process.env.PORT, () => {
  console.log('Listening on port ' + listener.address().port);
});
