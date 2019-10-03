let subscriptions = require('./subscriptions.json');
let actions = require('./actions.js');

let handlers = {
  addSubscription: (request, response) => {
    let subscription = request.body;
    subscriptions[subscription.endpoint] = subscription;
    response.sendStatus(200);
  },
  removeSubscription: (request, response) => {
    let subscription = request.body;
    delete subscriptions[subscription.endpoint];
    response.sendStatus(200);
  },
  notifyAll: (request, response) => {
    let notification = request.body.notification;
    sendNotifications(subscriptions, notification);
    response.sendStatus(200);
  },
  notifyMe: () => {}
}

module.exports = handlers;
