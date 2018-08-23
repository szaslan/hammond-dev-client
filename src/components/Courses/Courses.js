import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { Link } from "react-router-dom";
import Flexbox from 'flexbox-react';
import Loader from 'react-loader-spinner';

import CardComp from '../CourseCard/CourseCard';
import JumbotronComp from '../JumbotronComp/JumbotronComp';
import SidebarComp from '../SideBar/SideBar';
import UnauthorizedError from '../UnauthorizedError/UnauthorizedError';

import './Courses.css';

class Courses extends Component {
    constructor(props) {
        super(props);

        this.state = {
            courses: [],
            error: false,
            error_message: null,
            loaded: false,
            showCourse: false,
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
                        res.json().then(data => {
                            this.setState({
                                courses: data.courses,
                                loaded: true,
                                user: data.first_name,
                            })
                        })
                        break;
                    case 400:
                        console.log("ran into an error when trying to pull the list of courses from canvas")
                        break;
                    case 401:
                        res.json().then(res => {
                            this.setState({
                                error: true,
                                error_message: res.message,
                            })
                        })
                        break;
                    case 404:
                        console.log("no courses found on canvas where you are listed as teacher")
                        break;
                }
            })
    }

    onClick() {
        this.setState({
            showCourse: true
        });
    }

    signOut() {
        fetch('/logout', {
            credentials: 'include'
        })
    }

    componentWillMount() {
        this.setState({
            courses: null
        });
    }

    componentDidMount() {
        this.fetchCourses();
    }

    render() {
        if (this.state.error) {
            return (
                <UnauthorizedError message={this.state.error_message} />
            )
        }

        if (!this.state.loaded) {
            return (
                <Loader className="loader" type="TailSpin" color="black" height={80} width={80} />
            );
        }
        return (
            <div>
                <Container>
                    <SidebarComp
                        content={
                            <div>
                                <JumbotronComp mainTitle={this.state.user} />
                                <Container className="well1-container" fluid>
                                    <Flexbox className="well1-flexbox" minWidth="700px" width="90vw"
                                        flexWrap="wrap" inline="true">
                                        {/*<h1 className="pagetitle">Courses</h1>*/}
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

                {/* <JumbotronComp mainTitle={this.state.user} />

                        <Container className="well1-container" fluid>
                            <Flexbox className="well1-flexbox" minWidth="700px" width="90vw"
                                flexWrap="wrap" inline="true">

                                <Flexbox className="well1-flexbox" minWidth="700px" width="90vw"
                                    flexWrap="wrap" inline="true">
                                    {this.state.courses.length > 0
                                        ?
                                        this.state.courses ?
                                            this.state.courses.map(courses =>
                                                <Link to={`/courses/${courses.id}`}>
                                                    <Example name={courses.name} />
                                                </Link>)
                                            :
                                            null

                                        :
                                        <h1>No classes as a teacher</h1>
                                    }
                                </Flexbox>
                            </Flexbox>
                        </Container> */}



                {/*<Well className="bottom" fluid>
                    <Container className="bottom-container" fluid>
                        <button className="about-button" >About Us</button>
                        <button className="about-button">About untitled</button>
                    </Container>
                </Well>*/}
            </div>

        );
    }
}

export default Courses;