import React, { Component } from 'react';
import { Alert } from 'react-bootstrap';
import { Tooltip } from 'reactstrap';
import InputMoment from 'input-moment';
import moment from 'moment';

import './DueDate.css';
import { Tooltip } from 'reactstrap';
import { Alert } from 'react-bootstrap';
import { Container } from 'reactstrap';
import Datetime from 'react-datetime';

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
    toggle() {
        this.setState({
            tooltipOpen: !this.state.tooltipOpen
        })
    }

    handleChange = m => {
        /*this.setState({ dueDateDisplay: m.format('llll') });
        this.setState({ dueDateActual: m.format('l') + ", " + m.format('LTS') });
        var new_date = new Date(this.state.dueDateDisplay)
        var formatted = moment(new_date).format('llll')
        console.log("formatted: " + formatted)*/
        //this.setState({ dueDateDisplay: m.format('llll') }, () => {
        // localStorage.setItem(("calendarDate_" + this.props.assignmentId + "_" + this.props.number), this.state.dueDateActual);
        //localStorage.setItem(("calendarDate_" + this.props.assignmentId + "_" + this.props.number), this.state.dueDateDisplay);
        //});
        this.setState({ dueDateDisplay: m.format('llll') });
        this.setState({ dueDateActual: m.format('l') + ", " + m.format('LTS') });
        var formatted = m.format('llll');
        console.log("formatted: ", formatted);
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
            var date_1 = new Date(localStorage.getItem("calendarDate_" + this.props.assignmentId + "_1"));
            if (date_1.getTime() > actual_date.getTime()) {
                this.isAfter = false;
                localStorage.removeItem("calendarDate_" + this.props.assignmentId + "_" + this.props.number);
                this.setState({ dueDateDisplay: "" });
                this.setState({ buttonPressed: true });
            }
            else {
                this.isAfter = true;
                this.setState({ buttonPressed: false });
            }
        }
else if (this.number == "3") {
            var date_2 = new Date(localStorage.getItem("calendarDate_" + this.props.assignmentId + "_2"));
            if (date_2.getTime() > actual_date.getTime()) {
                this.isAfter = false;
                localStorage.removeItem("calendarDate_" + this.props.assignmentId + "_" + this.props.number);
                this.setState({ dueDateDisplay: "" });
                this.setState({ buttonPressed: true });
            }
            else {
                this.isAfter = true;
                this.setState({ buttonPressed: false });
            }
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
                    {/* <button onClick={this.handleClick1} >{this.props.name}</button> */}
                    <span style={{ textDecoration: "underline", color: "blue" }} href="#" id={"TooltipExample" + this.props.number}>
                        <img src={infoIcon} width="20" />
                    </span>
                    <Tooltip placement="right" isOpen={this.state.tooltipOpen} target={"TooltipExample" + this.number} toggle={this.toggle}>
                        {this.state.message}
                    </Tooltip>
                    {this.state.dueDateDisplay}
                </p>
          
                <Container className="input-moment-container">
                    {/* {this.state.buttonPressed ? */}


                    {this.isAcceptable ?
                        (this.isAfter ?

                            <InputMoment
                                moment={this.state.m}
                                onChange={this.handleChange}
                                onSave={this.handleSave}
                                minStep={1} // default
                                hourStep={1} // default
                                prevMonthIcon="ion-ios-arrow-left" // default
                                nextMonthIcon="ion-ios-arrow-right" // default
                            />


                            :
                            <Alert bsStyle="danger" onDismiss={this.handleDismiss}>
                                <h2>Oops.</h2>
                                <h4>That date has already happened. Please select a date that has not happened.</h4>
                                {/* <button onClick = {this.handleDismiss}>Ok fineee</button> */}
                            </Alert>
                        :

                        <Alert bsStyle="danger" onDismiss={this.handleDismiss}>
                            <h2>Oops.</h2>
                            <h4>That date has already happened. Please select a date that has not happened.</h4>

                            {/* <button onClick = {this.handleDismiss}>Ok fineee</button> */}
                        </Alert>
                    }
                    {/* ? */}
                    {/* } */}
                </Container>




            </div>
        );
    }
}

export default DueDate;