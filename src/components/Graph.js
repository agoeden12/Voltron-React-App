import React, { Component } from "react";
import { Line } from "react-chartjs-2";

class Graph extends Component {

  // Receive current data and generate the graphs
  constructor(props) {
    super(props);

    this.labels = this.props.labels;
    this.voltage = this.props.voltage;
    this.current = this.props.current;
  }

  // Update the graphs as new data is received
  componentWillReceiveProps(nextProps) {
      this.labels = nextProps.labels;
      this.voltage = nextProps.voltage;
      this.current = nextProps.current;
  }
  
  render() {
    return (
      <Line
          data={{
          labels: this.labels,
          datasets: [
            {
              label: "Voltage",
              data: this.voltage,
              fill: true,
              borderColor: "rgb(75, 192, 192)",
              backgroundColor: "rgba(75, 192, 192,0.2)",
              tension: 0.1,
              order: 1,
            },
            {
              label: "Current",
              data: this.current,
              fill: true,
              borderColor: "rgb(75, 192, 75)",
              backgroundColor: "rgba(75, 192, 75,0.2)",
              tension: 0.1,
              order: 2,
            },
          ],
        }}
        options={{
          maintainAspectRatio: true,
          scales: {
            y: {
              // defining min and max so hiding the dataset does not change scale range
              min: 85,
              max: 100,
            },
          },

          // Removing animations creates smooth data updates in the graph
          animation: false,
          pointRadius: 0,
          pointHitRadius: 20,
        }}
      />
    );
  }
}

export default Graph;
