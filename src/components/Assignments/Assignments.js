import React, { Component } from 'react';
import history from '../../history';
import Loader from 'react-loader-spinner'
import SelectSearch from 'react-select-search'

import '../BreadcrumbComp/BreadcrumbComp.css';

import './Assignments.css';
import AssignmentInfo from '../AssignmentInfo/AssignmentInfo';

const array = [];

const FilterAssignments = currAssignment => {
    if (currAssignment.peer_reviews) {
        array.push({
            name: currAssignment.name,
            value: currAssignment.id,
        })
    }
    else {
        array.push({
            name: currAssignment.name,
            value: null,
        })
    }
}

class Assignments extends Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            assignments: [],
            courseId: this.props.courseJSON.id,
            dropdownOpen: false,
            loaded: false,
            url: `/courses/${this.props.courseJSON.id}/assignments/`,
            value: null,

            ...props,
        }

        this.pullAssignments = this.pullAssignments.bind(this);
        this.select = this.select.bind(this);
        this.toggle = this.toggle.bind(this);
    }

    pullAssignments() {
        let data = {
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

    toggle() {
        this.setState(prevState => ({
            dropdownOpen: !prevState.dropdownOpen
        }));
    }

    componentDidMount() {
        this.pullAssignments()
    }

    render() {
        if (this.state.assignments && array.length !== this.state.assignments.length) {
            this.state.assignments.map(assignments => {
                FilterAssignments(assignments);
            })
        }

        if (this.state.loaded && array.length === this.state.assignments.length) {
            return (
                <div>
                    <div className="assigndrop">
                        <SelectSearch
                            className="select-search-box"
                            options={array}
                            search="true"
                            placeholder="Select an Assignment"
                            value={this.state.value}
                            onChange={this.select}
                        />
                    </div>

                    {this.state.value ? <AssignmentInfo courseJSON={this.props.courseJSON} assignmentId={this.state.value} />
                        :
                        null}
                </div>
            );
        }

        return (
            <Loader type="TailSpin" color="black" height={80} width={80} />
        )
    }
}

export default Assignments;
