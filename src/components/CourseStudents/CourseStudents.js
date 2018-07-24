import React, { Component } from 'react';
import Loader from 'react-loader-spinner';
import JumbotronComp from '../JumbotronComp/JumbotronComp';
import {Breadcrumb} from 'react-bootstrap';

class CourseStudents extends Component {
    constructor(props) {
        super(props);

        //URL is the current url while taking in the parameters from the props of the previous url
        this.state = {
            students: [],
            url: '',
            loaded: false,
            ...props
        }
    }

    componentWillMount() {
        this.setState({ students: [] })
    }

    //fetch assignments for course with course_id passed down
    componentDidMount() {
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
            return (
                <div>
                    <JumbotronComp mainTitle="Students" secondaryTitle="&nbsp;" />

                      <Breadcrumb className="breadcrumb1">
                        <Breadcrumb.Item className="breadcrumb-item" href="/courses">Home</Breadcrumb.Item>
                        <Breadcrumb.Item className="breadcrumb-item breadcrumb-item1" href={`/courses/${this.state.match.params.course_id}`}>
                            {this.state.location.state.name}
                        </Breadcrumb.Item>
                        <Breadcrumb.Item className="breadcrumb-item" active>Students</Breadcrumb.Item>
                    </Breadcrumb>

                    {/* <Breadcrumb className="breadcrumb1">
                        <Breadcrumb.Item className="breadcrumb-item" href="/courses/">Home</Breadcrumb.Item>
                        <Breadcrumb.Item className="breadcrumb-item breadcrumb-item1" active>{this.state.courseJSON.name}</Breadcrumb.Item>
                    </Breadcrumb> */}

                    {this.state.students ?
                    
                
                    <ul>
                        {
                            this.state.students.map(students =>
                                <li key={students.id}>{students.name}</li>)
                        }
                    </ul>
                    :
                    <Loader type="TailSpin" color="black" height={80} width={80} />
                    }
                </div>
            );
        }


    }

export default CourseStudents;
