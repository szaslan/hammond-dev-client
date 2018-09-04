import React, { Component } from 'react';

import NewDueDateForm from './NewDueDateForm';

import 'rc-time-picker/assets/index.css';
import './NewDueDate.css';

class NewDueDate extends Component {
    constructor(props) {
        super(props);

        this.state = {
            number: Number(this.props.number),
        }

        this.assignmentId = this.props.assignmentId;
        this.courseId = this.props.courseId;
        this.localStorageExtension = "_" + this.props.assignmentId + "_" + this.props.courseId;
    }

    render() {
        switch (this.state.number) {
            case 1:
                return (
                    <NewDueDateForm assignmentId={this.assignmentId} courseId={this.courseId} number={this.state.number} textDescription={this.props.textDescription}/>
                );
            case 2:
                return (
                    (localStorage.getItem("dueDate1" + this.localStorageExtension) && localStorage.getItem("dueDate1" + this.localStorageExtension) !== "N/A" ?
                        <NewDueDateForm assignmentId={this.assignmentId} courseId={this.courseId} number={this.state.number} textDescription={this.props.textDescription}/>
                        :
                        <NewDueDateForm isGray assignmentId={this.assignmentId} courseId={this.courseId} number={this.state.number} textDescription={this.props.textDescription}/>
                    )
                )
            case 3:
                return (
                   ((localStorage.getItem("dueDate1" + this.localStorageExtension) && localStorage.getItem("dueDate1" + this.localStorageExtension) !== "N/A" &&
                        localStorage.getItem("dueDate2" + this.localStorageExtension)) && localStorage.getItem("dueDate2" + this.localStorageExtension) !== "N/A" ?
                        <NewDueDateForm assignmentId={this.assignmentId} courseId={this.courseId} number={this.state.number} textDescription={this.props.textDescription}/>
                        :
                        <NewDueDateForm isGray assignmentId={this.assignmentId} courseId={this.courseId} number={this.state.number} textDescription={this.props.textDescription}/>
                    )
                )
            default:
        }

    }
};

export default NewDueDate;
