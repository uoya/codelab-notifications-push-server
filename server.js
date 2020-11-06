const express = require('express');
const webpush = require('web-push');
const bodyparser = require('body-parser');
const session = require('express-session');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('.data/db.json');
const db = low(adapter);


db.defaults({
  subscriptions: []
}).write();

// { publicKey: 'BOyFjA9NR-Bf9lSB_T9EOqAMZ_pwMLZEwGC9QPBD8AQgGCeR3QUcKFRihphzsC9bzrFiAYZr2wOgy4SlIiFhok4',
//   privateKey: 'YneqpztUhGVl8jNNtK8FTR1CKm7ERKY4lYHynM-RS4I' }

// Generate VAPID keys
const vapidKeys = webpush.generateVAPIDKeys();
// console.log(vapidKeys);

const vapidDetails = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY,
  subject: process.env.VAPID_SUBJECT
}

function createNotification() {
  return {
    title: 'Hello, Notifications!',
    options: { 
      body: `ID: ${Math.floor(Math.random() * 100)}`
    }
  };
}

function sendNotifications(subscriptions) {
  const notification = JSON.stringify(createNotification());
  const options = {
    TTL: 10000,
    vapidDetails: vapidDetails
  };
  console.log(subscriptions);
  subscriptions.forEach(subscription => {
    const endpoint = subscription.endpoint;
    const id = endpoint.substr((endpoint.length - 8), endpoint.length);
    webpush.sendNotification(subscription, notification, options)
    .then(result => {
      console.log(`Endpoint ID: ${id}`);
      console.log(`Result: ${result.statusCode} `);
    })
    .catch(error => {
      console.log(`Endpoint ID: ${id}`);
      console.log(`Error: ${error} `);
    });
  });
}

const app = express();
app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'kg94gja2359gjdk46jgf'
}));
app.use(bodyparser.json());
app.use(express.static('public'));

app.post('/add-subscription', (request, response) => {
  console.log(`Subscribing ${request.body.endpoint}`);
  db.get('subscriptions')
    .push(request.body)
    .write();
  response.sendStatus(200);
});

app.post('/remove-subscription', (request, response) => {
  console.log(`Unsubscribing ${request.body.endpoint}`);
  db.get('subscriptions')
    .remove({endpoint: request.body.endpoint})
    .write();
  response.sendStatus(200);
});

app.post('/notify-me', (request, response) => {
  console.log(`Notifying ${request.body.endpoint}`);
  const subscription = db.get('subscriptions').find({endpoint: request.body.endpoint}).value();
  sendNotifications([subscription]);
  response.sendStatus(200);
});

app.post('/notify-all', (request, response) => {
  console.log('Notifying all subscribers');
  const subscriptions = db.get('subscriptions').cloneDeep().value();
  if (subscriptions.length > 0) {
    sendNotifications(subscriptions);
    response.sendStatus(200);
  } else {
    response.sendStatus(409);
  }
});

app.get('/', (request, response) => {
  response.sendFile(__dirname + '/views/index.html');
});

const listener = app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${listener.address().port}`);
});
