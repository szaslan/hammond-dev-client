import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { Link } from "react-router-dom";
import Flexbox from 'flexbox-react';
import history from '../../history'
import Loader from 'react-loader-spinner';

import JumbotronComp from '../JumbotronComp/JumbotronComp';
import SidebarComp from '../SideBar/SideBar';
import CardComp from '../CourseCard/CourseCard';

import './Courses.css';

class Courses extends Component {
    constructor(props) {
        super(props);
        this.state = {
            auth: false,
            courses: [],
            loaded: false,
            showCourse: false,
            user: [],
        }

        this.signOut = this.signOut.bind(this);
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
            .then(response => console.log(response))
    }


    componentWillMount() {
        this.setState({
            courses: null
        });
    }

    componentDidMount() {
        let get = this;

        this.setState({
            loaded: true
        });

        fetch('/api/courses', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'

            },
            redirect: 'follow'
        })
            .then(res => {
                if (res.status == 200) {
                    res.json().then(data => {
                        this.setState({
                            user: data.first_name,
                            courses: data.courses,
                        })
                    })
                }
                else if (res.status == 400) {
                    console.log("ran into an error when trying to pull the list of courses from canvas")
                }
                else if (res.status === 401) {
                    history.push("/login")
                    throw new Error();
                }
                else if (res.status == 404) {
                    console.log("no courses found on canvas where you are listed as teacher")
                }
            })
            .catch(err => console.log("unauthorized request when trying to pull the list of courses from canvas"))
    }

    render() {

        if (this.state.courses === null) {
            return (
                <Loader className="loader" type="TailSpin" color="black" height={80} width={80} />

            );
        }
        else {
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
                                                        this.state.courses ?
                                                            this.state.courses.map(courses =>
                                                                <Link to={`/courses/${courses.id}`}>
                                                                    <CardComp name={courses.name} />
                                                                </Link>)
                                                            :
                                                            null
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
        // else{
        //     return (
        //         <div>
        //             <div>Not Authenticated</div>
        //             <Link to="/login">
        //                 <button>Sign in</button>
        //             </Link>
        //         </div>
        //     )
        // }
    }
}

export default Courses;