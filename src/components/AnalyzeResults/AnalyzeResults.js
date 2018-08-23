import React, { Component } from 'react';
import { Progress } from 'reactstrap';
import { Well, Row } from 'react-bootstrap';
import Popup from 'reactjs-popup';

import UnauthorizedError from '../UnauthorizedError/UnauthorizedError';

import 'bootstrap/dist/css/bootstrap.css';

import '../Assignments/Assignments.css'

var progress = 0;
var progress_num_steps = 6;
var progress_bar_message = "";

// Steps When Analyze Is Clicked Assuming Everything Works Correctly:
// 1 - progress bar reset (from componentDidMount)
// 2 - Remove all of the messages from local storage (would only exist if analyze has previously been clicked)
// 3 - call to back-end to fetch peer reviews from canvas and save to SQL tables (from savePeerReviewsFromCanvasToDatabase)
// 4 - call to back-end to run the algorithm and determine if there is enough data (from analyze)
// 5 - local storage used to save completion statitstics
// 6 - call to back-end to sync up students' names with their entries in the SQL tables (from attachNamesToDatabase)
// 7 - call to back-end to pull students' names for anyone who doesn't have enough data (from pullNamesofFlaggedStudents)
// 8 - local storage used to save names of students who don't have enough data

class AnalyzeResults extends Component {
    constructor(props) {
        super(props);

        this.state = {
            error: false,
            unauthorized_error: false,
            unauthorized_error_message: null,
        }

        this.analyze = this.analyze.bind(this);
        this.attachNamesToDatabase = this.attachNamesToDatabase.bind(this);
        this.pullNamesofFlaggedStudents = this.pullNamesofFlaggedStudents.bind(this);
        this.savePeerReviewsFromCanvasToDatabase = this.savePeerReviewsFromCanvasToDatabase.bind(this);
        this.setProgress = this.setProgress.bind(this);

        this.assignment_id = this.props.assignmentId;
        this.assignment_info = this.props.assignmentInfo;
        this.course_id = this.props.courseId;
        this.missing_data_ids = [];
            this.pressed = this.props.pressed;

        this.error_message = "An error has occurred. Please consult the console to see what has gone wrong"
    }

    analyze() {
        var data = {
            assignment_id: this.assignment_id,
        }

        //Step 4
        fetch('/api/peer_reviews_analyzing', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(res => {
                switch (res.status) {
                    case 200:
                        this.setProgress(3)
                        res.json().then(res => {
                            let message = res.message;
                            this.missing_data_ids = res.missing_data_ids,

                                //Step 5
                                localStorage.setItem("analyzeDisplayTextNumCompleted_" + this.assignment_id, message.num_completed);
                            localStorage.setItem("analyzeDisplayTextNumAssigned_" + this.assignment_id, message.num_assigned);
                            localStorage.setItem("analyzeDisplayTextMessage_" + this.assignment_id, message.message);
                            this.setProgress(4)
                            this.attachNamesToDatabase()
                        })
                        break;
                    case 400:
                        if (!this.state.error) {
                            this.setState({
                                error: true
                            })
                        }
                        console.log("there was an error when running the analyze algorithm")
                        break;
                    case 404:
                        if (!this.state.error) {
                            this.setState({
                                error: true
                            })
                        }
                        console.log("there are no peer reviews completed for this assignment")
                        break;
                }
            })
    }

    attachNamesToDatabase() {
        var data = {
            course_id: this.course_id,
        }

        //Step 6
        fetch('/api/attach_names_in_database', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        })
            .then(res => {
                switch (res.status) {
                    case 204:
                        this.setProgress(5)
                        this.pullNamesofFlaggedStudents()
                        break;
                    case 400:
                        if (!this.state.error) {
                            this.setState({
                                error: true
                            })
                        }
                        console.log("ran into an error when trying to attach actual names to entries in SQL tables")
                        break;
                    case 401:
                        res.json().then(res => {
                            this.setState({
                                unauthorized_error: true,
                                unauthorized_error_message: res.message,
                            })
                        })
                        break;
                    case 404:
                        if (!this.state.error) {
                            this.setState({
                                error: true
                            })
                        }
                        console.log("there are no students enrolled in this course")
                        break;
                }
            })
    }

