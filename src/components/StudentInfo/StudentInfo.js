import React, { Component } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { Row, Col } from 'react-bootstrap';
import history from '../../history';
import Loader from 'react-loader-spinner'

import StudentInfoGraph from '../StudentInfoGraph/StudentInfoGraph'

import './StudentInfo.css';

//filter for only peer reviewable assignments
function FilterAssignments(props) {
    const currAssignment = props.currAssigment;
    //only show assignments that are peer reviewable
    if (currAssignment.peer_reviews) {
        return (
            <DropdownItem onClick={props.click} id={props.id}>{currAssignment.name}</DropdownItem>
        )
    }

    return null;
}

class StudentInfo extends Component {
    constructor(props) {
        super(props);

        this.state = {
            actualGrade: '',
            assignments: [],
            courseId: this.props.courseId,
            dropdownOpen: false,
            errorMessage: '',
            gradeGiven: '',
            graphsLoaded: false,
            message: '',
            peerReviewOpen: false,
            peerReviewsCompletedByCurrentStudent: [],
            selectedAssignment: '',
            selectedStudentId: this.props.studentId,
            studentEvaluatingData: null,
            studentHasSavedHistory: false,
            value: 'Select an Assignment',
            value2: 'Select a Peer Review',

            ...props,
        }

        this.checkIfFinalizeHasBeenPressed = this.checkIfFinalizeHasBeenPressed.bind(this);
        this.checkIfStudentHasSavedHistory = this.checkIfStudentHasSavedHistory.bind(this);
        this.determineGraphStyles = this.determineGraphStyles.bind(this);
        this.fetchAssignmentData = this.fetchAssignmentData.bind(this);
        this.getPeerReviews = this.getPeerReviews.bind(this);
        this.pullStudentEvaluatingData = this.pullStudentEvaluatingData.bind(this);
        this.resetFieldsForNewStudent = this.resetFieldsForNewStudent.bind(this);
        this.select = this.select.bind(this);
        this.selectPeerReview = this.selectPeerReview.bind(this);
        this.send400Error = this.send400Error.bind(this);
        this.setMessage = this.setMessage.bind(this);
        this.toggleAssignment = this.toggleAssignment.bind(this);
        this.toggleReview = this.toggleReview.bind(this);

        this.bucketData = {
            labels: [],
            datasets: [],
            options: {},
        };
        this.peerReviewCompletionData = {
            labels: [],
            datasets: [],
            options: {},
        }
        this.weightData = {
            labels: [],
            datasets: [],
            options: {},
        }
    }

