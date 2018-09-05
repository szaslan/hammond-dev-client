import ChartJS from 'react-chartjs-wrapper';
import Loader from 'react-loader-spinner'
import React, { Component } from 'react';

import './StudentInfoGraph.css';

class StudentInfoGraph extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data: {
                labels: [],
                datasets: [],
                options: {},
                tooltipOpen: false,
            },
            graphLoaded: false,

            ...props,
        }

        this.pullStudentEvaluatingData = this.pullStudentEvaluatingData.bind(this);
        this.toggle = this.toggle.bind(this);
    }

    pullStudentEvaluatingData() {
        let dataHistory = {
            labels: [],
            datasets: this.props.data.datasets,
            options: this.props.data.options,
        };

        this.props.assignments.forEach((assignment, index) => {
            if (assignment.peer_reviews) {
                let assignmentId = assignment.id;
                let assignmentName = assignment.name
                let columnName = assignmentId;

                if (this.props.peerReviewData[this.props.category + "History"][columnName] != null) {
                    dataHistory.labels.push(assignmentName)

                    let value = this.props.peerReviewData[this.props.category + "History"][columnName]
                    dataHistory.datasets[0].data.push(value)
                    if (this.props.category === 'weight') {
                        let green = {
                            red: 14,
                            green: 135,
                            blue: 46,
                        }
                        let red = {
                            red: 179,
                            green: 0,
                            blue: 12,
                        }
                        let white = {
                            red: 255,
                            green: 255,
                            blue: 255,
                        }

                        let greenPercentage = 0;
                        let redPercentage = 0;
                        let whitePercentage = 1;

                        if (value > 1) {
                            //weights in the range (1, 2.7] are linearlly interpolated between white and green
                            //weights in the range (2.7, +inf) are green
                            greenPercentage = value / 2.7;
                            if (greenPercentage > 1) greenPercentage = 1;
                        }
                        else if (value < 1) {
                            //weights in the range [0.3, 1) are linearlly interpolated between red and white
                            //weights in the range (0, 0.3) are red
                            redPercentage = (1 / (1 - 0.3)) - (value / (1 - 0.3));
                            if (redPercentage > 1) redPercentage = 1;
                        }

                        whitePercentage = 1 - redPercentage - greenPercentage;
                        let pointColor = {
                            red: (red.red * redPercentage) + (green.red * greenPercentage) + (white.red * whitePercentage),
                            green: (red.green * redPercentage) + (green.green * greenPercentage) + (white.green * whitePercentage),
                            blue: (red.blue * redPercentage) + (green.blue * greenPercentage) + (white.blue * whitePercentage),
                        }
                        
                        dataHistory.datasets[0].pointBackgroundColor.push(`rgb(${pointColor.red}, ${pointColor.green}, ${pointColor.blue})`);
                    }
                }

            }

            if (index === this.props.assignments.length - 1) {
                this.setState({
                    data: dataHistory,
                    graphLoaded: true,
                })
            }
        })
    }

    toggle() {
        this.setState({
            tooltipOpen: !this.state.tooltipOpen
        })
    }

    componentDidMount() {
        this.pullStudentEvaluatingData();
    }

    render() {
        if (this.state.graphLoaded) {
            return (
                <div className="graph" >
                    <ChartJS type='line' data={this.state.data} options={this.state.data.options} width="600" height="300" />
                </div>
            )
        }

        return (
            <Loader type="TailSpin" color="black" height={80} width={80} />
        )
    }
}

export default StudentInfoGraph;
