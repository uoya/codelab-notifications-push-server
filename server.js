const express = require('express');
const webpush = require('web-push');
const bodyparser = require('body-parser');
const session = require('express-session');

// Generate VAPID keys (only do this once). 
/* 
 * const vapidKeys = webpush.generateVAPIDKeys();
 * console.log(vapidKeys);
 */

const vapidDetails = {
  // TODO: Load VAPID details from environment variables.
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
  // TODO: Implement functionality to send notifications.
  console.log('TODO: Implement sendNotifications()');
  console.log('Endpoints to send to: ', endpoints);
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
  console.log('TODO: Implement handler for /add-subscription');
  console.log('Request body: ', request.body);
  response.sendStatus(200);
});

app.post('/remove-subscription', (request, response) => {
  // TODO: implement handler for /remove-subscription
  console.log('TODO: Implement handler for /remove-subscription');
  console.log('Request body: ', request.body);
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

app.get('/', (request, response) => {
  response.sendFile(__dirname + '/views/index.html');
});

const listener = app.listen(process.env.PORT, () => {
  console.log('Listening on port ' + listener.address().port);
});
