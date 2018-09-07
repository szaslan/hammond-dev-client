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

function warnUser() {
    return 'Do you really want to leave this page?';
}

class Courses extends Component {
    constructor(props) {
        super(props);

        this.state = {
            courses: [],
            loaded: false,
            user: [],
        }

        this.createTables = this.createTables.bind(this);
        this.fetchCourses = this.fetchCourses.bind(this);
        this.send400Error = this.send400Error.bind(this);
        this.signOut = this.signOut.bind(this);

        this.canvasUserId = this.props.match.params.user_id;
        this.coursecount = -1;
      
        localStorage.setItem("pageSaved?", true);
    }

    createTables() {
        fetch('/api/createTables', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        })
            .then(res => {
                switch (res.status) {
                    case 204:
                        //no issues
                        break;
                    case 400:
                        res.json().then(res => {
                            this.send400Error("This function is called whenever a user navigates to the dashboard (including after logging in / registering). This function ensures that every SQL table exists and has the necessary formatting.", res.error, "Courses.js: createTables()", res.message)
                        })
                        break;
                    default:
                }
            })
    }

    fetchCourses() {
        let data = {
            canvasUserId: this.canvasUserId,
        }

        fetch('/api/courses', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            redirect: 'follow',
            body: JSON.stringify(data),
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
                            this.send400Error('This function is called after a user logs in or registers for a new account. This function fetches the list of courses that the current user is enrolled in as a teacher from Canvas.', res.error, "Courses.js: fetchCourses()", res.message)
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

    send400Error(context, error, location, message) {
        history.push({
            pathname: '/error',
            state: {
                context: context,
                error: error,
                location: location,
                message: message,
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
        this.createTables();

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
                                    <JumbotronComp mainTitle={this.state.user} canvasUserId={this.canvasUserId} />
                                    <Container className="well1-container" fluid>
                                        <Flexbox className="well1-flexbox" minWidth="700px" width="90vw"
                                            flexWrap="wrap" inline="true">
                                            <Flexbox className="well1-flexbox" minWidth="700px" width="90vw"
                                                flexWrap="wrap" inline="true">
                                                {
                                                    this.state.courses.length > 0 ?
                                                        this.state.courses.map(course =>
                                                            <Link to={{
                                                                pathname: `./courses/${course.id}`,
                                                                state: { canvasUserId: this.canvasUserId }
                                                            }}>
                                                                {this.coursecount++}
                                                                <CardComp name={course.name} coursecount={this.coursecount} />
                                                            </Link>)
                                                        :
                                                        <h1>No classes as a teacher</h1>
                                                }
                                            </Flexbox>
                                        </Flexbox>
                                    </Container>
                                </div>
                            }
                            canvasUserId={this.canvasUserId}
                            location={"courses"}
                        />
                    </Container>
                </div>

            );
        };
        return (
            <Loader className="loader" type="TailSpin" color="black" height={80} width={80} />
        );
    }
}

export default Courses;
