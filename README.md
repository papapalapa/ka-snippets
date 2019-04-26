# Khan Academy Open Hours - Code Snippet

This repository hosts several key code snippets written to develop the office hour feature for Khan Academy

## Directory Structure
```
- server.js
- /client
  - chat.js
  - dashboard.html
  - index.html
  - office-hour.html
  - video-broadcast.js
  - whiteboard.css
  - whiteboard.html
  - whiteboard.js
````
## File Roles
- **server.js** : responsible for running the web static, socket.io, REST server
- **/client** : consists of all the public files to be hosted on the static server
  - **chat.js** : listens to the broadcast + emit messages from the socket connection
  - **dashboard.html** : structures and renders UI for question aggregation dashboard and links with real-time cloud database
  - **index.html** : renders the CTA button that redirects to the dashboard onClick()
  - **office-hour.html** : renders UI for video-broadcast, chat, and whiteboard
  - **video-broadcast.js**: makes a HTTP POST request to the REST API to fetch video tokens and emits video track data
  - **whiteboard.css**: styles the whiteboard UI
  - **whiteboard.html**: structures UI for the whiteboard feature
  - **whiteboard.js**: listens to the socket broadcast for draw() event and evokes render method in the whiteboard
