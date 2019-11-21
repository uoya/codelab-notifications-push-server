const express = require('express');
const webpush = require('web-push');
const bodyparser = require('body-parser');
const session = require('express-session');

// Generate VAPID keys (only do this once). 
/* 
 * const vapidKeys = webpush.generateVAPIDKeys();
 * console.log(vapidKeys);
 */

// Get VAPID details from environment variables.
const vapidDetails = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY,
  subject: process.env.VAPID_SUBJECT
}

// Create a test notification.
function createNotification() {
  // Include a random number to help tell the
  // difference between test notifications.
  let randy = Math.floor(Math.random() * 100);
  let notification = {
    title: 'Test ' + randy, 
    options: { body: 'Test body ' + randy }
  };
  return notification;
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
  // TODO: implement handler for /add-subscription
  response.sendStatus(200);
});

app.post('/remove-subscription', (request, response) => {
  // TODO: implement handler for /remove-subscription
  response.sendStatus(200);
});

app.post('/notify-me', (request, response) => {
  sendNotification({subscription: })
  response.sendStatus(200);
});

app.post('/notify-all', (request, response) => {
  sendNotification({});
  response.sendStatus(200);
});

app.get('/', (request, response) => {
  response.sendFile(__dirname + '/views/index.html');
});

const listener = app.listen(process.env.PORT, () => {
  console.log('Listening on port ' + listener.address().port);
});
