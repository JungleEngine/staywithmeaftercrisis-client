import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Room from "./components/room";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tmpCalledPause: 0,
      Player: {
        height: "390",
        width: "640",
        playerVars: {
          autoplay: 0,
        },
      },
    };
  }
  render() {
    return (
      <div className="App">
        {/* <VideoPlayer
          ref={this.videoPlayerRef}
          key="videoPlayer"
          handleEvents={this.handleVideoPlayerEvents}
        /> */}
        <Router>
          <Switch>
            <Route component={Room} exact path="/room/:id" />
            {/* <Route component={VideoPlayer} exact path="/player" /> */}
          </Switch>
        </Router>
      </div>
    );
  }
}

export default App;
