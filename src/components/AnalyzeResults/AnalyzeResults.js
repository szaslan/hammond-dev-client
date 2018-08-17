import React, { Component } from 'react';
import { Well, Row } from 'react-bootstrap';
import history from '../../history';
import Loader from 'react-loader-spinner'

import 'bootstrap/dist/css/bootstrap.css';

import '../Assignments/Assignments.css'

var message = "";
var names = null;

class AnalyzeResults extends Component {
    constructor(props) {
        super(props);

        this.state = {
            analyzeDisplayText: false,
            error: false,
        }

        this.attachNamesToDatabase = this.attachNamesToDatabase.bind(this);
        this.fetchPeerReviewData = this.fetchPeerReviewData.bind(this);
        this.fetchRubricData = this.fetchRubricData.bind(this);

        this.assignment_id = this.props.assignmentId;
        this.assignment_info = this.props.assignmentInfo;
        this.benchmarks = this.props.benchmarks;
        this.course_id = this.props.courseId;
        this.pressed = this.props.pressed;

        this.error = "An error has occurred. Please consult the console to see what has gone wrong"
    }

    attachNamesToDatabase() {
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
            .then(res => {
                if (res.status == 204) {
                    let data = {
                        ids: names,
                    }
                    fetch('/api/get_name_from_id', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    })
                        .then(res => {
                            if (res.status == 200) {
                                res.json().then(res => {
                                    localStorage.setItem("analyzeDisplayTextNames_" + this.assignment_id, JSON.stringify(res));
                                    localStorage.setItem("analyzeDisplayTextNumCompleted_" + this.assignment_id, message.num_completed);
                                    localStorage.setItem("analyzeDisplayTextNumAssigned_" + this.assignment_id, message.num_assigned);
                                    localStorage.setItem("analyzeDisplayTextMessage_" + this.assignment_id, message.message);
                                })
                                    .then(() => {
                                        this.setState({
                                            analyzeDisplayText: true,
                                        })
                                    })
                            }
                            else if (res.status == 400) {
                                if (!this.state.error) {
                                    this.setState({
                                        error: true
                                    })
                                }
                                console.log("ran into an error when gathering actual names from canvas ids")
                            }
                            else if (res.status == 404) {
                                if (!this.state.error) {
                                    this.setState({
                                        error: true
                                    })
                                }
                                console.log("could not find name for student")
                            }
                        })

                }
                else if (res.status == 400) {
                    if (!this.state.error) {
                        this.setState({
                            error: true
                        })
                    }
                    console.log("ran into an error when trying to attach actual names to entries in SQL tables")
                }
                else if (res.status == 401) {
                    history.push("/login")
                    throw new Error();
                }
                else if (res.status == 404) {
                    if (!this.state.error) {
                        this.setState({
                            error: true
                        })
                    }
                    console.log("there are no students enrolled in this course")
                }
            })
            .catch(err => console.log("unauthorized request when pulling info for specific assignment"))
    }

    fetchPeerReviewData() {
        let data = {
            course_id: this.course_id,
            assignment_id: this.assignment_id,
            points_possible: this.assignment_info.points_possible,
        }
        fetch('/api/save_all_peer_reviews', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(res => {
                if (res.status == 204) {
                    this.fetchRubricData()
                        .then(() => {
                            localStorage.setItem("analyzePressed_" + this.assignment_id, true);
                        })
                }
                else if (res.status == 400) {
                    if (!this.state.error) {
                        this.setState({
                            error: true
                        })
                    }
                    console.log("ran into an error when trying to save all peer reviews from canvas")
                }
                else if (res.status === 401) {
                    history.push("/login")
                    throw new Error();
                }
                else if (res.status == 404) {
                    if (!this.state.error) {
                        this.setState({
                            error: true
                        })
                    }
                    console.log("no peer reviews assigned for this assignment")
                }
            })
            .catch(err => console.log("unauthorized request when saving all peer reviews from canvas"))

    }

    fetchRubricData() {
        var data = {
            course_id: this.course_id,
            assignment_id: this.assignment_id,
            rubric_settings: this.assignment_info.rubric_settings.id,
            benchmarks: this.benchmarks,
        }

        fetch('/api/save_all_rubrics', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(res => {
                if (res.status == 204) {
                    fetch('/api/peer_reviews_analyzing', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    })
                        .then(res => {
                            if (res.status == 200) {
                                res.json().then(res => {
                                    message = res.message;
                                    names = res.names;
                                })
                                    .then(() => this.attachNamesToDatabase())
                            }
                            else if (res.status == 400) {
                                if (!this.state.error) {
                                    this.setState({
                                        error: true
                                    })
                                }
                                console.log("there was an error when running the analyze algorithm")
                            }
                            else if (res.status == 404) {
                                if (!this.state.error) {
                                    this.setState({
                                        error: true
                                    })
                                }
                                console.log("there are no peer reviews completed for this assignment")
                            }
                        })
                }
                else if (res.status == 400) {
                    if (!this.state.error) {
                        this.setState({
                            error: true
                        })
                    }
                    console.log("ran into an error when trying to save all rubric assessments from canvas")
                }
                else if (res.status === 401) {
                    history.push("/login")
                    throw new Error();
                }
                else if (res.status == 404) {
                    if (!this.state.error) {
                        this.setState({
                            error: true
                        })
                    }
                    console.log("no rubric assessments found for this assignment")
                }
            })
            .catch(err => console.log("unauthorized request when saving all rubric assessments from canvas"))

    }

    componentDidMount() {
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
            if (this.state.error) {
                return (
                    <div>
                        {this.error_message}
                    </div>
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
                                    {JSON.parse(localStorage.getItem("analyzeDisplayTextNames_" + this.assignment_id))}
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
}
export default AnalyzeResults;