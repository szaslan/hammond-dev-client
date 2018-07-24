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
            auth: false,
            ...props
        }
    
    }
    

    // componentWillMount(){
    //     if(this.state.location.state.auth){
    //         this.setState({auth: true})
    //     }
    // }
    componentDidMount() {
        const { match: { params } } = this.props;
        this.setState({ url: `/courses/${params.course_id}` });
        fetch(`https://canvas.northwestern.edu/api/v1/courses/${params.course_id}?access_token=${this.state.apiKey}`)
            .then(res => res.json())
            .then(courseJSON => this.setState({ courseJSON }));
        
    }


    render() {

        // if (!this.state.auth){
        //     return(
        //         <div>Not authenticated</div>
        //     )
        // }
        
        return (
            <div>          
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
                             <Link to={{pathname: this.state.url + '/'+ this.state.courseJSON.name, state: {name: this.state.courseJSON.name}, }}>
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
