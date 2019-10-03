const webpush = require('web-push');
let subscriptions = require('./subscriptions.json');

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

function sendNotifications(subscriptions, notification) {
  let myArray = Object.keys(subscriptions);
  //console.log(myArray);
  myArray.map((i) => {
    sendNotification(subscriptions[i], notification);
  })
}

function sendNotification(subscription, notification) {  
  if (!(subscriptions[subscription.endpoint])) {
    return;
  }
  let payload = JSON.stringify(notification);
  let end = subscription.endpoint.length;
  let id = subscription.endpoint.substr((end - 8), end);
  let options = {
    gcmAPIKey: process.env.FCM_KEY,
    vapidDetails: {
      subject: process.env.VAPID_SUBJECT,
      publicKey: process.env.VAPID_PUBLIC_KEY,
      privateKey: process.env.VAPID_PRIVATE_KEY
    },
    TTL: 9000
  };
  webpush.sendNotification(subscription, payload, options)
    .then((result) => { 
      console.log(id, result.statusCode);
    })
    .catch((error) => { 
      console.log(id, error.body);
      delete subscriptions[error.endpoint];
    });
}

let actions = {
  sendNotifications: sendNotifications,
  sendNotification: sendNotification
}

module.exports = actions;
