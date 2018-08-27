import React, { Component } from 'react';
import { Breadcrumb } from 'react-bootstrap';
import { Link } from "react-router-dom";
import Loader from 'react-loader-spinner';
import history from '../../history'
import { Container, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import JumbotronComp from '../JumbotronComp/JumbotronComp';
// import Select from 'react-select';
import SelectSearch from 'react-select-search'
// import linkState from 'react-link-state';
// import { Redirect } from 'react-router-dom'


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
            loaded: false,
            check: false,
            students: [],
            url: '',
            loaded: false,
            dropdownOpen: false,
            ...props,
        }
    }

    reDirect(event) {
      const { match: { params } } = this.props;
      console.log("redirecting")

      history.push(`/courses/${params.course_id}/${params.assignment_name}/students/${event.value}`)
    }

    //fetch assignments for course with course_id passed down
    componentDidMount() {8
        const { match: { params } } = this.props;
        this.setState({
            url: `/courses/${params.course_id}/${params.assignment_name}/students/`
        });

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
                if (res.status == 200) {
                    res.json().then(data => {
                        this.setState({
                            students: data
                        })
                    })
                }
                else if (res.status == 400) {
                    console.log("ran into an error when trying to pull the list of students in the course from canvas")
                }
                else if (res.status === 401) {
                    history.push("/login")
                    throw new Error();
                }
                else if (res.status == 404) {
                    console.log("no students enrolled in the selected course on canvas")
                }
            })
      .catch(err => console.log("unauthorized request when pulling the list of students in the course from canvas"))
    }

    toggle() {
        this.setState(prevState => ({
            dropdownOpen: !prevState.dropdownOpen
        }));
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
                            {this.props.location.state.student_name ?
                              this.props.location.state.student_name
                            :
                            "Students"}
                        </DropdownToggle>

                          <DropdownMenu className="studentmenu">
                            {this.state.students ?
                                this.state.students.map(students =>
                                    <Link className="student-link" to={{ pathname: this.state.url + students.id, state:
                                                            { student_id: students.id,
                                                            student_name: students.name,
                                                            course_id: this.state.match.params.course_id
                                                            } }}
                                            key={students.id}>
                                        <li className = "student-name" key={students.id}>{students.name}</li>
                                    </Link>
                                    )
                              :
                              <Loader type="TailSpin" color="black" height={80} width={80} />
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

                  {array.length == this.state.students.length ?
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
                  :
                  null
                }
                  <hr className="hr-3"></hr>
              </div>
            );
        }
    }

export default CourseStudents;
