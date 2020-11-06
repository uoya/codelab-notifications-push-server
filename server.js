const express = require('express');
const webpush = require('web-push');
const bodyparser = require('body-parser');
const session = require('express-session');

// { publicKey: 'BOyFjA9NR-Bf9lSB_T9EOqAMZ_pwMLZEwGC9QPBD8AQgGCeR3QUcKFRihphzsC9bzrFiAYZr2wOgy4SlIiFhok4',
//   privateKey: 'YneqpztUhGVl8jNNtK8FTR1CKm7ERKY4lYHynM-RS4I' }

// Generate VAPID keys
const vapidKeys = webpush.generateVAPIDKeys();
console.log(vapidKeys);

const vapidDetails = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY,
  subject: process.env.VAPID_SUBJECT
}

// Create a test notification.
function createNotification() {
  // Insert a random number in the title and body text.
  // This just helps you identify notifications while
  // playing around with them
  let randy = Math.floor(Math.random() * 100);
  let notification = {
    title: 'Test ' + randy, 
    options: { 
      body: 'Test body ' + randy
      // More options here, e.g icons, actions, etc
    }
  };
  return notification;
}

function sendNotifications(database, endpoints) {
  let notification = JSON.stringify(createNotification());
  let options = {
    TTL: 10000, // Time-to-live. Notifications expire after this.
    vapidDetails: vapidDetails // VAPID keys from .env
  };
  endpoints.map(endpoint => {
    let subscription = database[endpoint];
    let id = endpoint.substr((endpoint.length - 8), endpoint.length);
    webpush.sendNotification(subscription, notification, options)
    .then(result => {
      console.log(`Endpoint ID: ${id}`);
      console.log(`Result: ${result.statusCode} `);
    })
    .catch(error => {
      console.log(`Endpoint ID: ${id}`);
      console.log(`Error: ${error.body} `);
    });
  });
}

const app = express();
app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'CATS. CATS ARE NICE.'
}));
app.use(bodyparser.json());
app.use(express.static('public'));

app.post('/add-subscription', (request, response) => {
  let subscriptions = Object.assign({}, request.session.subscriptions);
  subscriptions[request.body.endpoint] = request.body;
  request.session.subscriptions = subscriptions;
  response.sendStatus(200);
});

app.post('/remove-subscription', (request, response) => {
  let subscriptions = Object.assign({}, request.session.subscriptions);
  delete subscriptions[request.body.endpoint];
  request.session.subscriptions = subscriptions;
  response.sendStatus(200);
});

app.post('/notify-me', (request, response) => {
  let endpoint = request.body.endpoint;
  let database = Object.assign({}, request.session.subscriptions);
  sendNotifications(database, [endpoint]);
  response.sendStatus(200);
});

app.post('/notify-all', (request, response) => {
  let database = Object.assign({}, request.session.subscriptions);
  sendNotifications(database, Object.keys(database));
  response.sendStatus(200);
});

app.get('/get-subscription-count', (request, response) => {
  console.log(typeof request.session.subscriptions);
  response.sendStatus(200);
});

app.get('/', (request, response) => {
  response.sendFile(__dirname + '/views/index.html');
});

const listener = app.listen(process.env.PORT, () => {
  console.log('Listening on port ' + listener.address().port);
});
