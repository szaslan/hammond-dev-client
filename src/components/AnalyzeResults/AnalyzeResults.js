import React, { Component } from 'react';
import { Well, Row } from 'react-bootstrap';
import Loader from 'react-loader-spinner'

import 'bootstrap/dist/css/bootstrap.css';

import '../Assignments/Assignments.css'

var message = "";

class AnalyzeResults extends Component {
    constructor(props) {
        super(props);

        this.state = {
            analyzeDisplayText: false,
        }

        this.attachNamesToDatabase = this.attachNamesToDatabase.bind(this);
        this.fetchPeerReviewData = this.fetchPeerReviewData.bind(this);
        this.fetchRubricData = this.fetchRubricData.bind(this);

        this.assignment_id = this.props.assignmentId;
        this.assignment_info = this.props.assignmentInfo;
        this.benchmarks = this.props.benchmarks;
        this.course_id = this.props.courseId;
        this.pressed = this.props.pressed;
    }

    attachNamesToDatabase() {
        console.log("10a: attaching names to database tables");
        var data = {
            course_id: this.course_id,
        }

        fetch('/api/attach_names_in_database', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        })
    }

    fetchPeerReviewData() {
        let data = {
            course_id: this.course_id,
            assignment_id: this.assignment_id,
            points_possible: this.assignment_info.points_possible,
        }
        console.log("3: fetching peer review data from canvas")
        fetch('/api/save_all_peer_reviews', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(() => {
                this.fetchRubricData()
            })
            .then(() => {
                localStorage.setItem("analyzePressed_" + this.assignment_id, true);
            })
    }

    fetchRubricData() {
        var data = {
            course_id: this.course_id,
            assignment_id: this.assignment_id,
            rubric_settings: this.assignment_info.rubric_settings.id,
            benchmarks: this.benchmarks,
        }

        var names;

        console.log("5: fetching rubric data from canvas");
        fetch('/api/save_all_rubrics', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(() => {
                console.log(this.benchmarks)
                fetch('/api/peer_reviews_analyzing', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                })
                    .then(res => res.json())
                    .then(res => {
                        message = res.message;
                        names = res.names;
                    })
                    // .then(() => {
                    //     fetch('/api/')
                    // })
                    .then(() => {
                        localStorage.setItem("analyzeDisplayTextNumCompleted_" + this.assignment_id, message.num_completed);
                        localStorage.setItem("analyzeDisplayTextNumAssigned_" + this.assignment_id, message.num_assigned);
                        localStorage.setItem("analyzeDisplayTextMessage_" + this.assignment_id, message.message);
                        localStorage.setItem("analyzeDisplayTextNames_" + this.assignment_id, names);
                    })
                    .then(() => {
                        this.setState({
                            analyzeDisplayText: true,
                        })
                    })
                    .then(() => this.attachNamesToDatabase())
            })
    }

    componentDidMount() {
        console.log("analyze mounted")
        if (localStorage.getItem("analyzePressed_" + this.assignment_id)) {
            this.setState({
                analyzeDisplayText: true,
            })
        }
    }

    render() {
        if (this.pressed) {
            return (
                < div >
                    {this.fetchPeerReviewData()}
                    <Loader type="TailSpin" color="black" height={80} width={80} />
                </div >
            )
        }
        else {
            return (
                <div>
                    {
                        localStorage.getItem("analyzeDisplayTextMessage_" + this.assignment_id) ?
                            <div>
                                {localStorage.getItem("analyzeDisplayTextMessage_" + this.assignment_id)}
                                <br></br>
                                <br></br>
                                {localStorage.getItem("analyzeDisplayTextNames_" + this.assignment_id)}
                                <br></br>
                                <br></br>
                                <Row>
                                    <Well className="well2">
                                        <strong>Completed Peer Reviews:</strong> {localStorage.getItem("analyzeDisplayTextNumCompleted_" + this.assignment_id)} / {localStorage.getItem("analyzeDisplayTextNumAssigned_" + this.assignment_id)}
                                    </Well>
                                </Row>
                            </div>
                            :
                            <Loader type="TailSpin" color="black" height={80} width={80} />
                    }
                </div>
            )
        }
    }
}
export default AnalyzeResults;