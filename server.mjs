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


// Generate VAPID keys
// const vapidKeys = webpush.generateVAPIDKeys();
// console.log(vapidKeys);

function createNotification() {
  return {
    title: 'UOYA WEB-PUSH!',
    options: { 
      body: `ID: ${Math.floor(Math.random() * 100)}`
    }
  };
}

function sendNotifications(subscriptions) {
  const notification = JSON.stringify(createNotification());
  webpush.setVapidDetails(vapidDetails.subject, vapidDetails.publicKey, vapidDetails.privateKey);
  const options = {
    TTL: 10000,
    urgency: 'normal'
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
        console.log(`Error: ${error.statusCode} `);
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
  db.update(({subscriptions}) => subscriptions.push(request.body)).then(() => {
    response.sendStatus(200);
  });
});

app.post('/remove-subscription', (request, response) => {
  console.log(`Unsubscribing ${request.body.endpoint}`);
  db.update(({subscriptions}) => subscriptions.splice(subscriptions.findIndex(s => s.endpoint === request.body.endpoint),1)).then(() => {
    response.sendStatus(200);
  });
});

app.post('/notify-me', (request, response) => {
  console.log(`Notifying ${request.body.endpoint}`);
  db.read();
  const subscription = db.data.subscriptions.find(s => s.endpoint === request.body.endpoint);
  sendNotifications([subscription]);
  response.sendStatus(200);
});

app.post('/notify-all', (request, response) => {
  console.log('Notifying all subscribers');
  db.read();  
  const subscriptions = db.data.subscriptions;
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
