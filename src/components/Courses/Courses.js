import React, { Component } from 'react';
import './Courses.css';
import { Link, Redirect } from "react-router-dom";
import history from '../../history'
import Loader from 'react-loader-spinner';
import { Container, Jumbotron } from 'reactstrap';
import { Well, Row, Col, Breadcrumb } from 'react-bootstrap';
import Flexbox from 'flexbox-react';
import JumbotronComp from '../JumbotronComp/JumbotronComp';
import SidebarComp from '../SideBar/SideBar';
import Example from '../CourseCard/CourseCard';

class Courses extends Component {
    constructor(props) {
        super(props);
        this.signOut = this.signOut.bind(this);
        this.state = {
            courses: [],
            loaded: false,
            showCourse: false,
            auth: false,
            user: [],
        }
    }

    componentWillMount() {
        this.setState({ courses: null });
    }

    componentDidMount() {
        let get = this;

        this.setState({ loaded: true });

        fetch('/api/courses', {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'

            },
            redirect: 'follow'
        })
            .then(function (res) {
                console.log(res)

                if (res.status === 401) {
                    console.log("4040404")
                    history.push("/login")
                    throw new Error();

                    // return <Redirect to="/" />
                    // window.location.href="/login"
                }
                // if (res.status == 200)
                {
                    // get.setState({auth: true})
                    // console.log(res)
                    res.json().then(function (data) {
                        console.log(data)
                        get.setState({ user: data.first_name, courses: data.courses })
                    })
                }

            })
            .catch(err => console.log(err));
    }

    onClick() {
        this.setState({ showCourse: true });
    }

    signOut() {
        fetch('/logout', {
            credentials: 'include'
        })
            .then(response => console.log(response))
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
