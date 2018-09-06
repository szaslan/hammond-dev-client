import history from '../../history';
import Loader from 'react-loader-spinner';
import React, { Component } from 'react';
import Select from 'react-select';

import './Assignments.css';

import AssignmentInfo from '../AssignmentInfo/AssignmentInfo';

const arrow = require('../../img/arrow3.png');

//array of options for dropdown menu
let array = [];

//disable assignments with no peer reviews
const FilterAssignments = currAssignment => {
    if (currAssignment.peer_reviews) {
        array.push({
            label: currAssignment.name,
            value: currAssignment.id,
        })
    }
    else {
        array.push({
            label: currAssignment.name,
            value: null,
            isDisabled: true
        })
    }
}

class Assignments extends Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            assignments: [],
            courseId: this.props.courseJSON.id,
            loaded: false,
            url: `/courses/${this.props.courseJSON.id}/assignments/`,
            value: null,

            ...props,
        }

        this.pullAssignments = this.pullAssignments.bind(this);
        this.select = this.select.bind(this);

        this.canvasUserId = this.props.canvasUserId;
    }

    pullAssignments() {
        let data = {
            canvasUserId: this.canvasUserId,
            courseId: this.state.courseId,
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
                                loaded: true
                            })
                        })
                        break;
                    case 400:
                        res.json().then(res => {
                            history.push({
                                pathname: '/error',
                                state: {
                                    context: 'This function is called whenever the assignments tab is clicked on from the course homepage. This function fetches the list of all assignments from Canvas',
                                    location: "Assignments.js: pullAssignments()",
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
                                context: 'This function is called whenever the assignments tab is clicked on from the course homepage. This function fetches the list of all assignments from Canvas',
                                location: "Assignments.js: pullAssignments()",
                                message: 'No assignments created on Canvas.',
                            }
                        })
                        break;
                    default:
                }
            })
    }

    select(event) {
        this.setState({
            value: event.value,
        })
    }

    componentDidMount() {
        array = [];
        this.pullAssignments();
    }

    render() {
        //push assignments to array of options for dropdown
        if (this.state.assignments && array.length < this.state.assignments.length) {
            this.state.assignments.map(assignments => {
                FilterAssignments(assignments);
            })
        }

        if (this.state.loaded && array.length === this.state.assignments.length) {
            return (
                <div>
                    {/* dropdown properties */}
                    <div className="assign-drop">
                        <Select
                            className="select-search-box"
                            onChange={this.select}
                            options={array}
                            placeholder="Select an Assignment"
                            isSearchable="true"
                        />
                    </div>
                    {this.state.value ?
                        <AssignmentInfo courseJSON={this.props.courseJSON} assignmentId={this.state.value} canvasUserId={this.canvasUserId}/>
                        :
                        <div className="assignment-default">
                            <img className="arrow-img" src={arrow}></img>
                            Please select an assignment from the dropdown.
                        </div>}
                </div>
            );
        }

        return (
            <Loader type="TailSpin" color="black" height={80} width={80} />
        )
    }
}

export default Assignments;
