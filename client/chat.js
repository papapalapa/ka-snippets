// Evoke on load
$(function() {
  // Initialize variables
  var $window = $(window); // Window Environment
  var $messages = $(".comments"); // Messages area
  var $inputMessage = $(".inputMessage"); // Input message input box

  // Prompt for setting a username
  var username;
  var $currentInput;

  // Refernce variable for websocket
  var socket = io(); 

  // Sets the client's username based on the current path name for demo
  const setUsername = () => {
    if (location.pathname === "/teacher.html") {
      // Civic partner's name to access the teacher page view
      username = "Adam Green";
    } else {
      // My name to access the non-teacher page view
      username = "Janghoon Lee";
    }

    // If the username is valid
    if (username) {
      // Focus the input field of chat
      $currentInput = $inputMessage.focus();
    }
  };
  
  // Call username-setting function
  setUsername();

  // Sends a chat message
  const sendMessage = () => {
    // Retrieve the DOM value of the input field
    var message = $inputMessage.val();
    // if there is a non-empty message and a socket connection
    if (message.trim()) {
      $inputMessage.val("");
      // JSON for chat message to be rendered to the DOM and broadcasted to the server
      addChatMessage({
        username: username,
        message: message
      });
      // tell server to execute 'new message' and send along one parameter
      socket.emit("new message", username, message);
    }
  };

  // Adds the visual chat message to the message list
  const addChatMessage = data => {
    // Template HTML for the chat message
    var $message = `
      <div class="comment">
        <div class="content">
            <a class="author">${data.username}</a>
            <div class="metadata">
                <div class="date">Just Now</div>
            </div>
            <div class="text">
                ${data.message}
            </div>
            <div class="actions">
                <a href="#">
                    <i class="thumbs up outline icon"></i>Like
                </a>
                <a href="#">
                    0 likes
                </a>
            </div>
        </div>
      </div>`;
    
    // Append to the chat list
    $messages.append($message);
    // Scroll to the bottom of the chat list for the most recent view
    $messages[0].scrollTop = $messages[0].scrollHeight;
  };

  // Keyboard events

  // Template function for every key events
  $window.keydown(event => {
    // Auto-focus the current input when a key is typed
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
      $currentInput.focus();
    }
    // When the client hits ENTER on their keyboard and the username is valid
    if (event.which === 13 && username) {
        // Send message
        sendMessage();
    }
  });

  // Focus input when clicking on the message input's border
  $inputMessage.click(() => {
    $inputMessage.focus();
  });

  // Socket events

  // Whenever the server emits 'new message', update the chat body
  socket.on("new message", data => {
    addChatMessage(data);
  });
});
