import React, { Component } from 'react';
import './CourseInfo.css';
import { Link } from "react-router-dom";
import { Well, Row, Col, Breadcrumb } from 'react-bootstrap';
import Flexbox from 'flexbox-react';
import history from '../../history'
import { Container, Jumbotron } from 'reactstrap';
import JumbotronComp from '../JumbotronComp/JumbotronComp'
import '../BreadcrumbComp/BreadcrumbComp.css';
import { resolve } from 'path';
import Loader from 'react-loader-spinner'


class CourseInfo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            courseJSON: [],
            courseID: '',
            url: '',
            auth: false,
            loaded: false,
            ...props
        }

        this.CreateTables = this.CreateTables.bind(this);
        this.DeleteTables = this.DeleteTables.bind(this);
        this.ResetTables = this.ResetTables.bind(this);

    }
    CreateTables() {
        fetch('/api/create_tables', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        })
    }

    DeleteTables() {
        fetch('/api/delete_tables', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        })
    }

    ResetTables() {
        fetch('/api/reset_tables', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        })
    }
    // componentWillMount(){
    //     if(this.state.location.state.auth){
    //         this.setState({auth: true})
    //     }
    // }
    componentDidMount() {
        const { match: { params } } = this.props;

        this.setState({ url: `/courses/${params.course_id}` });


        var data = {
            course_id: params.course_id,
        }
        console.log(data);
        fetch('/api/courseinfo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(data)
        })

            .then(res => {
                if (res.status === 401) {
                    console.log("4040404")
                    history.push("/login")
                    throw new Error();

                    // return <Redirect to="/" />
                    // window.location.href="/login"
                }
                {
                    res.json().then(data => {
                        this.setState({ courseJSON: data, loaded: true })
                    })
                }
            })
            .catch(err => console.log("no auth"))

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
                    secondaryTitle="&nbsp;" />

                <Breadcrumb className="breadcrumb1">
                    <Breadcrumb.Item className="breadcrumb-item" href="/courses/">Home</Breadcrumb.Item>
                    <Breadcrumb.Item className="breadcrumb-item breadcrumb-item1" active>{this.state.courseJSON.name}</Breadcrumb.Item>
                </Breadcrumb>
                {this.state.loaded ?
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

                <button onClick={this.CreateTables}>Create Database Tables</button>
                <button onClick={this.ResetTables}>Reset Database Tables</button>
                <button onClick={this.DeleteTables}>Delete Database Tables</button>
            </div>

        );
    }


}

export default CourseInfo;
