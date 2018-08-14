import React, { Component } from 'react';
import './Assignments.css';
import { Link } from "react-router-dom";
import Loader from 'react-loader-spinner'
import { Well, Row, Col, Breadcrumb } from 'react-bootstrap';
import JumbotronComp from '../JumbotronComp/JumbotronComp';
import AssignmentInfo from '../AssignmentInfo/AssignmentInfo';
import '../BreadcrumbComp/BreadcrumbComp.css';
import history from '../../history';
import { Container, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

//FILTERS ASSIGNMENTS TO ONES WITH POINTS POSSIBLE > 10
//USE THIS TO FILTER OUT ASSIGNMENTS THAT ARE NOT PEER REVIEWABLE
//if (currAssignment.peer_reviews == true)
function FilterAssignments(props) {
    const currAssignment = props.currAssigment;


    if (currAssignment.peer_reviews) {
        return (
            <Link className="assignment-link" to={{ pathname: props.link, state: { assignment_id: props.assignment_id, name: props.name, course_id: props.course_id } }} key={props.id}>
                {/* <li key={currAssignment.id} className="assignment-name">{currAssignment.name}</li>  */}
                <DropdownItem className="dropdown-ite" key={currAssignment.id} /*className="assignment-name"*/>{currAssignment.name}</DropdownItem>
            </Link>
        )
    }
    else {
        // return <li key={currAssignment.id} className="assignment-name not-pr">{currAssignment.name}</li>
        return <DropdownItem disabled className="dropdown-ite not-pr" key={currAssignment.id} /*className="assignment-name not-pr"*/>{currAssignment.name}</DropdownItem>
            ;
    }
}

// function buttonsInstance(courses, url){
//     <Col xs={6} className="col4">
//         {courses.map(courses => 
//          <div className="div-student">
//          <Link className="assignment-link" to={{pathname: url + courses.id, state: {assignment_id: courses.id} }} key={courses.id}>
//          <FilterAssignments currAssigment={courses}/>
//          </Link>
//          <br></br>
//      </div>
//     )}
//     </Col>
// }

class Assignments extends Component {
    constructor(props, context) {
        super(props, context);

        //URL is the current url while taking in the parameters from the props of the previous url
        this.toggle = this.toggle.bind(this);

        this.state = {
            assignments: [],
            loaded: false,
            dropdownOpen: false,
            url: '',
            ...props,
        }
    }

    toggle() {
        this.setState(prevState => ({
            dropdownOpen: !prevState.dropdownOpen
        }));
    }

    componentWillMount() {
        this.setState({ assignments: null });
    }
    //fetch assignments for course with course_id passed down
    componentDidMount() {
        const { match: { params } } = this.props;
        this.setState({ url: `/courses/${params.course_id}/${params.assignment_name}/assignments/` });

        let data = {
            course_id: params.course_id,
        }

        fetch('/api/assignments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
            credentials: 'include'
        })
            .then(res => {
                if (res.status === 401) {
                    console.log("4040404")
                    history.push("/login")
                    throw new Error();
                } else {
                    res.json().then(data => {
                        this.setState({
                            assignments: data,
                            mounted: true
                        })
                    })
                }
            })
            .catch(err => console.log("Not Authorized."))
    }





    render() {
        return (
            // <div className="all-assignments">

            <div>
                {/* <JumbotronComp mainTitle="Assignments" secondaryTitle="&nbsp;" /> */}

                {/* <Breadcrumb className="breadcrumb1">
                        <Breadcrumb.Item className="breadcrumb-item" href="/courses">Home</Breadcrumb.Item>
                        <Breadcrumb.Item className="breadcrumb-item breadcrumb-item1" href={`/courses/${this.state.match.params.course_id}`}>
                            {this.props.match.params.assignment_name}
                        </Breadcrumb.Item>
                        <Breadcrumb.Item className="breadcrumb-item" active>Assignments</Breadcrumb.Item>
                    </Breadcrumb> */}

                <div className="all-assignments">
                    <Container>
                        <p className="title">Assignments</p>
                        <hr className="hr-2"></hr>
                        {/* <ul className="assignment-list"> */}
                        <Dropdown direction="down" className="dropdown-1" isOpen={this.state.dropdownOpen} toggle={this.toggle}>
                            <DropdownToggle className="dropdown-tog" caret>
                                Assignments
                            </DropdownToggle>
                            <DropdownMenu className="dropdown-men">
                                {this.state.assignments ?
                                    this.state.assignments.map(assignments =>
                                        <FilterAssignments link={this.state.url + assignments.id} assignment_id={assignments.id} name={this.state.match.params.assignment_name} course_id={this.state.match.params.course_id} currAssigment={assignments} id={assignments.id} />


                                        // this.state.assignments.map(assignments =>
                                        //     <Link className="assignment-link" to={{ pathname: this.state.url + assignments.id, state: { assignment_id: assignments.id, name: this.state.match.params.assignment_name, course_id: this.state.match.params.course_id } }} key={assignments.id}>
                                        //         <FilterAssignments currAssigment={assignments}   />
                                        //     </Link>       
                                    )
                                    :
                                    <Loader type="TailSpin" color="black" height={80} width={80} />
                                }
                            </DropdownMenu>
                        </Dropdown>

                        {/* </ul> */}
                    </Container>
                </div>

            </div>
        );
    }
}


export default Assignments;
