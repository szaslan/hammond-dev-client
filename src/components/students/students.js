import React, { Component } from 'react';
import './students.css';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { Link } from "react-router-dom";
import JumbotronComp from '../JumbotronComp/JumbotronComp';
import { Breadcrumb } from 'react-bootstrap';

class Students extends Component {

    constructor() {
        super();


        this.state = {
            showComponent: false,
            students: [],
            dropdownOpen: false,
            showList: false,
            showUserInfo: false,
            courses: [],
            canvasID: '',

        }
        this.toggle = this.toggle.bind(this);
        // this.handleClick = this.handleClick.bind(this);
        this.filterList = this.filterList.bind(this);
        this.handleChange = this.handleChange.bind(this);
        // this.searchCourses = this.searchCourses.bind(this);
        this.fetchCourses = this.fetchCourses.bind(this);
    }

    // handleClick(){
    //     fetch('/api/students').then(res => res.json())
    //     .then(students => this.setState({students}, () => console.log('Students fetched....', students )));
    //     this.setState({showComponent: !this.state.showComponent});
    // }

    toggle() {
        this.setState(prevState => ({
            dropdownOpen: !prevState.dropdownOpen
        }));
    }

    filterList() {
        fetch("/api/filter").then(res => res.json())
            .then(students => this.setState({ students }, () => console.log('fetched... ', students)));
        this.setState({ showList: true });
    }

    //search for courses using canvas ID
    //   searchCourses(e){
    //     e.preventDefault();
    //     const userID = this.state.canvasID;
    //     this.fetchCourses(userID);
    //     console.log(this.state.courses);
    //     this.setState({showUserInfo: true});
    //   }

    fetchCourses(id) {
        fetch(`https://canvas.northwestern.edu/api/v1/users/${id}/courses?access_token=${this.state.apiKey}`)
            .then(res => res.json())
            .then(courses => this.setState({ courses }, () => console.log('Courses fetched...', courses)))
    }

    handleChange(e) {
        this.setState({ canvasID: e.target.value });
    }

    render() {
        return (
            <div>
                <JumbotronComp mainTitle="Students" secondaryTitle="&nbsp;" />
                <Breadcrumb className="breadcrumb1">
                    <Breadcrumb.Item className="breadcrumb-item" href="/courses/">Home</Breadcrumb.Item>
                    <Breadcrumb.Item className="breadcrumb-item breadcrumb-item1" active>{this.state.courseJSON.name}</Breadcrumb.Item>
                </Breadcrumb>
                <h2>Students</h2>
                <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}>
                    <DropdownToggle caret>
                        Filter by:
                </DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem onClick={this.filterList}>Completed All Assignments</DropdownItem>
                    </DropdownMenu>
                </Dropdown>

                {
                    this.state.showList
                        ?
                        <ul className="studentList">
                            {this.state.students.map(students =>
                                <li key={students.id}>{students.last_name}</li>)
                            }
                        </ul>
                        :
                        null
                }
                <input type="text" placeholder="Canvas UserID..." onChange={this.handleChange} />
                <button onClick={this.searchCourses}><Link to="/courses">Go!</Link></button>

                {this.state.showUserInfo
                    ?

                    <ul className="studentList">
                        {this.state.courses.map(courses =>
                            <li key={courses.id}>{courses.id}: {courses.name}</li>)}
                    </ul>
                    :
                    null
                }
            </div>
        );
    }
}

export default Students;
