import React, { Component } from 'react';
import { Breadcrumb } from 'react-bootstrap';
import { Link } from "react-router-dom";
import Loader from 'react-loader-spinner';
import history from '../../history'

import JumbotronComp from '../JumbotronComp/JumbotronComp';

import './CourseStudents.css'

class CourseStudents extends Component {
    constructor(props) {
        super(props);

        //URL is the current url while taking in the parameters from the props of the previous url
        this.state = {
            loaded: false,
            students: [],
            url: '',

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

    componentWillMount() {
        this.setState({
            students: []
        })
    }

    render() {
        return (
            <div>
                <JumbotronComp mainTitle="Students" secondaryTitle="&nbsp;" />

                <Breadcrumb className="breadcrumb1">
                    <Breadcrumb.Item className="breadcrumb-item" href="/courses">Home</Breadcrumb.Item>
                    <Breadcrumb.Item className="breadcrumb-item breadcrumb-item1" href={`/courses/${this.state.match.params.course_id}`}>
                        {this.props.match.params.assignment_name}
                    </Breadcrumb.Item>
                    <Breadcrumb.Item className="breadcrumb-item" active>Students</Breadcrumb.Item>
                </Breadcrumb>

                {/* <Breadcrumb className="breadcrumb1">
                        <Breadcrumb.Item className="breadcrumb-item" href="/courses/">Home</Breadcrumb.Item>
                        <Breadcrumb.Item className="breadcrumb-item breadcrumb-item1" active>{this.state.courseJSON.name}</Breadcrumb.Item>
                    </Breadcrumb> */}

                <div className="all-courses">
                    {
                        this.state.students ?
                            <ul className="courses-list">
                                {
                                    this.state.students.map(students =>
                                        <Link className="course-link" to={{
                                            pathname: this.state.url + students.id, state:
                                            {
                                                student_id: students.id,
                                                student_name: students.name,
                                                course_id: this.state.match.params.course_id
                                            }
                                        }}
                                            key={students.id}>
                                            <li className="course-name" key={students.id}>{students.name}</li>
                                        </Link>
                                    )
                                }
                            </ul>
                            :
                            <Loader type="TailSpin" color="black" height={80} width={80} />
                    }
                </div>
            </div>
        );
    }
}

export default CourseStudents;