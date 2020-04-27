import React, { Component } from "react";
import YouTube from "react-youtube";
import { VIDEO_PLAYER_ACTIONS } from "./../constants/videoPlayerActions";

class VideoPlayer extends Component {
  constructor(props) {
    super(props);
    this.internalvideoPlayerRef = React.createRef();

    this.onReady = this.onReady.bind(this);
    this.onPlay = this.onPlay.bind(this);
    this.onPause = this.onPause.bind(this);
    this.onStateChange = this.onStateChange.bind(this);

    this.pause = this.pause.bind(this);
    this.play = this.play.bind(this);
    this.seek = this.seek.bind(this);

    this.state = {
      videoPlayer: {
        height: "390",
        width: "640",
        playerVars: {
          autoplay: 0
        }
      }
    };
  }
  state = {};
  render() {
    return (
      <YouTube
        key="vid"
        ref={this.internalvideoPlayerRef}
        videoId={this.props.videoId}
        opts={this.state.videoPlayer}
        onReady={this.onReady}
        onPlay={this.onPlay}
        onPause={this.onPause}
        // onStateChange={this.onStateChange} // Not needed now as it is the same as onReady, onPlay, onPause
      />
    );
  }

  onReady(event) {
    this.props.handleEvents(VIDEO_PLAYER_ACTIONS.READY, { event: event });
  }

  onPlay(event) {
    this.props.handleEvents(VIDEO_PLAYER_ACTIONS.PLAY, { event: event });
  }

  onPause(event) {
    this.props.handleEvents(VIDEO_PLAYER_ACTIONS.PAUSE, { event: event });
    console.log("on pause");
  }

  onStateChange(event) {
    this.props.handleEvents(VIDEO_PLAYER_ACTIONS.STATE_CHANGED, {
      event: event
    });
  }

  // Called by room-manager
  pause(caller) {
    console.log("Pause called from room manager");
    this.internalvideoPlayerRef.current.internalPlayer.pauseVideo();
  }

  // Called by room-manager
  play(caller) {
    console.log("Play called from room manager");
  }

  // Called by room-manager
  seek(caller) {
    console.log("Seek called from room manager");
  }
}

export default VideoPlayer;
