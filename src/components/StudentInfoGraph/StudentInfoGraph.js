import ChartJS from 'react-chartjs-wrapper';
import Loader from 'react-loader-spinner'
import React, { Component } from 'react';
import { Tooltip } from 'reactstrap';

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

    toggle() {
        this.setState({
            tooltipOpen: !this.state.tooltipOpen
        })
    }

    componentDidMount() {
        console.log(this.props.peerReviewData)
        this.pullStudentEvaluatingData();
    }

    render() {
        if (this.state.graphLoaded) {
            return (
                <div>
                <div className="graph" id={"graphtooltip"}>
                    <ChartJS type='line' data={this.state.data} options={this.state.data.options} width="600" height="300" />
                </div>
                <Tooltip placement="right" isOpen={this.state.tooltipOpen} target={"graphtooltip"} toggle={this.toggle}>
                    -1: spazzy
                <br />
                    0: definitely harsh
                <br />
                    1: could be harsh
                <br />
                    2: could be lenient
                <br />
                    3: definitely lenient
                <br />
                    4: could be fair
                <br />
                    5: definitely fair
                </Tooltip>
                </div>
            )
        }

        return (
            <Loader type="TailSpin" color="black" height={80} width={80} />
        )
    }
}

export default StudentInfoGraph;
