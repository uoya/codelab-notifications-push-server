const express = require('express');
const webpush = require('web-push');
const bodyparser = require('body-parser');
const session = require('express-session');

// Load the 
const handlers = require('./handlers.js');


const app = express();

app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'cats'
}));
app.use(bodyparser.json());
app.use(express.static('public'));

app.post('/addsubscription', handlers.addSubscription);
app.post('/removesubscription', handlers.removeSubscription);
app.post('/notify-all', handlers.notifyAll);
app.post('/notify-me', handlers.notifyMe);

app.get('/favicon.ico', (request, response) => {
  response.sendStatus(200);
});
app.get('/', (request, response) => {
  response.sendFile(__dirname + '/views/index.html');
});

const listener = app.listen(process.env.PORT, () => {
  console.log('Listening on port ' + listener.address().port);
});
