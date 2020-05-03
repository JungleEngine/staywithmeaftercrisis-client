import React, { Component } from "react";
import YouTube from "react-youtube";
import { VIDEO_PLAYER_ACTIONS } from "./../constants/videoPlayerActions";
class VideoPlayer extends Component {
  constructor(props) {
    super(props);
    this.videoState = VIDEO_PLAYER_ACTIONS.UNSTARTED;
    this.internalvideoPlayerRef = React.createRef();

    this.onReady = this.onReady.bind(this);
    this.onPlay = this.onPlay.bind(this);
    this.onPause = this.onPause.bind(this);
    this.onStateChange = this.onStateChange.bind(this);
    this.getVideoCurrentTime = this.getVideoCurrentTime.bind(this);

    this.pause = this.pause.bind(this); // To be used by external controller
    this.play = this.play.bind(this); // To be used by external controller
    this.seek = this.seek.bind(this); // To be used by external controller
    this.buffer = this.buffer.bind(this);

    this.counters = {
      // "-1":0,
      // "0":0,
      // "1":0,
      // "2":0,
      // "3":0,
      // "5":0,
      pause: 0,
      play: 0,
      buffering: 0,
      unstarted: 0,
      cued: 0,
      ended: 0,
    };

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
        // onPlay={this.onPlay}
        // onPause={this.onPause}
        onStateChange={this.onStateChange} // Not needed now as it is the same as onReady, onPlay, onPause
      />
    );
  }

  getVideoCurrentTime() {
    // Using promises to avoid blocking code.
    let getCurrentTimePromise = this.internalvideoPlayerRef.current.internalPlayer.getCurrentTime();

    getCurrentTimePromise
      .then((currentTime) => {
        // this.props.videoPlayerIntervalUpdates({
        //   currentTime: currentTime,
        // });
        // console.log("current time:::::", currentTime);
      })
      .catch((err) =>
        console.log("Error in videoPlayer while getting videoCurrentTime")
      );
  }

  onReady(event) {
    this.videoState = VIDEO_PLAYER_ACTIONS.READY;
    this.props.handleEvents(VIDEO_PLAYER_ACTIONS.READY, { event: event });
  }

  onPlay(event) {
    if (this.videoState !== VIDEO_PLAYER_ACTIONS.PLAY) {
      console.log("on play, played due to self playing");
      this.videoState = VIDEO_PLAYER_ACTIONS.PLAY;
      // broadcast play
      this.props.handleEvents(VIDEO_PLAYER_ACTIONS.PLAY, {
        value: "empty data for now",
      });
    } else {
      console.log("on play, played due to other playing");
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
  }

  async onStateChange(event) {
    // eslint-disable-next-line
    let oldState = this.videoState;
    this.videoState = this.mapStateToString(event.data);

    if (this.counters[this.videoState] > 0) {
      this.counters[this.videoState]--;
      console.log(
        "consumed expected action: ",
        this.videoState,
        " remaining: ",
        this.counters[this.videoState]
      );
      return;
    }
    let currentTime = await this.internalvideoPlayerRef.current.internalPlayer.getCurrentTime();
    console.log(currentTime);
    if (this.videoState === VIDEO_PLAYER_ACTIONS.PLAY) {
      console.log("onStateChange: played due to self playing");
      this.props.handleEvents(VIDEO_PLAYER_ACTIONS.PLAY, {
        currentTime: currentTime,
      });
    } else if (this.videoState === VIDEO_PLAYER_ACTIONS.PAUSE) {
      console.log("onStateChange: paused due to self pausing");
      this.props.handleEvents(VIDEO_PLAYER_ACTIONS.PAUSE, {
        currentTime: currentTime,
      });
    } else if (this.videoState === VIDEO_PLAYER_ACTIONS.BUFFERING) {
      console.log("onStateChange: buffering");
      this.props.handleEvents(VIDEO_PLAYER_ACTIONS.BUFFERING, {
        currentTime: currentTime,
      });
    } else {
      console.log("onStateChange: state callback: ", this.videoState);
    }
  }

  async pausePause() {
    await this.internalvideoPlayerRef.current.internalPlayer.pauseVideo();
  }
  async playPlay() {
    await this.internalvideoPlayerRef.current.internalPlayer.playVideo();
  }

  mapStateToString(state) {
    let str;
    switch (state) {
      case -1: //– unstarted
        str = VIDEO_PLAYER_ACTIONS.UNSTARTED;
        break;
      case 0: //– ended
        str = VIDEO_PLAYER_ACTIONS.ENDED;
        break;
      case 1: //playing
        str = VIDEO_PLAYER_ACTIONS.PLAY;
        break;
      case 2: //– paused
        str = VIDEO_PLAYER_ACTIONS.PAUSE;
        break;
      case 3: // – buffering
        str = VIDEO_PLAYER_ACTIONS.BUFFERING;
        break;
      case 5: //– video cued
        str = VIDEO_PLAYER_ACTIONS.CUED;
        break;
      default:
        str = null;
        return;
    }
    return str;
  }
  // Called by room-manager
  async pause(caller, data) {
    if (this.videoState === VIDEO_PLAYER_ACTIONS.UNSTARTED) {
      console.log("Cannot perform pause action as player is not ready yet");
      return;
    }
    if (this.videoState === VIDEO_PLAYER_ACTIONS.BUFFERING) {
      // await this.internalvideoPlayerRef.current.internalPlayer.playVideo();
      return;
    }
    if (this.videoState !== VIDEO_PLAYER_ACTIONS.PAUSE) {
      this.videoState = VIDEO_PLAYER_ACTIONS.PAUSE;
      this.counters.pause = 1;
      await this.internalvideoPlayerRef.current.internalPlayer.pauseVideo();
    }

    this.sync(data.currentTime);
  }

  buffer(caller, data) {
    if (this.videoState === VIDEO_PLAYER_ACTIONS.UNSTARTED) {
      console.log("Cannot perform buffer action as player is not ready yet");
      return;
    }
    // if (this.videoState !== VIDEO_PLAYER_ACTIONS.BUFFERING) {
    this.videoState = VIDEO_PLAYER_ACTIONS.PLAY;
    this.pause(this, data);
    // }
  }

  // Called by room-manager
  async play(caller, data) {
    if (this.videoState === VIDEO_PLAYER_ACTIONS.UNSTARTED) {
      console.log("Cannot perform play action as player is not ready yet");
      return;
    }
    // if (this.videoState === VIDEO_PLAYER_ACTIONS.PLAY) {
    //   // console.log("already playing don't play while playing 3lshan byboz");
    //   return;
    // }
    if (this.videoState === VIDEO_PLAYER_ACTIONS.BUFFERING) {
      this.counters.pause = 1;
      await this.sync(data.currentTime);
      // await this.internalvideoPlayerRef.current.internalPlayer.playVideo();
      return;
    }
    // await this.pause(this, data);
    if (this.videoState !== VIDEO_PLAYER_ACTIONS.PLAY) {
      this.videoState = VIDEO_PLAYER_ACTIONS.PLAY;
      this.counters.play = 1;
      await this.internalvideoPlayerRef.current.internalPlayer.playVideo();
    }
  }
  async sync(target) {
    if (this.videoState === VIDEO_PLAYER_ACTIONS.UNSTARTED) {
      console.log("Cannot perform pause action as player is not ready yet");
      return;
    }
    let currentTime = await this.internalvideoPlayerRef.current.internalPlayer.getCurrentTime();
    if (Math.abs(target - currentTime) > 3) {
      console.log(
        "syncronizing the video time as the difference was more than one sec"
      );
      await this.internalvideoPlayerRef.current.internalPlayer.seekTo(target);
    } else {
      console.log(
        "no need for sync, absolute difference:",
        Math.abs(target - currentTime + 0.5)
      );
    }
  }
  // Called by room-manager
  seek(caller, data) {
    if (this.videoState === VIDEO_PLAYER_ACTIONS.UNSTARTED) {
      console.log("Cannot perform pause action as player is not ready yet");
      return;
    }
    // this.internalvideoPlayerRef.current.internalPlayer.seekTo(data.currentTime);
  }
}

export default VideoPlayer;
