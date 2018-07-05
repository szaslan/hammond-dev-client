import React, { Component } from 'react';
import './AssignmentInfo.css';

class AssignmentInfo extends Component{
    constructor(props){
        super(props);

        this.state = {
            apiKey: "1876~ypSApnhVIL4RWGQCp5oW7aJqw4NoP0kxvdKRiTVqcpGXVgzeToigIKbVBskcqk8u",
            assignment: [],
            url: '',
        }
    }
    //

    componentWillReceiveProps(){
        const { match: { params } } = this.props;
        this.setState({url: `/courses/${params.course_id}/assignments/`});
        fetch(`https://canvas.northwestern.edu/api/v1/courses/${params.course_id}/assignments/${params.assignment_id}?access_token=${this.state.apiKey}`)
        .then(res => res.json())
        .then(assignment => this.setState({assignment}));
    }



    render(){
        return(
                <div className="assignment-info">
                    {this.state.assignment.name}
                </div>
        );
    }


}

export default AssignmentInfo;
