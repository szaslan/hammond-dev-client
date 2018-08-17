import React, { Component } from 'react';
import Loader from 'react-loader-spinner'

import AnalyzeButton from '../AnalyzeButton/AnalyzeButton';

import './AssignmentInfo.css';

class AssignmentInfo extends Component {
    constructor(props) {
        super(props);

        this.state = {
            assignment: null,
            url: '',
            id: this.props.match.params.assignment_id,
            assignmentClicked: false,
            peerreviewJSON: [],
            rubricJSON: [],
            ...props,
        }

        this.clearLocalStorage = this.clearLocalStorage.bind(this);
        this.fetchAssignmentData = this.fetchAssignmentData.bind(this);
    }

    clearLocalStorage() {
        localStorage.clear()
    }

    //fetches assigment data
    fetchAssignmentData() {
        const { match: { params } } = this.props;

        this.setState({
            assignmentClicked: true
        });

        console.log("1: fetching assignment data from canvas");
        this.setState({
            url: `/courses/${params.course_id}/assignments/`
        });

        let data = {
            course_id: params.course_id,
            assignment_id: params.assignment_id
        }

        fetch('/api/assignmentinfo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(res => res.json())
            .then(res => {
                this.setState({
                    assignment: res
                })
            })
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.match.params.assignment_id !== prevState.id) {
            return {
                id: nextProps.match.params.assignment_id,
                assignment: null
            }
        }
        return null;
    }

    //everytime a new assignment is clicked on, component re-renders and new assignment is fetched
    componentDidMount() {
        console.log("assignmentinfo mounted!");
        this.fetchAssignmentData();
    }

    //renders initially
    componentDidUpdate(prevProps) {
        if (this.props.match.params.assignment_id !== prevProps.match.params.assignment_id) {
            console.log("component did update!");
            this.fetchAssignmentData();
        }
    }

    //
    // componentWillReceiveProps(nextProps) {
    //     if (nextProps.match.params.assignment_id !== this.props.match.params.assignment_id) {
    //         this.setState({id: nextProps.match.params.assignment_id});
    //         console.log(nextProps);
    //     }
    // }

    render() {

        if (this.state.assignment === null)
            return (
                <div className="assignment-info">
                    <Loader
                        type="TailSpin"
                        color="black"
                        height={80}
                        width={80}
                    />
                </div>
            )
        else {
            return (
                <div className="assignment-info">
                      <h2 className="headertext">Score Details
                      {/*<button className="clear-local-button" onClick={this.clearLocalStorage}> Clear Local Storage</button>*/}
                      </h2>
                      <hr className="hr-2"></hr>
                        {/*<p><strong>Title: </strong>{this.state.assignment.name}</p>*/}
                        <br></br>

                    <AnalyzeButton
                        assignmentInfo={this.state.assignment}
                        courseId={this.props.match.params.course_id}
                        assignmentId={this.props.match.params.assignment_id}
                    />

                </div>
            )
        }

    }


}

export default AssignmentInfo;
