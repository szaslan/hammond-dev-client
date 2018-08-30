import React, { Component } from 'react';
import history from '../../history';
import SelectSearch from 'react-select-search'

import StudentInfo from '../StudentInfo/StudentInfo';

import './CourseStudents.css'

const array = [];

class CourseStudents extends Component {
    constructor(props) {
        super(props);

        this.state = {
            courseId: this.props.match.params.course_id,
            dropdownOpen: false,
            loaded: false,
            studentId: '',
            studentName: '',
            students: [],
            url: `/courses/${this.props.match.params.course_id}/students/`,
            value: null,

            ...props,
        }

        this.fetchStudentsFromCanvas = this.fetchStudentsFromCanvas.bind(this);
        this.select = this.select.bind(this);
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
            studentName: event.name,
            studentId: event.value
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
        if (this.state.students.length !== array.length) {
            this.state.students.map(students => {
                array.push({
                    name: students.name,
                    value: students.id,
                });
            })
        }

        return (
            <div className="studentdrop">
                <div>
                    <SelectSearch
                        className="select-search-box"
                        options={array}
                        search="true"
                        placeholder="Select a Student"
                        value={this.state.studentName}
                        onChange={this.select}
                    />
                </div>
                <hr className="hr-3" />hr>

                {
                    this.state.studentName ?
                        <StudentInfo courseId={this.state.courseId} studentId={this.state.studentId} studentName={this.state.studentName} />
                        :
                        null
                }
            </div>
        );
    }
}

export default CourseStudents;