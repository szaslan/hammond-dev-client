import React, { Component } from 'react';
import './Assignments.css';
import {  Link } from "react-router-dom";
import Loader from 'react-loader-spinner'


//FILTERS ASSIGNMENTS TO ONES WITH POINTS POSSIBLE > 10
//USE THIS TO FILTER OUT ASSIGNMENTS THAT ARE NOT PEER REVIEWABLE
//if (currAssignment.peer_reviews == true)
function FilterAssignments(props){
    const currAssignment = props.currAssigment;

    if (currAssignment.points_possible > 10){
        return (
            <li key={currAssignment.id} className="assignment-name">{currAssignment.name}</li>
        )
    }
    else {
        return null;
    }
}


class Assignments extends Component{
    constructor(props){
        super(props);

        //URL is the current url while taking in the parameters from the props of the previous url
        this.state = {
            apiKey: "1876~ypSApnhVIL4RWGQCp5oW7aJqw4NoP0kxvdKRiTVqcpGXVgzeToigIKbVBskcqk8u",
            assignments: [],
            url: '',
            loaded: false
        }
    }
     
    //fetch assignments for course with course_id passed down
    componentDidMount(){
        this.setState({loaded: true});
        const { match: { params } } = this.props;
        this.setState({url: `/courses/${params.course_id}/assignments/`});
        fetch(`https://canvas.northwestern.edu/api/v1/courses/${params.course_id}/assignments?per_page=500&access_token=${this.state.apiKey}`)
        .then(res => res.json())
        .then(assignments => this.setState({assignments}));
    }

 

    render(){
        return(
            <div className="all-assignments">
                {this.state.loaded 
                ?   
                    <div >
                        <Link to={`/courses/${this.props.match.params.course_id}`} >
                            <div>Back to Course Page</div>
                        </Link>
                        <ul className="assignment-list">
                            {                //maps to a list of the assignments for this course
                                this.state.assignments.map(assignments =>
                                    <Link to={{pathname: this.state.url + assignments.id, state: {assignment_id: assignments.id} }} key={assignments.id}>
                                    {/* <li className="assignment-name"key={assignments.id} >{assignments.name}</li> */}
                                    <FilterAssignments currAssigment={assignments}/>
                                    </Link>
                                    )
                            }
                        </ul>
                    </div>
                :
                    <Loader type="Bars" color="black" height={80} width={80} />

                }

        </div>
        );
    }
}

export default Assignments;
