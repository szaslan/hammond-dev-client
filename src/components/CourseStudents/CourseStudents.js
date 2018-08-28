import React, { Component } from 'react';
import { Link } from "react-router-dom";
import history from '../../history';
import Loader from 'react-loader-spinner';
import { Container, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import JumbotronComp from '../JumbotronComp/JumbotronComp';
// import Select from 'react-select';
import SelectSearch from 'react-select-search'
// import linkState from 'react-link-state';
import { Redirect } from 'react-router-dom'

import './CourseStudents.css'
import StudentInfo from '../StudentInfo/StudentInfo';

const array = [];

class CourseStudents extends Component {
    constructor(props) {
        super(props);
        this.toggle = this.toggle.bind(this);
        this.select= this.select.bind(this);
        // this.handleChange = this.handleChange.bind(this)
        //URL is the current url while taking in the parameters from the props of the previous url
        this.state = {
            courseId: this.props.match.params.course_id,
            dropdownOpen: false,
            loaded: false,
            check: false,
            students: [],
            loaded: false,
            dropdownOpen: false,
            studentName: '',
            studentId: '',
            ...props,
            url: `/courses/${this.props.match.params.course_id}/students/`,

        }
      this.fetchStudentsFromCanvas = this.fetchStudentsFromCanvas.bind(this);
    }

    select(event) {
      this.setState({studentName: event.name})
      this.setState({studentId: event.value})
  
    }


    //fetch assignments for course with course_id passed down
    componentDidMount() {
        const { match: { params } } = this.props;
        if (this.props.location.state.student_name.length > 0) console.log('name found')
        this.setState({
            url: `/courses/${params.course_id}/students/`
        })
    };

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

    render(){
            return(
                <div className="studentdrop">

                    {this.state.students.length !== array.length ?
                        this.state.students.map(students => {
                            array.push({
                              name: students.name,
                              value: students.id,
                            });
                          }

                            )
                      :
                        null
                    }
                    <div>
                  <SelectSearch
                    className="select-search-box"
                    options={array}
                    search = "true"
                    placeholder = "Select a Student"
                    value={this.state.studentName}
                    onChange={this.select}
                  />
                  </div>
                  <hr className="hr-3"></hr>

                  {this.state.studentName ?
                  <StudentInfo courseId={this.state.courseId} studentId={this.state.studentId} />
                  :
                  null
                  }
              </div>
            );
        }
    }


export default CourseStudents;
