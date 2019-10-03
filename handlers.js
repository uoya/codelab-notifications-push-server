let subscriptions = require('./subscriptions.json');

module.exports.addSubscription = (request, response) => {
  let subscription = request.body;
  subscriptions[subscription.endpoint] = subscription;
  response.sendStatus(200);
};
module.exports.removeSubscription = () => {};
  notifyAll: () => {},
  notifyMe: () => {}
}