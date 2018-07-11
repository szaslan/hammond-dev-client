import React, { Component } from 'react';
import './Assignments.css';
import {  Link } from "react-router-dom";
import Loader from 'react-loader-spinner'
import { Container, Jumbotron } from 'reactstrap';
import { Well, Row, Col, Breadcrumb } from 'react-bootstrap';
import Flexbox from 'flexbox-react';
import AnalyzeButton from '../AnalyzeButton/AnalyzeButton';
import AssignmentInfo from '../AssignmentInfo/AssignmentInfo';

//FILTERS ASSIGNMENTS TO ONES WITH POINTS POSSIBLE > 10
//USE THIS TO FILTER OUT ASSIGNMENTS THAT ARE NOT PEER REVIEWABLE
//if (currAssignment.peer_reviews == true)
function FilterAssignments(props){
    const currAssignment = props.currAssigment;

    if (currAssignment.points_possible > 1){
        return (
            <li key={currAssignment.id} className="assignment-name">{currAssignment.name}</li>
        )
    }
    else {
        return null;
    }
}





// function buttonsInstance(courses, url){
//     <Col xs={6} className="col4">
//         {courses.map(courses => 
//          <div className="div-student">
//          <Link className="assignment-link" to={{pathname: url + courses.id, state: {assignment_id: courses.id} }} key={courses.id}>
//          <FilterAssignments currAssigment={courses}/>
//          </Link>
//          <br></br>
//      </div>
//     )}
//     </Col>
// }



class Assignments extends Component{
    constructor(props){
        super(props);

        //URL is the current url while taking in the parameters from the props of the previous url
        this.state = {
            apiKey: "1876~ypSApnhVIL4RWGQCp5oW7aJqw4NoP0kxvdKRiTVqcpGXVgzeToigIKbVBskcqk8u",
            assignments: [],
            loaded: false,
            url: '',
            ...props,
        }
    }
     componentWillMount(){
         this.setState({loaded: true});
     }
    //fetch assignments for course with course_id passed down
    componentDidMount(){
        const { match: { params } } = this.props;
        this.setState({url: `/courses/${params.course_id}/assignments/`});
        fetch(`https://canvas.northwestern.edu/api/v1/courses/${params.course_id}/assignments?per_page=500&access_token=${this.state.apiKey}`)
        .then(res => res.json())
        .then(assignments => this.setState({assignments}));
    }

   

 

    render(){

        if (!this.state.loaded){
            return (
                <div className="all-assignments">
                <Loader type="TailSpin" color="black" height={80} width={80} />
                </div>
            )
        } else {
        return(
            <div className="all-assignments">

                                <div>
                <Jumbotron className="jumbo" fluid>
                    <Container className="jumbo-container" fluid>
                    <Row className="jumbo-row" fluid>
                            <Col xs={10} className="col1" >
                                <Row className="row-welcomes">
                                <h1 className="welcome">&nbsp;</h1>
                                </Row>
                                <Row>
                                <h1 className="name">Assignments</h1>
                                </Row>
                            </Col>
                            <Col xs={1} className="col2">
                                <Link to ="/">
                                <button className="pull-right signout-button">Sign Out</button>
                                </Link>
                            </Col>
                        </Row>
                    </Container>
                </Jumbotron>
                <Breadcrumb className="breadcrumb1">
                    <Breadcrumb.Item className="breadcrumb-item" href="/courses">Home</Breadcrumb.Item>
                    <Breadcrumb.Item className="breadcrumb-item" href={`/courses/${this.state.match.params.course_id}`}>
                        {this.state.location.state.name ? this.state.location.state.name : null }
                        {console.log(this.state.name)}
                    </Breadcrumb.Item>
                    {console.log(this.state.assignments)}
                    <Breadcrumb.Item className="breadcrumb-item" active>Assignments</Breadcrumb.Item>
                </Breadcrumb>
                <ul className="assignment-list">
                            {this.state.assignments.map(assignments =>
                                    <Link className="assignment-link" to={{ pathname: this.state.url + assignments.id, state: { assignment_id: assignments.id, name: this.state.location.state.name, course_id: this.state.match.params.course_id } }} key={assignments.id}>
                                        <FilterAssignments currAssigment={assignments} />
                                    </Link>                            
                            )}
                            
                    </ul>
            </div>
           

        </div>
        );
    }
    }
}

export default Assignments;
