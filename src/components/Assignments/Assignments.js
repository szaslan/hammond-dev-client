import React, { Component } from 'react';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import { Link } from "react-router-dom";
import { Well } from 'react-bootstrap';
import history from '../../history';

import '../BreadcrumbComp/BreadcrumbComp.css';

import './Assignments.css';

function FilterAssignments(props) {
    const currAssignment = props.currAssigment;
    let assignmentId = currAssignment.id;

    if (currAssignment.peer_reviews) {
        return (
            <Link className="assignment-link" to={{ pathname: props.link + assignmentId, state: { assignment_id: assignmentId, assignment_name: currAssignment.name, course_id: props.courseId } }} key={assignmentId}>
                <DropdownItem className="dropdown-ite" key={currAssignment.id}>
                    {currAssignment.name}
                </DropdownItem>
            </Link>
        )
    }
    else {
        return (
            <DropdownItem disabled className="dropdown-ite not-pr" key={currAssignment.id}>
                {currAssignment.name}
            </DropdownItem>
        )
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
        if (this.state.loaded) {
            return (
                <div className="all-assignments">
                    <Well className="body-well">
                        <Dropdown direction="down" isOpen={this.state.dropdownOpen} toggle={this.toggle}>
                            <DropdownToggle className="dropdown-tog" caret>
                                {
                                    this.props.location.state.assignment_name ?
                                        this.props.location.state.assignment_name
                                        :
                                        "Assignment Title"
                                }
                            </DropdownToggle>
                            <hr className="hr-2"></hr>
                            <DropdownMenu className="dropdown-men">
                                {
                                    this.state.assignments.map(assignment =>
                                        <FilterAssignments className="assign-name" link={this.state.url} courseId={this.state.courseId} currAssigment={assignment} />
                                    )
                                }
                            </DropdownMenu>
                        </Dropdown>
                    </Well>
                    <hr className="hr-3"></hr>

                </div>
            );
        }

        return (
            <div></div>
        )
    }
}

export default Assignments;