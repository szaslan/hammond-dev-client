import React, { Component } from 'react';
import { Breadcrumb } from 'react-bootstrap';
import { Link } from "react-router-dom";
import Loader from 'react-loader-spinner';
import history from '../../history'
import { Container, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

import JumbotronComp from '../JumbotronComp/JumbotronComp';

import './CourseStudents.css'

class CourseStudents extends Component {
    constructor(props) {
        super(props);
        this.toggle = this.toggle.bind(this);
        //URL is the current url while taking in the parameters from the props of the previous url
        this.state = {
            loaded: false,
            students: [],
            url: '',
            loaded: false,
            dropdownOpen: false,
            ...props
        }
    }

    //fetch assignments for course with course_id passed down
    componentDidMount() {
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
  
    render(){
            return (
                <div className="studentdrop">
                    {console.log(this.state.students)}
                    <Dropdown direction="down" isOpen={this.state.dropdownOpen} toggle={this.toggle}>
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
                    </Dropdown>
                  <hr className="hr-3"></hr>
              </div>



            );
        }
    }
}

export default CourseStudents;