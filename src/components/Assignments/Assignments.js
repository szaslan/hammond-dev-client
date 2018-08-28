import React, { Component } from 'react';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import { Link } from "react-router-dom";
import { Well } from 'react-bootstrap';
import history from '../../history';

import '../BreadcrumbComp/BreadcrumbComp.css';
import SelectSearch from 'react-select-search'

import './Assignments.css';

const array = [];
// var statusToClassName = null;

const FilterAssignments = currAssignment => {
    // const currAssignment = props.currAssignment;
    // console.log(assignArr)

    console.log("filtering assignments")

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
            courseId: this.props.match.params.course_id,
            dropdownOpen: false,
            loaded: false,
            url: `/courses/${this.props.match.params.course_id}/assignments/`,

            ...props,
        }

        this.pullAssignments = this.pullAssignments.bind(this);
        this.toggle = this.toggle.bind(this);
        this.reDirect = this.reDirect.bind(this);
    }

    reDirect(event) {
        const { match: { params } } = this.props;
        console.log("redirecting")

        history.push(`/courses/${params.course_id}/assignments/${event.value}`)
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
                                    context: '',
                                    location: "Assignments.js: pullAssignments() (error came from Canvas)",
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
                        console.log("no assignments created on canvas")
                        break;
                }
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
        if (this.state.assignments && array.length != this.state.assignments.length) {
            this.state.assignments.map(assignments => {
                console.log(assignments);
                FilterAssignments(assignments);
            })
        }

        if (this.state.loaded) {
            return (
                <div className="assigndrop">

                    {console.log(array)}
                    {console.log(this.state.assignments.length)}
                    {console.log(this.state.value)}
                    {array.length == this.state.assignments.length ?
                        <div>
                            <SelectSearch
                                className="select-search-box"
                                options={array}
                                search="true"
                                placeholder="Select an Assignment"
                                value={this.state.value}
                                onChange={this.reDirect}
                            />
                        </div>
                        :
                        null
                    }
                </div>
            );
        }

        return (
            <div></div >
        )
    }
}

export default Assignments;
