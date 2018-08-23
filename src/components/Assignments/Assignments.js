import React, { Component } from 'react';
import { Link } from "react-router-dom";
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

import UnauthorizedError from '../UnauthorizedError/UnauthorizedError';

import '../BreadcrumbComp/BreadcrumbComp.css';

import './Assignments.css';

function FilterAssignments(props) {
    const currAssignment = props.currAssigment;

    if (currAssignment.peer_reviews) {
        return (
            <Link className="assignment-link" to={{ pathname: props.link, state: { assignment_id: props.assignmentId, assignment_name: currAssignment.name, course_id: props.courseId } }} key={props.id}>
                {/* <li key={currAssignment.id} className="assignment-name">{currAssignment.name}</li>  */}
                <DropdownItem className="dropdown-ite" key={currAssignment.id} /*className="assignment-name"*/>{currAssignment.name}</DropdownItem>
            </Link>
        )
    }
    else {
        // return <li key={currAssignment.id} className="assignment-name not-pr">{currAssignment.name}</li>
        return <DropdownItem disabled className="dropdown-ite not-pr" key={currAssignment.id} /*className="assignment-name not-pr"*/>{currAssignment.name}</DropdownItem>
    }
}

class Assignments extends Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            assignments: null,
            dropdownOpen: false,
            error: false,
            error_message: null,
            mounted: false,
            url: '',

            ...props,
        }

        this.pullAssignments = this.pullAssignments.bind(this);
        this.toggle = this.toggle.bind(this);
    }

    pullAssignments() {
        const { match: { params } } = this.props;

        let data = {
            course_id: params.course_id,
        }

        console.log(data)

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
                                mounted: true
                            })
                        })
                        break;
                    case 400:
                        console.log("an error occcurred when pulling the list of assignments from canvas")
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

    toggle() {
        this.setState(prevState => ({
            dropdownOpen: !prevState.dropdownOpen
        }));
    }

    componentDidMount() {
        const { match: { params } } = this.props;
        this.setState({
            url: `/courses/${params.course_id}/${params.assignment_name}/assignments/`
        });

        this.pullAssignments()
    }

    render() {
        if (this.state.error) {
            return (
                <UnauthorizedError message={this.state.error_message} />
            )
        }

        if (this.state.mounted) {
            return (
                <div className="assigndrop">
                    <Dropdown direction="down" isOpen={this.state.dropdownOpen} toggle={this.toggle}>
                        <DropdownToggle className="assigntog" caret>
                            {
                                this.props.location.state.assignment_name ?
                                    this.props.location.state.assignment_name
                                    :
                                    "Assignment Title"
                            }
                        </DropdownToggle>
                        <DropdownMenu className="dropdown-men">
                            {
                                this.state.assignments.map(assignments =>
                                    <FilterAssignments className="assign-name" link={this.state.url + assignments.id} assignmentId={assignments.id} name={this.state.match.params.assignment_name} courseId={this.state.match.params.course_id} currAssigment={assignments} id={assignments.id} />
                                    //     <Link className="assignment-link" to={{ pathname: this.state.url + assignments.id, state: { assignment_id: assignments.id, name: this.state.match.params.assignment_name, course_id: this.state.match.params.course_id } }} key={assignments.id}>
                                    //         <FilterAssignments currAssigment={assignments}   />
                                    //     </Link>
                                )
                            }
                        </DropdownMenu>
                    </Dropdown>
                    <hr className="hr-3"></hr>
                </div>
            );
        }
        
        return (
            <div></div>
            // <Loader type="TailSpin" color="black" height={80} width={80} />
        )
    }
}

export default Assignments;