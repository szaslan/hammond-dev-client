import React, { Component } from 'react';
import './StudentInfo.css';
import Loader from 'react-loader-spinner'
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import history from '../../history'
import ChartJS from 'react-chartjs-wrapper';

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


        this.getPeerReviews = this.getPeerReviews.bind(this);
        this.toggleReview = this.toggleReview.bind(this);
        this.toggleAssignment = this.toggleAssignment.bind(this);
        this._fetchAssignmentData = this._fetchAssignmentData.bind(this);
        this.select = this.select.bind(this);
        this.selectPeerReview = this.selectPeerReview.bind(this);
        this.pullPeerReviewData = this.pullPeerReviewData.bind(this);

        this.state = {

            student: [],
            assignments: [],
            peer_reviews: [],
            url: '',
            id: this.props.match.params.assignment_id,
            dropdownOpen: false,
            peerReviewOpen: false,
            selectedAssignment: '',
            selectedStudent: '',
            value: 'Select an Assignment',
            value2: 'Select a Peer Review',
            noPeerReview: false,
            scoreGiven: '',
            finalScore: '',
            errorMessage: 'No peer reviews for this student!',
            message: '',

            bucket_data: {
                labels: [],
                datasets: [],
                options: {},
            },
            weight_data: {
                labels: [],
                datasets: [],
                options: {},
            },
            number_of_reviews_completed_data: {
                labels: [],
                datasets: [],
                options: {},
            },

            graph_loaded: false,

            ...props,

        }
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

    //everytime a new assignment is clicked on, component re-renders and new assignment is fetched
    componentDidMount() {
        console.log("component mounted!");
        this.setState({ errorMessage: " " })
        this._fetchAssignmentData();
    }

    //renders initially
    componentDidUpdate(prevProps) {
        if (this.props.location.state.student_name !== prevProps.location.state.student_name) {
            console.log("component did update!");

            this.setState({ errorMessage: "" })

            this.setState({
                value: "Select an Assignment",
                value2: "Select a Peer Review",
                finalScore: "",
                message: '',
                scoreGiven: "",
                peer_reviews: []
            })
            // this._fetchAssignmentData();
        }
    }


    //fetches assigment data
    _fetchAssignmentData() {
        const { match: { params } } = this.props;
        this.setState({ studentClicked: true });

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
                if (res.status === 401) {
                    console.log("4040404")
                    history.push("/login")
                    throw new Error();
                } else {
                    res.json().then(data => {
                        this.setState({ assignments: data })
                    })
                }
            })
            .catch(err => console.log("Not auth"))
            .then(() => {
                this.pullPeerReviewData();
            })


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
        console.log('getPeerReview()');

        let get = this;

        fetch('/api/get_peer_reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(function (res) {
                console.log(res)
                if (res.status == 404) {
                    get.setState({ errorMessage: "No peer reviews for this student!" })

                }
                else if (res.status == 200) {
                    res.json().then(function (data) {

                        console.log(data);
                        get.setState({ peer_reviews: data })
                        // if (get.state.peer_reviews == []){
                        //     get.setState({errorMessage: "No peer reviews for this student!"})
                        //     console.log(get.state.errorMessage)

                        // }   
                    })
                } else {

                    fetch('/api/has_finalize_been_pressed', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: finalizeId
                    })
                        .then(function (response) {
                            console.log(response)
                            if (response.status == 400) {
                                console.log("400 repsonse")
                                get.setState({ peer_reviews: [] })
                                get.setState({ errorMessage: "Assignment hasn't been finalized!" })
                            }
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
            .then(res => res.json())
            .then(res => {
                let bucket_history = {
                    labels: [],
                    datasets: [
                        {
                            label: "Bucket",
                            fill: false,
                            data: [],
                            lineTension: 0,
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
                        }
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
                for (var i = 0; i < this.state.assignments.length; i++) {
                    if (this.state.assignments[i].peer_reviews) {
                        let assignment_id = this.state.assignments[i].id;
                        let assignment_name = this.state.assignments[i].name

                        if (res[assignment_id + '_bucket'] != undefined) {
                            bucket_history.labels.push(assignment_name)
                            bucket_history.datasets[0].data.push(res[assignment_id + '_bucket'])
                        }
                        if (res[assignment_id + '_number_completed'] != undefined) {
                            number_of_reviews_completed_history.labels.push(assignment_name)
                            number_of_reviews_completed_history.datasets[0].data.push(res[assignment_id + '_number_completed'])
                        }
                        if (res[assignment_id + '_weight'] != undefined) {
                            weight_history.labels.push(assignment_name)
                            weight_history.datasets[0].data.push(res[assignment_id + '_weight'])
                        }
                    }
                }
                this.setState({
                    bucket_data: bucket_history,
                    weight_data: weight_history,
                    number_of_reviews_completed_data: number_of_reviews_completed_history,
                    graph_loaded: true,
                })
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

    select(event) {
        console.log(event.target)

        this.setState({
            value: event.target.innerText,
            selectedAssignment: Number(event.target.id),
            value2: 'Select a Peer Review',
            message: '',
            scoreGiven: '',
            finalScore: ''
        }, () => {
            this.getPeerReviews();
            console.log('ran get peer reviews')
        })

        let get = this;



        console.log(this.state.selectedAssignment)
    }

    selectPeerReview(event) {
        console.log(event.target)
        this.setState({
            value2: event.target.innerText,
            selectedStudent: Number(event.target.id)
        })

        let data = {
            assignment_id: this.state.selectedAssignment,
            assessor_id: this.props.location.state.student_id,
            user_id: Number(event.target.id)
        }

        console.log(data);

        let get = this;

        fetch('/api/peer_review_grade', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(function (res) {
                if (res.status == 404) {
                    console.log("no score recieved yet")
                }
                else {
                    res.json().then(function (data) {
                        get.setState({
                            scoreGiven: data.score_given,
                            finalScore: data.final_score
                        })
                        if (data.score_given == null) {
                            get.setState({ message: <div>{get.props.location.state.student_name} did not complete this peer review</div> })
                        } else {
                            get.setState({
                                message:
                                    <div>
                                        <div>{get.props.location.state.student_name} gave {get.state.value2} a score of {get.state.scoreGiven}</div>
                                        <div>{get.state.value2} received a final grade of {get.state.finalScore}</div>
                                    </div>
                            })
                        }


                    })
                }


            })
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
                    this.state.graph_loaded ?
                        <div>
                            <ChartJS type='line' data={this.state.bucket_data} options={this.state.bucket_data.options} width="600" height="300" />
                            <br></br>
                            <br></br>
                            <ChartJS type='line' data={this.state.weight_data} options={this.state.weight_data.options} width="600" height="300" />
                            <br></br>
                            <br></br>
                            <ChartJS type='line' data={this.state.number_of_reviews_completed_data} options={this.state.number_of_reviews_completed_data.options} width="600" height="300" />
                        </div>
                        :
                        <Loader type="TailSpin" color="black" height={80} width={80} />
                }


            </div>

            //                </div>
        )
    }

}


export default StudentInfo;
