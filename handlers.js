const database = require('./database.js');
const actions = require('./actions.js');

function addSubscription(request, response) {
  let subscription = request.body;
  let subscriptions = database.getSubscriptions();
  subscriptions[subscription.endpoint] = subscription;
  response.sendStatus(200);
}

function removeSubscription(request, response) {
  let subscription = request.body;
  let subscriptions = database.getSubscriptions();
  delete subscriptions[subscription.endpoint];
  response.sendStatus(200);
}

function notifyAll(request, response) {
  let subscriptions = database.getSubscriptions();
  let notification = request.body.notification;
  actions.sendNotifications(subscriptions, notification);
  response.sendStatus(200);
}

function notifyMe(request, response) {
  let subscription = request.body.subscription;
  let notification = request.body.notification;
  actions.sendNotification(subscription, notification);
  response.sendStatus(200);
}

let handlers = {
  addSubscription: addSubscription,
  removeSubscription: removeSubscription,
  notifyAll: notifyAll,
  notifyMe: notifyMe
}

module.exports = handlers;