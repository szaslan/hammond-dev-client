import React, { Component } from 'react';
import './Courses.css';
import {BrowserRouter as Router, Link, Redirect } from "react-router-dom";
import CourseInfo from '../CourseInfo/CourseInfo';
import Loader from 'react-loader-spinner'


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

    componentDidMount(){
        this.setState({loaded: true});
        fetch(`https://canvas.northwestern.edu/api/v1/users/83438/courses?per_page=500&access_token=${this.state.apiKey}`)
        .then(res => res.json())
        .then(courses => this.setState({courses}))
        .then(courses => this.props = courses);
    }

    onClick(){
        this.setState({showCourse: true});
    }


    render(){
        return(
                <div>
                    {this.state.loaded 
                    ?
                    <ul>
                        {
                        this.state.courses.map(courses => 
                        <li key={courses.id}><Link to={`/courses/${courses.id}`}>{courses.name}</Link></li>)
                        }

                        
                    </ul>
                    :
                    <Loader type="Bars" color="black" height={80} width={80} />
                    }
                </div>
        );
    }


}

export default Courses;
