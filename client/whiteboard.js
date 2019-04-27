// Declare strict mode in ES5 to prevent the use of undeclared variables
"use strict";

// Initial function evoke on load
(function() {
  // Connect to the socket server
  var socket = io();
  // Get the DOM elements
  var canvas = document.getElementsByClassName("whiteboard")[0];
  var colors = document.getElementsByClassName("color");
  var context = canvas.getContext("2d");
  
  // Set initial pen color to white
  var current = {
    color: "white"
  };
  
  // Drawing status check
  var drawing = false;

  // Add mouse event handler to the canvas
  canvas.addEventListener("mousedown", onMouseDown, false);
  canvas.addEventListener("mouseup", onMouseUp, false);
  canvas.addEventListener("mouseout", onMouseUp, false);
  canvas.addEventListener("mousemove", throttle(onMouseMove, 10), false);

  //Touch support for mobile devices
  canvas.addEventListener("touchstart", onMouseDown, false);
  canvas.addEventListener("touchend", onMouseUp, false);
  canvas.addEventListener("touchcancel", onMouseUp, false);
  canvas.addEventListener("touchmove", throttle(onMouseMove, 10), false);
  
  // Attach event listeners to each color
  for (var i = 0; i < colors.length; i++) {
    colors[i].addEventListener("click", onColorUpdate, false);
  }

  // Call draw event when the server emits "drawing" event
  socket.on("drawing", onDrawingEvent);

  // Clear the whiteboard on resize
  window.addEventListener("resize", onResize, false);
  onResize();

  // Draw on canvas as vector strokes
  function drawLine(x0, y0, x1, y1, color, emit) {
    context.beginPath(); // Initialize path
    context.moveTo(x0, y0); // Set starting point
    context.lineTo(x1, y1); // Set end point
    context.strokeStyle = color; // Set pen css color
    
    // Vary pen stroke size on color
    if (color === "black") {
      context.lineWidth = 50;
    } else {
      context.lineWidth = 4;
    }
    
    // Send event to the canvas
    context.stroke();
    context.closePath();
    
    // Stop the function when drawing stops
    if (!emit) {
      return;
    }
    
    // Retrieve relative width and height for the socket emit message
    var w = canvas.width;
    var h = canvas.height;

    // Emit drawing message to socket-connected clients
    socket.emit("drawing", {
      x0: x0 / w,
      y0: y0 / h,
      x1: x1 / w,
      y1: y1 / h,
      color: color
    });
  }
  
  // Start drawing event
  function onMouseDown(e) {
    drawing = true;
    current.x = e.clientX || e.touches[0].clientX;
    current.y = e.clientY || e.touches[0].clientY;
  }

  // Stop drawing event
  function onMouseUp(e) {
    if (!drawing) {
      return;
    }
    drawing = false;
    drawLine(
      current.x,
      current.y,
      e.clientX || e.touches[0].clientX,
      e.clientY || e.touches[0].clientY,
      current.color,
      true
    );
  }

  // Continue drawing event
  function onMouseMove(e) {
    if (!drawing) {
      return;
    }
    drawLine(
      current.x,
      current.y,
      e.clientX || e.touches[0].clientX,
      e.clientY || e.touches[0].clientY,
      current.color,
      true
    );
    current.x = e.clientX || e.touches[0].clientX;
    current.y = e.clientY || e.touches[0].clientY;
  }
  
  // Call color update event
  function onColorUpdate(e) {
    current.color = e.target.className.split(" ")[1];
  }

  // Limit the number of events per second
  function throttle(callback, delay) {
    var previousCall = new Date().getTime();
    return function() {
      var time = new Date().getTime();

      if (time - previousCall >= delay) {
        previousCall = time;
        callback.apply(null, arguments);
      }
    };
  }

  // Evoke canvas drawing for DOM canvas
  function onDrawingEvent(data) {
    var w = canvas.width;
    var h = canvas.height;
    drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
  }

  // Make the canvas fill its parent
  function onResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
})();
