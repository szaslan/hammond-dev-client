import history from '../../history';
import Loader from 'react-loader-spinner';
import React, { Component } from 'react';

import JumbotronComp from '../JumbotronComp/JumbotronComp'
import SidebarComp from '../SideBar/SideBar';

class CourseInfo extends Component {
    constructor(props) {
        super(props);

        this.state = {
            courseId: this.props.match.params.course_id,
            courseJSON: null,
            loaded: false,

            ...props
        }

        this.fetchCourseInfo = this.fetchCourseInfo.bind(this);
        this.resetTables = this.resetTables.bind(this);
        this.send400Error = this.send400Error.bind(this);

        this.canvasUserId = this.props.match.params.user_id;
    }

    fetchCourseInfo() {
        var data = {
            canvasUserId: this.canvasUserId,
            courseId: this.state.courseId,
        }

        fetch('/api/courseInfo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(data)
        })
            .then(res => {
                switch (res.status) {
                    case 200:
                        res.json().then(data => {
                            this.setState({
                                courseJSON: data,
                                loaded: true,
                            })
                        })
                        break;
                    case 400:
                        res.json().then(res => {
                            this.send400Error("This function is called anytime a course is selected from the general homepage. This function fetches all of the information about a course from Canvas.", res.error, "CourseInfo.js: fetchCourseInfo()", res.message)
                        })
                        break;
                    case 401:
                        res.json().then(res => {
                            history.push({
                                pathname: '/unauthorized',
                                state: {
                                    location: res.location,
                                    message: res.message,
                                }
                            })
                        })
                        break;
                    case 404:
                        history.push({
                            pathname: '/notfound',
                            state: {
                                context: 'This function is called anytime a course is selected from the general homepage. This function fetches all of the information about a course from Canvas.',
                                location: "CourseInfo.js: fetchCourseInfo()",
                                message: 'Course not found on Canvas.',
                            }
                        })
                        break;
                    default:
                }
            })
    }

    resetTables() {
        fetch('/api/resetTables', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        })
            .then(res => {
                switch (res.status) {
                    case 204:
                        //no issues
                        break;
                    case 400:
                        res.json().then(res => {
                            this.send400Error("", res.error, "CourseInfo.js: resetTables()", res.message)
                        })
                        break;
                    default:
                }
            })
    }

    send400Error(context, error, location, message) {
        history.push({
            pathname: '/error',
            state: {
                context: context,
                error: error,
                location: location,
                message: message,
            }
        })
    }

    componentDidMount() {
        this.fetchCourseInfo();
    }

    render() {
        if (this.state.loaded) {
            return (
                <div>
                    {/* sidebar holds headers and tabs, containing main assignment and student pages */}
                    <SidebarComp
                        content={
                            <div>
                                <JumbotronComp mainTitle={this.state.courseJSON.name}
                                    tabs courseJSON={this.state.courseJSON} canvasUserId={this.canvasUserId}/>
                                <button onClick={this.resetTables}>Reset Database Tables</button>
                            </div>
                        }
                        canvasUserId={this.canvasUserId}
                    />
                </div>
            )
        }
        
        return (<Loader type="TailSpin" color="black" height={80} width={80} />)
    }
}

export default CourseInfo;
