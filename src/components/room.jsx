import React, { Component } from "react";
import io from "socket.io-client";

// To be added as props.
// const SOCKET_URL = "http://127.0.0.1:8090";

class Room extends Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: null
    };

    // Can be replaced by ()=> function as it binds this to Room Object
    this.eventHandlers = {
      connect: this.handleConnect.bind(this)
    };
  }

  componentDidMount() {
    this.initSocket();
  }

  initSocket = async () => {
    const { id } = this.props.match.params;
    const [socketUrl, roomName, action] = id.split("&");

    const socket = io(socketUrl, {
      query: `roomName=${roomName}&action=${action}`
    });
    await this.setState({ socket });
    this.attachRoomEvents();
  };

  attachRoomEvents() {
    for (var event in this.eventHandlers) {
      this.state.socket.on(event, this.eventHandlers[event]);
    }
  }

  handleConnect() {
    console.log("Socket Connected");
  }

  render() {
    return <div>Room Page</div>;
  }
}

export default Room;
