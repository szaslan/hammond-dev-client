import React, { Component } from 'react';
import { Alert } from 'react-bootstrap';
import { Tooltip } from 'reactstrap';
import InputMoment from 'input-moment';
import moment from 'moment';

import './DueDate.css';

var infoIcon = require('../InfoIcon.svg')

class DueDate extends Component {
    constructor(props) {
        super(props);

        this.state = {
            buttonPressed: false,
            dueDate: '',
            dueDateActual: '',
            dueDateDisplay: '',
            m: moment(),
            message: '',
            tooltipOpen: false,
        };

        this.convertDateStringToCorrectFormat = this.convertDateStringToCorrectFormat.bind(this);
        this.compareDates = this.compareDates.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleClick1 = this.handleClick1.bind(this);
        this.handleDismiss = this.handleDismiss.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.toggle = this.toggle.bind(this);

        this.assignment_id = this.props.assignmentId;
        this.isAcceptable = true;
        this.isAfter = true;
        this.number = this.props.number;
    }

    convertDateStringToCorrectFormat(format, datestring) {
        var date = new Date(datestring);
        var formatted_date = moment(date).format(format);
        return formatted_date
    }

    compareDates(old_date, current_date) {
        if (old_date > current_date) {
            this.isAfter = false;
            localStorage.removeItem("calendarDate_" + this.assignment_id + "_" + this.number);
            this.setState({
                dueDateDisplay: "",
                buttonPressed: true,
            });
        }
        else {
            this.isAfter = true;
            this.setState({
                buttonPressed: false
            });
        }
    }

    handleChange(m) {
        this.setState({
            dueDateDisplay: m.format('llll'),
            dueDateActual: m.format('l') + ", " + m.format('LTS')
        });
    };

    handleClick1() {
        this.setState(prevState => ({
            buttonPressed: !prevState.buttonPressed
        }));
    }

    handleDismiss() {
        this.isAcceptable = true;
        this.isAfter = true;
        this.setState({
            buttonPressed: true
        })
    }

    handleSave() {
        this.setState({
            buttonPressed: false
        })

        localStorage.setItem(("calendarDate_" + this.assignment_id + "_" + this.number), this.state.dueDateDisplay);

        var actual_date = new Date(this.state.m.format('llll'));
        let actual_date_time = actual_date.getTime();
        var d = new Date();

        if ((actual_date_time - d.getTime()) < 0) {
            this.isAcceptable = false;
            localStorage.removeItem("calendarDate_" + this.assignment_id + "_" + this.number);

            this.setState({
                buttonPressed: true,
                dueDateDisplay: "",
            });
        }
        else {
            this.isAcceptable = true;
            // this.setState({ 
            //     buttonPressed: false
            //  });
        }

        if (this.number == "2") {
            var date_1 = new Date(localStorage.getItem("calendarDate_" + this.assignment_id + "_1"));

            this.compareDates(date_1.getTime(), actual_date_time)
        }
        else if (this.number == "3") {
            var date_2 = new Date(localStorage.getItem("calendarDate_" + this.assignment_id + "_2"));

            this.compareDates(date_2.getTime(), actual_date_time)
        }
        else {
            this.isAfter = true;
            //this.setState({ buttonPressed: false });
        }
    };

    toggle() {
        this.setState({
            tooltipOpen: !this.state.tooltipOpen
        })
    }

    componentDidMount() {
        this.setState({
            message: this.props.message
        })

        if (localStorage.getItem("calendarDate_" + this.assignment_id + "_" + this.number)) {
            var actual_date = new Date(localStorage.getItem("calendarDate_" + this.assignment_id + "_" + this.number));
            var formatted_date = moment(actual_date).format('llll');

            this.setState({
                dueDateDisplay: formatted_date
            })
        }
    }

    render() {
        return (
            <div className="app">
                <p>
                    <button onClick={this.handleClick1} >{this.props.name}</button>
                    <span style={{ textDecoration: "underline", color: "blue" }} href="#" id={"TooltipExample" + this.number}>
                        <img src={infoIcon} width="20" />
                    </span>
                    <Tooltip placement="right" isOpen={this.state.tooltipOpen} target={"TooltipExample" + this.number} toggle={this.toggle}>
                        {this.state.message}
                    </Tooltip>
                    {this.state.dueDateDisplay}
                </p>

                {
                    this.state.buttonPressed ?
                        this.isAcceptable ?
                            this.isAfter ?
                                <form>
                                    <InputMoment
                                        moment={this.state.m}
                                        onChange={this.handleChange}
                                        onSave={this.handleSave}
                                        minStep={1} // default
                                        hourStep={1} // default
                                        prevMonthIcon="ion-ios-arrow-left" // default
                                        nextMonthIcon="ion-ios-arrow-right" // default
                                    />
                                </form>
                                :
                                <Alert bsStyle="danger" onDismiss={this.handleDismiss}>
                                    <h2>Oops.</h2>
                                    <h4>That date comes before one of the previous Due Dates.
                                    Please select a date that comes after all of the previous Due Dates.</h4>
                                    {/* <button onClick = {this.handleDismiss}>Ok fineee</button> */}
                                </Alert>
                            :
                            <Alert bsStyle="danger" onDismiss={this.handleDismiss}>
                                <h2>Oops.</h2>
                                <h4>That date has already happened. Please select a date that has not happened.</h4>
                                {/* <button onClick = {this.handleDismiss}>Ok fineee</button> */}
                            </Alert>
                        :
                        null
                }
            </div>
        );
    }
}

export default DueDate;