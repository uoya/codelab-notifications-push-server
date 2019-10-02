const express = require('express');
const webpush = require('web-push');
const bodyparser = require('body-parser');
const app = express();

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
  myArray.map((i) => {
    sendNotification(subscriptions[i], notification);
  })
}

function sendNotification(subscription, notification) {
  if (subscriptions[subscription.endpoint]) {
    console.log('Send notification to ', subscription.endpoint);
  }
}

app.use(express.static('public'));

app.post('/addsubscription', (request, response) => {
  let subscription = request.body;
  console.log(subscriptions);
  subscriptions[subscription.endpoint] = subscription;
  response.sendStatus(200);
});

app.post('/removesubscription', (request, response) => {
  let subscription = request.body;
  delete subscriptions[subscription.endpoint];
  console.log(subscriptions);
  response.sendStatus(200);
});

app.get('/test', (request, response) => {
  console.log('Implement test endpoint');
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
