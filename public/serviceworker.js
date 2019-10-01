console.log('Hello from serviceworker.js');

this.onmessage = (message) => {
  console.log(message);
}

console.log(this);
