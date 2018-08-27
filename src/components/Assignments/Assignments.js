import React, { Component } from 'react';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import { Link } from "react-router-dom";
import { Well } from 'react-bootstrap';
import history from '../../history';

import '../BreadcrumbComp/BreadcrumbComp.css';
import SelectSearch from 'react-select-search'

import './Assignments.css';

const array = [];
// var statusToClassName = null;

const FilterAssignments = currAssignment => {
    // const currAssignment = props.currAssignment;
    // console.log(assignArr)

    console.log("filtering assignments")
        if (currAssignment.peer_reviews ) {
      array.push({
        name: currAssignment.name,
        value: currAssignment.id,
      })
    }
    else {     
        array.push({
          name: currAssignment.name,
          value: null,
        })
    }
}

class Assignments extends Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            assignments: [],
            courseId: this.props.match.params.course_id,
            dropdownOpen: false,
            loaded: false,
            url: `/courses/${this.props.match.params.course_id}/assignments/`,
            value: '',
            ...props,
        }

        this.pullAssignments = this.pullAssignments.bind(this);
        this.toggle = this.toggle.bind(this);
        this.reDirect = this.reDirect.bind(this);
    }

    reDirect(event) {
      const { match: { params } } = this.props;
      console.log("redirecting")

      history.push(`/courses/${params.course_id}/assignments/${event.value}`)
    }

    pullAssignments() {
        let data = {
            courseId: this.state.courseId,
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
                switch (res.status) {
                    case 200:
                        res.json().then(data => {
                            this.setState({
                                assignments: data,
                                loaded: true
                            })
                        })
                        break;
                    case 400:
                    res.json().then(res => {
                        history.push({
                            pathname: '/error',
                            state: {
                                context: '',
                                location: "Assignments.js: pullAssignments() (error came from Canvas)",
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
                        console.log("no assignments created on canvas")
                        break;
                }
            })
    }

    toggle() {
        this.setState(prevState => ({
            dropdownOpen: !prevState.dropdownOpen
        }));
    }

    componentDidMount() {
        this.pullAssignments()
    }



    render() {
      if (this.state.assignments && array.length != this.state.assignments.length) {
            this.state.assignments.map(assignments => {
                console.log(assignments);
                FilterAssignments(assignments);
              })
            }

        return (
                <div className="assigndrop">
                        {/*<Dropdown direction="down" isOpen={this.state.dropdownOpen} toggle={this.toggle}>
                            <DropdownToggle className="assigntog" caret>
                                {this.props.location.state.assignment_name ?
                                  this.props.location.state.assignment_name
                                :
                                "Assignment Title"}
                            </DropdownToggle>
                            <hr className="hr-2"></hr>
                            <DropdownMenu className="dropdown-men">
                                {
                                    this.state.assignments.map(assignment =>
                                        <FilterAssignments className="assign-name" link={this.state.url} courseId={this.state.courseId} currAssigment={assignment} />
                                    )
                                }
                            </DropdownMenu>
                        </Dropdown>*/}
                        {/*this.state.assignments ?
                            this.state.assignments.map(assignments =>
                              <FilterAssignments className="assign-name" link={this.state.url + assignments.id} length={this.state.assignments.length} assignment_id={assignments.id} name={this.state.match.params.assignment_name} course_id={this.state.match.params.course_id} currAssigment={assignments} id={assignments.id} />

                                )
                          :
                          <Loader type="TailSpin" color="black" height={80} width={80} />*/}

                          {console.log(array)}
                          {console.log(this.state.assignments.length)}
                          {console.log(this.state.value)}
                            <div>
                          <SelectSearch
                            // className={statusToClassName}
                            className="select-search-box"
                            options={array}
                            search = "true"
                            placeholder = "Select an Assignment"
                            value={this.state.value}
                            onChange={this.reDirect}
                          />
                          </div>
                </div>
            );
        }

    //     return (
    //         <div></div>
    //     )
    // }
}

export default Assignments;
