import React, { Component } from 'react';
import Loader from 'react-loader-spinner'
import ChartJS from 'react-chartjs-wrapper';

import './StudentInfoGraph.css';

class StudentInfoGraph extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data: {
                labels: [],
                datasets: [],
                options: {},
            },
            graphLoaded: false,

            ...props,
        }

        this.pullStudentEvaluatingData = this.pullStudentEvaluatingData.bind(this);
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

                if (this.props.peerReviewData[this.props.category + "History"][columnName]) {
                    dataHistory.labels.push(assignmentName)
                    dataHistory.datasets[0].data.push(this.props.peerReviewData[this.props.category + "History"][columnName])
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

    componentDidMount() {
        this.pullStudentEvaluatingData();
    }

    render() {
        if (this.state.graphLoaded) {
            return (
                <div className="graph">
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