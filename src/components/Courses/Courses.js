import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { Link } from "react-router-dom";
import Flexbox from 'flexbox-react';
import history from '../../history';
import Loader from 'react-loader-spinner';

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
                                context: '',
                                error: res.error,
                                location: "Courses.js: fetchCourses() (error came from Canvas)",
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
                        console.log("no courses found on canvas where you are listed as teacher")
                        break;
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
        return (
            <Loader className="loader" type="TailSpin" color="black" height={80} width={80} />
        );
    }
}

export default Courses;