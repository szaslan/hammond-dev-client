import history from '../../history';
import Loader from '../Loader/Loader';
import React, { Component } from 'react';
import { Well } from 'react-bootstrap';

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
                            console.log(res)
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
                    <AnalyzeButton assignmentId={this.state.assignmentId} assignmentInfo={this.state.assignmentJSON} courseId={this.state.courseId} />
                </div>
            )
        }

        return (
            // <Well className="assignment-info">
            <div className="assignment-info">
                <Loader />
            </div>
                
            // </Well>
        )
    }
}

export default AssignmentInfo;
