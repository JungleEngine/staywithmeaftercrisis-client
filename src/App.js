import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Room from "./components/room";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <div className="App">
        <Router>
          <Switch>
            <Route component={Room} exact path="/room/:id" />
          </Switch>
        </Router>
      </div>
    );
  }
}

export default App;
