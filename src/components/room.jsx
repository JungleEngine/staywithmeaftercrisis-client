import React, { Component } from "react";
import io from "socket.io-client";
import RoomForm from "./roomForm";

// To be added as props.
// const SOCKET_URL = "http://127.0.0.1:8090";

class Room extends Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: null,
      url: null,
    };

    // Can be replaced by ()=> function as it binds this to Room Object
    this.eventHandlers = {
      connect: this.handleConnect.bind(this),
      setURL: this.setURL.bind(this),
      update: this.update.bind(this),
    };
    this.handleSubmitForm = this.handleSubmitForm.bind(this);
    this.sendToServer = this.sendToServer.bind(this);
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
  update(data) {
    console.log("received update action: ", data);
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

  sendToServer(channel, data) {
    this.state.socket.emit(channel, data);
  }
  render() {
    return (
      <div>
        <h1>Room Page</h1>
        <RoomForm key="urlbtn" submit={this.handleSubmitForm} />
      </div>
    );
  }
}

export default Room;
