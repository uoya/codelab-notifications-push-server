const push = require('./push.js');

function addSubscription(request, response) {
  let endpoint = request.body.endpoint;
  let subscriptions = request.session.subscriptions;
  subscriptions = Object.assign({}, subscriptions, {
    [endpoint]: request.body
  });
  request.session.subscriptions = subscriptions;
  response.sendStatus(200);
}

function removeSubscription(request, response) {
  let endpoint = request.body.endpoint;
  let subscriptions = request.session.subscriptions;
  subscriptions = Object.assign({}, subscriptions, {
    [endpoint]: false
  });
  request.session.subscriptions = subscriptions;
  response.sendStatus(200);
}

function notifyAll(request, response) {
  let subscriptions = request.session.subscriptions;
  let notification = request.body.notification;
  push.sendNotifications(subscriptions, notification);
  response.sendStatus(200);
}

function notifyMe(request, response) {
  let subscriptions = request.session.subscriptions;
  let subscription = request.body.subscription;
  let notification = request.body.notification;
  if (subscription) {
    push.sendNotification(subscriptions, subscription, notification);
  }
  response.sendStatus(200);
}

let handlers = {
  addSubscription: addSubscription,
  removeSubscription: removeSubscription,
  notifyAll: notifyAll,
  notifyMe: notifyMe
}

module.exports = handlers;
