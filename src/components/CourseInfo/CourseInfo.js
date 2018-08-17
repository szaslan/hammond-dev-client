import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { Link } from "react-router-dom";
import Flexbox from 'flexbox-react';
import history from '../../history'
import Loader from 'react-loader-spinner'

import JumbotronComp from '../JumbotronComp/JumbotronComp'

import './CourseInfo.css';

class CourseInfo extends Component {
    constructor(props) {
        super(props);

        this.state = {
            auth: false,
            courseID: '',
            courseJSON: [],
            loaded: false,
            url: '',

            ...props
        }

        this.CreateTables = this.CreateTables.bind(this);
        this.ResetTables = this.ResetTables.bind(this);
    }

    CreateTables() {
        fetch('/api/create_tables', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        })
            .then(res => {
                if (res.status == 204) {
                    //no issues
                }
                else if (res.status == 400) {
                    console.log("ran into an error when creating nonexistent SQL tables")
                }
            })
    }

    ResetTables() {
        fetch('/api/reset_tables', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(res => {
            if (res.status == 204) {
                //no issues
            }
            else if (res.status == 400) {
                console.log("ran into an error when creating nonexistent SQL tables")
            }
        })
    }

    componentDidMount() {
        const { match: { params } } = this.props;

        this.setState({
            url: `/courses/${params.course_id}`
        });

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
                if (res.status == 200) {
                    res.json().then(data => {
                        this.setState({
                            courseJSON: data,
                            loaded: true
                        })
                    })
                }
                else if (res.status == 400) {
                    console.log("ran into an error when trying to pull course info from canvas")
                }
                else if (res.status === 401) {
                    history.push("/login")
                    throw new Error();
                }
                else if (res.status == 404) {
                    console.log("there are no courses where you are listed as a teacher on canvas")
                }
            })
            .catch(err => console.log("unauthorized request when pulling info for specific course from canvas"))

        this.CreateTables();
    }

    render() {

        // if (!this.state.auth){
        //     return(
        //         <div>Not authenticated</div>
        //     )
        // }

        return (
            <div>
                <JumbotronComp mainTitle={this.state.courseJSON.name}
                    tabs />
                {
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
                }

                <button onClick={this.ResetTables}>Reset Database Tables</button>
            </div>

        );
    }


}

export default CourseInfo;
