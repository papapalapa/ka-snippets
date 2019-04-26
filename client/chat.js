$(function() {
  // Initialize variables
  var $window = $(window);
  var $messages = $(".comments"); // Messages area
  var $inputMessage = $(".inputMessage"); // Input message input box

  // Prompt for setting a username
  var username;
  var $currentInput;

  var socket = io();

  // Sets the client's username
  const setUsername = () => {
    if (location.pathname === "/teacher.html") {
      username = "Adam Green";
    } else {
      username = "Janghoon Lee";
    }

    // If the username is valid
    if (username) {
      $currentInput = $inputMessage.focus();
    }
  };

  setUsername();

  // Sends a chat message
  const sendMessage = () => {
    var message = $inputMessage.val();
    // if there is a non-empty message and a socket connection
    if (message.trim()) {
      $inputMessage.val("");
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

    $messages.append($message);
    $messages[0].scrollTop = $messages[0].scrollHeight;
  };

  // Keyboard events

  $window.keydown(event => {
    // Auto-focus the current input when a key is typed
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
      $currentInput.focus();
    }
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
      if (username) {
        sendMessage();
        socket.emit("stop typing");
        typing = false;
      } else {
        setUsername();
      }
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
