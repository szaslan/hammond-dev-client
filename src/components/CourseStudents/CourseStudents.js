import React, { Component } from 'react';
import Loader from 'react-loader-spinner'


class CourseStudents extends Component{
    constructor(props){
        super(props);

        //URL is the current url while taking in the parameters from the props of the previous url
        this.state = {
            students: [],
            url: '',
            loaded: false,
        }
    }

    componentWillMount(){
        this.setState({students: []})
    }
     
    //fetch assignments for course with course_id passed down
    componentDidMount(){
        const { match: { params } } = this.props;
        this.setState({url: `/courses/${params.course_id}/students`});

        let data = {
            course_id: params.course_id
        }

        fetch('/api/coursestudents',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(students => this.setState({students}))
        .catch(this.setState({students: null}))
                
    }


    render(){
    
        if(this.state.students === null) {
            return (
                <h1>Error! No students found!</h1>
            )
        }
        
        else{

        
        return(
            <div>
                    <ul>
                        {
                            this.state.students.map(students =>
                                <li key={students.id}>{students.name}</li>)
                        }
                    </ul>
        </div>
        );
    }


}
}

export default CourseStudents;
