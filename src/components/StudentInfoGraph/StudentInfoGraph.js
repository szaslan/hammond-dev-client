import React, { Component } from 'react';
import './StudentInfoGraph.css';
import Loader from 'react-loader-spinner'
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import history from '../../history'
import ChartJS from 'react-chartjs-wrapper';

class StudentInfoGraph extends Component {
    constructor(props) {
        super(props);

        this.pullPeerReviewData = this.pullPeerReviewData.bind(this);

        this.state = {
            assignments: this.props.assignments,
            peer_review_data: this.props.peerReviewData,
            category: this.props.category,
            data: {
                labels: [],
                datasets: [],
                options: {},
            },
            graph_loaded: false,

            ...props,

        }
    }

    componentDidMount() {
        console.log("graph mounted!");
        this.pullPeerReviewData();
    }

    pullPeerReviewData() {
        console.log("pulling peer review data")

        let data_history = {
            labels: [],
            datasets: this.props.data.datasets,
            options: this.props.data.options,
        };

        for (var i = 0; i < this.state.assignments.length; i++) {
            if (this.state.assignments[i].peer_reviews) {
                let assignment_id = this.state.assignments[i].id;
                let assignment_name = this.state.assignments[i].name
                let column_name = "'" + assignment_id + "'";

                console.log(this.state.peer_review_data)

                if (this.state.peer_review_data[this.state.category + "_history"][column_name] != undefined) {
                    data_history.labels.push(assignment_name)
                    data_history.datasets[0].data.push(this.state.peer_review_data[this.state.category + "_history"][column_name])
                }
            }
        }
        this.setState({
            data: data_history,
            graph_loaded: true,
        })
    }

    render() {
        return (
            <div className="graph">
                {
                    this.state.graph_loaded ?
                        <div>
                            <ChartJS type='line' data={this.state.data} options={this.state.data.options} width="600" height="300" />
                        </div>
                        :
                        <Loader type="TailSpin" color="black" height={80} width={80} />
                }
            </div>
        )
    }

}


export default StudentInfoGraph;