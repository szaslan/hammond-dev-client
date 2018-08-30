import React, { Component } from 'react';
import { Well } from 'react-bootstrap';
import history from '../../history';
import Loader from 'react-loader-spinner'

import AnalyzeButton from '../AnalyzeButton/AnalyzeButton';

import './AssignmentInfo.css';

class AssignmentInfo extends Component {
    constructor(props) {
        super(props);

        this.state = {
            assignmentId: this.props.assignmentId, //assignment_id prop passed through route in app.js\
            assignmentJSON: null,
            courseId: this.props.courseJSON.id,
            loaded: false,
            url: `/courses/${this.props.courseId}/assignments/`,

            ...props,
        }

        this.fetchAssignmentData = this.fetchAssignmentData.bind(this);
    }

    //fetches assigment data
    fetchAssignmentData() {
        this.setState({
            loaded: false,
        })

        let data = {
            assignmentId: this.state.assignmentId,
            courseId: this.state.courseId,
        }

        fetch('/api/assignmentInfo', {
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
                                assignmentJSON: res,
                                loaded: true,
                            })
                        })
                        break;
                    case 400:
                        res.json().then(res => {
                            history.push({
                                pathname: '/error',
                                state: {
                                    context: 'This function is called any time a new assignment is clicked on from the dropdown menu. This function fetches all of the information about this assignment from Canvas.',
                                    location: "AssignmentInfo.js: fetchAssignmentData()",
                                    message: res.message,
                                }
                            })
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
                                context: 'This function is called any time a new assignment is clicked on from the dropdown menu. This function fetches all of the information about this assignment from Canvas.',
                                location: "AssignmentInfo.js: fetchAssignmentData()",
                                message: 'Assignment not found on Canvas.',
                            }
                        })
                        break;
                    default:
                }
            })
    }

    componentDidMount() {
        this.fetchAssignmentData();
    }

    componentDidUpdate(prevProps) {
        if (this.state.assignmentId !== prevProps.assignmentId) {
            this.fetchAssignmentData();
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.assignmentId !== prevState.assignmentId) {
            return {
                assignmentId: nextProps.assignmentId,
                assignmentJSON: null,
            }
        }
        return null;
    }

    render() {
        if (this.state.loaded) {
            return (
                <div className="assignment-info">
                    {/*<h2 className="headertext">Score Details
                      <button className="clear-local-button" onClick={this.clearLocalStorage}> Clear Local Storage</button>
                      </h2>
                      <hr className="hr-2" />hr>
                        <p><strong>Title: </strong>{this.state.assignment.name}</p>
                        <br />*/}

                    <AnalyzeButton assignmentId={this.state.assignmentId} assignmentInfo={this.state.assignmentJSON} courseId={this.state.courseId} />

                </div>
            )
        }

        return (
            <Well className="assignment-info">
                <Loader type="TailSpin" color="black" height={80} width={80} />
            </Well>
        )
    }
}

export default AssignmentInfo;
