import React, { Component } from 'react';
import './Assignments.css';
import { Link } from "react-router-dom";
import Loader from 'react-loader-spinner'
import { Container, Jumbotron } from 'reactstrap';
import { Well, Row, Col, Breadcrumb } from 'react-bootstrap';
import Flexbox from 'flexbox-react';
import AnalyzeButton from '../AnalyzeButton/AnalyzeButton';
import JumbotronComp from '../JumbotronComp/JumbotronComp';
import AssignmentInfo from '../AssignmentInfo/AssignmentInfo';
import '../BreadcrumbComp/BreadcrumbComp.css';

//FILTERS ASSIGNMENTS TO ONES WITH POINTS POSSIBLE > 10
//USE THIS TO FILTER OUT ASSIGNMENTS THAT ARE NOT PEER REVIEWABLE
//if (currAssignment.peer_reviews == true)
function FilterAssignments(props) {
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
    constructor(props, context){
        super(props, context);

        //URL is the current url while taking in the parameters from the props of the previous url
        this.state = {
            assignments: [],
            loaded: false,
            url: '',
            ...props,
        }
    }

    componentWillMount() {
        this.setState({ assignments: null });
    }
    //fetch assignments for course with course_id passed down
    componentDidMount() {
        const { match: { params } } = this.props;
      this.setState({url: `/courses/${params.course_id}/${params.assignment_name}/assignments/`});
        
        let data = {
            course_id: params.course_id,
        }

        fetch('/api/assignments',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(assignments => this.setState({assignments}))
        .then(this.setState({mounted: true}))


    }

    

   

    render() {
            return (
                // <div className="all-assignments">

                <div>
                    <JumbotronComp mainTitle="Assignments" secondaryTitle="&nbsp;" />

                    <Breadcrumb className="breadcrumb1">
                        <Breadcrumb.Item className="breadcrumb-item" href="/courses">Home</Breadcrumb.Item>
                        <Breadcrumb.Item className="breadcrumb-item breadcrumb-item1" href={`/courses/${this.state.match.params.course_id}`}>
                            {this.props.match.params.assignment_name}
                        </Breadcrumb.Item>
                        <Breadcrumb.Item className="breadcrumb-item" active>Assignments</Breadcrumb.Item>
                    </Breadcrumb>
                    
                    <div className="all-assignments">

                        <ul className="assignment-list">
                                            {this.state.assignments ?
                
                    this.state.assignments.map(assignments =>
                        <Link className="assignment-link" to={{ pathname: this.state.url + assignments.id, state: { assignment_id: assignments.id, name: this.state.match.params.assignment_name, course_id: this.state.match.params.course_id } }} key={assignments.id}>
                            <FilterAssignments currAssigment={assignments}   />
                        </Link>                            
                          )
                      :
                      <Loader type="TailSpin" color="black" height={80} width={80} />
                                  }

                        </ul>
                    </div>
                    
                </div>
            );
        }
    }


export default Assignments;
