import React, { Component } from 'react';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';
import Datetime from 'react-datetime';
import Flexbox from 'flexbox-react';
import moment from 'moment';
import TimePicker from 'rc-time-picker';

import 'rc-time-picker/assets/index.css';

import './NewDueDate.css';

const format = 'h:mm a';

class NewDueDateForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            dateValue: moment().startOf('minute'),
            modal: false,
            number: Number(this.props.number),
            timeValue: moment().startOf('minute'),
        };

        this.checkDate = this.checkDate.bind(this);
        this.checkOtherDueDates = this.checkOtherDueDates.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.onChange = this.onChange.bind(this);
        this.toggle = this.toggle.bind(this);

        this.dueDateExtension = this.state.number + "_" + this.props.assignmentId;
        this.isBeforeDates = false;
        this.isInPast = false;
        this.isValidTime = true;
        this.previousDueDateExtension = (this.state.number - 1) + "_" + this.props.assignmentId;
        this.previousDueDateNumber = this.state.number - 1;
    }

    checkDate(current) {
        if (this.state.number === 1) {
            //Make sure date selected is after yesterday (in the present)
            var yesterday = Datetime.moment().subtract(1, 'day');
            return current.isAfter(yesterday);
        }
        else {
            //Make sure date selected is either on or after the previous due date day

            var lowerBoundDate = Datetime.moment(localStorage.getItem("dueDate" + this.previousDueDateExtension)).subtract(1, 'day');
            return current.isAfter(lowerBoundDate);
        }
    }

    checkOtherDueDates() {
        let currentDueDate = Datetime.moment(localStorage.getItem("dueDate" + this.dueDateExtension))
        for (var i = this.state.number + 1; i <= 3; i++) {
            let laterDueDate = Datetime.moment(localStorage.getItem("dueDate" + i + "_" + this.props.assignmentId))
            if (laterDueDate) {
                //if the current due date is at the same time or after the later one, delete the later one
                if (currentDueDate.isAfter(laterDueDate) || (!currentDueDate.isBefore(laterDueDate) && !laterDueDate.isBefore(currentDueDate))) {
                    localStorage.removeItem("dueDate" + i + "_" + this.props.assignmentId)
                }
            }
        }
    }

    handleChange(value) {
        this.setState({
            dateValue: value
        });
    }

    handleSubmit(event) {
        event.preventDefault();

        this.isBeforeDates = false;
        this.isInPast = false;
        this.isValidTime = true;

        var concatDateTime = (this.state.dateValue).format('ddd MMM DD YYYY') + " " + (this.state.timeValue).format('HH:mm:ss') + " GMT-0500";
        localStorage.setItem("dueDate" + this.dueDateExtension, concatDateTime);

        var currentTime = Datetime.moment();
        var chosenDueDate = Datetime.moment(concatDateTime);

        if (chosenDueDate.isBefore(currentTime)) {
            this.isInPast = true;
            this.isValidTime = false;
        }
        else {
            if (this.state.number === 1) {
                this.isValidTime = true;
            }
            else {
                var previousDueDate = Datetime.moment(localStorage.getItem("dueDate" + this.previousDueDateExtension));
                this.isValidTime = previousDueDate.isBefore(chosenDueDate);
                this.isBeforeDates = chosenDueDate.isBefore(previousDueDate);
            }
        }

        if (this.isValidTime) {
            this.checkOtherDueDates()
        }
        else {
            this.toggle();
        }
    }

    onChange(value) {
        if (value) {
            this.setState({
                timeValue: value.startOf('minute')
            });
        }
    }

    toggle() {
        localStorage.removeItem("dueDate" + this.dueDateExtension);

        this.setState({
            modal: !this.state.modal,
        });
    }

    render() {
        return (
            <div className={"dateTime " + (this.props.isGray ? "grayOut" : "")}>
                <Flexbox flexDirectionn="column" flexWrap="wrap" maxWidth="300px">

                    <form onSubmit={this.handleSubmit} className="dateTimeForm">
                        <div className={"color-border-" + (localStorage.getItem("dueDate" + this.dueDateExtension) ? "green" : "red")}>
                            <Datetime dateFormat="MM/DD/YYYY" timeFormat={false} onChange={this.handleChange} isValidDate={this.checkDate}
                                inputProps={{
                                    disabled: true,
                                    placeholder: (localStorage.getItem("dueDate" + this.dueDateExtension) ?
                                        (moment(localStorage.getItem("dueDate" + this.dueDateExtension))).format('MM/DD/YYYY')
                                        :
                                        "Select a Date")
                                }}
                                // viewDate={
                                //     this.number == 2 || this.number == 3 ?
                                //         moment(localStorage.getItem("dueDate" + this.dueDateExtension))
                                //         :
                                //         moment()
                                // }
                            />

                            <Flexbox justifyContent="space-between">
                                <TimePicker
                                    className="timePicker"
                                    format={format}
                                    inputReadOnly
                                    onChange={this.onChange}
                                    showSecond={false}
                                    use12Hours
                                    placeholder={(localStorage.getItem("dueDate" + this.dueDateExtension) ?
                                        (moment(localStorage.getItem("dueDate" + this.dueDateExtension))).format('h:mm a')
                                        :
                                        "Select a Time")}
                                />
                                <input type="submit" value="Submit" className="dateTimeSubmit" />
                            </Flexbox>

                        </div>

                        <Modal isOpen={this.state.modal} className="invalidModal">
                            <ModalHeader toggle={this.toggle}>Invalid Time Selected</ModalHeader>
                            {
                                this.isInPast ?
                                    <ModalBody>
                                        Looks like you chose a date and time that has already occured. Please choose one that has not.
                                    <br></br>
                                        <br></br>
                                        Due Date Selected: {this.state.dateValue.format('MM/DD/YYYY')} {this.state.timeValue.format('h:mm a')}
                                    </ModalBody>
                                    :
                                    <div>
                                        {
                                            this.isBeforeDates ?
                                                <ModalBody>
                                                    Looks like you chose a date and time that occurs before Due Date {this.previousDueDateNumber} for this assignment.
                                                    Please choose one that does not.
                                                <br></br>
                                                    <br></br>
                                                    Due Date {this.previousDueDateNumber}: {moment(localStorage.getItem("dueDate" + this.previousDueDateExtension)).format('MM/DD/YYYY')} {moment(localStorage.getItem("dueDate" + this.previousDueDateExtension)).format('h:mm a')}
                                                    <br></br>
                                                    Due Date Selected: {this.state.dateValue.format('MM/DD/YYYY')} {this.state.timeValue.format('h:mm a')}
                                                </ModalBody>
                                                :
                                                <ModalBody>
                                                    Looks like you chose a date and time that occurs at the same time as Due Date {this.previousDueDateNumber} for this assignment.
                                                    Unfortunately, due dates must be separated by at least one minute. Please choose a new due date.
                                                <br></br>
                                                    <br></br>
                                                    Due Date Selected: {this.state.dateValue.format('MM/DD/YYYY')} {this.state.timeValue.format('h:mm a')}
                                                </ModalBody>
                                        }
                                    </div>

                            }


                        </Modal>

                    </form>
                    <p>{this.props.textDescription}</p>
                </Flexbox>

            </div>
        )
    }

};

export default NewDueDateForm;