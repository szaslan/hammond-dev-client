import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { Link } from "react-router-dom";
import Flexbox from 'flexbox-react';
import history from '../../history';
import Iframe from 'react-iframe';
import Loader from 'react-loader-spinner';

import JumbotronComp from '../JumbotronComp/JumbotronComp'
import SidebarComp from '../SideBar/SideBar';

import './CourseInfo.css';

class CourseInfo extends Component {
    constructor(props) {
        super(props);

        this.state = {
            courseId: this.props.match.params.course_id,
            courseJSON: null,
            loaded: false,
            url: `/courses/${this.props.match.params.course_id}`,

            ...props
        }

        this.createTables = this.createTables.bind(this);
        this.fetchCourseInfo = this.fetchCourseInfo.bind(this);
        this.resetTables = this.resetTables.bind(this);
    }

    createTables() {
        fetch('/api/createTables', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        })
            .then(res => {
                switch (res.status) {
                    case 201:
                        //no issues
                        break;
                    case 400:
                        res.json().then(res => {
                            history.push({
                                pathname: '/error',
                                state: {
                                    context: '',
                                    error: res.error,
                                    location: "CourseInfo.js: createTables()",
                                }
                            })
                        })
                        break;
                }
            })
    }

    fetchCourseInfo() {
        var data = {
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
                            history.push({
                                pathname: '/error',
                                state: {
                                    context: '',
                                    location: "CourseInfo.js: fetchCourseInfo() (error came from Canvas)",
                                    message: res.message,
                                }
                            })
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
                        console.log("there are no courses where you are listed as a teacher on canvas")
                        break;
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
                            history.push({
                                pathname: '/error',
                                state: {
                                    context: '',
                                    error: res.error,
                                    location: "CourseInfo.js: resetTables()",
                                }
                            })
                        })
                        break;
                }
            })
    }

    componentDidMount() {
        this.fetchCourseInfo();
        this.createTables();
    }

    render() {

        // if (!this.state.auth){
        //     return(
        //         <div>Not authenticated</div>
        //     )
        // }
        if (this.state.loaded) {
            return (
                <div>
                    <SidebarComp
                        content={
                            <div>
                                <JumbotronComp mainTitle={this.state.courseJSON.name}
                                    tabs />
                                {/*{
                    this.state.loaded ?
                        <Container className="well1-container" fluid>
                            <Flexbox className="big-buttons-flexbox" minWidth="700px" width="60vw" justifyContent="center"
                                minHeight="50vh" flexDirection="column">
                                <Flexbox
                                    justifyContent="space-around"
                                    flexWrap="nowrap">
                                    <Link to={{ pathname: this.state.url + '/' + this.state.courseJSON.name + "/assignments/", state: { name: this.state.courseJSON.name }, }}>
                                        <button className="pull-left big-button">Assignments</button>
                                    </Link>
                                    <Link to={{ pathname: this.state.url + "/" + this.state.courseJSON.name + "/students", state: { name: this.state.courseJSON.name } }}>
                                        <button className="pull-right big-button">Students</button>
                                    </Link>
                                </Flexbox>
                            </Flexbox>
                        </Container>
                        :
                        <Loader type="TailSpin" color="black" height={80} width={80} />
                */}

                                <button onClick={this.ResetTables}>Reset Database Tables</button>}
                </div>
                        }
                    />
                </div>

            );
        }

        return (
            <Loader type="TailSpin" color="black" height={80} width={80} />
        )
    }
}

export default CourseInfo;