const PRE = "DELTA"
const SUF = "MEET"
var room_id;
var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
var local_stream;
var screenStream;
var peer = null;
var currentPeer = null
var screenSharing = false

function createRoom() {
  console.log("Creating Room")
  let room = document.getElementById("room-input").value;
  if (room == " " || room == "") {
    alert("Please enter room number")
    return;
  }
  room_id = PRE + room + SUF;
  peer = new Peer(room_id)
  peer.on('open', (id) => {
    console.log("Peer Connected with ID: ", id)

    getUserMedia({
      video: true,
      audio: true
    }, (stream) => {
      local_stream = stream;
      setLocalStream(local_stream)
    }, (err) => {
      console.log(err)
    })
    notify("Waiting for peer to join.")
  })
  peer.on('call', (call) => {
    call.answer(local_stream);
    call.on('stream', (stream) => {
      setRemoteStream(stream)
    })
    currentPeer = call;
  })
}

function setLocalStream(stream) {
  let video = document.getElementById("local-video");
  video.srcObject = stream;
  video.muted = true;
  video.play();
}

function setRemoteStream(stream) {
  var video_create = document.createElement("video")
  var create_div = document.createElement("div")
  var parent = document.querySelector(".local-meat")
  create_div.setAttribute("class", "video-item")
  video_create.setAttribute("id", "remote-video");
  create_div.appendChild(video_create)
  parent.appendChild(create_div)
  video_create.srcObject = stream
  video_create.play()

  // let video = document.getElementById("remote-video");
  // video.srcObject = stream;
  // video.play();
}

function joinRoom() {
  console.log("Joining Room")
  let room = document.getElementById("room-input").value;
  if (room == " " || room == "") {
    alert("Please enter room number")
    return;
  }
  room_id = PRE + room + SUF;

  peer = new Peer()
  peer.on('open', (id) => {
    console.log("Connected with Id: " + id)
    getUserMedia({
      video: true,
      audio: true
    }, (stream) => {
      local_stream = stream;
      setLocalStream(local_stream)
      notify("Joining peer")
      let call = peer.call(room_id, stream)
      call.on('stream', (stream) => {
        setRemoteStream(stream);
      })
      currentPeer = call;
    }, (err) => {
      console.log(err)
    })

  })
}



function notify(msg) {
  let notification = document.getElementById("notification")
  notification.innerHTML = msg
  notification.hidden = false
  setTimeout(() => {
    notification.hidden = true;
  }, 3000)
}


function startScreenShare() {
  if (screenSharing) {
    stopScreenSharing()
  }
  navigator.mediaDevices.getDisplayMedia({
    video: true
  }).then((stream) => {
    screenStream = stream;
    let videoTrack = screenStream.getVideoTracks()[0];
    videoTrack.onended = () => {
      stopScreenSharing()
    }
    if (peer) {
      let sender = currentPeer.peerConnection.getSenders().find(function(s) {
        return s.track.kind == videoTrack.kind;
      })
      sender.replaceTrack(videoTrack)
      screenSharing = true
    }
    console.log(screenStream)
  })
}

function stopScreenSharing() {
  if (!screenSharing) return;
  let videoTrack = local_stream.getVideoTracks()[0];
  if (peer) {
    let sender = currentPeer.peerConnection.getSenders().find(function(s) {
      return s.track.kind == videoTrack.kind;
    })
    sender.replaceTrack(videoTrack)
  }
  screenStream.getTracks().forEach(function(track) {
    track.stop();
  });
  screenSharing = false
}
// custom code js
var video = document.querySelector(".local-meat")
// video controling button code here
var button = document.querySelectorAll("button")
for (var i = 0; i < button.length; i++) {
  button[i].addEventListener("click", function() {
    for (var j = 0; j < button.length; j++) {
      button[j].classList.remove("active")
    }
    this.classList.add("active")
  })
}

// video controll
var admin_video = document.querySelector("#admin-video")
var webcame = document.getElementById("webcame")
var mutedBtn = document.getElementById("muted")
var one_off = document.getElementById("one_off")
webcame.onclick = () => {
  if (admin_video.paused) {
    admin_video.play()
  } else {
    admin_video.pause()
  }
}
mutedBtn.onclick = () => {
  if (admin_video.muted === true) {
    admin_video.muted = false
  } else {
    admin_video.muted = true;
  }
}

one_off.onclick = () => {
  admin_video.pause()
  admin_video.setAttribute('poster', 'images/crypto.png')
}
