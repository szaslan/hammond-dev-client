import React, { Component } from 'react';
import { Link } from "react-router-dom";
import { Container, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import JumbotronComp from '../JumbotronComp/JumbotronComp';
// import Select from 'react-select';
// import linkState from 'react-link-state';
import { Redirect } from 'react-router-dom'
import history from '../../history';
import Loader from 'react-loader-spinner';
import SelectSearch from 'react-select-search'

import './CourseStudents.css'

const array = [];

class CourseStudents extends Component {
    constructor(props) {
        super(props);
        this.state = {
            courseId: this.props.match.params.course_id,
            dropdownOpen: false,
            loaded: false,
            students: [],
            url: `/courses/${this.props.match.params.course_id}/students/`,
            value: null,
          
          ...props,

        }
        this.fetchStudentsFromCanvas = this.fetchStudentsFromCanvas.bind(this);
        this.reDirect = this.reDirect.bind(this);
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
                }
            })
    }

    reDirect(event) {
      /*
      const { match: { params } } = this.props;
      let id = event.value.toString();
      this.setState({value: event.value})
      console.log(this.state.url+id)
      console.log(event);
      console.log("redirecting");
      <Redirect push to={{
          pathname: this.state.url + id,
          state: {student_id: event.value, student_name: event.name}}} />
    // <Link className="student-link" to={{ pathname: this.state.url + student.id, state: { student: student, course_id: this.state.courseId } }} key={student.id}>

      history.push({pathname:`/courses/${params.course_id}/students/${event.value}`,
                    state: {student_id: event.value,
                            student_name: event.name
                        }})*/
      
        this.setState({
            value: event.value,
        })

        history.push({
            pathname: `/courses/${this.state.courseId}/students/${event.value}`,
            state: {
                name: event.name
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
        if (this.state.students && array.length != this.state.students.length) {
            this.state.students.map(students => {
                array.push({
                    name: students.name,
                    value: students.id,
                });
            })
        }

        if (this.state.loaded) {
            return (
                <div className="studentdrop">
                    {
                        array.length == this.state.students.length ?
                            <div>
                                <SelectSearch
                                    className="select-search-box"
                                    options={array}
                                    search="true"
                                    placeholder="Select a Student"
                                    value={this.state.value}
                                    onChange={this.reDirect}
                                />
                            </div>
                            :
                            null
                    }
                    <hr className="hr-3"></hr>
                </div>
            );
        }

        // return (
        //     <Loader type="TailSpin" color="black" height={80} width={80} />
        // )
    }
}

export default CourseStudents;