import React, { Component } from 'react';
import Loader from 'react-loader-spinner'
import {Well} from 'react-bootstrap';

import AnalyzeButton from '../AnalyzeButton/AnalyzeButton';
import UnauthorizedError from '../UnauthorizedError/UnauthorizedError';

import './AssignmentInfo.css';

class AssignmentInfo extends Component {
    constructor(props) {
        super(props);

        this.state = {
            assignment: null,
            assignmentClicked: false,
            error: false,
            error_message: null,
            url: '',
            id: this.props.match.params.assignment_id,

            ...props,
        }

        this.fetchAssignmentData = this.fetchAssignmentData.bind(this);
    }

    //fetches assigment data
    fetchAssignmentData() {
        const { match: { params } } = this.props;

        this.setState({
            assignmentClicked: true,
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
                switch (res.status) {
                    case 200:
                        res.json().then(res => {
                            this.setState({
                                assignment: res
                            })
                        })
                        break;
                    case 400:
                        console.log("an error occcurred when pulling info for a specific assignment from canvas")
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
                        console.log("no assignments created on canvas")
                        break;
                }
            })
    }

    componentDidMount() {
        this.fetchAssignmentData();
    }

    componentDidUpdate(prevProps) {
        if (this.props.match.params.assignment_id !== prevProps.match.params.assignment_id) {
            this.fetchAssignmentData();
        }
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

    render() {
        if (this.state.error) {
            return (
                <UnauthorizedError message={this.state.error_message} />
            )
        }

        if (this.state.assignment == null)
            return (
                <Well className="assignment-info">
                    <Loader type="TailSpin" color="black" height={80} width={80} />
                </Well>
            )
            
        return (
            <div className="assignment-info">
                <h2 className="headertext">
                    Score Details
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

export default AssignmentInfo;
