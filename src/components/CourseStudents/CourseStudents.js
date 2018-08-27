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

const array = [];

class CourseStudents extends Component {
    constructor(props) {
        super(props);
        this.toggle = this.toggle.bind(this);
        this.reDirect = this.reDirect.bind(this);
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
            value: '',
            ...props,
            url: `/courses/${this.props.match.params.course_id}/students/`,

        }
      this.fetchStudentsFromCanvas = this.fetchStudentsFromCanvas.bind(this);
    }

    reDirect(event) {
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
                        }})
    }

    //fetch assignments for course with course_id passed down
    componentDidMount() {
        const { match: { params } } = this.props;
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

    // handleChange(event) {
    //   this.setState({value: event.target.value});
    // }

    // setRedirect = () => {
    //     this.setState({
    //         redirect: true
    //     })
    // }
    //
    // renderRedirect = () => {
    //   if (this.state.redirect) {
    //     return <Redirect to= {}/>
    //   }
    // }

    render(){
            return(
                <div className="studentdrop">
                    {/*console.log(this.state.students)*/}
                    {/*<Dropdown direction="down" isOpen={this.state.dropdownOpen} toggle={this.toggle}>
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
                    </Dropdown>*/}

                    {this.state.students ?
                        this.state.students.map(students => {
                            array.push({
                              name: students.name,
                              value: students.id,
                            });
                          }

                            )
                      :
                      <Loader type="TailSpin" color="black" height={80} width={80} />}

                    <div>
                  <SelectSearch
                    className="select-search-box"
                    options={array}
                    search = "true"
                    placeholder = "Select a Student"
                    value={this.state.value}
                    onChange={this.reDirect}
                    // onChange={this.handleChange}
                    // onChange={() => {if (this.value) window.location.href=this.value}}
                    // onChange={() => {if (this.value) window.location.href=this.options[this.selectedIndex].value}}
                    // onChange={() => {if (this.value) this.options[this.selectedIndex].value && (window.location.href = this.options[this.selectedIndex].value)}}
                    // onChange={this.setRedirect}
                  />
                  </div>
                  <hr className="hr-3"></hr>
              </div>
            );
        }

        // return (
        //     <Loader type="TailSpin" color="black" height={80} width={80} />
        // )
    }

export default CourseStudents;
