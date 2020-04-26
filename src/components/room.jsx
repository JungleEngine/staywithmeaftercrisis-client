import React, { Component } from "react";
import io from "socket.io-client";
import RoomForm from "./roomForm";
import VideoPlayer from "./videoPlayer";
import { VIDEO_PLAYER_ACTIONS } from "./../constants/videoPlayerActions";

// To be added as props.
// const SOCKET_URL = "http://127.0.0.1:8090";

class Room extends Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: null,
      url: null,
    };
    this.videoPlayerRef = React.createRef();
    // Can be replaced by ()=> function as it binds this to Room Object
    this.eventHandlers = {
      connect: this.handleConnect.bind(this),
      setURL: this.setURL.bind(this),
      update: this.update.bind(this),
    };
    this.handleSubmitForm = this.handleSubmitForm.bind(this);
    this.sendToServer = this.sendToServer.bind(this);
    this.handleVideoPlayerEvents = this.handleVideoPlayerEvents.bind(this);
    this.renderVideoPlayer = this.renderVideoPlayer.bind(this);
    // Bind functions that needs reference to this
    this.pauseVideo = this.pauseVideo.bind(this);
    this.playVideo = this.playVideo.bind(this);
  }

  componentDidMount() {
    this.initSocket();
  }

  initSocket = async () => {
    const { id } = this.props.match.params;
    const [socketUrl, roomName, action] = id.split("&");

    const socket = io(socketUrl, {
      query: `roomName=${roomName}&action=${action}`,
      multiplex: false,
    });
    await this.setState({ socket });
    this.attachRoomEvents();
  };

  setURL(data) {
    console.log("received url:", data);
    this.setState({ url: data.url });
  }
  getVideoID() {
    let url = this.state.url;
    if (!url) {
      return null;
    }
    let vidID;
    let rx = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|&v(?:i)?=))([^#&?]*).*/;

    vidID = url.match(rx);
    if (vidID) {
      return vidID[1];
    } else {
      console.log("unable to parse youtube video: ", url);
      return null;
    }
  }
  update(data) {
    console.log("received update action: ", data);
    if (data.action === "play") {
      this.playVideo();
    }
    if (data.action === "pause") {
      this.pauseVideo();
    }
  }
  attachRoomEvents() {
    for (var event in this.eventHandlers) {
      this.state.socket.on(event, this.eventHandlers[event]);
    }
  }

  handleConnect() {
    console.log("Socket Connected");
  }

  handleSubmitForm(form) {
    console.log("form button clicked with value:", form);
    this.sendToServer("setRoomURL", { url: form.value });
  }

  sendToServer(channel, data) {
    this.state.socket.emit(channel, data);
  }
  handleVideoPlayerEvents(action, data) {
    console.log(`Event handler called from videoPlayer with action:${action}`);
    //if (action == VIDEO_PLAYER_ACTIONS.PAUSE) {
    this.sendToServer("update", { action: action, data: data });
    //}
    // if (!this.state.tmpCalledPause && action === VIDEO_PLAYER_ACTIONS.PLAY) {
    //   this.setState({ tmpCalledPause: 1 });
    //   this.pauseVideo();
    // }
  }
  // TODO: We will use seek instead, or seek then pause
  pauseVideo() {
    console.log("Room Manager is going to pause video..");
    this.videoPlayerRef.current.pause(this);
  }

  // TODO: We will use seek instead, or seek then play
  playVideo() {
    console.log("Room Manager is going to play video..");
    this.videoPlayerRef.current.play(this);
  }
  renderVideoPlayer() {
    if (this.state.url) {
      return (
        <VideoPlayer
          ref={this.videoPlayerRef}
          key="videoPlayer"
          handleEvents={this.handleVideoPlayerEvents}
          videoId={this.getVideoID()}
        />
      );
    } else {
      return <h1>URL not set</h1>;
    }
  }
  render() {
    return (
      <div>
        <h1>Room Page</h1>
        <RoomForm key="urlbtn" submit={this.handleSubmitForm} />
        {this.renderVideoPlayer()}
      </div>
    );
  }
}

export default Room;
