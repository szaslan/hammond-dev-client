import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { Link } from "react-router-dom";
import Flexbox from 'flexbox-react';
import Iframe from 'react-iframe';

import JumbotronComp from '../JumbotronComp/JumbotronComp'
import SidebarComp from '../SideBar/SideBar';
import UnauthorizedError from '../UnauthorizedError/UnauthorizedError';

import './CourseInfo.css';

class CourseInfo extends Component {
    constructor(props) {
        super(props);

        this.state = {
            courseJSON: [],
            error: false,
            error_message: null,
            loaded: false,
            url: '',

            ...props
        }

        this.createTables = this.createTables.bind(this);
        this.fetchCourseInfo = this.fetchCourseInfo.bind(this);
        this.resetTables = this.resetTables.bind(this);
    }

    createTables() {
        fetch('/api/create_tables', {
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
                        console.log("ran into an error when creating nonexistent SQL tables")
                        break;
                }
            })
    }

    fetchCourseInfo() {
        const { match: { params } } = this.props;

        var data = {
            course_id: params.course_id,
        }

        fetch('/api/courseinfo', {
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
                                loaded: true
                            })
                        })
                        break;
                    case 400:
                        console.log("ran into an error when trying to pull course info from canvas")
                        break;
                    case 401:
                        res.json().then(res => {
                            this.setState({
                                error: true,
                                error_message: res.message,
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
        fetch('/api/reset_tables', {
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
                        console.log("ran into an error when creating nonexistent SQL tables")
                        break;
                }
            })
    }

    componentDidMount() {
        const { match: { params } } = this.props;

        this.setState({
            url: `/courses/${params.course_id}`
        });

        this.fetchCourseInfo();
        this.createTables();
    }

    render() {
        if (this.state.error) {
            return (
                <UnauthorizedError message={this.state.error_message} />
            )
        }

        if (this.state.loaded) {
            return (
                <div>
                    <SidebarComp
                        content={
                            <div>
                                <JumbotronComp mainTitle={this.state.courseJSON.name} tabs />
                                {
                                    <Container className="well1-container" fluid>
                                        <Flexbox className="big-buttons-flexbox" minWidth="700px" width="60vw" justifyContent="center"
                                            minHeight="50vh" flexDirection="column">
                                            <Flexbox justifyContent="space-around" flexWrap="nowrap">
                                                <Link to={{ pathname: this.state.url + '/' + this.state.courseJSON.name + "/assignments/", state: { name: this.state.courseJSON.name }, }}>
                                                    <button className="pull-left big-button">Assignments</button>
                                                </Link>
                                                <Link to={{ pathname: this.state.url + "/" + this.state.courseJSON.name + "/students", state: { name: this.state.courseJSON.name } }}>
                                                    <button className="pull-right big-button">Students</button>
                                                </Link>
                                            </Flexbox>
                                        </Flexbox>
                                    </Container>
                                }

                                <button onClick={this.resetTables}>Reset Database Tables</button>
                            </div>
                        }
                    />
                </div>

            );
        }
        
        return (
            <div></div>
        )
    }
}

export default CourseInfo;