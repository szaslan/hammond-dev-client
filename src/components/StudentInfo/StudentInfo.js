import React, { Component } from 'react';
import './StudentInfo.css';
import Loader from 'react-loader-spinner'
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import history from '../../history'
import StudentInfoGraph from '../StudentInfoGraph/StudentInfoGraph'

//filter for only peer reviewable assignments
function FilterAssignments(props) {
    const currAssignment = props.currAssigment;

    if (currAssignment.peer_reviews) {
        return (
            <DropdownItem onClick={props.click} id={props.id}>{currAssignment.name}</DropdownItem>
        )
    }
    else {
        return null;
    }
}

class StudentInfo extends Component {
    constructor(props) {
        super(props);

        this.state = {
            assignments: [],
            bucket_data: {
                labels: [],
                datasets: [],
                options: {},
            },
            dropdownOpen: false,
            errorMessage: 'No peer reviews for this student!',
            finalScore: '',
            graphs_loaded: false,
            id: this.props.match.params.assignment_id,
            message: '',
            noPeerReview: false,
            number_of_reviews_completed_data: {
                labels: [],
                datasets: [],
                options: {},
            },
            peerReviewOpen: false,
            peer_reviews: [],
            peer_review_data: null,
            selectedAssignment: '',
            selectedStudent: '',
            scoreGiven: '',
            student_exists: false,
            url: '',
            value: 'Select an Assignment',
            value2: 'Select a Peer Review',
            weight_data: {
                labels: [],
                datasets: [],
                options: {},
            },

            ...props,
        }

        this.checkIfStudentExists = this.checkIfStudentExists.bind(this);
        this.determineGraphStyles = this.determineGraphStyles.bind(this);
        this.fetchAssignmentData = this.fetchAssignmentData.bind(this);
        this.getPeerReviews = this.getPeerReviews.bind(this);
        this.pullPeerReviewData = this.pullPeerReviewData.bind(this);
        this.select = this.select.bind(this);
        this.selectPeerReview = this.selectPeerReview.bind(this);
        this.toggleAssignment = this.toggleAssignment.bind(this);
        this.toggleReview = this.toggleReview.bind(this);
    }
    //if props are changed, this runs
    // static getDerivedStateFromProps(nextProps, prevState){
    //     if (nextProps.match.params.assignment_id !== prevState.id){
    //         return {
    //         id: nextProps.match.params.assignment_id,
    //         assignment: null
    //         }
    //     }
    //     return null;
    // }

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
                if (res.status == 204) {
                    this.setState({
                        student_exists: true
                    })
                    this.pullPeerReviewData();
                }
                else if (res.status == 400) {
                    console.log("there was an erorr when checking if the current student exists in the database")
                }
                else if (res.status == 404) {
                    this.setState({
                        graphs_loaded: true,
                    })
                    console.log("the student does not exist in the database")
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
        this.setState({
            bucket_data: bucket_history,
            weight_data: weight_history,
            number_of_reviews_completed_data: number_of_reviews_completed_history,
            graphs_loaded: true,
        })
    }

    //fetches assigment data
    fetchAssignmentData() {
        const { match: { params } } = this.props;
        this.setState({
            studentClicked: true
        });

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
                if (res.status == 200) {
                    res.json().then(data => {
                        this.setState({
                            assignments: data,
                        })
                        this.checkIfStudentExists()
                    })
                }
                else if (res.status == 400) {
                    console.log("an error occcurred when pulling the list of assignments from canvas")
                }
                else if (res.status === 401) {
                    history.push("/login")
                    throw new Error();
                }
                else if (res.status == 404) {
                    console.log("no assignments created on canvas")
                }
            })
            .catch(err => console.log("unauthorized request when pulling info for specific assignment"))

        /* NEED TO FETCH STUDENT INFO AND SET STATE TO FETCHED INFO WHEN PROPS ARE UPDATED
         fetch(/api/students)/
         */
    }

    getPeerReviews() {
        let data = {
            student_id: this.props.location.state.student_id,
            assignment_id: this.state.selectedAssignment,
        }

        let finalizeId = {
            assigment_id: this.state.selectedAssignment
        }

        fetch('/api/get_peer_reviews_for_student', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(res => {
                if (res.status == 200) {
                    res.json().then(res => {
                        this.setState({
                            peer_reviews: res
                        })
                    })
                }
                else if (res.status == 400) {
                    fetch('/api/has_finalize_been_pressed', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: finalizeId
                    })
                        .then(res => {
                            if (res.status == 204) {
                                //assignment has been finalized so issue with searching for peer reviews
                                this.setState({
                                    peer_reviews: [],
                                })
                                console.log("there was an error when searching for the peer reviews completed by this student")
                            }
                            else if (res.status == 404) {
                                this.setState({
                                    peer_reviews: [],
                                    errorMessage: "Assignment hasn't been finalized!"
                                })
                            }
                        })
                }
                else if (res.status == 404) {
                    this.setState({
                        errorMessage: "No peer reviews for this student!"
                    })

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
                if (res.status == 200) {
                    res.json().then(res => {
                        this.setState({
                            peer_review_data: res
                        })
                        this.determineGraphStyles()
                    })
                }
                else if (res.status == 400) {
                    console.log("ran into an error when gathering all saved peer review evaluating history")
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
                if (res.status == 200) {
                    res.json().then(data => {
                        this.setState({
                            scoreGiven: data.score_given,
                            finalScore: data.final_score
                        })
                        if (data.score_given == null) {
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
                    })
                }
                else if (res.status == 400) {
                    console.log("there was an error when pulling the assigned and actual score for a specific peer review")
                }
            })
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
            errorMessage: " "
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
        return (
            <div className="student-info">
                {/*THIS BELOW SHOULD BE THIS.STATE.STUDENT*/}
                <div className="student-name">{this.props.location.state.student_name}</div>
                <Dropdown className="dropdowns" isOpen={this.state.dropdownOpen} toggle={this.toggleAssignment} >
                    <DropdownToggle caret>
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
                            <DropdownToggle caret>
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
                        <div>{this.state.errorMessage}</div>
                }

                {this.state.message}
                {
                    this.state.graphs_loaded ?
                        <div>
                            {this.state.student_exists ?
                                <div>
                                    <StudentInfoGraph assignments={this.state.assignments} peerReviewData={this.state.peer_review_data} category="bucket" data={this.state.bucket_data} />
                                    <StudentInfoGraph assignments={this.state.assignments} peerReviewData={this.state.peer_review_data} category="weight" data={this.state.weight_data} />
                                    <StudentInfoGraph assignments={this.state.assignments} peerReviewData={this.state.peer_review_data} category="completion" data={this.state.number_of_reviews_completed_data} />
                                </div>
                                :
                                <div>
                                    This student does not have any data saved for them at this point. To save data, you must finalize an assignment
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
