import React, { Component } from "react";
import YouTube from "react-youtube";
import { VIDEO_PLAYER_ACTIONS } from "./../constants/videoPlayerActions";

class VideoPlayer extends Component {
  constructor(props) {
    super(props);
    this.videoState = VIDEO_PLAYER_ACTIONS.READY;
    this.internalvideoPlayerRef = React.createRef();

    this.onReady = this.onReady.bind(this);
    this.onPlay = this.onPlay.bind(this);
    this.onPause = this.onPause.bind(this);
    this.onStateChange = this.onStateChange.bind(this);
    this.getVideoCurrentTime = this.getVideoCurrentTime.bind(this);

    this.pause = this.pause.bind(this); // To be used by external controller
    this.play = this.play.bind(this); // To be used by external controller
    this.seek = this.seek.bind(this); // To be used by external controller

    this.state = {
      videoPlayer: {
        height: "390",
        width: "640",
        playerVars: {
          mute: 1,
          autoplay: 1,
          rel: 0, //  Don’t show related videos
          theme: "light", // Use a light player instead of a dark one
          controls: 1, // Show player controls
          showinfo: 0, // Don’t show title or loader,
          modestbranding: 0,
        },
      },
    };
  }

  componentDidMount() {
    // VideoPlayer should send regular updates to component owner.
    setInterval(this.getVideoCurrentTime, this.props.updatesInterval);
  }

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

  getVideoCurrentTime() {
    // Using promises to avoid blocking code.
    let getCurrentTimePromise = this.internalvideoPlayerRef.current.internalPlayer.getCurrentTime();

    getCurrentTimePromise
      .then(currentTime =>
        this.props.videoPlayerIntervalUpdates({
          currentTime: currentTime,
        })
      )
      .catch(err =>
        console.log("Error in videoPlayer while getting videoCurrentTime")
      );
  }

  onReady(event) {
    this.props.handleEvents(VIDEO_PLAYER_ACTIONS.READY, { event: event });
  }

  onPlay(event) {
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

  onStateChange(event) {}

  // Called by room-manager
  pause(caller) {
    console.log("Pause called from room manager");
    this.videoState = VIDEO_PLAYER_ACTIONS.PAUSE;
    this.internalvideoPlayerRef.current.internalPlayer.pauseVideo();
    // don't broadcast to users
    // set state to pause
    this.videoState = VIDEO_PLAYER_ACTIONS.PAUSE;
  }

  // Called by room-manager
  play(caller) {
    console.log("Play called from room manager");
    this.videoState = VIDEO_PLAYER_ACTIONS.PLAY;
    this.internalvideoPlayerRef.current.internalPlayer.playVideo();
  }

  // Called by room-manager
  seek(caller, data) {
    console.log(`Seek called from room manager to time:${data.currentTime}`);
    this.internalvideoPlayerRef.current.internalPlayer.seekTo(data.currentTime);
  }
}

export default VideoPlayer;
