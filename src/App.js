import "./App.css";
import React, { Component } from "react";
import {Button, Badge} from "react-bootstrap";
import Graph from "./components/Graph";

const axios = require("axios");
class App extends Component {
  _isMounted = false;
  ws = new WebSocket(`ws://${window.location.hostname}:5000/point`);

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

  startSocket = () => {
    axios.get("http://localhost:5000/sessionPoints").then((res) => {
      res.data.forEach((point) => {
        this.state.labels.push(point.time);
        this.state.voltage.push(point.voltage);
        this.state.current.push(point.current);
      });

      this.setState({
        labels: [...this.state.labels],
        voltage: [...this.state.voltage],
        current: [...this.state.current],
        lowestCell: res.data[res.data.length-1].lowestCell,
        averageCell: res.data[res.data.length-1].averageCell,
        highestCell: res.data[res.data.length-1].highestCell,
      });
    });

    this.ws.onopen = () => {
      this.setState({
        isConnected: true,
      });
    };

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

    this.ws.onclose = () => {
      this.setState({
        isConnected: false,
      });
    };

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
