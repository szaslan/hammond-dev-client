import React, { Component } from 'react';
import { Link } from "react-router-dom";
import { Container, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import Loader from 'react-loader-spinner'
import history from '../../history';

import '../BreadcrumbComp/BreadcrumbComp.css';

import './Assignments.css';

function FilterAssignments(props) {
    const currAssignment = props.currAssigment;

    if (currAssignment.peer_reviews) {
        return (
            <Link className="assignment-link" to={{ pathname: props.link, state: { assignment_id: props.assignmentId, name: props.name, course_id: props.courseId } }} key={props.id}>
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
            loaded: false,
            dropdownOpen: false,
            url: '',

            ...props,
        }

        //URL is the current url while taking in the parameters from the props of the previous url
        this.toggle = this.toggle.bind(this);
    }

    toggle() {
        this.setState(prevState => ({
            dropdownOpen: !prevState.dropdownOpen
        }));
    }

    //fetch assignments for course with course_id passed down
    componentDidMount() {
        const { match: { params } } = this.props;
        this.setState({
            url: `/courses/${params.course_id}/${params.assignment_name}/assignments/`
        });

        let data = {
            course_id: params.course_id,
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
                if (res.status == 200) {
                    res.json().then(data => {
                        this.setState({
                            assignments: data,
                            mounted: true
                        })
                    })
                }
                else if (res.status == 400) {
                    console.log("an error occcurred when pulling the list of assignment from canvas")
                }
                else if (res.status === 401) {
                    history.push("/login")
                    throw new Error();
                }
                else if (res.status == 404) {
                    console.log("no assignments created on canvas")
                }
            })
            .catch(err => console.log("unauthorized request when pulling info for specific assignment"))
    }

    render() {
        return (
            // <div className="all-assignments">

            <div>
                {/* <JumbotronComp mainTitle="Assignments" secondaryTitle="&nbsp;" /> */}

                {/* <Breadcrumb className="breadcrumb1">
                        <Breadcrumb.Item className="breadcrumb-item" href="/courses">Home</Breadcrumb.Item>
                        <Breadcrumb.Item className="breadcrumb-item breadcrumb-item1" href={`/courses/${this.state.match.params.course_id}`}>
                            {this.props.match.params.assignment_name}
                        </Breadcrumb.Item>
                        <Breadcrumb.Item className="breadcrumb-item" active>Assignments</Breadcrumb.Item>
                    </Breadcrumb> */}

                <div className="all-assignments">
                    <Container>
                        
                        {/* <ul className="assignment-list"> */}
                        <Dropdown direction="down" className="dropdown-1" isOpen={this.state.dropdownOpen} toggle={this.toggle}>
                            <DropdownToggle className="dropdown-tog" caret>
                                ASSIGNMENT TITLE
                            </DropdownToggle>
                            <hr className="hr-2"></hr>
                            <DropdownMenu className="dropdown-men">
                                {this.state.assignments ?
                                    this.state.assignments.map(assignments =>
                                        <FilterAssignments link={this.state.url + assignments.id} assignmentId={assignments.id} name={this.state.match.params.assignment_name} courseId={this.state.match.params.course_id} currAssigment={assignments} id={assignments.id} />


                                        // this.state.assignments.map(assignments =>
                                        //     <Link className="assignment-link" to={{ pathname: this.state.url + assignments.id, state: { assignment_id: assignments.id, name: this.state.match.params.assignment_name, course_id: this.state.match.params.course_id } }} key={assignments.id}>
                                        //         <FilterAssignments currAssigment={assignments}   />
                                        //     </Link>       
                                    )
                                    :
                                    <Loader type="TailSpin" color="black" height={80} width={80} />
                                }
                            </DropdownMenu>
                        </Dropdown>
                    </Container>
                </div>

            </div>
        );
    }
}

export default Assignments;