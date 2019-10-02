const express = require('express');
const webpush = require('web-push');

const app = express();

app.use(express.static("public"));

app.get("/test", function(request, response) {
  console.log('congrats you hit the test endpoint');
  response.send(200);
});

app.get("/favicon.ico", function(request, response) {
  response.send(200);
});

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function(request, response) {
  response.sendFile(__dirname + "/views/index.html");
});

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
