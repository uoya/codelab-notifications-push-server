const webpush = require('web-push');

/*
const vapidKeys = webpush.generateVAPIDKeys();
console.log(vapidKeys);
*/

webpush.setGCMAPIKey(process.env.FCM_KEY);
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

const pushOptions = {
  gcmAPIKey: process.env.FCM_KEY,
  vapidDetails: {
    subject: process.env.VAPID_SUBJECT,
    publicKey: process.env.VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY
  }
};

function sendNotifications(subscriptions, notification) {
  let myArray = Object.keys(subscriptions);
  let results = myArray.map((i) => {
    return sendNotification(subscriptions, subscriptions[i], notification);
  });
}

function sendNotification(subscriptions, subscription, notification) { 
  let endpoint = subscription.endpoint;
  if (!(subscriptions[endpoint])) {
    return false;
  }
  let id = endpoint.substr((endpoint.length - 8), endpoint.length);
  let options = Object.assign({}, pushOptions, { TTL: 9000 });
  let payload = JSON.stringify(notification);
  
  return webpush.sendNotification(subscription, payload, options)
  .then((result) => { 
    return { id: result.statusCode } 
  })
  .catch((error) => { 
    delete subscriptions[error.endpoint];
    return { id: error.body };
  });
}

let push = {
  sendNotifications: sendNotifications,
  sendNotification: sendNotification
}

module.exports = push;
