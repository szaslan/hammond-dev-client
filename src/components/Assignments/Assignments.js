import React, { Component } from 'react';
import { Link } from "react-router-dom";
import { Container, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import Loader from 'react-loader-spinner'
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

    if (currAssignment.peer_reviews) {
      array.push({
        name: currAssignment.name,
        value: currAssignment.id,
      })
      // statusToClassName = "select-search-box"
          // if (array.length == props.length) {
          //   return (
          //     array
          //   )}
          // else{

          // }

    }
    else {      // return <li key={currAssignment.id} className="assignment-name not-pr">{currAssignment.name}</li>
        // return <DropdownItem disabled className="assign-name not-pr" key={currAssignment.id} /*className="assignment-name not-pr"*/>{currAssignment.name}</DropdownItem>
        array.push({
          name: currAssignment.name,
          value: null,
        })

        // statusToClassName = "select-search-box-dis"
    }
}

class Assignments extends Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            assignments: [],
            loaded: false,
            dropdownOpen: false,
            url: '',
            ...props,
        }

        //URL is the current url while taking in the parameters from the props of the previous url
        this.toggle = this.toggle.bind(this);
        this.reDirect = this.reDirect.bind(this);
    }

    reDirect(event) {
      const { match: { params } } = this.props;
      console.log("redirecting")

      history.push(`/courses/${params.course_id}/${params.assignment_name}/assignments/${event.value}`)
    }

    toggle() {
        this.setState(prevState => ({
            dropdownOpen: !prevState.dropdownOpen
        }));
    }

    //fetch assignments for course with course_id passed down
    componentDidMount() {
        const { match: { params } } = this.props;
        this.setState({
            url: `/courses/${params.course_id}/${params.assignment_name}/assignments/`
        });

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
                if (res.status == 200) {
                    res.json().then(data => {
                        this.setState({
                            assignments: data,
                            mounted: true
                        })
                    })
                }
                else if (res.status == 400) {
                    console.log("an error occcurred when pulling the list of assignment from canvas")
                }
                else if (res.status === 401) {
                    history.push("/login")
                    throw new Error();
                }
                else if (res.status == 404) {
                    console.log("no assignments created on canvas")
                }
            })
            .catch(err => console.log("unauthorized request when pulling info for specific assignment"))
    }



    render() {
      if (this.state.assignments && array.length != this.state.assignments.length) {
        console.log("hello")
          this.state.assignments.map(assignments => {
            console.log(assignments);
            FilterAssignments(assignments);
          }
              )
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
                            <DropdownMenu className="dropdown-men">
                                {this.state.assignments ?
                                    this.state.assignments.map(assignments =>
                                        <FilterAssignments className="assign-name" link={this.state.url + assignments.id} assignment_id={assignments.id} name={this.state.match.params.assignment_name} course_id={this.state.match.params.course_id} currAssigment={assignments} id={assignments.id} />
                                    )
                                    :
                                    <Loader type="TailSpin" color="black" height={80} width={80} />
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
                      {array.length == this.state.assignments.length ?
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
                      :
                      null
                    }
                </div>
        );
    }
}

export default Assignments;
