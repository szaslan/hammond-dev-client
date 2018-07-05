import React, { Component } from 'react';
import './CourseInfo.css';
import {Link } from "react-router-dom";

class CourseInfo extends Component{
    constructor(props){
        super(props);



        this.state = {
            apiKey: "1876~ypSApnhVIL4RWGQCp5oW7aJqw4NoP0kxvdKRiTVqcpGXVgzeToigIKbVBskcqk8u",
            courseJSON: [],
            courseID: '',
            url: '',
        }
    }
    //

    componentDidMount(){
        const { match: { params } } = this.props;
        this.setState({url: `/courses/${params.course_id}`});
        fetch(`https://canvas.northwestern.edu/api/v1/courses/${params.course_id}?access_token=${this.state.apiKey}`)
        .then(res => res.json())
        .then(courseJSON => this.setState({courseJSON}));
    }


    render(){
        return(
                <div>
                 {this.state.courseJSON.name}

                 <div>
                    <Link to={ this.state.url + "/assignments"}>
                        Assignments
                    </Link>
                </div>
                <div>
                    <Link to={this.state.url + "/students"}>
                        Students
                    </Link>
                </div>

                </div>
        );
    }


}

export default CourseInfo;
