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

        this.assignmentId = this.props.assignmentId
    }

    render() {
        switch (this.state.number) {
            case 1:
                return (
                    <NewDueDateForm assignmentId={this.assignmentId} number={this.state.number} />
                );
            case 2:
                return (
                    (localStorage.getItem("dueDate_" + this.assignmentId + "_1") ?
                        <NewDueDateForm assignmentId={this.assignmentId} number={this.state.number} />
                        :
                        <NewDueDateForm isGray assignmentId={this.assignmentId} number={this.state.number} />
                    )
                )
            case 3:
                return (
                    ((localStorage.getItem("dueDate_" + this.assignmentId + "_1") &&
                        localStorage.getItem("dueDate_" + this.assignmentId + "_2")) ?
                        <NewDueDateForm assignmentId={this.assignmentId} number={this.state.number} />
                        :
                        <NewDueDateForm isGray assignmentId={this.assignmentId} number={this.state.number} />
                    )
                )
        }
    }
};

export default NewDueDate;