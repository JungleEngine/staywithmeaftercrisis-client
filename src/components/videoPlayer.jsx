import React, { Component } from "react";
import YouTube from "react-youtube";
import { VIDEO_PLAYER_ACTIONS } from "./../constants/videoPlayerActions";

class VideoPlayer extends Component {
  constructor(props) {
    super(props);
    this.videoState = VIDEO_PLAYER_ACTIONS.READY;
    this.videoPlayerRef = React.createRef();

    this.onReady = this.onReady.bind(this);
    this.onPlay = this.onPlay.bind(this);
    this.onPause = this.onPause.bind(this);
    this.onStateChange = this.onStateChange.bind(this);

    this.pause = this.pause.bind(this); // To be used by external controller
    this.play = this.play.bind(this); // To be used by external controller
    this.seek = this.seek.bind(this); // To be used by external controller

    this.state = {
      videoPlayer: {
        height: "390",
        width: "640",
        playerVars: {
          autoplay: 0,
        },
      },
    };
  }
  state = {};
  render() {
    return (
      <YouTube
        key="vid"
        ref={this.videoPlayerRef}
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
    // this.props.handleEvents(VIDEO_PLAYER_ACTIONS.PLAY, { event: event });
    // broadcast
    console.log("on play");
    if (this.videoState !== VIDEO_PLAYER_ACTIONS.PLAY) {
      console.log("played due to self playing");
      this.videoState = VIDEO_PLAYER_ACTIONS.PLAY;
      // broadcast play
      this.props.handleEvents(VIDEO_PLAYER_ACTIONS.PLAY, {
        value: "empty data for now",
      });
    } else {
      console.log("played due to other playing");
    }
  }

  onPause(event) {
    // this.props.handleEvents(VIDEO_PLAYER_ACTIONS.PAUSE, { event: event });
    console.log("on pause");
    if (this.videoState !== VIDEO_PLAYER_ACTIONS.PAUSE) {
      console.log("paused due to self pausing");
      this.videoState = VIDEO_PLAYER_ACTIONS.PAUSE;
      // broadcast pause
      this.props.handleEvents(VIDEO_PLAYER_ACTIONS.PAUSE, {
        value: "empty data for now",
      });
    } else {
      console.log("paused due to other pausing");
    }
    // if state != pause
    // broadcast pause
    // set state to pause
    // else
    // do nothing
  }

  onStateChange(event) {
    // this.props.handleEvents(VIDEO_PLAYER_ACTIONS.STATE_CHANGED, {
    //   event: event,
    // });
    // broadcast
  }

  pause(caller) {
    console.log("Pause called from room manager");
    this.videoPlayerRef.current.internalPlayer.pauseVideo();
    // don't broadcast to users
    // set state to pause
    this.videoState = VIDEO_PLAYER_ACTIONS.PAUSE;
  }

  play(caller) {
    console.log("Play called from room manager");
    this.videoPlayerRef.current.internalPlayer.playVideo();
    this.videoState = VIDEO_PLAYER_ACTIONS.PLAY;
  }

  seek(caller) {
    console.log("Seek called from room manager");
  }
}

export default VideoPlayer;
