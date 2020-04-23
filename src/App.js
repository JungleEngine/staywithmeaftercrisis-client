import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Room from "./components/room";
import VideoPlayer from "./components/videoPlayer";
import {VIDEO_PLAYER_ACTIONS} from './constants/videoPlayerActions'

class App extends Component {
  constructor(props) {
    super(props);
    this.videoPlayerRef = React.createRef();
    this.state = {
      tmpCalledPause: 0,
      Player: {
        height: "390",
        width: "640",
        playerVars: {
          autoplay: 0
        }
      }
    };

    // Bind functions that needs reference to this
    this.handleVideoPlayerEvents = this.handleVideoPlayerEvents.bind(this);
    this.pauseVideo = this.pauseVideo.bind(this);
    this.playVideo = this.playVideo.bind(this);
  }
  render() {
    return (
      <div className="App">
        <VideoPlayer
          ref={this.videoPlayerRef}
          key="videoPlayer"
          handleEvents={this.handleVideoPlayerEvents}
        />
        <Router>
          <Switch>
            <Route component={Room} exact path="/room/:id" />
            {/* <Route component={VideoPlayer} exact path="/player" /> */}
          </Switch>
        </Router>
      </div>
    );
  }
  handleVideoPlayerEvents(action, data) {
    console.log(`Event handler called from videoPlayer with action:${action}`);
    if (!this.state.tmpCalledPause && action === VIDEO_PLAYER_ACTIONS.PLAY) {
      this.setState({ tmpCalledPause: 1 });
      this.pauseVideo();
    }
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
}

export default App;
