import "./App.css";
import React, { Component } from "react";
import {Button, Badge} from "react-bootstrap";
import Graph from "./components/Graph";

const axios = require("axios");
class App extends Component {
  _isMounted = false;

  // Create the websocket variable and connect given the device IP from the browser url
  ws = new WebSocket(`ws://${window.location.hostname}:5000/point`);

  // Create the application variables and update connection status of the websocket
  constructor(props) {
    super(props);

    this.state = {
      labels: [],
      voltage: [],
      current: [],
      isConnected: this.ws.readyState === 1 ? true : false,
      lowestCell: 0,
      averageCell: 0,
      highestCell: 0,
    };

    this.startSocket = this.startSocket.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;
    this.startSocket();
  }

  // This is called whenever the websocket disconnects and the user wanted to reconnect
  startSocket = () => {

    // Sync data with the database before listening for new messages
    axios.get("http://localhost:5000/sessionPoints").then((res) => {
      res.data.forEach((point) => {
        this.state.labels.push(point.time);
        this.state.voltage.push(point.voltage);
        this.state.current.push(point.current);
      });

      const dataLen = res.data.length;

      this.setState({
        labels: [...this.state.labels],
        voltage: [...this.state.voltage],
        current: [...this.state.current],
        lowestCell: dataLen ? res.data[res.data.length-1].lowestCell : 0,
        averageCell: dataLen ? res.data[res.data.length-1].averageCell : 0,
        highestCell: dataLen ? res.data[res.data.length-1].highestCell : 0,
      });
    });

    // Set connection status
    this.ws.onopen = () => {
      this.setState({
        isConnected: true,
      });
    };

    // Update the data as new messages are received
    this.ws.onmessage = (msg) => {
      const message = JSON.parse(msg.data);
      this.setState({
        labels: [...this.state.labels, message.time],
        voltage: [...this.state.voltage, message.voltage],
        current: [...this.state.current, message.current],
        lowestCell: message.lowestCell,
        averageCell: message.averageCell,
        highestCell: message.highestCell,
      });
    };

    // Update connection status
    this.ws.onclose = () => {
      this.setState({
        isConnected: false,
      });
    };

    // Reconnect when an error occurs
    this.ws.onerror = () => {
      this.ws = new WebSocket("ws://localhost:5000/point");
    };
  };

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    return (
      <div className="App">
        <div className="cells">
          <Badge pill variant="info">Lowest Cell: {this.state.lowestCell}</Badge>
          <Badge pill variant="info">Highest Cell: {this.state.highestCell}</Badge>
          <Badge pill variant="info">Average Cell: {this.state.averageCell}</Badge>
        </div>
        <Graph
          className="Graph"
          labels={this.state.labels}
          voltage={this.state.voltage}
          current={this.state.current}
        />
        <div className="connection">
          <p>Connection Status:</p>
          {/* This button displays the current connection status and triggers the reconnect and sync when the websocket disconnects */}
          <Button
            variant={
              this.state.isConnected ? "outline-success" : "outline-danger"
            }
            onClick={() => {
              if (!this.state.isConnected) {
                this.ws = new WebSocket("ws://localhost:5000/point");
                this.startSocket();
                console.log("socket reconnecting");
              }
              console.log("button clicked");
            }}
          >
            {this.state.isConnected ? "Connected" : "Not Connected"}
          </Button>
        </div>
      </div>
    );
  }
}

export default App;
