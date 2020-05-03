import React, { Component } from "react";
import io from "socket.io-client";
import RoomForm from "./roomForm";
import VideoPlayer from "./videoPlayer";
// eslint-disable-next-line
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
    this.bufferVideo = this.bufferVideo.bind(this);
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
    if (
      this.videoPlayerRef.current.counters.play !== 0 ||
      this.videoPlayerRef.current.counters.pause !== 0 ||
      this.videoPlayerRef.current.counters.buffering !== 0
    ) {
      console.log("video player is busy.... come back again");
    }
    if (data.action === "play") {
      this.playVideo(data);
    }
    if (data.action === "pause") {
      this.pauseVideo(data);
    }
    if (data.action === "seek") {
      this.seekVideo(data);
    }
    if (data.action === "buffer") {
      this.bufferVideo(data);
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
    this.sendToServer("update", {
      action: "seek",
      currentTime: data.currentTime,
    });
  }

  handleVideoPlayerEvents(action, _data) {
    this.sendToServer("update", {
      action: action,
      currentTime: _data.currentTime,
    });
  }

  pauseVideo(data) {
    this.videoPlayerRef.current.pause(this, data.data);
  }

  playVideo(data) {
    this.videoPlayerRef.current.play(this, data.data);
  }

  seekVideo(data) {
    this.videoPlayerRef.current.seek(this, {
      currentTime: data.data.currentTime,
    });
  }
  bufferVideo(data) {
    this.videoPlayerRef.current.buffer(this, {
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
