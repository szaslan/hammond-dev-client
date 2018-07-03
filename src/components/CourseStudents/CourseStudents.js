import React, { Component } from 'react';
import {BrowserRouter as Router, Link } from "react-router-dom";
import Loader from 'react-loader-spinner'


class CourseStudents extends Component{
    constructor(props){
        super(props);

        //URL is the current url while taking in the parameters from the props of the previous url
        this.state = {
            apiKey: "1876~ypSApnhVIL4RWGQCp5oW7aJqw4NoP0kxvdKRiTVqcpGXVgzeToigIKbVBskcqk8u",
            students: [],
            url: '',
            loaded: false,
        }
    }
     
    //fetch assignments for course with course_id passed down
    componentDidMount(){
        this.setState({loaded: true})
        const { match: { params } } = this.props;
        this.setState({url: `/courses/${params.course_id}/students`});
        fetch(`https://canvas.northwestern.edu/api/v1/courses/${params.course_id}/users?per_page=500&access_token=${this.state.apiKey}`)
        .then(res => res.json())
        .then(students => this.setState({students}))
    }


    render(){
        return(
            <div>
                {this.state.loaded
                     ?
                    //maps to a list of the assignments for this course
                    <ul>
                        {
                            this.state.students.map(students =>
                                <li key={students.id}>{students.name}</li>)
                        }
                    </ul>
                    :
                    <Loader type="Bars" color="black" height={80} width={80} />
        }
        </div>
        );
    }


}

export default CourseStudents;
