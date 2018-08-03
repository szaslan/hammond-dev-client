import React, { Component } from 'react';
import { Well, Row, Panel } from 'react-bootstrap';

import Flexbox from 'flexbox-react';
import 'bootstrap/dist/css/bootstrap.css';
import Accordion from '../Accordion/Accordion';
import Loader from 'react-loader-spinner'

import '../Assignments/Assignments.css'

var message = "";

class AnalyzeResults extends Component {
    constructor(props) {
        super(props);


        this.state = {
            analyzeDisplayText: false,
        }

        this.fetchPeerReviewData = this.fetchPeerReviewData.bind(this);
        this.fetchRubricData = this.fetchRubricData.bind(this);
        this.attachNamesToDatabase = this.attachNamesToDatabase.bind(this);
    }

    fetchPeerReviewData() {
        let data = {
            course_id: this.props.course_id,
            assignment_id: this.props.assignment_id
        }
        console.log("3: fetching peer review data from canvas")
        fetch('/api/save_all_peer_reviews_outer', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(res => {
                res.json()
                    .then(result => {
                        let data = {
                            peer_reviews: result,
                            course_id: this.props.course_id,
                            assignment_id: this.props.assignment_id,
                            points_possible: this.props.assignment_info.points_possible,
                        }

                        fetch('/api/save_all_peer_reviews', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(data)
                        })
                            .then(() => {
                                this.fetchRubricData();
                            })
                    })
            })
            .then(() => {
                localStorage.setItem("analyzePressed_" + this.props.assignment_id, true);
            })
    }

    fetchRubricData() {
        var data = {
            course_id: this.props.course_id,
            rubric_settings: this.props.assignment_info.rubric_settings.id
        }

        console.log("5: fetching rubric data from canvas");
        fetch('/api/save_all_rubrics_outer', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(res => {
                res.json()
                    .then(result => {
                        var data = {
                            rubrics: result,
                            assignment_id: this.props.assignment_id,
                        }

                        fetch('/api/save_all_rubrics', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(data)
                        })
                            .then(() => {
                                fetch('/api/peer_reviews_analyzing', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify(data)
                                })
                                    .then(res => res.json())
                                    .then(res => message = res.message)
                                    .then(() => {
                                        localStorage.setItem("analyzeDisplayTextNumCompleted_" + this.props.assignment_id, message.num_completed);
                                        localStorage.setItem("analyzeDisplayTextNumAssigned_" + this.props.assignment_id, message.num_assigned);
                                        localStorage.setItem("analyzeDisplayTextMessage_" + this.props.assignment_id, message.message);
                                    })
                                    .then(() => {
                                        this.setState({
                                            analyzeDisplayText: true,
                                        })
                                    })
                                    .then(() => this.attachNamesToDatabase())
                            })
                    })
            })
    }

    attachNamesToDatabase() {
        console.log("10a: attaching names to database tables");
        var data = {
            course_id: this.props.course_id,
            apiy: this.props.apiKey
        }

        fetch('/api/attach_names_in_database', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        })
    }

    componentDidMount() {
        console.log("analyze mounted")
        if (localStorage.getItem("analyzePressed_" + this.props.assignment_id)) {
            this.setState({
                analyzeDisplayText: true,
            })
        }
    }

    render() {
        return (
            <div>
                {
                    this.props.pressed ?
                        <div>
                            {
                                this.fetchPeerReviewData()
                            }

                            {
                                this.state.analyzeDisplayText ?
                                    <div>
                                        {localStorage.getItem("analyzeDisplayTextMessage_" + this.props.assignment_id)}
                                        <Row>
                                            <Well className="well2">
                                                <strong>Completed Peer Reviews:</strong> {localStorage.getItem("analyzeDisplayTextNumCompleted_" + this.props.assignment_id)} / {localStorage.getItem("analyzeDisplayTextNumAssigned_" + this.props.assignment_id)}
                                            </Well>
                                        </Row>
                                    </div>
                                    :
                                    <Loader type="TailSpin" color="black" height={80} width={80} />
                            }
                        </div>
                        :
                        <div>
                            {
                                localStorage.getItem("analyzeDisplayTextMessage_" + this.props.assignment_id) ?
                                    <div>
                                        {localStorage.getItem("analyzeDisplayTextMessage_" + this.props.assignment_id)}
                                        <Row>
                                            <Well className="well2">
                                                <strong>Completed Peer Reviews:</strong> {localStorage.getItem("analyzeDisplayTextNumCompleted_" + this.props.assignment_id)} / {localStorage.getItem("analyzeDisplayTextNumAssigned_" + this.props.assignment_id)}
                                            </Well>
                                        </Row>
                                    </div>
                                    :
                                    <Loader type="TailSpin" color="black" height={80} width={80} />
                            }
                        </div>
                }
            </div>
        )
    }
}
export default AnalyzeResults;