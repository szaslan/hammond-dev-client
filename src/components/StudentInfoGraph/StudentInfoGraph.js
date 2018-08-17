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
            graph_loaded: false,

            ...props,
        }

        this.pullPeerReviewData = this.pullPeerReviewData.bind(this);
    }

    pullPeerReviewData() {
        let data_history = {
            labels: [],
            datasets: this.props.data.datasets,
            options: this.props.data.options,
        };

        this.props.assignments.forEach(assignment => {
            if (assignment.peer_reviews) {
                let assignment_id = assignment.id;
                let assignment_name = assignment.name
                let column_name = "'" + assignment_id + "'";

                if (this.props.peerReviewData[this.props.category + "_history"][column_name] != undefined) {
                    data_history.labels.push(assignment_name)
                    data_history.datasets[0].data.push(this.props.peerReviewData[this.props.category + "_history"][column_name])
                }
            }
        })

        this.setState({
            data: data_history,
            graph_loaded: true,
        })
    }

    componentDidMount() {
        this.pullPeerReviewData();
    }

    render() {
        if (this.state.graph_loaded) {
            return (
                <div className="graph">
                    <ChartJS type='line' data={this.state.data} options={this.state.data.options} width="600" height="300" />
                </div>
            )
        }
        else {
            return (
                <Loader type="TailSpin" color="black" height={80} width={80} />
            )
        }
    }
}

export default StudentInfoGraph;