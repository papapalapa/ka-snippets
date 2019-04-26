// MAIN APPLICATION

// Import twilio SDK
var Video = require("twilio-video");

// Initiate variables for video-broadcast
var activeRoom;
var previewTracks;
var identity;
var roomName;

// Attach the Tracks to the DOM.
function attachTracks(tracks, container) {
  // Loop for each track in the queue
  tracks.forEach(function(track) {
    container.appendChild(track.attach());
  });
}

// Attach the Participant's Tracks to the DOM.
function attachParticipantTracks(participant, container) {
  // Loop for each track in the queue
  var tracks = Array.from(participant.tracks.values());
  attachTracks(tracks, container);
}

// Detach the Tracks from the DOM.
function detachTracks(tracks) {
  // Loop for each track in the queue
  tracks.forEach(function(track) {
    track.detach().forEach(function(detachedElement) {
      detachedElement.remove();
    });
  });
}

// Detach the Participant's Tracks from the DOM.
function detachParticipantTracks(participant) {
  // Loop for each track in the queue
  var tracks = Array.from(participant.tracks.values());
  detachTracks(tracks);
}

// When we are about to transition away from this page, disconnect
// from the room, if joined.
window.addEventListener("beforeunload", leaveRoomIfJoined);

// Obtain a token from the server in order to connect to the Room.
$.getJSON("/token", function(data) {
  identity = data.identity;

  // roomName = document.getElementById('room-name').value;
  roomName = "minerva";

  log("Joining room '" + roomName + "'...");
  var connectOptions = {
    name: roomName,
    logLevel: "debug"
  };
  
  // Join the Room with the token from the server and the
  // LocalParticipant's Tracks.
  Video.connect(data.token, connectOptions).then(roomJoined, function(error) {
    log("Could not connect to Twilio: " + error.message);
  });
});

// Successfully connected!
function roomJoined(room) {
  window.room = activeRoom = room;

  log("Joined as '" + identity + "'");

  // Attach LocalParticipant's Tracks, if not already attached.
  var previewContainer = document.getElementById("local-media");
  // Append to the DOM
  if (!previewContainer.querySelector("video")) {
    attachParticipantTracks(room.localParticipant, previewContainer);
  }

  // Attach the Tracks of the Room's Participants.
  room.participants.forEach(function(participant) {
    log("Already in Room: '" + participant.identity + "'");
    var previewContainer = document.getElementById("remote-media");
    // Add to the track queue
    attachParticipantTracks(participant, previewContainer);
  });

  // When a Participant joins the Room, log the event.
  room.on("participantConnected", function(participant) {
    log("Joining: '" + participant.identity + "'");
  });

  // When a Participant adds a Track, attach it to the DOM.
  room.on("trackAdded", function(track, participant) {
    log(participant.identity + " added track: " + track.kind);
    var previewContainer = document.getElementById("remote-media");
    // Add to the track queue and render to the DOM
    attachTracks([track], previewContainer);
  });

  // When a Participant removes a Track, detach it from the DOM.
  room.on("trackRemoved", function(track, participant) {
    log(participant.identity + " removed track: " + track.kind);
    // Remove from the track queue
    detachTracks([track]);
  });

  // When a Participant leaves the Room, detach its Tracks.
  room.on("participantDisconnected", function(participant) {
    log("Participant '" + participant.identity + "' left the room");
    // Remove from the participant queue
    detachParticipantTracks(participant);
  });

  // Once the LocalParticipant leaves the room, detach the Tracks
  // of all Participants, including that of the LocalParticipant.
  room.on("disconnected", function() {
    log("Left");
    detachParticipantTracks(room.localParticipant);
    room.participants.forEach(detachParticipantTracks);
    activeRoom = null;
  });
}


// Activity log.
function log(message) {
  console.log(message);
}

// Leave Room.
function leaveRoomIfJoined() {
  if (activeRoom) {
    activeRoom.disconnect();
  }
}
