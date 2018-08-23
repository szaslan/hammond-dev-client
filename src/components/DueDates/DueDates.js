import React, { Component } from 'react';

import DueDate from '../DueDate/DueDate';

import 'bootstrap/dist/css/bootstrap.css';

import '../Assignments/Assignments.css';

class DueDates extends Component {
    constructor(props) {
        super(props);

        this.state = {
            assignmentId: null,
            loaded: false,
            message1: '',
            message2: '',
            message3: '',
        };

    }

    componentDidMount() {
        this.setState({
            assignmentId: this.props.assignmentId,
            message1: this.props.messages.message1,
            message2: this.props.messages.message2,
            message3: this.props.messages.message3,
            loaded: true,
        })
    }

    render() {
        if (this.state.loaded) {
            return (
                <div>
                    <DueDate
                        name="Due Date 1"
                        assignmentId={this.state.assignmentId}
                        number="1"
                        message={this.state.message1}
                    />
                    {
                        localStorage.getItem("calendarDate_" + this.state.assignmentId + "_1") ?
                            <DueDate
                                name="Due Date 2"
                                assignmentId={this.state.assignmentId}
                                number="2"
                                message={this.state.message2}
                            />
                            :
                            null
                    }
                    {
                        localStorage.getItem("calendarDate_" + this.state.assignmentId + "_1") && localStorage.getItem("calendarDate_" + this.state.assignmentId + "_2") ?
                            <DueDate
                                name="Due Date 3"
                                assignmentId={this.state.assignmentId}
                                number="3"
                                message={this.state.message3}
                            />
                            :
                            null
                    }
                </div>
            );
        }
        else {
            return (
                <div></div>
            )
        }
    }
}
export default DueDates;