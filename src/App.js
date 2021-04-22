import logo from "./logo.svg";
import "./App.css";
import React, {Component} from "react";
// import io from "socket.io";

  const ws = new WebSocket("ws://localhost:5000/point");

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      dataFromServer: []
    }
  }

  componentDidMount() {
    ws.onopen = () => {
      console.log("connected");
    };

    ws.onmessage = (msg) => {
      const message = JSON.parse(msg.data);
      this.state.dataFromServer.push(message);
      console.log(this.state.dataFromServer);
    };

    ws.onclose = () => {
      console.log("disconnected");
    };
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    );
  }
}

export default App;
