import { Container } from 'reactstrap';
import Flexbox from 'flexbox-react';
import history from '../../history';
import { Link } from "react-router-dom";
import Loader from 'react-loader-spinner';
import React, { Component } from 'react';

import CardComp from '../CourseCard/CourseCard';
import JumbotronComp from '../JumbotronComp/JumbotronComp';
import SidebarComp from '../SideBar/SideBar';

import './Courses.css';

class Courses extends Component {
    constructor(props) {
        super(props);

        this.state = {
            courses: [],
            loaded: false,
            url: '/courses',
            user: [],
        }

        this.fetchCourses = this.fetchCourses.bind(this);
        this.signOut = this.signOut.bind(this);
    }

    fetchCourses() {
        fetch('/api/courses', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            redirect: 'follow'
        })
            .then(res => {
                switch (res.status) {
                    case 200:
                        res.json().then(res => {
                            this.setState({
                                courses: res.courses,
                                loaded: true,
                                user: res.firstName,
                            })
                        })
                        break;
                    case 400:
                        res.json().then(res => {
                            history.push({
                                pathname: '/error',
                                state: {
                                    context: 'This function is called after a user logs in or registers for a new account. This function fetches the list of courses that the current user is enrolled in as a teacher from Canvas.',
                                    error: res.error,
                                    location: "Courses.js: fetchCourses()",
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
                                context: 'This function is called after a user logs in or registers for a new account. This function fetches the list of courses that the current user is enrolled in as a teacher from Canvas.',
                                location: "Courses.js: fetchCourses()",
                                message: 'No course found where you are listed as a teacher on Canvas.',
                            }
                        })
                        break;
                    default:
                }
            })
    }

    signOut() {
        fetch('/logout', {
            credentials: 'include'
        })
    }

    componentDidMount() {
        this.fetchCourses();
    }

    render() {
        if (this.state.loaded) {
            return (
                <div>
                    <Container>
                        <SidebarComp
                            content={
                                <div>
                                    {/* course cards for dashboard */}
                                    <JumbotronComp mainTitle={this.state.user} />
                                    <Container className="well1-container" fluid>
                                        <Flexbox className="well1-flexbox" minWidth="700px" width="90vw"
                                            flexWrap="wrap" inline="true">
                                            <Flexbox className="well1-flexbox" minWidth="700px" width="90vw"
                                                flexWrap="wrap" inline="true">
                                                {
                                                    this.state.courses.length > 0 ?
                                                        this.state.courses.map(course =>
                                                            <Link to={`/courses/${course.id}`}>
                                                                <CardComp name={course.name} />
                                                            </Link>)
                                                        :
                                                        <h1>No classes as a teacher</h1>
                                                }
                                            </Flexbox>
                                        </Flexbox>
                                    </Container>
                                </div>
                            } />
                    </Container>
                </div>
            );
        }
        return (
            <Loader className="loader" type="TailSpin" color="black" height={80} width={80} />
        );
    }
}

export default Courses;