    checkIfFinalizeHasBeenPressed() {
        let finalizeId = {
            assignmentId: this.state.selectedAssignment
        }

        //if error, check if assignment has been finalized (error inevitable if assignment hasn't been finalized)
        fetch('/api/hasFinalizeBeenPressed', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(finalizeId)
        })
            .then(res => {
                res.json().then(res => {
                    if (res.result === "not found") {
                        this.setState({
                            peerReviewsCompletedByCurrentStudent: [],
                            errorMessage: "Assignment hasn't been finalized!"
                        })
                    }
                    else if (res.result === "found") {
                        //assignment has been finalized so issue with searching for peer reviews
                        this.setState({
                            peerReviewsCompletedByCurrentStudent: [],
                        })
                        console.log("there was an error when searching for the peer reviews completed by this student")
                    }
                })
            })
    }

    checkIfStudentHasSavedHistory() {
        let data = {
            studentId: this.state.selectedStudentId,
        }

        fetch('/api/checkIfStudentHasSavedHistory', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        })
            .then(res => {
                switch (res.status) {
                    case 204:
                        this.setState({
                            studentHasSavedHistory: true
                        })
                        this.pullStudentEvaluatingData();
                        break;
                    case 400:
                        res.json().then(res => {
                            this.send400Error("This function is called when a specific student has been clicked on from the dropdown under the students tab after all of the assignments have been successfully pulled from Canvas. This function checks if a student has any saved evaluating data in the SQL tables. This data will only exist after an assignment has been finalized.", res.error, "StudentInfo.js checkIfStudentHasSavedHistory()", res.message)
                        })
                        break;
                    case 404:
                        this.setState({
                            graphsLoaded: true,
                        })
                        console.log("the student does not exist in the database")
                        break;
                    default:
                }
            })
    }

    determineGraphStyles() {
        var bucketHistory = {
            labels: [],
            datasets: [
                {
                    label: "Bucket",
                    fill: false,
                    data: [],
                    lineTension: 0,
                    pointBackgroundColor: "#black",
                    pointRadius: 5,
                }
            ],
            options: {
                title: {
                    display: true,
                    text: 'Bucket Data:',
                },
                scales: {
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'Bucket Classifications:'
                        },
                        ticks: {
                            min: -1,
                            max: 5,
                            stepSize: 1,
                            callback: function (value) {
                                if (value === -1) {
                                    return "-1: Spazzy"
                                }
                                else if (value === 0) {
                                    return "0: definitely harsh"
                                }
                                else if (value === 1) {
                                    return "1: could be harsh"
                                }
                                else if (value === 2) {
                                    return "2: could be lenient"
                                }
                                else if (value === 3) {
                                    return "3: definitely lenient"
                                }
                                else if (value === 4) {
                                    return "4: could be fair"
                                }
                                else if (value === 5) {
                                    return "5: definitely fair"
                                }
                            }
                        }
                    }],
                    xAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'Assignments'
                        },
                    }],
                }
            }
        };
        let weightHistory = {
            labels: [],
            datasets: [
                {
                    label: "Weight",
                    fill: false,
                    data: [],
                    lineTension: 0,
                    pointBackgroundColor: "#black",
                    pointRadius: 5,
                }
            ],
            options: {
                title: {
                    display: true,
                    text: 'Weight History:',
                },
                scales: {
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'Weight:'
                        },
                        ticks: {
                            suggestedMin: 0,
                            suggestedMax: 3,
                            stepSize: .2,
                            callback: function (value) {
                                if (value === 1) {
                                    return "Neutral <---------> 1.00"
                                }
                                else if (value.toFixed(2) === 2.00) {
                                    return "Fair          ≈        2.00"
                                }
                                else if (value.toFixed(2) === 0.40) {
                                    return "Harsh/Lenient         ≈        0.40"
                                }
                                else {
                                    return value.toFixed(2)
                                }
                            }
                        }
                    }],
                    xAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'Assignments:'
                        },
                    }],
                },
            }
        };
        let peerReviewCompletionHistory = {
            labels: [],
            datasets: [
                {
                    label: "Number Of Peer Reviews Completed",
                    fill: false,
                    data: [],
                    lineTension: 0,
                    pointBackgroundColor: "#black",
                    pointRadius: 5,
                }
            ],
            options: {
                title: {
                    display: true,
                    text: 'Peer Reviews Completed History:',
                },
                scales: {
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'Number of Peer Reviews Completed:'
                        },
                        ticks: {
                            min: 0,
                            suggestedMax: 10,
                            stepSize: 1,

                        }
                    }],
                    xAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'Assignments:'
                        },
                    }],
                }
            }
        };

        this.bucketData = bucketHistory;
        this.peerReviewCompletionData = peerReviewCompletionHistory;
        this.weightData = weightHistory;
        this.setState({
            graphsLoaded: true,
        })
    }

    //fetches assignment data
    fetchAssignmentData() {
        let data = {
            courseId: this.state.courseId
        }

        fetch('/api/assignments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
            credentials: 'include'
        })
            .then(res => {
                switch (res.status) {
                    case 200:
                        res.json().then(data => {
                            this.setState({
                                assignments: data,
                            })
                            console.log(this.state)
                            this.checkIfStudentHasSavedHistory()
                        })
                        break;
                    case 400:
                        res.json().then(res => {
                            this.send400Error("This function is called when a specific student has been clicked on from the dropdown under the students tab. This function fetches the information for all of the assignments from Canvas.", res.error, "StudentInfo.js fetchAssignmentData()", res.message)
                        })
                        break;
                    case 401:
                        res.json().then(res => {
                            history.push({
                                pathname: '/unauthorized',
                                state: {
                                    location: res.location,
                                    message: res.message,
                                }
                            })
                        })
                        break;
                    case 404:
                        history.push({
                            pathname: '/notfound',
                            state: {
                                context: 'This function is called when a specific student has been clicked on from the dropdown under the students tab. This function fetches the information for all of the assignments from Canvas.',
                                location: "StudentInfo.js fetchAssignmentData()",
                                message: 'No assignments created on Canvas.',
                            }
                        })
                        break;
                    default:
                }
            })
    }

    getPeerReviews() {
        let data = {
            studentId: this.state.selectedStudentId,
            assignmentId: this.state.selectedAssignment,
        }

        fetch('/api/getPeerReviewsForStudent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(res => {
                switch (res.status) {
                    case 200:
                        res.json().then(res => {
                            this.setState({
                                peerReviewsCompletedByCurrentStudent: res
                            })
                        })
                        break;
                    case 400:
                        //if 400 error, check if there should be any peer reviews
                        this.checkIfFinalizeHasBeenPressed()
                        break;
                    case 404:
                        this.setState({
                            errorMessage: "No peer reviews for this student!"
                        })
                        break;
                    default:
                }
            })
    }

    pullStudentEvaluatingData() {
        let data = {
            studentId: this.state.selectedStudentId,
        }

        fetch('/api/pullStudentEvaluatingData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(res => {
                switch (res.status) {
                    case 200:
                        res.json().then(res => {
                            this.setState({
                                studentEvaluatingData: res
                            })
                            this.determineGraphStyles()
                        })
                        break;
                    case 400:
                        res.json().then(res => {
                            this.send400Error("This function is called after a student is confirmed to have saved evaluating data. This function pulls all the data from the SQL tables and assembles it to be displayed on graphs.", res.error, "StudentInfo.js pullStudentEvaluatingData()", res.message)
                        })
                        break;
                    default:
                }
            })
    }

    resetFieldsForNewStudent() {
        this.bucketData = {labels: [],datasets: [],options: {}};
        this.peerReviewCompletionData = {labels: [],datasets: [],options: {},}
        this.weightData = {labels: [],datasets: [],options: {},}

        this.setState({
            actualGrade: '',
            errorMessage: '',
            gradeGiven: '',
            graphsLoaded: false,
            message: '',
            peerReviewsCompletedByCurrentStudent: [],
            selectedAssignment: '',
            selectedStudentId: this.props.studentId,
            studentEvaluatingData: null,
            studentHasSavedHistory: false,
            value: "Select an Assignment",
            value2: "Select a Peer Review",
        }, () => {
            //only check if student has saved history if fetch assignment data has already been run at least once
            if (this.state.assignments.length !== 0) {
                this.checkIfStudentHasSavedHistory();
            }
        })
    }

    select(event) {
        this.setState({
            value: event.target.innerText,
            selectedAssignment: Number(event.target.id),
            value2: 'Select a Peer Review',
            peerReviewsCompletedByCurrentStudent: [],
            message: '',
            gradeGiven: '',
            actualGrade: ''
        }, () => {
            this.getPeerReviews();
        })
    }

    selectPeerReview(event) {
        this.setState({
            value2: event.target.innerText,
        })

        let data = {
            assignmentId: this.state.selectedAssignment,
            assessorId: this.state.selectedStudentId,
            userId: Number(event.target.id)
        }

        fetch('/api/peerReviewGrade', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(res => {
                switch (res.status) {
                    case 200:
                        res.json().then(data => {
                            this.setState({
                                gradeGiven: data.gradeGiven,
                                actualGrade: data.actualGrade
                            })
                            this.setMessage();
                        })
                        break;
                    case 400:
                        res.json().then(res => {
                            this.send400Error("This function is called when a peer review has been selected for a specific student for a specific assignment. This function gathers from the SQL tables what grade was assigned by the reviewer for this submission, and what grade, the submission actually received.", res.error, "StudentInfo.js selectPeerReview()", res.message)
                        })
                        break;
                    default:
                }
            })
    }

    send400Error(context, error, location, message) {
        history.push({
            pathname: '/error',
            state: {
                context: context,
                error: error,
                location: location,
                message: message,
            }
        })
    }

    setMessage() {
        if (this.state.gradeGiven == null) {
            this.setState({
                message: <div>{this.props.studentName} did not complete this peer review</div>
            })
        }
        else {
            this.setState({
                message:
                    <div>
                        <div>{this.props.studentName} gave {this.state.value2} a score of {this.state.gradeGiven}</div>
                        <div>{this.state.value2} received a final grade of {this.state.actualGrade}</div>
                    </div>
            })
        }
    }

    toggleAssignment() {
        this.setState(prevState => ({
            dropdownOpen: !prevState.dropdownOpen,
        }));
    }

    toggleReview() {
        this.setState(prevState => ({
            peerReviewOpen: !prevState.peerReviewOpen,
        }))
    }
    //everytime a new assignment is clicked on, component re-renders and new assignment is fetched
    componentDidMount() {
        this.setState({
            errorMessage: ""
        })
        this.fetchAssignmentData();
    }

    //renders initially
    componentDidUpdate(prevProps) {
        console.log(this.props, prevProps)
        if (this.props.studentId !== prevProps.studentId) {
            this.resetFieldsForNewStudent()
        }
    }

    render() {
        return (
            <div className="student-info">
                <hr className="hr-6"></hr>
                <h2 className="headertext">Peer Grading Details</h2>
                <hr className="hr-2"></hr>
                {/*THIS BELOW SHOULD BE THIS.STATE.STUDENT*/}
                {/*<div className="studentinfo-name">{this.props.location.state.name}</div>*/}
                <Row>
                    <Col className="dropsouter">
                        <Dropdown className={"dropdowns" + (!this.state.studentHasSavedHistory ? " disabled" : "")} isOpen={this.state.dropdownOpen} toggle={this.toggleAssignment} >
                            <DropdownToggle disabled={!this.state.studentHasSavedHistory} className="dropbutton" caret>
                                {this.state.value}
                            </DropdownToggle>
                            <DropdownMenu >

                                {
                                    this.state.assignments.map(assignment =>
                                        <FilterAssignments id={assignment.id} click={this.select} currAssigment={assignment} />
                                    )
                                }

                            </DropdownMenu>
                        </Dropdown>

                        {
                            this.state.peerReviewsCompletedByCurrentStudent.length > 0 ?

                                <Dropdown className="dropdowns" isOpen={this.state.peerReviewOpen} toggle={this.toggleReview} >
                                    <DropdownToggle className="dropbutton" caret>
                                        {this.state.value2}
                                    </DropdownToggle>
                                    <DropdownMenu >
                                        {
                                            this.state.peerReviewsCompletedByCurrentStudent.map(currPeerReivew =>
                                                <DropdownItem id={currPeerReivew.id} onClick={this.selectPeerReview}>
                                                    {currPeerReivew.name}
                                                </DropdownItem>
                                            )
                                        }
                                    </DropdownMenu>
                                </Dropdown>
                                :
                                <div className="errmessage">{this.state.errorMessage}</div>
                        }
                    </Col>
                    <Col className="message">
                        {this.state.message}
                    </Col>
                </Row>
                <hr className="hr-4"></hr>
                <h2 className="headertext">Grading History</h2>
                <hr className="hr-2"></hr>
                {
                    this.state.graphsLoaded ?
                        <div>
                            {
                                this.state.studentHasSavedHistory ?
                                    <div>
                                        <StudentInfoGraph className="graph" assignments={this.state.assignments} peerReviewData={this.state.studentEvaluatingData} category="bucket" data={this.bucketData} />
                                        <StudentInfoGraph className="graph" assignments={this.state.assignments} peerReviewData={this.state.studentEvaluatingData} category="weight" data={this.weightData} />
                                        <StudentInfoGraph className="graph" assignments={this.state.assignments} peerReviewData={this.state.studentEvaluatingData} category="completion" data={this.peerReviewCompletionData} />
                                    </div>
                                    :
                                    <div className="message1">
                                        This student does not have any data saved at this point. To save data, you must finalize an assignment.
                                </div>
                            }
                        </div>
                        :
                        <Loader type="TailSpin" color="black" height={80} width={80} />
                }
            </div>
        )
    }

}

export default StudentInfo;
