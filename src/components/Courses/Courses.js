import React, { Component } from 'react';
import './Courses.css';
import {Link } from "react-router-dom";
import Loader from 'react-loader-spinner'
import { Container, Jumbotron } from 'reactstrap';
import { Well, Row, Col, Breadcrumb } from 'react-bootstrap';
import Flexbox from 'flexbox-react';


const COURSES = ['EECS 348: Intro to Artificial Intelligence', 'EECS 397: Innovation in Journalism and Technology', 'EECS 397: Building Technologies for the Law'];

function renderCourseButton(title, i) {
    return (
        <Link to="/course-home-page">
            <button className="course-button">{title}</button>
        </Link>
    );
}


class Courses extends Component{
    constructor(props){
        super(props);

        this.signOut = this.signOut.bind(this);

        this.state = {
            apiKey: "1876~ypSApnhVIL4RWGQCp5oW7aJqw4NoP0kxvdKRiTVqcpGXVgzeToigIKbVBskcqk8u",
            courses: [],
            loaded: false,
            showCourse: false,
            auth: false,
        }
    }

    componentWillMount(){
        this.setState({courses: null});
    }

    componentDidMount(){

        let get = this;

        this.setState({loaded: true});
        fetch(`https://canvas.northwestern.edu/api/v1/users/83438/courses?per_page=500&access_token=${this.state.apiKey}`
    )
        .then(res => res.json())
        .then(courses => this.setState({courses}))
        .then(courses => this.props = courses);

        fetch('/courses', {
            credentials: 'include'
        })
        .then(function(res){
            if (res.status == 200){
                get.setState({auth: true})
                console.log(res)
            }
            
        })
        .catch(err => console.log(err));
    }

    onClick(){
        this.setState({showCourse: true});
    }

    signOut(){
        fetch('/logout', {
            credentials: 'include'
        })
        .then(response => console.log(response))
    }


    render(){

        if (this.state.courses === null){
            return(
                <Loader className="loader" type="TailSpin" color="black" height={80} width={80} />

            );
        }
        else if (this.state.auth == true){
        return(

            <div>
                <Jumbotron className="jumbo" fluid>
                    <Container className="jumbo-container" fluid>
                        <Row className="jumbo-row" fluid>
                            <Col xs={11} className="col1" >
                                <Row calssName="row-title">
                                    <h1 className="welcome">Welcome,</h1>
                                </Row>
                                <Row className="row-title">
                                    <h1 className="name">Professor Hammond</h1>
                                </Row>
                            </Col>
                            <Col xs={1} className="col2">
                                <Link to="/logout">
                                    <button className="pull-right signout-button" onClick={this.signOut}>Sign Out</button>
                                </Link>
                            </Col>
                        </Row>
                    </Container>
                </Jumbotron>


                <Container className="well1-container" fluid>
                        <Flexbox className="well2-flexbox" minWidth="700px" width="90vw"
                            flexWrap="wrap" inline="true">
                            {this.state.courses ?
                                this.state.courses.map(courses =>
                                    <Link to={`/courses/${courses.id}`}>
                                        <button className="course-button">{courses.name}</button>
                                    </Link>)
                                    :
                                null
                            }
                        </Flexbox>
                </Container>

                <Well className="bottom" fluid>
                    <Container className="bottom-container" fluid>
                        <button className="about-button" >About Us</button>
                        <br></br>
                        <button className="about-button">About untitled</button>
                    </Container>
                </Well>
            </div>
                
        );
    }
    else{
        return (
            <div>Not Authenticated</div>
        )
    }
    }


}

export default Courses;
