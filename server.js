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
  console.log(myArray);
  myArray.map((i) => {
    sendNotification(subscriptions[i], notification);
  })
}

function sendNotification(subscription, notification) {
  if (subscriptions[subscription.endpoint]) {
    let payload = JSON.stringify(notification);
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
        console.log('Location: ', result.headers.location);
        console.log('Content type: ', result.headers['content-type']);
        console.log('Status: ', result.statusCode);
      })
      .catch((error) => { console.log(error) });
  }
}

app.use(express.static('public'));

app.post('/addsubscription', (request, response) => {
  let subscription = request.body;
  subscriptions[subscription.endpoint] = subscription;
  response.sendStatus(200);
});

app.post('/removesubscription', (request, response) => {
  let subscription = request.body;
  delete subscriptions[subscription.endpoint];
  response.sendStatus(200);
});

app.post('/test', (request, response) => {
  sendNotifications(subscriptions, JSON.parse(request.body));
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
