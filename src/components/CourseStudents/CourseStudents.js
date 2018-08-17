import React, { Component } from 'react';
import Loader from 'react-loader-spinner';
import JumbotronComp from '../JumbotronComp/JumbotronComp';
import {Breadcrumb} from 'react-bootstrap';
import './CourseStudents.css'
import StudentInfo from '../StudentInfo/StudentInfo';
import { Link } from "react-router-dom";
import history from '../../history'
import { Container, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';


class CourseStudents extends Component {
    constructor(props) {
        super(props);
        this.toggle = this.toggle.bind(this);
        //URL is the current url while taking in the parameters from the props of the previous url
        this.state = {
            students: [],
            url: '',
            loaded: false,
            dropdownOpen: false,
            ...props
        }
    }

    componentWillMount() {
        this.setState({ students: [] })
    }

    //fetch assignments for course with course_id passed down
    componentDidMount() {
        const { match: { params } } = this.props;
        this.setState({url: `/courses/${params.course_id}/${params.assignment_name}/students/`});

        let data = {
            course_id: params.course_id
        }

        fetch('/api/coursestudents',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
            credentials: 'include'
        })
        .then(res => {
            if (res.status === 401){
                console.log("4040404")
                history.push("/login")
                throw new Error();
            } else {
                res.json().then(res => {
                this.setState({students: res})
            })
        }
    })
        .catch(err => { console.log("not authorized") })


    }

    toggle() {
        this.setState(prevState => ({
            dropdownOpen: !prevState.dropdownOpen
        }));
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

export default CourseStudents;
