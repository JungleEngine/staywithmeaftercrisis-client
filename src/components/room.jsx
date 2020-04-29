import React, { Component } from "react";
import io from "socket.io-client";
import RoomForm from "./roomForm";
import VideoPlayer from "./videoPlayer";
import { VIDEO_PLAYER_ACTIONS } from "./../constants/videoPlayerActions";

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

    // Bind functions that needs reference to this
    this.handleSubmitForm = this.handleSubmitForm.bind(this);
    this.sendToServer = this.sendToServer.bind(this);
    this.handleVideoPlayerEvents = this.handleVideoPlayerEvents.bind(this);
    this.handleVideoPlayerIntervalUpdates = this.handleVideoPlayerIntervalUpdates.bind(
      this
    );

    this.renderVideoPlayer = this.renderVideoPlayer.bind(this);
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
    if (data.action === "seek") {
      this.seekVideo(data);
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

  sendToServer(channel, _data) {
    this.state.socket.emit(channel, _data);
  }

  handleVideoPlayerIntervalUpdates(data) {
    console.log(
      `Interval updates from player: currentTime:${data.currentTime}`
    );

    this.sendToServer("update", {
      action: "seek",
      currentTime: data.currentTime,
    });
  }

  handleVideoPlayerEvents(action, _data) {
    console.log(`Event handler called from videoPlayer with action:${action}`);
    this.sendToServer("update", { action: action, data: {} });
  }

  pauseVideo() {
    console.log("Room Manager is going to pause video..");
    this.videoPlayerRef.current.pause(this);
  }

  playVideo() {
    console.log("Room Manager is going to play video..");
    this.videoPlayerRef.current.play(this);
  }

  //TODO:: Check potential bug may occur as player maybe called to seek but not loaded yet.
  //This potential bug is probably fixed by adding videoplayer ready state, updated when player is ready (onReady)
  seekVideo(data) {
    console.log("Room Manager is going to seek video..");
    this.videoPlayerRef.current.seek(this, {
      currentTime: data.data.currentTime,
    });
  }

  renderVideoPlayer() {
    if (this.state.url) {
      return (
        <VideoPlayer
          ref={this.videoPlayerRef}
          key="videoPlayer"
          videoPlayerIntervalUpdates={this.handleVideoPlayerIntervalUpdates}
          updatesInterval={50000}
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
