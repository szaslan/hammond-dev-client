import React, { Component } from 'react';
import './Assignments.css';
import { Link } from "react-router-dom";
import Loader from 'react-loader-spinner'
import { Breadcrumb } from 'react-bootstrap';
import JumbotronComp from '../JumbotronComp/JumbotronComp';
import AssignmentInfo from '../AssignmentInfo/AssignmentInfo';
import '../BreadcrumbComp/BreadcrumbComp.css';
import history from '../../history'

//FILTERS ASSIGNMENTS TO ONES WITH POINTS POSSIBLE > 10
//USE THIS TO FILTER OUT ASSIGNMENTS THAT ARE NOT PEER REVIEWABLE
//if (currAssignment.peer_reviews == true)
function FilterAssignments(props) {
    const currAssignment = props.currAssigment;


    if (currAssignment.peer_reviews){
        return (
            <Link className="assignment-link" to={{ pathname: props.link, state: { assignment_id: props.assignment_id, name: props.name, course_id: props.course_id} }} key={props.id}>
                <li key={currAssignment.id} className="assignment-name">{currAssignment.name}</li>
            </Link>
        )
    }
    else {
        return  <li key={currAssignment.id} className="assignment-name not-pr">{currAssignment.name}</li>
        ;
    }
}

class Assignments extends Component{
    constructor(props, context){
        super(props, context);

        //URL is the current url while taking in the parameters from the props of the previous url
        this.state = {
            assignments: [],
            loaded: false,
            url: '',
            error: false,
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
            body: JSON.stringify(data),
            credentials: 'include'
        })
        .then(res => {
            if (res.status === 401){
                console.log("4040404")
                history.push("/login")
                throw new Error();
            } else {
                res.json().then(data => {
                    this.setState({assignments: data,
                                   mounted: true})
                }).catch(() => this.setState({error: true}))
            }
        })
        .catch(err => console.log("Not Authorized.")) 
    }

    

   

    render() {

        if (this.state.error){
            return (
                <div>
                    <JumbotronComp mainTitle="Assignments" secondaryTitle="&nbsp;" />

                    <Breadcrumb className="breadcrumb1">
                        <Breadcrumb.Item className="breadcrumb-item" href="/courses">Home</Breadcrumb.Item>
                        <Breadcrumb.Item className="breadcrumb-item breadcrumb-item1" href={`/courses/${this.state.match.params.course_id}`}>
                            {this.props.match.params.assignment_name}
                        </Breadcrumb.Item>
                        <Breadcrumb.Item className="breadcrumb-item" active>Assignments</Breadcrumb.Item>
                    </Breadcrumb>
                        <div>Oops! There was something wrong on our end.</div>
                    </div>
            )
        }else {
            return (
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
                            <FilterAssignments link={this.state.url + assignments.id} assignment_id={assignments.id} name={this.state.match.params.assignment_name} course_id={this.state.match.params.course_id} currAssigment={assignments}  id={assignments.id} />   
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
    }


export default Assignments;
