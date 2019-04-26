// Import a library to read environment variables from the device
require("dotenv").load();

// Setup basic express server
var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);
var port = process.env.PORT || 3000;

// Twilio Video Chat
var AccessToken = require("twilio").jwt.AccessToken;
var VideoGrant = AccessToken.VideoGrant;

// Set public directory to /client
app.use(express.static(__dirname + "/client"));

// Listen on the defined port
server.listen(port, () => {
  console.log("Server listening at port %d", port);
});

// Generate Video Token for Twilio SDK
app.get("/token", function(request, response) {
  var randomID = Math.floor(Math.random() * 99999);
  var identity = `student_${randomID}`;

  // Create an access token which we will sign and return to the client,
  // containing the grant we just created.
  var token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_API_KEY,
    process.env.TWILIO_API_SECRET
  );

  // Assign the generated identity to the token.
  token.identity = identity;

  // Grant the access token Twilio Video capabilities.
  var grant = new VideoGrant();
  token.addGrant(grant);

  // Serialize the token to a JWT string and include it in a JSON response.
  response.send({
    identity: identity,
    token: token.toJwt()
  });
});

// Chatroom
io.on("connection", socket => {
  console.log(socket.username);
  socket.on("drawing", data => socket.broadcast.emit("drawing", data));

  // when the client emits 'new message', this listens and executes
  socket.on("new message", (username, message) => {
    // we tell the client to execute 'new message' with the parsed data
    socket.broadcast.emit("new message", {
      username: username,
      message: message
    });
  });
});