    pullNamesofFlaggedStudents() {
        let data = {
            ids: this.missing_data_ids,
        }

        //Step 7
        fetch('/api/get_name_from_id', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(res => {
                switch (res.status) {
                    case 200:
                        this.setProgress(6)
                        res.json().then(res => {
                            //Step 8
                            localStorage.setItem("analyzeDisplayTextNames_" + this.assignment_id, JSON.stringify(res));
                            localStorage.setItem("analyzePressed_" + this.assignment_id, true);
                            this.setProgress(7)
                        })
                        break;
                    case 400:
                        if (!this.state.error) {
                            this.setState({
                                error: true
                            })
                        }
                        console.log("ran into an error when gathering actual names from canvas ids")
                        break;
                    case 404:
                        if (!this.state.error) {
                            this.setState({
                                error: true
                            })
                        }
                        console.log("could not find name for student")
                        break;
                }
            })
    }

    savePeerReviewsFromCanvasToDatabase() {
        let data = {
            course_id: this.course_id,
            assignment_id: this.assignment_id,
            points_possible: this.assignment_info.points_possible,
        }

        //Step 3
        fetch('/api/save_all_peer_reviews', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(res => {
                switch (res.status) {
                    case 204:
                        this.setProgress(2)
                        this.analyze()
                        break;
                    case 400:
                        if (!this.state.error) {
                            this.setState({
                                error: true
                            })
                        }
                        console.log("ran into an error when trying to save all peer reviews from canvas")
                        break;
                    case 401:
                        res.json().then(res => {
                            this.setState({
                                error: true,
                                error_message: res.message,
                            })
                        })
                        break;
                    case 404:
                        if (!this.state.error) {
                            this.setState({
                                error: true
                            })
                        }
                        console.log("no peer reviews assigned for this assignment")
                        break;
                }
            })
    }

    setProgress(step) {
        progress = (step / progress_num_steps) * 100;
        progress_bar_message = [progress.toFixed(0) + "%"]
    }

    componentDidMount() {
        //Step 1
        this.setProgress(0)
    }

    render() {
        if (this.state.unauthorized_error) {
            return (
                <UnauthorizedError message={this.state.error_message} />
            )
        }

        if (this.state.error) {
            return (
                <div>
                    {this.error_message}
                </div>
            )
        }

        if (this.pressed) {
            //Step 2
            localStorage.removeItem("analyzeDisplayTextNames_" + this.assignment_id)
            localStorage.removeItem("analyzeDisplayTextNumCompleted_" + this.assignment_id)
            localStorage.removeItem("analyzeDisplayTextNumAssigned_" + this.assignment_id)
            localStorage.removeItem("analyzeDisplayTextMessage_" + this.assignment_id)
            this.setProgress(1)
            return (
                <div>
                    {this.savePeerReviewsFromCanvasToDatabase()}
                </div>
            )
        }

        return (
            <div>
                {
                    localStorage.getItem("analyzeDisplayTextNames_" + this.assignment_id) ?
                        <div>
                            {localStorage.getItem("analyzeDisplayTextMessage_" + this.assignment_id)}
                            <br></br>
                            <br></br>
                            <Row>
                                <Well className="well2">
                                    <strong>Completed Peer Reviews:</strong> {localStorage.getItem("analyzeDisplayTextNumCompleted_" + this.assignment_id)} / {localStorage.getItem("analyzeDisplayTextNumAssigned_" + this.assignment_id)}
                                </Well>
                            </Row>

                            <hr className="hr-4"></hr>
                            {console.log(this.assignment_id)}
                            {console.log(localStorage.getItem("analyzeDisplayTextNames_" + this.assignment_id))}
                            {console.log(JSON.parse(localStorage.getItem("analyzeDisplayTextNames_" + this.assignment_id)))}
                            <Popup className="pop-up"
                                trigger={<button className="flaggedbutton"> View Flagged Grades ({JSON.parse(localStorage.getItem("analyzeDisplayTextNames_" + this.assignment_id)).length})</button>}
                                modal
                                closeOnDocumentClick
                            >
                                <span><h5 className="modaltext">Flagged Grades</h5></span>
                                <hr />
                                <span className="studentlist">
                                    {JSON.parse(localStorage.getItem("analyzeDisplayTextNames_" + this.assignment_id))}
                                </span>
                            </Popup>
                        </div>
                        :
                        <Progress value={progress}> {progress_bar_message} </Progress>
                }
            </div>
        )
    }
}

export default AnalyzeResults;