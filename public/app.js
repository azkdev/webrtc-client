/*global io*/
/** @type {RTCConfiguration} */
const config = {
  // eslint-disable-line no-unused-vars
  iceServers: [
    {
      urls: ["stun:stun.l.google.com:19302"]
    }
  ]
};

const socket = io.connect("https://192.168.1.109:30443");
const video = document.querySelector("video"); // eslint-disable-line no-unused-vars

window.onunload = window.onbeforeunload = function() {
  socket.close();
};

/*global socket, video, config*/
const peerConnections = {};
let ownStream;

/** @type {MediaStreamConstraints} */
const constraints = {
  // audio: true,
  video: { facingMode: "user" }
};

navigator.mediaDevices
  .getUserMedia(constraints)
  .then(function(stream) {
    video.srcObject = stream;
  })
  .catch(error => console.error(error));

navigator.mediaDevices
  .getDisplayMedia({ video: true, audio: true })
  .then(stream => {
    ownStream = stream;
    socket.emit("broadcaster");
  });

socket.on("answer", function(id, description) {
  peerConnections[id].setRemoteDescription(description);
});

socket.on("watcher", function(id) {
  console.log("on watcher client");
  const peerConnection = new RTCPeerConnection(config);
  peerConnections[id] = peerConnection;
  peerConnection.addStream(ownStream);
  peerConnection
    .createOffer()
    .then(sdp => peerConnection.setLocalDescription(sdp))
    .then(function() {
      socket.emit("offer", id, peerConnection.localDescription);
    });
  peerConnection.onicecandidate = function(event) {
    if (event.candidate) {
      socket.emit("candidate", id, event.candidate);
    }
  };
});

socket.on("candidate", function(id, candidate) {
  peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
});

socket.on("bye", function(id) {
  peerConnections[id] && peerConnections[id].close();
  delete peerConnections[id];
});
