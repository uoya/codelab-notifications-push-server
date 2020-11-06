const express = require('express');
const webpush = require('web-push');
const bodyparser = require('body-parser');
const session = require('express-session');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('.data/db.json');
const db = low(adapter);

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
  console.log(endpoints.length);
  let notification = JSON.stringify(createNotification());
  let options = {
    TTL: 10000, // Time-to-live. Notifications expire after this.
    vapidDetails: vapidDetails // VAPID keys from .env
  };
  endpoints.forEach(endpoint => {
    const subscription = database[endpoint];
    const id = endpoint.substr((endpoint.length - 8), endpoint.length);
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
  // if (!request.session.subscriptions) request.session.subscriptions = {};
  // request.session.subscriptions[request.body.endpoint] = request.body;
  // console.info(`Subscribed ${request.body.endpoint}`);
  db.get('subscriptions')
    .push(request.body)
    .write();
  response.sendStatus(200);
});

app.post('/remove-subscription', (request, response) => {
  if (request.session.subscriptions[request.body.endpoint]) {
    delete request.session.subscriptions[request.body.endpoint];
    console.info(`Deleted ${request.body.endpoint}`);
  }
  response.sendStatus(200);
});

app.post('/notify-me', (request, response) => {
  sendNotifications(request.session.subscriptions, [request.body.endpoint]);
  response.sendStatus(200);
});

app.post('/notify-all', (request, response) => {
  if (request.session.subscriptions) {
    sendNotifications(request.session.subscriptions, 
        Object.keys(request.session.subscriptions));
    response.sendStatus(200);
  } else {
    response.sendStatus(409);
  }
});

app.post('/log-endpoints', (request, response) => {
  console.log(request.session.subscriptions);
  response.sendStatus(200);
});

app.get('/', (request, response) => {
  response.sendFile(__dirname + '/views/index.html');
});

const listener = app.listen(process.env.PORT, () => {
  console.log('Listening on port ' + listener.address().port);
});
