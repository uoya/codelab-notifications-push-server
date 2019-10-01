console.log('Hello from serviceworker.js');

this.onmessage = (data) => {
  console.log('hi');
  console.log(data);
}
