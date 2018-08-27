import React, { Component } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu } from 'reactstrap';
import { Link } from "react-router-dom";
import history from '../../history';
import Loader from 'react-loader-spinner';

import './CourseStudents.css'

class CourseStudents extends Component {
    constructor(props) {
        super(props);

        this.state = {
            courseId: this.props.match.params.course_id,
            dropdownOpen: false,
            loaded: false,
            students: [],
            url: `/courses/${this.props.match.params.course_id}/students/`,

            ...props
        }

        this.fetchStudentsFromCanvas = this.fetchStudentsFromCanvas.bind(this);
        this.toggle = this.toggle.bind(this);
    }

    fetchStudentsFromCanvas() {
        let data = {
            courseId: this.state.courseId
        }

        fetch('/api/courseStudents', {
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
                    res.json().then(res => {
                        history.push({
                            pathname: '/error',
                            state: {
                                context: '',
                                location: "CourseStudents.js: fetchStudentsFromCanvas() (error came from Canvas)",
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
        this.fetchStudentsFromCanvas()
    }

    componentWillMount() {
        this.setState({
            students: []
        })
    }

    render() {
        if (this.state.loaded) {
            return (
                <div className="studentdrop">
                    <Dropdown direction="down" isOpen={this.state.dropdownOpen} toggle={this.toggle}>
                        <DropdownToggle className="studenttog" caret>
                            {
                                this.props.location.state.student ?
                                    this.props.location.state.student.name
                                    :
                                    "Students"
                            }
                        </DropdownToggle>

                        <DropdownMenu className="studentmenu">
                            {
                                this.state.students.map(student =>
                                    <Link className="student-link" to={{ pathname: this.state.url + student.id, state: { student: student, course_id: this.state.courseId } }} key={student.id}>
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