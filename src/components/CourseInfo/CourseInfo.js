import React, { Component } from 'react';
import './CourseInfo.css';
import { Link } from "react-router-dom";
import { Well, Row, Col, Breadcrumb } from 'react-bootstrap';
import Flexbox from 'flexbox-react';
import { Container, Jumbotron } from 'reactstrap';
import JumbotronComp from '../JumbotronComp/JumbotronComp'
import '../BreadcrumbComp/BreadcrumbComp.css';

class CourseInfo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            apiKey: "1876~ypSApnhVIL4RWGQCp5oW7aJqw4NoP0kxvdKRiTVqcpGXVgzeToigIKbVBskcqk8u",
            courseJSON: [],
            courseID: '',
            url: '',
            
        }
        
    }
    

    componentDidMount() {
        const { match: { params } } = this.props;
        this.setState({ url: `/courses/${params.course_id}` });
        fetch(`https://canvas.northwestern.edu/api/v1/courses/${params.course_id}?access_token=${this.state.apiKey}`)
            .then(res => res.json())
            .then(courseJSON => this.setState({ courseJSON }));
        
    }


    render() {
        
        return (
            <div>
                {/* <Jumbotron className="jumbo" fluid>
                    <Container className="jumbo-container" fluid>
                        <Row className="jumbo-row" fluid>
                            <Col xs={10} className="col1" >
                                <Row className="row-title">
                                    <h1 className="welcome">&nbsp;</h1>
                                </Row>
                                <Row className="row-title">
                                    <h1 className="name">{this.state.courseJSON.name}</h1>
                                </Row>
                            </Col>
                            <Col xs={1} className="col2">
                                <Link to="/">
                                    <button className="pull-right signout-button">Sign Out</button>
                                </Link>
                            </Col>
                        </Row>
                    </Container>
                </Jumbotron> */}
                <JumbotronComp  mainTitle= {this.state.courseJSON.name}
                secondaryTitle="&nbsp;"/>
                
                <Breadcrumb className="breadcrumb1">
                    <Breadcrumb.Item className="breadcrumb-item" href="/courses/">Home</Breadcrumb.Item>
                    <Breadcrumb.Item className="breadcrumb-item breadcrumb-item1" active>{this.state.courseJSON.name}</Breadcrumb.Item>
                </Breadcrumb>
                <Container className="well1-container" fluid>
                    <Flexbox className="big-buttons-flexbox" minWidth="700px" width="60vw" justifyContent="center"
                        minHeight="50vh" flexDirection="column">
                        <Flexbox
                            justifyContent="space-around"
                            flexWrap="nowrap">
                            <Link to={{ pathname: this.state.url + "/assignments", state: { course_id: this.state.courseJSON.name } }}>
                                <button className="pull-left big-button">Assignments</button>
                            </Link>
                            <Link to={this.state.url + "/students"}>
                                <button className="pull-right big-button">Students</button>
                            </Link>
                        </Flexbox>
                    </Flexbox>
                </Container>
            </div>

        );
    }


}

export default CourseInfo;
