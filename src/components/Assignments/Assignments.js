import React, { Component } from 'react';
import './Assignments.css';
import {  Link } from "react-router-dom";
import Loader from 'react-loader-spinner'


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
                        <ul className="assignment-list">
                            {                //maps to a list of the assignments for this course
                                this.state.assignments.map(assignments =>
                                    <Link to={this.state.url + assignments.id}>
                                    <li className="assignment-name"key={assignments.id}>{assignments.name}</li>
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
