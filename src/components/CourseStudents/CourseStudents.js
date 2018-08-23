import React, { Component } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu } from 'reactstrap';
import { Link } from "react-router-dom";
import Loader from 'react-loader-spinner';

import UnauthorizedError from '../UnauthorizedError/UnauthorizedError';

import './CourseStudents.css'

class CourseStudents extends Component {
    constructor(props) {
        super(props);

        this.state = {
            dropdownOpen: false,
            error: false,
            error_message: null,
            loaded: false,
            students: [],
            url: '',

            ...props
        }

        this.fetchStudentsFromCanvas = this.fetchStudentsFromCanvas.bind(this);
        this.toggle = this.toggle.bind(this);
    }

    fetchStudentsFromCanvas() {
        const { match: { params } } = this.props;

        let data = {
            course_id: params.course_id
        }

        fetch('/api/coursestudents', {
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
                                loaded: true,
                                students: data,
                            })
                        })
                        break;
                    case 400:
                        console.log("ran into an error when trying to pull the list of students in the course from canvas")
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
                        console.log("no students enrolled in the selected course on canvas")
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
            url: `/courses/${params.course_id}/${params.assignment_name}/students/`
        });

        this.fetchStudentsFromCanvas()
    }

    componentWillMount() {
        this.setState({
            students: []
        })
    }

    render() {
        if (this.state.error) {
            return (
                <UnauthorizedError message={this.state.error_message} />
            )
        }

        if (this.state.loaded) {
            return (
                <div className="studentdrop">
                    <Dropdown direction="down" isOpen={this.state.dropdownOpen} toggle={this.toggle}>
                        <DropdownToggle className="studenttog" caret>
                            {
                                this.props.location.state.student_name ?
                                    this.props.location.state.student_name
                                    :
                                    "Students"
                            }
                        </DropdownToggle>

                        <DropdownMenu className="studentmenu">
                            {
                                this.state.students.map(student =>
                                    <Link className="student-link" to={{ pathname: this.state.url + student.id, state: { student_id: student.id, student_name: student.name, course_id: this.state.match.params.course_id } }} key={student.id}>
                                        <li className="student-name" key={student.id}>
                                            {student.name}
                                        </li>
                                    </Link>
                                )
                            }
                        </DropdownMenu>
                    </Dropdown>
                    <hr className="hr-3"></hr>
                </div>
            );
        }

        return (
            <Loader type="TailSpin" color="black" height={80} width={80} />
        )
    }
}

export default CourseStudents;