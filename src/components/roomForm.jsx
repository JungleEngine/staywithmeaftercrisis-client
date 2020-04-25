import React, { Component } from "react";
class RoomForm extends Component {
  constructor(props) {
    super(props);
    this.state = { value: "https://www.youtube.com/watch?v=aqz-KE-bpKQ" };
    this.handleChange = this.handleChange.bind(this);
    this.buttonClick = this.buttonClick.bind(this);
  }

  render() {
    return (
      <div>
        <input type="text" onChange={this.handleChange} />
        <button
          type="button"
          className="btn btn-info"
          onClick={this.buttonClick}
        >
          Click Me
        </button>
      </div>
    );
  }
  handleChange(event) {
    this.setState({ value: event.target.value });
  }
  buttonClick() {
    this.props.submit({ value: this.state.value });
  }
}

export default RoomForm;
