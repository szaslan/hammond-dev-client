import React, { Component } from 'react';
import './Courses.css';
import {Link } from "react-router-dom";
import Loader from 'react-loader-spinner';
import { Container, Jumbotron } from 'reactstrap';
import { Well, Row, Col, Breadcrumb } from 'react-bootstrap';
import Flexbox from 'flexbox-react';
import JumbotronComp from '../JumbotronComp/JumbotronComp';



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
            user: [],
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
            res.json().then(function(data){
                get.setState({user: data})
                console.log(data);
            })
                if (res.status === 404){
                    get.setState({auth: false})
                    throw new Error("404")
                }
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
                <JumbotronComp mainTitle ={this.state.user.first_name} secondaryTitle="Welcome," />

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
    else{
        return (
            <div>Not Authenticated</div>
        )
    }
    }


}

export default Courses;
