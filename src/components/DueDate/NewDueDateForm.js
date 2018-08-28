import React, { Component } from 'react';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';
import Datetime from 'react-datetime';
import Flexbox from 'flexbox-react';
import moment from 'moment';
import TimePicker from 'rc-time-picker';

import 'rc-time-picker/assets/index.css';

import './NewDueDate.css';

const format = 'h:mm a';

class NewDueDate extends Component {
    constructor(props) {
        super(props);

        this.state = {
            dateValue: (localStorage.getItem("date" + this.props.assignmentId + "_" + this.props.number) ?
                localStorage.getItem("date" + this.props.assignmentId + "_" + this.props.number)
                :
                moment()),
            modal: false,
            number: Number(this.props.number),
            timeValue: (localStorage.getItem("time" + this.props.assignmentId + "_" + this.props.number) ?
                localStorage.getItem("time" + this.props.assignmentId + "_" + this.props.number)
                :
                moment()),
        };

        this.checkDate = this.checkDate.bind(this);
        this.checkOtherDueDates = this.checkOtherDueDates.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.onChange = this.onChange.bind(this);
        this.toggle = this.toggle.bind(this);

        this.dueDateExtension = this.props.assignmentId + "_" + this.state.number;
        this.isBeforeDates = false;
        this.isInPast = false;
        this.isValidTime = true;
        this.previousDueDateExtension = this.props.assignmentId + "_" + (this.state.number - 1);
        this.previousDueDateNumber = this.state.number - 1;
    }

    checkDate(current) {
        if (this.state.number == 1) {
            //Make sure date selected is after yesterday (in t`he present)
            var yesterday = Datetime.moment().subtract(1, 'day');
            return current.isAfter(yesterday);
        }
        else {
            //Make sure date selected is either on or after the previous due date day

            var lowerBoundDate = Datetime.moment(localStorage.getItem("dueDate_" + this.previousDueDateExtension)).subtract(1, 'day');
            return current.isAfter(lowerBoundDate);
        }
    }

    checkOtherDueDates() {
        let currentDueDate = Datetime.moment(localStorage.getItem("dueDate_" + this.dueDateExtension))
        for (var number = this.state.number + 1; number <= 3; number++) {
            let laterDueDate = Datetime.moment(localStorage.getItem("dueDate_" + this.props.assignmentId + "_" + number))
            if (laterDueDate) {
                if (currentDueDate.isAfter(laterDueDate)) {
                    localStorage.removeItem("dueDate_" + this.props.assignmentId + "_" + number)
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
        localStorage.setItem("dueDate_" + this.dueDateExtension, concatDateTime);

        var currentTime = Datetime.moment();
        var chosenDueDate = Datetime.moment(concatDateTime);

        if (chosenDueDate.isBefore(currentTime)) {
            this.isInPast = true;
            this.isValidTime = false;
        }
        else {
            if (this.state.number == 1) {
                this.isValidTime = true;
            }
            else {
                var previousDueDate = Datetime.moment(localStorage.getItem("dueDate_" + this.previousDueDateExtension));
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
                timeValue: value
            });
        }
    }

    toggle() {
        localStorage.removeItem("dueDate_" + this.dueDateExtension);

        this.setState({
            modal: !this.state.modal,
        });
    }

    componentDidMount() {
        // console.log(moment())
    }

    render() {
        return (
            <div className={"dateTime " + (this.props.isGray ? "grayOut" : null)}>
                <p className="headertext">Set Due Date:</p>
                <form onSubmit={this.handleSubmit} className="dateTimeForm">
                    <div className={"color-border-" + (localStorage.getItem("dueDate_" + this.dueDateExtension) ? "green" : "red")}>
                        <Datetime dateFormat="MM/DD/YYYY" timeFormat={false} onChange={this.handleChange} isValidDate={this.checkDate}
                            inputProps={{
                                disabled: true,
                                placeholder: (localStorage.getItem("dueDate_" + this.dueDateExtension) ?
                                    (moment(localStorage.getItem("dueDate_" + this.dueDateExtension))).format('MM/DD/YYYY')
                                    :
                                    "Select a Date")
                            }}
                        />

                        <Flexbox justifyContent="space-between">
                            <TimePicker
                                className="timePicker"
                                format={format}
                                inputReadOnly
                                onChange={this.onChange}
                                showSecond={false}
                                use12Hours
                                placeholder={(localStorage.getItem("dueDate_" + this.dueDateExtension) ?
                                    (moment(localStorage.getItem("dueDate_" + this.dueDateExtension))).format('h:mm a')
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
                                                Due Date {this.previousDueDateNumber}: {moment(localStorage.getItem("dueDate_" + this.previousDueDateExtension)).format('MM/DD/YYYY')} {moment(localStorage.getItem("dueDate_" + this.previousDueDateExtension)).format('h:mm a')}
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



            </div>
        )
    }

};

export default NewDueDate;
