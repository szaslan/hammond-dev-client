import history from '../../history';
import Loader from 'react-loader-spinner';
import React, { Component } from 'react';
import Select from 'react-select';

import './CourseStudents.css'

import StudentInfo from '../StudentInfo/StudentInfo';

//array of options for student dropdown
const array = [];
const arrow = require('../../img/arrow3.png');

class CourseStudents extends Component {
    constructor(props) {
        super(props);
        this.state = {
            courseId: this.props.courseId,
            dropdownOpen: false,
            loaded: false,
            studentId: '',
            studentName: '',
            students: [],
            url: `/courses/${this.props.courseId}/students/`,
            value: null,

            ...props,
        }

        this.fetchStudentsFromCanvas = this.fetchStudentsFromCanvas.bind(this);
        this.select = this.select.bind(this);

        this.canvasUserId = this.props.canvasUserId;
    }

    fetchStudentsFromCanvas() {
        let data = {
            canvasUserId: this.canvasUserId,
            courseId: this.state.courseId,
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
                                    context: 'This function is called when the students tab is clicked on from the course homepage. This function fetches the list of students currently enrolled in this course from Canvas.',
                                    location: "CourseStudents.js: fetchStudentsFromCanvas()",
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
                                context: 'This function is called when the students tab is clicked on from the course homepage. This function fetches the list of students currently enrolled in this course from Canvas.',
                                location: "CourseStudents.js: fetchStudentsFromCanvas()",
                                message: 'No students enrolled in this course on Canvas.',
                            }
                        })
                        break;
                    default:
                }
            })
    }

    select(event) {
        this.setState({
            studentName: event.label,
            studentId: event.value
        })
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
        if (this.state.students && array.length < this.state.students.length) {
            this.state.students.map(students => {
                //create array of students for dropdown
                array.push({
                    label: students.name,
                    value: students.id,
                });
            }

            )
        }
        if (this.state.loaded && array.length === this.state.students.length) {
            return (
                <div>
                    <div className="student-drop">
                        {/* react select properties */}
                        <Select
                            className="select-search-box"
                            options={array}
                            isSearchable="true"
                            placeholder="Select a Student"
                            onChange={this.select}
                        />
                    </div>
                    {this.state.studentName ?
                        <StudentInfo courseId={this.state.courseId} studentId={this.state.studentId} studentName={this.state.studentName} canvasUserId={this.canvasUserId}/>
                        :
                        <div className="assignment-default">
                            <img className="arrow-img" src={arrow}></img>
                            Please select a student from the dropdown.
                        </div>
                    }
                </div>
            );
        }
        return (
            <Loader type="TailSpin" color="black" height={80} width={80} />
        )
    }
}

export default CourseStudents;
