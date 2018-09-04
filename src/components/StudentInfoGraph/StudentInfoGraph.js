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
                        let redColor = 255;
                        let greenColor = 255;
                        let blueColor = 255;

                        if (value > 1) {
                            let whitePercentage = value / 3;
                            let greenPercentage = 1 - (value / 3);

                            redColor = (11 * greenPercentage) + (255 * whitePercentage);
                            greenColor = (102 * greenPercentage) + (255 * whitePercentage);
                            blueColor = (35 * greenPercentage) + (255 * whitePercentage);
                        }
                        else if (value < 1) {
                            let whitePercentage = value;
                            let redPercentage = 1 - value;

                            redColor = (179 * redPercentage) + (255 * whitePercentage);;
                            greenColor = (0 * redPercentage) + (255 * whitePercentage);;
                            blueColor = (12 * redPercentage) + (255 * whitePercentage);;
                        }

                        if (redColor > 255) redColor = 255;
                        if (greenColor > 255) greenColor = 255;
                        if (blueColor > 255) blueColor = 255;
                        if (redColor < 0) redColor = 0;
                        if (greenColor < 0) greenColor = 0;
                        if (blueColor < 0) blueColor = 0;

                        dataHistory.datasets[0].pointBackgroundColor.push(`rgb(${redColor}, ${greenColor}, ${blueColor})`);
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
