const webpush = require('web-push');

let subscriptions = {};
let notification = {};

function sendNotifications(subscriptions, notification) {
  let myArray = Object.keys(subscriptions);
  myArray.map((i) => {
    doThing(subscriptions[i], notification);
  })
}

function doThing() {
  console.log('TODO: implement doThing');
}