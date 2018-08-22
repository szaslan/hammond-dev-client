import React, { Component } from 'react';
import './NewDueDate.css';
import 'rc-time-picker/assets/index.css';
import NewDueDateForm from './NewDueDateForm';


class NewDueDate extends Component {

    constructor(props) {
        super(props);

    }

    render() {
        return (
            (this.props.number == "2" ?
                (localStorage.getItem("dateTime" + this.props.assignmentId + "_1") ?
                    <NewDueDateForm isGray={false} assignmentId={this.props.assignmentId} number={this.props.number} />
                    :
                    <NewDueDateForm isGray={true} assignmentId={this.props.assignmentId} number={this.props.number} />
                )
                :
                (this.props.number == "3" ?
                    ((localStorage.getItem("dateTime" + this.props.assignmentId + "_1") &&
                        localStorage.getItem("dateTime" + this.props.assignmentId + "_2")) ?
                        <NewDueDateForm isGray={false} assignmentId={this.props.assignmentId} number={this.props.number} />
                        :
                        <NewDueDateForm isGray={true} assignmentId={this.props.assignmentId} number={this.props.number} />
                    )
                    :
                    <NewDueDateForm isGray={false} assignmentId={this.props.assignmentId} number={this.props.number} />
                )
            )
        )
    }
};

export default NewDueDate;