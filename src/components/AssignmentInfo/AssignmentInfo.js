import React, { Component } from 'react';
import history from '../../history';
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
            .then(res => {
                if (res.status == 200) {
                    res.json()
                        .then(res => {
                            this.setState({
                                assignment: res
                            })
                        })
                }
                else if (res.status == 400) {
                    console.log("an error occcurred when pulling info for a specific assignment from canvas")
                }
                else if (res.status == 401) {
                    history.push("/login")
                    throw new Error();
                }
                else if (res.status == 404) {
                    console.log("no assignments created on canvas")
                }
            })
            .catch(err => console.log("unauthorized request when pulling info for specific assignment"))
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
        this.fetchAssignmentData();
    }

    //renders initially
    componentDidUpdate(prevProps) {
        if (this.props.match.params.assignment_id !== prevProps.match.params.assignment_id) {
            this.fetchAssignmentData();
        }
    }

    //
    // componentWillReceiveProps(nextProps) {
    //     if (nextProps.match.params.assignment_id !== this.props.match.params.assignment_id) {
    //         this.setState({id: nextProps.match.params.assignment_id});
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
                    <div className="assignment-info-title">
                        <p><strong>Title: </strong>{this.state.assignment.name}</p>
                        <button className="clear-local-button" onClick={this.clearLocalStorage}> Clear Local Storage</button>
                    </div>
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
