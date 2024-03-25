import express from 'express';
import webpush from 'web-push';
import bodyParser from 'body-parser';
import session from 'express-session';
import { JSONFilePreset } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultData = { subscriptions: [] }
const db = await JSONFilePreset('.data/db.json', defaultData)
const vapidDetails = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY,
  subject: process.env.VAPID_SUBJECT
};

console.log(vapidDetails);

// Generate VAPID keys
// const vapidKeys = webpush.generateVAPIDKeys();
// console.log(vapidKeys);

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
  subscriptions.forEach(subscription => {
    const endpoint = subscription.endpoint;
    const id = endpoint.substr((endpoint.length - 8), endpoint.length);
    webpush.sendNotification(subscription, notification, options)
      .then(result => {
        console.log(`Endpoint ID: ${id}`);
        console.log(`Result: ${result.statusCode}`);
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
app.use(bodyParser.json());
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
