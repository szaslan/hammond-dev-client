import React, { Component } from 'react';
import './Courses.css';
import {Link } from "react-router-dom";
import Loader from 'react-loader-spinner';
import { Container, Jumbotron } from 'reactstrap';
import { Well, Row, Col, Breadcrumb } from 'react-bootstrap';
import Flexbox from 'flexbox-react';
import JumbotronComp from '../JumbotronComp/JumbotronComp';


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

        

        this.state = {
            apiKey: "1876~ypSApnhVIL4RWGQCp5oW7aJqw4NoP0kxvdKRiTVqcpGXVgzeToigIKbVBskcqk8u",
            courses: [],
            loaded: false,
            showCourse: false,
        }
    }

    componentWillMount(){
        this.setState({courses: null});
    }

    componentDidMount(){
        this.setState({loaded: true});
        fetch(`https://canvas.northwestern.edu/api/v1/users/83438/courses?per_page=500&access_token=${this.state.apiKey}`
    )
        .then(res => res.json())
        .then(courses => this.setState({courses}))
        .then(courses => this.props = courses);
    }

    onClick(){
        this.setState({showCourse: true});
    }


    render(){

        if (this.state.courses === null){
            return(
                <Loader className="loader" type="TailSpin" color="black" height={80} width={80} />

            );
        }
        else {
        return(
            <div>
                <JumbotronComp mainTitle ="Professor Hammond" secondaryTitle="Welcome," />


                <Container className="well1-container" fluid>
                        <Flexbox className="well1-flexbox" minWidth="700px" width="90vw"
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
    }


}

export default Courses;
