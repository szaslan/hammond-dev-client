import { Container } from 'reactstrap';
import Flexbox from 'flexbox-react';
import history from '../../history';
import { Link } from "react-router-dom";
// import Loader from 'react-loader-spinner';
import React, { Component } from 'react';
import Loader from '../Loader/Loader'
import CardComp from '../CourseCard/CourseCard';
import JumbotronComp from '../JumbotronComp/JumbotronComp';
import SidebarComp from '../SideBar/SideBar';
import './Courses.css';

// function CheckBrowser()
// {
//      // Check Browser Close [X] , Alt+F4 , File -> Close
//      if(window.event.clientX < 0 && window.event.clientY <0)
//     {
//           window.open("Operation.aspx",
//                 "Operation",'left=12000,top=1200,width=10,height=1');
//     }
// }

// function handleWindowClose(e) {
//     e = window.event || e;
//         if ((e.clientX < 0) || (e.clientY < 0))
//         {
//             e.returnValue = "Are You sure to leave this page";
//         }
// }
// window.onbeforeunload = handleWindowClose;

class Courses extends Component {
    constructor(props) {
        super(props);

        this.state = {
            courses: [],
            coursecount: -1,
            loaded: false,
            url: '/courses',
            user: [],
        }

        this.createTables = this.createTables.bind(this);
        this.fetchCourses = this.fetchCourses.bind(this);
        this.send400Error = this.send400Error.bind(this);
        this.signOut = this.signOut.bind(this);
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
        // console.log("mount")
        this.fetchCourses();
        this.createTables();
    }
    // componentDidUpdate() {
    //     console.log("update")
    // }
    // componentWillUnmount() {
    //     console.log("unmount")
    // }

    render() {
        // function blahfunction() {
        // 	return 'Do you really want to leave this page?';
        // };
        // window.onbeforeunload = blahfunction;

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
                                                                {console.log(this.state.coursecount++)}
                                                                <CardComp name={course.name} coursecount={this.state.coursecount} />
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
        else{
        return (
            <Loader />
        );
        }
    }
}

export default Courses;
