import React, { Component } from 'react';
import './AssignmentInfo.css';
import Loader from 'react-loader-spinner'
import { Well, Row, Col, Breadcrumb, Button } from 'react-bootstrap';
import AnalyzeButton from '../AnalyzeButton/AnalyzeButton';
import CalendarComp from '../CalendarComp/CalendarComp';

import DueDateButton from '../DueDateButton/DueDateButton';
import Flexbox from 'flexbox-react'
class AssignmentInfo extends Component {
    constructor(props) {
        super(props);


        this._fetchAssignmentData = this._fetchAssignmentData.bind(this);
        this.state = {
            assignment: [],
            url: '',
            id: this.props.match.params.assignment_id,
            assignmentClicked: false,
            ...props,
        }
    }
    //

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.match.params.assignment_id !== prevState.id) {
            return {
                id: nextProps.match.params.assignment_id,
                assignment: null
            }
        }
        return null;
    }


    //everytime a new assignment is clicked on, component re-renders and new assignment is fetched
    componentDidMount() {
        console.log("component mounted!");
        this._fetchAssignmentData();
    }

    //renders initially
    componentDidUpdate(prevProps) {
        if (this.props.match.params.assignment_id !== prevProps.match.params.assignment_id) {
            console.log("componendidupdate!");
            this._fetchAssignmentData();
        }
    }

    //
    // componentWillReceiveProps(nextProps){
    //     if (nextProps.match.params.assignment_id !== this.props.match.params.assignment_id){
    //         this.setState({id: nextProps.match.params.assignment_id});
    //         console.log(nextProps);
    //     }
    // }

    //fetches assigment data
    _fetchAssignmentData() {
        const { match: { params } } = this.props;
        this.setState({ assignmentClicked: true });
        console.log("fetched!");
        this.setState({url: `/courses/${params.course_id}/${params.assignment_name}/`});

        let data = {
            course_id: params.course_id,
            assignment_id: params.assignment_id
        }

        fetch('/api/assignmentinfo',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(res => res.json())
            .then(assignment => this.setState({ assignment }))

        
    }


    render() {

        if (this.state.assignment === null)
            return (
                <div className="assignment-info">
                    <Loader type="TailSpin" color="black" height={80} width={80} />
                </div>
            )
        else {
            return (               
                <div className="assignment-info">
                    <p><strong>Title:</strong> {this.state.assignment.name}</p>
                    <DueDateButton />
                    <AnalyzeButton varName="hello"/>
                </div>

            )
        }

    }


}

export default AssignmentInfo;
