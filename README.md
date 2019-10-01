# Get started with the Notifications API

Have you completed Step 2 of this codelab? If not, you might want to do that first! You can find it here: [notifications-step-2](https://glitch.com/edit/#!/notifications-step-2)

## Step 3 (Optional): Experiment!

The `Notification` constructor takes two parameters: `title` and `options`. `options` is an object with properties representing visual settings and data you can include in a notification. See the [MDN documentation on notification parameters](https://developer.mozilla.org/en-US/docs/Web/API/notification/Notification#Parameters) for more information. 

Example:

```js
let title = 'Title';
let options = {
  body: 'body',
  actions: [{
    action: 'shop',
    title: 'Shop'
  },{
    action: 'cart',
    title: 'View Cart'
  }],
  data: { 
    cheese: 'I like cheese',
    pizza: 'Excellent cheese delivery mechanism',
    arbitrary: { 
      faveNumber: 42,
      myBool: true
    }
  }
};
let notification = new Notification(title, options);
```

In the `sendNotification` function in index.js, edit the `options` object to experiment with some notification options. Try [Peter Beverloo's Notification Generator](https://tests.peter.sh/notification-generator/) for some ideas!

{ alert }

Note that the following `options` fields only work with a Service Worker:

```

```

Take the next codelab in this series, [Handle notifications with a service worker](http://) to explore more.
