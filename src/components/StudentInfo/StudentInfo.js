import React, { Component } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { Row, Col } from 'react-bootstrap';
import Loader from 'react-loader-spinner'

import StudentInfoGraph from '../StudentInfoGraph/StudentInfoGraph'
import UnauthorizedError from '../UnauthorizedError/UnauthorizedError';

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
            assignments: [],
            dropdownOpen: false,
            errorMessage: '',
            finalScore: '',
            graphs_loaded: false,
            id: this.props.match.params.assignment_id,
            message: '',
            noPeerReview: false,
            peerReviewOpen: false,
            peer_reviews: [],
            peer_review_data: null,
            selectedAssignment: '',
            selectedStudent: '',
            scoreGiven: '',
            student_exists: false,
            unauthorized_error: false,
            unauthorized_error_message: null,
            url: '',
            value: 'Select an Assignment',
            value2: 'Select a Peer Review',

            ...props,
        }

        this.checkIfFinalizeHasBeenPressed = this.checkIfFinalizeHasBeenPressed.bind(this);
        this.checkIfStudentExists = this.checkIfStudentExists.bind(this);
        this.determineGraphStyles = this.determineGraphStyles.bind(this);
        this.fetchAssignmentData = this.fetchAssignmentData.bind(this);
        this.getPeerReviews = this.getPeerReviews.bind(this);
        this.pullPeerReviewData = this.pullPeerReviewData.bind(this);
        this.select = this.select.bind(this);
        this.selectPeerReview = this.selectPeerReview.bind(this);
        this.setMessage = this.setMessage.bind(this);
        this.toggleAssignment = this.toggleAssignment.bind(this);
        this.toggleReview = this.toggleReview.bind(this);

        this.bucket_data = {
            labels: [],
            datasets: [],
            options: {},
        };
        this.number_of_reviews_completed_data = {
            labels: [],
            datasets: [],
            options: {},
        }
        this.weight_data = {
            labels: [],
            datasets: [],
            options: {},
        }
    }

    checkIfFinalizeHasBeenPressed() {
        let finalizeId = {
            assignment_id: this.state.selectedAssignment
        }

        //if error, check if assignment has been finalized (error inevitable if assignment hasn't been finalized)
        fetch('/api/has_finalize_been_pressed', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(finalizeId)
        })
            .then(res => {
                res.json().then(res => {
                    if (res.result == "not found") {
                        this.setState({
                            peer_reviews: [],
                            errorMessage: "Assignment hasn't been finalized!"
                        })
                    }
                    else if (res.result == "found") {
                        //assignment has been finalized so issue with searching for peer reviews
                        this.setState({
                            peer_reviews: [],
                        })
                        console.log("there was an error when searching for the peer reviews completed by this student")
                    }
                })
            })
    }

    checkIfStudentExists() {
        let data = {
            student_id: this.props.location.state.student_id,
        }

        fetch('/api/check_if_student_exists', {
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
                            student_exists: true
                        })
                        this.pullPeerReviewData();
                        break;
                    case 400:
                        console.log("there was an erorr when checking if the current student exists in the database")
                        break;
                    case 404:
                        this.setState({
                            graphs_loaded: true,
                        })
                        console.log("the student does not exist in the database")
                        break;
                }
            })
    }

    determineGraphStyles() {
        var bucket_history = {
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
                                if (value == -1) {
                                    return "-1: Spazzy"
                                }
                                else if (value == 0) {
                                    return "0: definitely harsh"
                                }
                                else if (value == 1) {
                                    return "1: could be harsh"
                                }
                                else if (value == 2) {
                                    return "2: could be lenient"
                                }
                                else if (value == 3) {
                                    return "3: definitely lenient"
                                }
                                else if (value == 4) {
                                    return "4: could be fair"
                                }
                                else if (value == 5) {
                                    return "5: definitely fair"
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
                }
            }
        };
        let weight_history = {
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
                                if (value == 1) {
                                    return "Neutral <---------> 1.00"
                                }
                                else if (value.toFixed(2) == 2.00) {
                                    return "Fair          ≈        2.00"
                                }
                                else if (value.toFixed(2) == 0.40) {
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
        let number_of_reviews_completed_history = {
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

        this.bucket_data = bucket_history;
        this.number_of_reviews_completed_data = number_of_reviews_completed_history;
        this.weight_data = weight_history;
        this.setState({
            graphs_loaded: true,
        })
    }

    //fetches assignment data
    fetchAssignmentData() {
        const { match: { params } } = this.props;

        let data = {
            course_id: params.course_id,
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
                            this.checkIfStudentExists()
                        })
                        break;
                    case 400:
                        console.log("an error occcurred when pulling the list of assignments from canvas")
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
                        console.log("no assignments created on canvas")
                        break;
                }
            })
    }

    getPeerReviews() {
        let data = {
            student_id: this.props.location.state.student_id,
            assignment_id: this.state.selectedAssignment,
        }

        fetch('/api/get_peer_reviews_for_student', {
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
                                peer_reviews: res
                            })
                        })
                        break;
                    case 400:
                        this.checkIfFinalizeHasBeenPressed()
                        break;
                    case 404:
                        this.setState({
                            errorMessage: "No peer reviews for this student!"
                        })
                        break;
                }
            })
    }

    pullPeerReviewData() {
        let data = {
            assessor_id: this.props.location.state.student_id,
        }

        fetch('/api/pull_peer_review_data', {
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
                                peer_review_data: res
                            })
                            this.determineGraphStyles()
                        })
                        break;
                    case 400:
                        console.log("ran into an error when gathering all saved peer review evaluating history")
                        break;
                }
            })
    }

    select(event) {
        this.setState({
            value: event.target.innerText,
            selectedAssignment: Number(event.target.id),
            value2: 'Select a Peer Review',
            peer_reviews: [],
            message: '',
            peer_reviews: [],
            scoreGiven: '',
            finalScore: ''
        }, () => {
            this.getPeerReviews();
        })
    }

    selectPeerReview(event) {
        this.setState({
            value2: event.target.innerText,
            selectedStudent: Number(event.target.id)
        })

        let data = {
            assignment_id: this.state.selectedAssignment,
            assessor_id: this.props.location.state.student_id,
            user_id: Number(event.target.id)
        }

        fetch('/api/peer_review_grade', {
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
                                scoreGiven: data.score_given,
                                finalScore: data.final_score
                            })
                            this.setMessage();
                        })
                        break;
                    case 400:
                        console.log("there was an error when pulling the assigned and actual score for a specific peer review")
                        break;
                }
            })
    }

    setMessage() {
        if (this.state.scoreGiven == null) {
            this.setState({
                message: <div>{this.props.location.state.student_name} did not complete this peer review</div>
            })
        }
        else {
            this.setState({
                message:
                    <div>
                        <div>{this.props.location.state.student_name} gave {this.state.value2} a score of {this.state.scoreGiven}</div>
                        <div>{this.state.value2} received a final grade of {this.state.finalScore}</div>
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
        if (this.props.location.state.student_name !== prevProps.location.state.student_name) {
            this.setState({
                errorMessage: "",
                value: "Select an Assignment",
                value2: "Select a Peer Review",
                finalScore: "",
                message: '',
                scoreGiven: "",
                peer_reviews: [],
                graphs_loaded: false,
            }, () => {
                this.checkIfStudentExists();
            })
            // this.fetchAssignmentData();
        }
    }

    render() {
        if (this.state.unauthorized_error) {
            return (
                <UnauthorizedError message={this.state.unauthorized_error_message} />
            )
        }

        return (
            <div className="student-info">
                <h2 className="headertext">Peer Grading Details</h2>
                <hr className="hr-2"></hr>
                {/*THIS BELOW SHOULD BE THIS.STATE.STUDENT*/}
                {/*<div className="studentinfo-name">{this.props.location.state.student_name}</div>*/}
                <Row>
                    <Col className="dropsouter">
                        <Dropdown className="dropdowns" isOpen={this.state.dropdownOpen} toggle={this.toggleAssignment} >
                            <DropdownToggle className="dropbutton" caret>
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
                            this.state.peer_reviews.length > 0 ?

                                <Dropdown className="dropdowns" isOpen={this.state.peerReviewOpen} toggle={this.toggleReview} >
                                    <DropdownToggle className="dropbutton" caret>
                                        {this.state.value2}
                                    </DropdownToggle>
                                    <DropdownMenu >
                                        {
                                            this.state.peer_reviews.map(currPeerReivew =>
                                                <DropdownItem id={currPeerReivew.id} onClick={this.selectPeerReview}>{currPeerReivew.name}</DropdownItem>
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
                    this.state.graphs_loaded ?
                        <div>
                            {
                                this.state.student_exists ?
                                    <div>
                                        <StudentInfoGraph className="graph" assignments={this.state.assignments} peerReviewData={this.state.peer_review_data} category="bucket" data={this.bucket_data} />
                                        <StudentInfoGraph className="graph" assignments={this.state.assignments} peerReviewData={this.state.peer_review_data} category="weight" data={this.weight_data} />
                                        <StudentInfoGraph className="graph" assignments={this.state.assignments} peerReviewData={this.state.peer_review_data} category="completion" data={this.number_of_reviews_completed_data} />
                                    </div>
                                    :
                                    <div className="message">
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